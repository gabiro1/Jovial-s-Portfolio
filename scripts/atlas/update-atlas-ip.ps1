# Adds this PC's current public IP to the MongoDB Atlas project IP access list.
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File .\update-atlas-ip.ps1
#
# Reads credentials from atlas.config.json in the same folder
# (copy atlas.config.example.json and fill it in).

[CmdletBinding()]
param(
  [string]$ConfigPath,
  [int]$MaxAttempts = 6,
  [int]$RetrySeconds = 20
)

$ErrorActionPreference = 'Stop'
function Write-Log($m) { Write-Host ("[{0}] {1}" -f (Get-Date -Format 'HH:mm:ss'), $m) }

$scriptDir = $PSScriptRoot
if (-not $scriptDir) { $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path }
if (-not $scriptDir) { $scriptDir = (Get-Location).Path }
if (-not $ConfigPath) { $ConfigPath = Join-Path $scriptDir 'atlas.config.json' }

if (-not (Test-Path -LiteralPath $ConfigPath)) {
  Write-Log "Config not found: $ConfigPath  (copy atlas.config.example.json)"
  exit 1
}

$cfg = Get-Content -LiteralPath $ConfigPath -Raw | ConvertFrom-Json
foreach ($k in 'projectId', 'publicKey', 'privateKey') {
  if (-not $cfg.$k -or $cfg.$k -like 'YOUR_*') {
    Write-Log "atlas.config.json is missing a valid '$k'."
    exit 1
  }
}
$comment = if ($cfg.comment) { $cfg.comment } else { 'auto-added at logon' }

$listUrl = "https://cloud.mongodb.com/api/atlas/v1.0/groups/$($cfg.projectId)/accessList"
$digestCredential = New-Object System.Net.NetworkCredential($cfg.publicKey, $cfg.privateKey)

function Invoke-AtlasApi {
  param([string]$Method, [string]$Uri, [string]$Body)

  $request = [System.Net.HttpWebRequest]::Create($Uri)
  $request.Method = $Method
  $request.Accept = 'application/json'
  $request.ContentType = 'application/json'
  $request.Timeout = 30000

  $cache = New-Object System.Net.CredentialCache
  $cache.Add([Uri]$Uri, 'Digest', $digestCredential)
  $request.Credentials = $cache

  if ($Body) {
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($Body)
    $request.ContentLength = $bytes.Length
    $stream = $request.GetRequestStream()
    $stream.Write($bytes, 0, $bytes.Length)
    $stream.Close()
  }

  try {
    $response = $request.GetResponse()
  } catch [System.Net.WebException] {
    $errorResponse = $_.Exception.Response
    if ($errorResponse) {
      $reader = New-Object System.IO.StreamReader($errorResponse.GetResponseStream())
      $text = $reader.ReadToEnd()
      throw "HTTP $([int]$errorResponse.StatusCode): $text"
    }
    throw
  }

  $reader = New-Object System.IO.StreamReader($response.GetResponseStream())
  $result = $reader.ReadToEnd()
  $reader.Close()
  $response.Close()
  return $result
}

function Get-PublicIp {
  (Invoke-RestMethod -Uri 'https://api.ipify.org?format=json' -TimeoutSec 20).ip
}

$attempt = 0
while ($true) {
  $attempt++
  try {
    $ip = Get-PublicIp
    if (-not $ip) { throw 'Could not determine public IP' }
    Write-Log "Public IP: $ip"

    $existing = (Invoke-AtlasApi -Method GET -Uri $listUrl | ConvertFrom-Json).results
    if ($existing | Where-Object { $_.ipAddress -eq $ip }) {
      Write-Log "IP $ip is already in the Atlas allowlist. Nothing to do."
      exit 0
    }

    $payload = ConvertTo-Json -Compress -Depth 4 @(@{ ipAddress = $ip; comment = $comment })
    $null = Invoke-AtlasApi -Method POST -Uri $listUrl -Body $payload
    Write-Log "Added $ip to the Atlas allowlist."
    exit 0
  } catch {
    Write-Log "Attempt $attempt/$MaxAttempts failed: $($_.Exception.Message)"
    if ($attempt -ge $MaxAttempts) { Write-Log 'Giving up.'; exit 1 }
    Start-Sleep -Seconds $RetrySeconds
  }
}
