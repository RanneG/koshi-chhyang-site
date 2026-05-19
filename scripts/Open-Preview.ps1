# Serve concepts over http://localhost:8766 (avoids file:// image quirks).
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root
Write-Host "Preview: http://localhost:8766/"
Write-Host "Press Ctrl+C to stop."
python -m http.server 8766
