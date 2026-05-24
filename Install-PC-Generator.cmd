@echo off
setlocal EnableExtensions
title PC Generator Installer

if exist "%~dp0dist\PC-Generator-Setup-aktuell.exe" (
  start "" "%~dp0dist\PC-Generator-Setup-aktuell.exe"
  exit /b 0
)

if exist "%~dp0dist\PC-Generator-Setup.exe" (
  start "" "%~dp0dist\PC-Generator-Setup.exe"
  exit /b 0
)

echo Keine Setup-EXE gefunden. Baue den Installer...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0build-installer.ps1"

if exist "%~dp0dist\PC-Generator-Setup-aktuell.exe" (
  start "" "%~dp0dist\PC-Generator-Setup-aktuell.exe"
  exit /b 0
)

echo.
echo Setup konnte nicht gefunden werden.
pause
