Add-Type -AssemblyName System.Drawing

$assetsDir = "C:\Users\giang\.gemini\antigravity\scratch\luxe-shop\build_assets"
if (!(Test-Path $assetsDir)) {
    New-Item -ItemType Directory -Path $assetsDir -Force | Out-Null
}

function Create-AppIcon {
    param (
        [string]$Path,
        [string]$Letter,
        [System.Drawing.Color]$BgColor,
        [System.Drawing.Color]$TextColor,
        [System.Drawing.Color]$BorderColor
    )
    $size = 64
    $bmp = New-Object System.Drawing.Bitmap $size, $size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

    # Rounded circle background
    $bgBrush = New-Object System.Drawing.SolidBrush $BgColor
    $g.FillEllipse($bgBrush, 2, 2, $size - 4, $size - 4)

    # Border
    $borderPen = New-Object System.Drawing.Pen $BorderColor, 3
    $g.DrawEllipse($borderPen, 2, 2, $size - 4, $size - 4)

    # Letter
    $font = New-Object System.Drawing.Font ("Georgia", [float]28, [System.Drawing.FontStyle]::Bold)
    $textBrush = New-Object System.Drawing.SolidBrush $TextColor
    $format = New-Object System.Drawing.StringFormat
    $format.Alignment = [System.Drawing.StringAlignment]::Center
    $format.LineAlignment = [System.Drawing.StringAlignment]::Center

    $rect = New-Object System.Drawing.RectangleF 0, 0, $size, $size
    $g.DrawString($Letter, $font, $textBrush, $rect, $format)

    $hIcon = $bmp.GetHicon()
    $icon = [System.Drawing.Icon]::FromHandle($hIcon)
    $fileStream = New-Object System.IO.FileStream $Path, ([System.IO.FileMode]::Create)
    $icon.Save($fileStream)
    $fileStream.Close()

    $g.Dispose()
    $bmp.Dispose()
}

$gold = [System.Drawing.Color]::FromArgb(201, 169, 110)
$black = [System.Drawing.Color]::FromArgb(26, 26, 26)
$darkGold = [System.Drawing.Color]::FromArgb(180, 145, 85)

Create-AppIcon -Path "$assetsDir\customer.ico" -Letter "L" -BgColor $black -TextColor $gold -BorderColor $darkGold
Create-AppIcon -Path "$assetsDir\admin.ico" -Letter "A" -BgColor $black -TextColor $gold -BorderColor $darkGold

Write-Host "Icons generated successfully in $assetsDir"
