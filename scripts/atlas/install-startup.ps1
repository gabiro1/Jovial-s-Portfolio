# Creates a shortcut in YOUR Startup folder so update-atlas-ip.ps1 runs at logon.
# Does NOT require administrator rights (unlike a Scheduled Task).
#
# Run once:
#   powershell -ExecutionPolicy Bypass -File .\install-startup.ps1
#
# Remove later by deleting:
#   %APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\Atlas Update IP.lnk

[CmdletBinding()]
param()

$scriptDir = $PSScriptRoot
if (-not $scriptDir) { $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path }
if (-not $scriptDir) { $scriptDir = (Get-Location).Path }

$target = Join-Path $scriptDir 'update-atlas-ip.ps1'
if (-not (Test-Path -LiteralPath $target)) {
  Write-Error "Script not found: $target"
}

$startup = [Environment]::GetFolderPath('Startup')
$linkPath = Join-Path $startup 'Atlas Update IP.lnk'

$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($linkPath)
$shortcut.TargetPath = 'powershell.exe'
$shortcut.Arguments = '-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File "{0}"' -f $target
$shortcut.WorkingDirectory = $scriptDir
$shortcut.WindowStyle = 7
$shortcut.Description = 'Adds this PC current public IP to the MongoDB Atlas allowlist at logon.'
$shortcut.Save()

Write-Host "Startup shortcut created:"
Write-Host "  $linkPath"
Write-Host ""
Write-Host "It will run automatically at every logon."
Write-Host "Test it right now with:"
Write-Host "  powershell -NoProfile -ExecutionPolicy Bypass -File `"$target`""
