# Schwimmplan

Web-App für Eltern von Wettkampfschwimmern. Liest EasyWk-Meldeergebnis-PDFs aus und zeigt gefiltert die Starts der eigenen Kinder an (Uhrzeit, Disziplin, Lauf, Bahn).

## Stack
Reines HTML/CSS/JS, keine Build-Tools, keine Dependencies außer PDF.js (via CDN).
Wird als statische Seite auf GitHub Pages gehostet.

## Dateien
- `index.html` — die komplette App (alles in einer Datei)
- `manifest.webmanifest`, `sw.js`, `icons/` — PWA (installierbar, offline nutzbar)

## PDF-Parser
PDF.js extrahiert den Rohtext. Danach Regex-Parser für drei EasyWk-Formate:

- **Format A** – `Bahn 3 Max Mustermann (M) 2016 SC Beispielstadt 00:57,66`
- **Format B** – `Bahn 1 Mustermann, Max 2016 SC Beispielstadt 00:48,30`
- **Format C** – `Bahn 3 Erika Musterfrau 2003 | S10 SV Musterhausen 3,5,H,12+ 02:47,07`

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
- Gespeicherte Wettkämpfe (Presets) per fetch() aus dem gleichen Verzeichnis – derzeit leer.
  Meldeergebnis-PDFs enthalten personenbezogene Daten (Namen, Jahrgänge) und sollen **nicht** ins
  Repo; zum Testen lokal ablegen (`*.pdf` steht in `.gitignore`).
- Eigene PDF hochladen (Drag & Drop oder Dateiauswahl). Hochgeladene PDFs werden lokal im Browser
  gespeichert (IndexedDB `schwimmplan`, Store `competitions`: PDF + Parse-Ergebnis) und erscheinen unter
  „Gespeicherte Wettkämpfe“ (mit Löschen-Knopf). Gleicher Wettkampf (Name + Datum) ersetzt den alten Eintrag.
  Bei Parser-Änderungen `PARSER_VERSION` hochzählen, dann werden gespeicherte PDFs neu eingelesen.
- Zuletzt geöffneter Wettkampf (`schwimmplan_active` in localStorage) wird beim Start wieder geöffnet
- Bei mehrtägigen Wettkämpfen: Starts chronologisch nach Tag gruppiert mit Tages-Label
- Farbkodierung nach Bahnnummer (0–9)
- Vorlauf/Finale-Badge, bei Vorläufen Hinweis auf mögliches Finale inkl. Zeitfenster
- Countdown pro Kind: nächster Start hervorgehoben (blau „Nächster Start“, gelb „Gleich dran“ ab
  `SOON_MIN` = 30 Min, grün „Jetzt dran“ bis `NOW_MIN` = 10 Min nach der ca.-Zeit), vergangene Starts
  gedimmt mit „✓ vorbei“. Aktualisiert alle 30 s und beim Zurückkehren in die App (visibilitychange/focus).
- PWA: Service Worker cacht App, PDF.js und geöffnete Preset-PDFs (beim Ändern von Dateien `CACHE` in `sw.js` hochzählen)

## Deployment
GitHub Pages: `main`-Branch, Root-Verzeichnis, Repo `joergschiller/wettkampf`.
Live unter https://wettkampf.schiller.guru/ (Custom Domain über die Datei `CNAME` – nicht löschen;
DNS: CNAME `wettkampf` → `joergschiller.github.io` bei Namecheap FreeDNS, HTTPS erzwungen).

## Offene Punkte / mögliche nächste Schritte
- Capacitor-Wrapper für Android APK

## Arbeitsweise
- Änderungen nicht selbst mergen: erst PR öffnen und dem Nutzer Screenshots zeigen, gemergt wird erst nach Freigabe.
