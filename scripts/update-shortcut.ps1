$WshShell = New-Object -ComObject WScript.Shell
$DesktopPath = [System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::Desktop)
$ShortcutPath = Join-Path $DesktopPath "TabZenith - Dashboard Gerencial.lnk"

$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$Shortcut.Arguments = "--app=chrome-extension://oigehliembpnijhhigpeofedoilbgaaj/dashboard.html"
$Shortcut.Description = "TabZenith - Dashboard Gerencial de Pestañas AI"
$Shortcut.WorkingDirectory = "C:\Program Files\Google\Chrome\Application"
$Shortcut.Save()

Write-Host "Acceso directo actualizado exitosamente hacia la extensión de Chrome: $ShortcutPath"
