# Registers a Windows Scheduled Task that runs update-atlas-ip.ps1 at every logon.
#
# Run once:
#   powershell -ExecutionPolicy Bypass -File .\register-startup-task.ps1
#
# Remove later with:
#   Unregister-ScheduledTask -TaskName "Atlas-Update-My-IP" -Confirm:$false

[CmdletBinding()]
param(
  [string]$TaskName = 'Atlas-Update-My-IP'
)

$ErrorActionPreference = 'Stop'

$scriptDir = $PSScriptRoot
if (-not $scriptDir) { $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path }
if (-not $scriptDir) { $scriptDir = (Get-Location).Path }

$scriptPath = Join-Path $scriptDir 'update-atlas-ip.ps1'
if (-not (Test-Path -LiteralPath $scriptPath)) {
  Write-Error "Script not found: $scriptPath"
}

$action = New-ScheduledTaskAction -Execute 'powershell.exe' `
  -Argument ('-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File "{0}"' -f $scriptPath)

$trigger = New-ScheduledTaskTrigger -AtLogOn

$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries -StartWhenAvailable

Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger `
  -Settings $settings -Force `
  -Description 'Adds this PC current public IP to the MongoDB Atlas allowlist at logon.' | Out-Null

Write-Host "Scheduled task '$TaskName' registered. It will run at every logon."
Write-Host "Run it now to test:  Start-ScheduledTask -TaskName '$TaskName'"
