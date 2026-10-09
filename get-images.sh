#!/usr/bin/env bash
# Downloads the demo photos into assets/img so the site serves them locally.
# Run once from the repo root:  bash get-images.sh   — then commit assets/img.
# Until you do, every page falls back to the same photos on the Unsplash CDN.
set -euo pipefail
cd "$(dirname "$0")/assets/img"

get () { echo "→ $1"; curl -fsSL -o "$1" "https://images.unsplash.com/$2?auto=format&fit=crop&fm=jpg&q=80&$3"; }

get hero.jpg           photo-1770872937837-267dadb4a138 "w=1800&h=1000"
get streaming.jpg      photo-1586899028174-e7098604235b "w=1000&h=800"
get card-payment.jpg   photo-1556742031-c6961e8560b0 "w=1800&h=900"
get family-cycling.jpg photo-1643632540114-5e2b3753919d "w=1200&h=900"
get mortgage.jpg       photo-1758523671285-9ff3f4e0ff38 "w=1200&h=900"
get newsletter.jpg     photo-1573496782432-8690d8148c46 "w=1000&h=380"
get account.jpg        photo-1758272422081-20d29fb67365 "w=1200&h=600"

echo "Done. Commit assets/img to serve the photos from your repo."
