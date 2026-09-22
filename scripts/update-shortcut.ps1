$WshShell = New-Object -ComObject WScript.Shell
$DesktopPath = [System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::Desktop)
$ShortcutPath = Join-Path $DesktopPath "TabZenith - Dashboard Gerencial.lnk"
$OldUrlPath = Join-Path $DesktopPath "TabZenith.url"

# Detectar el perfil de Chrome donde reside la extensión
$ExtensionId = "oigehliembpnijhhigpeofedoilbgaaj"
$UserDataPath = "$env:LOCALAPPDATA\Google\Chrome\User Data"
$TargetProfile = "Profile 3"

Get-ChildItem -Path $UserDataPath -Filter "Preferences" -Recurse -Depth 2 -ErrorAction SilentlyContinue | ForEach-Object {
    $content = Get-Content $_.FullName -Raw -ErrorAction SilentlyContinue
    if ($content -match $ExtensionId) {
        $TargetProfile = Split-Path (Split-Path $_.FullName -Parent) -Leaf
    }
}

$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$Shortcut.Arguments = "--profile-directory=`"$TargetProfile`" --app=chrome-extension://$ExtensionId/dashboard.html"
$Shortcut.Description = "TabZenith - Dashboard Gerencial de Pestañas AI"
$Shortcut.WorkingDirectory = "C:\Program Files\Google\Chrome\Application"
$Shortcut.Save()

# Limpiar acceso directo viejo de Vite si existiera
if (Test-Path $OldUrlPath) {
    Remove-Item $OldUrlPath -Force -ErrorAction SilentlyContinue
}

Write-Host "Acceso directo actualizado exitosamente hacia la extensión de Chrome ($TargetProfile): $ShortcutPath"

