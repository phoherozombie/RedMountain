# Red Mountain Contact Buttons Automated Verification Script
$ErrorActionPreference = "Stop"

Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "RUNNING AUTOMATED CONTACTS AND ASSETS VERIFICATION" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan

$filesToCheck = @(
    @{ Path = "index.html"; Rel = "./" },
    @{ Path = "pages/rooms.html"; Rel = "../" },
    @{ Path = "pages/wellness.html"; Rel = "../" },
    @{ Path = "pages/long-stay.html"; Rel = "../" },
    @{ Path = "pages/contact.html"; Rel = "../" }
)

$targetFacebook = "https://www.facebook.com/profile.php?id=61582163267317"
$targetZalo = "https://zalo.me/086699439"
$targetWhatsApp = "https://wa.me/8486699439"

$overallPass = $true

foreach ($file in $filesToCheck) {
    $filePath = Join-Path (Get-Location) $file.Path
    Write-Host "`nChecking: $($file.Path)..." -ForegroundColor Yellow

    if (-not (Test-Path $filePath)) {
        Write-Host "[FAIL] File not found: $filePath" -ForegroundColor Red
        $overallPass = $false
        continue
    }

    $content = Get-Content $filePath -Raw
    $filePass = $true

    # 1. Check sticky-cta presence
    if ($content -match "sticky-cta") {
        Write-Host "  [PASS] sticky-cta container found" -ForegroundColor Green
    } else {
        Write-Host "  [FAIL] sticky-cta container NOT found" -ForegroundColor Red
        $filePass = $false
    }

    # 2. Check Facebook Fanpage URL
    if ($content -match [regex]::Escape($targetFacebook)) {
        Write-Host "  [PASS] Facebook URL matches: $targetFacebook" -ForegroundColor Green
    } else {
        Write-Host "  [FAIL] Facebook URL missing or incorrect (Expected: $targetFacebook)" -ForegroundColor Red
        $filePass = $false
    }

    # 3. Check Zalo URL
    if ($content -match [regex]::Escape($targetZalo)) {
        Write-Host "  [PASS] Zalo URL matches: $targetZalo" -ForegroundColor Green
    } else {
        Write-Host "  [FAIL] Zalo URL missing or incorrect (Expected: $targetZalo)" -ForegroundColor Red
        $filePass = $false
    }

    # 4. Check WhatsApp URL
    if ($content -match [regex]::Escape($targetWhatsApp)) {
        Write-Host "  [PASS] WhatsApp URL matches: $targetWhatsApp" -ForegroundColor Green
    } else {
        Write-Host "  [FAIL] WhatsApp URL missing or incorrect (Expected: $targetWhatsApp)" -ForegroundColor Red
        $filePass = $false
    }

    # 5. Check upgrade.css import
    if ($content -match 'href="[^"]*css/upgrade\.css"') {
        Write-Host "  [PASS] upgrade.css stylesheet import found" -ForegroundColor Green
    } else {
        Write-Host "  [FAIL] upgrade.css stylesheet import NOT found" -ForegroundColor Red
        $filePass = $false
    }

    # 6. Check upgrade.js import
    if ($content -match 'src="[^"]*js/upgrade\.js"') {
        Write-Host "  [PASS] upgrade.js script import found" -ForegroundColor Green
    } else {
        Write-Host "  [FAIL] upgrade.js script import NOT found" -ForegroundColor Red
        $filePass = $false
    }

    if ($filePass) {
        Write-Host "Status: ALL CHECKS PASSED for $($file.Path)" -ForegroundColor Green
    } else {
        Write-Host "Status: CHECKS FAILED for $($file.Path)" -ForegroundColor Red
        $overallPass = $false
    }
}

Write-Host "`n==============================================" -ForegroundColor Cyan
if ($overallPass) {
    Write-Host "VERIFICATION RESULTS: ALL PAGES PASSED!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "VERIFICATION RESULTS: SOME PAGES FAILED!" -ForegroundColor Red
    exit 1
}
