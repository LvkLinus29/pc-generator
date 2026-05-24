param(
  [string]$Version = "2.6.0"
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$CacheRoot = Join-Path $Root ".cache\electron-builder"
$WinCodeSignRoot = Join-Path $CacheRoot "winCodeSign"
$FinalDir = Join-Path $WinCodeSignRoot "winCodeSign-$Version"
$Archive = Join-Path $WinCodeSignRoot "winCodeSign-$Version.7z"
$TempDir = Join-Path $WinCodeSignRoot "_extract-$Version"
$SevenZip = Join-Path $Root "node_modules\7zip-bin\win\x64\7za.exe"
$Url = "https://github.com/electron-userland/electron-builder-binaries/releases/download/winCodeSign-$Version/winCodeSign-$Version.7z"

if (Test-Path -LiteralPath (Join-Path $FinalDir "rcedit-x64.exe")) {
  return
}

if (-not (Test-Path -LiteralPath $SevenZip)) {
  throw "7za.exe wurde nicht gefunden. Fuehre zuerst npm.cmd install aus."
}

New-Item -ItemType Directory -Force -Path $WinCodeSignRoot | Out-Null

if (-not (Test-Path -LiteralPath $Archive)) {
  Write-Host "[PC Generator] Lade winCodeSign-$Version..."
  Invoke-WebRequest -UseBasicParsing -Uri $Url -OutFile $Archive
}

if (Test-Path -LiteralPath $TempDir) {
  Remove-Item -LiteralPath $TempDir -Recurse -Force
}
if (Test-Path -LiteralPath $FinalDir) {
  Remove-Item -LiteralPath $FinalDir -Recurse -Force
}

New-Item -ItemType Directory -Force -Path $TempDir | Out-Null

& $SevenZip x -bd $Archive "-o$TempDir" | Out-Host
if ($LASTEXITCODE -ne 0 -and $LASTEXITCODE -ne 2) {
  throw "winCodeSign konnte nicht entpackt werden. Exit-Code: $LASTEXITCODE"
}

New-Item -ItemType Directory -Force -Path $FinalDir | Out-Null
Copy-Item -Path (Join-Path $TempDir "*") -Destination $FinalDir -Recurse -Force
Remove-Item -LiteralPath $TempDir -Recurse -Force

if (-not (Test-Path -LiteralPath (Join-Path $FinalDir "rcedit-x64.exe"))) {
  throw "winCodeSign wurde vorbereitet, aber rcedit-x64.exe fehlt."
}
