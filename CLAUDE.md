# Schwimmplan

Web-App für Eltern von Wettkampfschwimmern. Liest EasyWk-Meldeergebnis-PDFs aus und zeigt gefiltert die Starts der eigenen Kinder an (Uhrzeit, Disziplin, Lauf, Bahn).

## Stack
Reines HTML/CSS/JS, keine Build-Tools, keine Dependencies außer PDF.js (via CDN).
Wird als statische Seite auf GitHub Pages gehostet.

## Dateien
- `index.html` — die komplette App (alles in einer Datei)
- `260523-Berlin-SC_Poseidon_Berlin.pdf` — Preset-Wettkampf (Format B: "Nachname, Vorname")
- `mm086.pdf` — Preset-Wettkampf (Format C: mehrtägig, mit Jg|SK-Spalte)
- `manifest.webmanifest`, `sw.js`, `icons/` — PWA (installierbar, offline nutzbar)

## PDF-Parser
PDF.js extrahiert den Rohtext. Danach Regex-Parser für drei EasyWk-Formate:

- **Format A** – `Bahn 3 Torenius Schiller (M) 2016 SC Poseidon Berlin 00:57,66`
- **Format B** – `Bahn 1 Schiller, Torenius 2016 SC Poseidon Berlin 00:48,30`
- **Format C** – `Bahn 3 Yannick Schroeter 2003 | S10 SV Berolina 3,5,H,12+ 02:47,07`

Parser erkennt außerdem:
- `Wettkampf N - Disziplin` → aktueller Wettkampf
- `Lauf N/M - ca. HH:MM Uhr` → aktueller Lauf + Uhrzeit
- `Abschnitt N - Wochentag DD.MM.YYYY` → aktueller Tag (für mehrtägige Wettkämpfe)
- `<Name> vom DD.MM.YYYY bis DD.MM.YYYY` (Seitenkopf) → Wettkampfname + Datum
- Runde aus der letzten Klammer im Wettkampftitel (`Vorlauf`, `Finale`, `A-Finale`, `Jugendfinale`, `1. Runde` …)
- Exceptions-Spalte (z. B. `3,5,H,12+`) wird vom Vereinsnamen abgetrennt

Finals stehen nur in der Wettkampffolge (ohne Läufe). Für jeden Vorlauf-Start werden passende
Finals im selben Abschnitt gesucht (gleiche Strecke + Lage + Geschlecht) und mit einem
Zeitfenster aus den benachbarten Wettkämpfen angezeigt.

## Features
- Namen der Kinder per Chip-UI, gespeichert in localStorage
- Letzter gewählter Preset-Wettkampf in localStorage gespeichert
- Gespeicherte Wettkämpfe (Presets) per fetch() aus dem gleichen Verzeichnis
- Eigene PDF hochladen (Drag & Drop oder Dateiauswahl)
- Bei mehrtägigen Wettkämpfen: Starts chronologisch nach Tag gruppiert mit Tages-Label
- Farbkodierung nach Bahnnummer (0–9)
- Vorlauf/Finale-Badge, bei Vorläufen Hinweis auf mögliches Finale inkl. Zeitfenster
- PWA: Service Worker cacht App, PDF.js und geöffnete Preset-PDFs (beim Ändern von Dateien `CACHE` in `sw.js` hochzählen)

## Deployment
GitHub Pages: `main`-Branch, Root-Verzeichnis.
URL-Schema: `https://USERNAME.github.io/meldeliste/`

## Offene Punkte / mögliche nächste Schritte
- Capacitor-Wrapper für Android APK
