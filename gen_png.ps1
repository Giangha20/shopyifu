Add-Type -AssemblyName System.Drawing

$imgDir = "C:\Users\giang\.gemini\antigravity\scratch\luxe-shop\public\images"
if (!(Test-Path $imgDir)) {
    New-Item -ItemType Directory -Path $imgDir -Force | Out-Null
}

function Generate-AppIcon {
    param(
        [string]$OutPath,
        [int]$Size
    )
    $bmp = New-Object System.Drawing.Bitmap $Size, $Size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

    $bgBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(26,26,26))
    $g.FillRectangle($bgBrush, 0, 0, $Size, $Size)

    $goldPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(201,169,110)), ([float]($Size * 0.035))
    $g.DrawEllipse($goldPen, [float]($Size * 0.08), [float]($Size * 0.08), [float]($Size * 0.84), [float]($Size * 0.84))

    $font = New-Object System.Drawing.Font ("Georgia", [float]($Size * 0.42), [System.Drawing.FontStyle]::Bold)
    $textBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(201,169,110))

    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = [System.Drawing.StringAlignment]::Center
    $sf.LineAlignment = [System.Drawing.StringAlignment]::Center

    $rect = New-Object System.Drawing.RectangleF 0, 0, $Size, $Size
    $g.DrawString("L", $font, $textBrush, $rect, $sf)

    $bmp.Save($OutPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
}

Generate-AppIcon -OutPath "$imgDir\icon-192.png" -Size 192
Generate-AppIcon -OutPath "$imgDir\icon-512.png" -Size 512

Write-Host "Icons generated:" (Test-Path "$imgDir\icon-192.png") (Test-Path "$imgDir\icon-512.png")
