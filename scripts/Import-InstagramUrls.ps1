# Download Instagram image URLs from assets/image-urls.txt (no cookies / no admin).
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$urlsFile = Join-Path $root "assets\image-urls.txt"
if (-not (Test-Path $urlsFile)) {
    Write-Host "Missing: $urlsFile"
    Write-Host "Add one image URL per line (see assets/import-photos.html for steps)."
    exit 1
}

$lines = Get-Content $urlsFile | Where-Object { $_ -match '\S' -and $_ -notmatch '^\s*#' }
if ($lines.Count -lt 1) {
    Write-Host "No URLs in image-urls.txt yet. Open assets/import-photos.html in your browser for steps."
    exit 1
}

Write-Host "Downloading $($lines.Count) URL(s) into assets/images/ ..."
python "$root\scripts\download_assets.py" --from-urls
Write-Host "Done. Refresh http://localhost:8766/ (Ctrl+F5)."
