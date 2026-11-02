# Installs the ndr Transform Quick Apply panel for Premiere Pro (current user).
# Run from this folder:  powershell -ExecutionPolicy Bypass -File install.ps1

$src  = $PSScriptRoot
$dest = Join-Path $env:APPDATA "Adobe\CEP\extensions\ndr-transform-quick-apply"

New-Item -ItemType Directory -Force -Path (Join-Path $dest "CSXS") | Out-Null
Copy-Item (Join-Path $src "CSXS\manifest.xml") (Join-Path $dest "CSXS") -Force
Copy-Item (Join-Path $src "index.html"), (Join-Path $src "main.js"), (Join-Path $src "host.jsx") $dest -Force

# The panel is unsigned, so CEP must allow unsigned extensions.
# Premiere Pro 25 uses CEP 12; CSXS.11 is set too in case.
foreach ($v in "11", "12") {
    $key = "HKCU:\Software\Adobe\CSXS.$v"
    New-Item -Path $key -Force | Out-Null
    Set-ItemProperty -Path $key -Name PlayerDebugMode -Value "1"
}

Write-Host "Installed to $dest"
Write-Host "Restart Premiere Pro, then open Window > Extensions > ndr Transform Quick Apply."
