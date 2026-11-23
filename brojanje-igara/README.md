# Brojanje igara

Aplikacija za brojanje poena i pobjeda u kartaškim i društvenim igrama (Uno, Remi, Tablić, Belot, Jamb ili bilo koja druga).

- Dodaj igru iz brzog izbora ili vlastitu, s bojom i znakom.
- Dodaj i imenuj igrače.
- Broji poene po rundama (pobjeđuje najviše ili najmanje) ili samo pobjede.
- Opcionalna granica do koje se igra, s proglašenjem pobjednika.
- Historija rundi, poništavanje i brisanje.
- Podaci se čuvaju lokalno u pregledniku (`localStorage`).

## Razvoj

Izvor je `src/app.html`. `node build.js` sklapa samostalni `index.html`.

## Objava

Statička stranica bez build koraka: Vercel servira `index.html` direktno (Framework Preset: Other, bez build komande).

## Aplikacija na telefonu

Stranica je PWA: `manifest.webmanifest`, ikone i `sw.js` omogućavaju instalaciju na početni ekran i rad bez interneta. Kod promjene naziva ili adrese ažuriraj `manifest.webmanifest` i konstantu `SITE` u `build.js`, pa pokreni `node build.js`.
