# Try instaloader with browser cookies. Prefer NORMAL PowerShell (not Admin).
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole(
    [Security.Principal.WindowsBuiltInRole]::Administrator
)
if ($isAdmin) {
    Write-Host ""
    Write-Host "WARNING: You are in Admin PowerShell." -ForegroundColor Yellow
    Write-Host "Edge/Chrome cookies usually FAIL to decrypt here (DPAPI)." -ForegroundColor Yellow
    Write-Host "Use instead:" -ForegroundColor Yellow
    Write-Host "  1. Open assets/import-photos.html for the browser copy-paste method" -ForegroundColor Cyan
    Write-Host "  2. Or run this script again in a NORMAL PowerShell window" -ForegroundColor Cyan
    Write-Host ""
}

$igDir = Join-Path $root "assets\instagram"
New-Item -ItemType Directory -Force -Path $igDir | Out-Null

Write-Host "Close Edge completely before continuing (check system tray)." -ForegroundColor DarkGray
Start-Sleep -Seconds 2

$ok = $false
foreach ($browser in @("edge", "chrome")) {
    Write-Host "Trying instaloader --load-cookies $browser ..."
    try {
        & python -m instaloader --load-cookies $browser --count 8 --no-videos --no-metadata-json --no-captions `
            --dirname-pattern "$igDir" koshichhyang 2>&1 | Write-Host
        if ($LASTEXITCODE -eq 0) { $ok = $true; break }
    } catch {
        Write-Host $_ -ForegroundColor DarkYellow
    }
}

if (-not $ok) {
    Write-Host ""
    Write-Host "Automatic download did not work." -ForegroundColor Yellow
    Write-Host "Use the reliable manual path:" -ForegroundColor Yellow
    Write-Host "  start $root\assets\import-photos.html" -ForegroundColor Cyan
    Write-Host "  then: .\scripts\Import-InstagramUrls.ps1" -ForegroundColor Cyan
    exit 1
}

Write-Host "Mapping to assets/images slots..."
python "$root\scripts\download_assets.py" --from-instaloader
Write-Host "Done. Refresh http://localhost:8766/ in your browser."
