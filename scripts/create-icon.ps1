param(
  [string]$SourcePng = "C:\Users\linus\Downloads\ChatGPT Image 24. Mai 2026, 12_47_02.png",
  [string]$AssetsDir = (Join-Path (Split-Path -Parent $PSScriptRoot) "assets")
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $SourcePng)) {
  throw "Icon-Quelle wurde nicht gefunden: $SourcePng"
}

New-Item -ItemType Directory -Force -Path $AssetsDir | Out-Null

$PngTarget = Join-Path $AssetsDir "app-icon.png"
$IcoTarget = Join-Path $AssetsDir "app-icon.ico"

Copy-Item -LiteralPath $SourcePng -Destination $PngTarget -Force

Add-Type -AssemblyName System.Drawing

$sizes = @(256, 128, 64, 48, 32, 16)
$source = [System.Drawing.Image]::FromFile($PngTarget)
$entries = New-Object System.Collections.Generic.List[object]

try {
  foreach ($size in $sizes) {
    $bitmap = New-Object System.Drawing.Bitmap $size, $size
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    try {
      $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
      $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
      $graphics.Clear([System.Drawing.Color]::Transparent)
      $graphics.DrawImage($source, 0, 0, $size, $size)

      $stream = New-Object System.IO.MemoryStream
      $bitmap.Save($stream, [System.Drawing.Imaging.ImageFormat]::Png)
      $entries.Add([pscustomobject]@{
        Size = $size
        Bytes = $stream.ToArray()
      })
    } finally {
      $graphics.Dispose()
      $bitmap.Dispose()
    }
  }
} finally {
  $source.Dispose()
}

$output = New-Object System.IO.MemoryStream
$writer = New-Object System.IO.BinaryWriter $output

$writer.Write([UInt16]0)
$writer.Write([UInt16]1)
$writer.Write([UInt16]$entries.Count)

$offset = 6 + ($entries.Count * 16)
foreach ($entry in $entries) {
  $writer.Write([byte]($(if ($entry.Size -eq 256) { 0 } else { $entry.Size })))
  $writer.Write([byte]($(if ($entry.Size -eq 256) { 0 } else { $entry.Size })))
  $writer.Write([byte]0)
  $writer.Write([byte]0)
  $writer.Write([UInt16]1)
  $writer.Write([UInt16]32)
  $writer.Write([UInt32]$entry.Bytes.Length)
  $writer.Write([UInt32]$offset)
  $offset += $entry.Bytes.Length
}

foreach ($entry in $entries) {
  $writer.Write($entry.Bytes)
}

[System.IO.File]::WriteAllBytes($IcoTarget, $output.ToArray())
$writer.Dispose()
$output.Dispose()

Write-Host "Erstellt: $PngTarget"
Write-Host "Erstellt: $IcoTarget"
