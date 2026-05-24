# PC Generator

Moderne Windows-App fuer PC-Vorschlaege nach Budget und Nutzung. Die Vorschlaege orientieren sich an Dubaro-PC-Klassen und erzeugen fuer jede Komponente passende Geizhals-Suchlinks.

## Start

```powershell
npm.cmd run start
```

## Installieren wie ein normales Windows-Programm

Installer bauen:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\build-installer.ps1
```

Doppelklick auf:

```text
dist\PC-Generator-Setup-aktuell.exe
```

Oder direkt:

```text
Install-PC-Generator.cmd
```

Der Electron-Installer erstellt eine Desktop- und Startmenue-Verknuepfung mit dem App-Icon und registriert den PC Generator in den Windows-Einstellungen unter installierte Apps.

## Entwicklung

Abhaengigkeiten installieren:

```powershell
npm.cmd install
```

App starten:

```powershell
npm.cmd run start
```

Installer bauen:

```powershell
npm.cmd run dist
```

## CLI-Fallback

Die Kommandozeile bleibt erhalten:

```powershell
node pc-generator.cjs --budget 1800 --use gaming --goal 1440p
```

Mit mehreren Nutzungen:

```powershell
node pc-generator.cjs --budget 1800 --use gaming,streaming --goal 1440p
node pc-generator.cjs --budget 2200 --use gaming+creator --goal 4k
```

Mit Preisspanne:

```powershell
node pc-generator.cjs --budget 1200-1800 --use gaming --goal 1440p
```

Oder mit getrennten Werten:

```powershell
node pc-generator.cjs --min 1200 --max 1800 --use gaming --goal 1440p
```

Mit Datei-Ausgabe:

```powershell
node pc-generator.cjs --budget 2800 --use creator --goal 4k --save
```

## Nutzungen

- `gaming`
- `streaming`
- `creator`
- `ai`
- `office`
- `allround`

## Ziele

- `1080p`
- `1440p`
- `4k`
- `quiet`
- `upgrade`

Das App-Icon wird aus `assets\app-icon.png` und `assets\app-icon.ico` genutzt. Mit `scripts\create-icon.ps1` kann es aus dem Originalbild neu erzeugt werden.

In der App sind die Komponentennamen und die Direktlink-Buttons direkt mit Geizhals verbunden.

Fuer 800-1000 Euro mit Gaming + Streaming + Creator priorisiert der Generator jetzt Ryzen 5 5600, 32GB DDR4 und eine sinnvollere NVMe-SSD statt Ryzen 5 5500, 16GB RAM oder ueberteuertem Kuehler/Storage.
