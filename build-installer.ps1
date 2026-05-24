param(
  [switch]$SkipInstall
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path

Push-Location $Root
try {
  powershell -NoProfile -ExecutionPolicy Bypass -File ".\scripts\create-icon.ps1"

  if (-not $SkipInstall -and -not (Test-Path -LiteralPath ".\node_modules\electron")) {
    Write-Host "[PC Generator] Installiere Electron-Abhaengigkeiten..."
    npm.cmd install
  }

  Write-Host "[PC Generator] Baue Windows-Installer..."
  npm.cmd run dist
} finally {
  Pop-Location
}
