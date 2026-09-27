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

## Design
Material Design 3, helles Schema im Stil der Google-Apps (Farben als CSS-Variablen in `:root`,
Systemschrift/Roboto, Material-Icons inline als SVG-Pfade in `ICONS`). Kein Dunkelmodus.
Aufbau: Top-App-Bar mit Menü · Wettkampf-Auswahl (Bottom-Sheet) · Kinder als Filter-Chips
(„＋ Kind“ öffnet Dialog mit Live-Namensprüfung und Liste zum Entfernen) · pro Kind Countdown-Karte +
Liste, vergangene Starts eingeklappt · Snackbar. „Wettkampf hinzufügen“ im Menü (⋮) und im
Wettkampf-Auswahlblatt (bewusst kein schwebender Knopf). Ohne gespeicherten Wettkampf:
Startseite mit „PDF auswählen“. UI wird komplett über `render()` aus dem Zustand neu gezeichnet.

## Features
- Namen der Kinder per Chip-UI, gespeichert in localStorage (`schwimmplan_names`); per Chip ausgeblendete
  Kinder bleiben nach dem Neuladen ausgeblendet (`schwimmplan_hidden`)
- Gespeicherte Wettkämpfe (Presets) per fetch() aus dem gleichen Verzeichnis – derzeit leer.
  Meldeergebnis-PDFs enthalten personenbezogene Daten (Namen, Jahrgänge) und sollen **nicht** ins
  Repo; zum Testen lokal ablegen (`*.pdf` steht in `.gitignore`).
- Eigene PDF hochladen (Drag & Drop auf die ganze Seite oder Dateiauswahl über Menü, Auswahlblatt, Startseite).
  Hochgeladene PDFs werden lokal im Browser
  gespeichert (IndexedDB `schwimmplan`, Store `competitions`: PDF + Parse-Ergebnis) und erscheinen unter
  der Wettkampf-Auswahl (mit Löschen-Knopf). Gleicher Wettkampf (Name + Datum) ersetzt den alten Eintrag.
  Bei Parser-Änderungen `PARSER_VERSION` hochzählen, dann werden gespeicherte PDFs neu eingelesen.
- Zuletzt geöffneter Wettkampf (`schwimmplan_active` in localStorage) wird beim Start wieder geöffnet
- Bei mehrtägigen Wettkämpfen: Starts chronologisch nach Tag gruppiert mit Tages-Label
- Vorlauf/Finale-Badge, bei Vorläufen Hinweis auf mögliches Finale inkl. Zeitfenster
- Countdown-Karte pro Kind (Countdown kompakt rechts in der Kopfzeile neben dem Status, darunter Trennlinie und Start-Details; blau „Nächster Start“, gelb „Gleich dran“ ab `SOON_MIN` = 30 Min,
  grün „Jetzt dran“ bis `NOW_MIN` = 10 Min nach der ca.-Zeit, „Alle Starts geschafft“ am Ende);
  vergangene Starts eingeklappt („N Starts vorbei“). Aktualisiert alle 30 s und beim Zurückkehren in die App (visibilitychange/focus).
- Menüeintrag „App installieren“: nutzt `beforeinstallprompt` (Chrome/Edge/Samsung), auf iPhone/iPad
  Dialog mit Anleitung (Teilen → Zum Home-Bildschirm); ausgeblendet in der installierten App.
  Einmalige Install-Karte wurde bewusst (noch) nicht umgesetzt.
- PWA: Service Worker cacht App, PDF.js und geöffnete Preset-PDFs (beim Ändern von Dateien `CACHE` in `sw.js` hochzählen)

## Deployment
Nicht indexieren: `<meta name="robots" content="noindex, nofollow">` in `index.html`. Kein `robots.txt`
mit Disallow anlegen (dann sieht Google das noindex nicht). Fußzeile: „Nur private Nutzung · Kontakt:
joerg@schiller.guru · vNN“ – die Versionsnummer `vNN` steht nur dort; bei jeder Änderung zusammen mit
`CACHE` in `sw.js` (`schwimmplan-vNN`) hochzählen.
GitHub Pages: `main`-Branch, Root-Verzeichnis, Repo `joergschiller/wettkampf`.
Live unter https://wettkampf.schiller.guru/ (Custom Domain über die Datei `CNAME` – nicht löschen;
DNS: CNAME `wettkampf` → `joergschiller.github.io` bei Namecheap FreeDNS, HTTPS erzwungen).

## Offene Punkte / mögliche nächste Schritte
- Capacitor-Wrapper für Android APK

## Arbeitsweise
- Änderungen nicht selbst mergen: erst PR öffnen und dem Nutzer Screenshots zeigen, gemergt wird erst nach Freigabe.
