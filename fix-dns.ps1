# ============================================================
# GlobeMate — DNS Fix Script
# RIGHT-CLICK this file → "Run with PowerShell" (as Admin)
# OR: Open PowerShell as Admin and run: .\fix-dns.ps1
# ============================================================

$hostFile  = "C:\Windows\System32\drivers\etc\hosts"
$supabase  = "zucibmuisijwpgcfnkds.supabase.co"
$goodIP    = "104.18.38.10"  # Cloudflare IP confirmed working
$marker    = "# GlobeMate Supabase — pinned IP"

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  GlobeMate DNS Fix" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

# ── 1. Add/Update hosts file entry ───────────────────────────
$content = Get-Content $hostFile -Raw -ErrorAction SilentlyContinue

if ($content -match [regex]::Escape($supabase)) {
    # Already present — replace the line to ensure correct IP
    $content = $content -replace ".*$([regex]::Escape($supabase)).*", "$goodIP`t$supabase  $marker"
    Set-Content $hostFile $content -Encoding ASCII
    Write-Host "✅ Hosts entry updated." -ForegroundColor Green
} else {
    Add-Content $hostFile "`r`n$goodIP`t$supabase  $marker" -Encoding ASCII
    Write-Host "✅ Hosts entry added." -ForegroundColor Green
}

# ── 2. Flush DNS cache ────────────────────────────────────────
ipconfig /flushdns | Out-Null
Write-Host "✅ DNS cache flushed." -ForegroundColor Green

# ── 3. Verify ────────────────────────────────────────────────
Write-Host "`nVerifying connection to Supabase..." -ForegroundColor Yellow
try {
    $r = Invoke-WebRequest -Uri "https://$supabase/auth/v1/settings" -TimeoutSec 8 -UseBasicParsing -ErrorAction Stop
    Write-Host "✅ Supabase reachable! (HTTP $($r.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Still can't reach Supabase: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Try restarting your browser after running this script." -ForegroundColor Yellow
}

Write-Host "`n✅ Done! Restart your browser and refresh GlobeMate." -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to exit"
