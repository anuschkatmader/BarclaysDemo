# Windows version of get-images.sh — downloads the demo photos into assets\img.
# Run from the repo root in PowerShell:  .\get-images.ps1   — then commit assets\img.
$ErrorActionPreference = "Stop"
$dir = Join-Path $PSScriptRoot "assets\img"
$photos = @(
  @("hero.jpg",           "photo-1770872937837-267dadb4a138", "w=1800&h=1000"),
  @("streaming.jpg",      "photo-1586899028174-e7098604235b", "w=1000&h=800"),
  @("card-payment.jpg",   "photo-1556742031-c6961e8560b0", "w=1800&h=900"),
  @("family-cycling.jpg", "photo-1643632540114-5e2b3753919d", "w=1200&h=900"),
  @("mortgage.jpg",       "photo-1758523671285-9ff3f4e0ff38", "w=1200&h=900"),
  @("newsletter.jpg",     "photo-1573496782432-8690d8148c46", "w=1000&h=380"),
  @("account.jpg",        "photo-1758272422081-20d29fb67365", "w=1200&h=600")
)
foreach ($p in $photos) {
  Write-Host "-> $($p[0])"
  Invoke-WebRequest -Uri "https://images.unsplash.com/$($p[1])?auto=format&fit=crop&fm=jpg&q=80&$($p[2])" -OutFile (Join-Path $dir $p[0])
}
Write-Host "Done. Commit assets\img to serve the photos from your repo."
