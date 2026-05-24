param(
  [Parameter(ValueFromRemainingArguments = $true)]
  [string[]]$BuilderArgs
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot

Push-Location $Root
try {
  powershell -NoProfile -ExecutionPolicy Bypass -File ".\scripts\create-icon.ps1"
  powershell -NoProfile -ExecutionPolicy Bypass -File ".\scripts\prepare-win-code-sign.ps1"

  $env:ELECTRON_BUILDER_CACHE = Join-Path $Root ".cache\electron-builder"
  $env:CSC_IDENTITY_AUTO_DISCOVERY = "false"

  $Builder = Join-Path $Root "node_modules\.bin\electron-builder.cmd"
  if (-not (Test-Path -LiteralPath $Builder)) {
    throw "electron-builder wurde nicht gefunden. Fuehre zuerst npm.cmd install aus."
  }

  & $Builder @BuilderArgs
  if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
  }
} finally {
  Pop-Location
}
