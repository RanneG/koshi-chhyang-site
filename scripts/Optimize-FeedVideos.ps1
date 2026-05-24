# Stub: print ffmpeg one-liners for assets/videos/ (see assets/videos/README.md).
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$out = Join-Path $root "assets\videos"

Write-Host "Drop source files in $out then run ffmpeg, e.g.:" -ForegroundColor Cyan
Write-Host @"

  cd $out
  ffmpeg -i feed-01-source.mp4 -an -vf "scale=-2:720" -c:v libx264 -crf 28 -movflags +faststart feed-01.mp4
  ffmpeg -i feed-02-source.mp4 -an -vf "scale=-2:720" -c:v libx264 -crf 28 -movflags +faststart feed-02.mp4
  ffmpeg -i feed-03-source.mp4 -an -vf "scale=-2:720" -c:v libx264 -crf 28 -movflags +faststart feed-03.mp4
  ffmpeg -i visit-hero-source.mp4 -an -vf "scale=-2:720" -c:v libx264 -crf 28 -movflags +faststart visit-hero.mp4

"@

if (-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)) {
    Write-Host "ffmpeg not on PATH — install via winget install ffmpeg" -ForegroundColor Yellow
}
