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

## Statistika

„Završi partiju i počni novu“ sprema rezultat u statistiku igre (pobjede, prosjek, zadnje partije). Sve ostaje u pregledniku.

## Zajednički sto uživo

`api/table.js` je Vercel funkcija koja drži stanje podijeljenog stola pod kratkim kodom. Treba joj Redis s REST pristupom:
u Vercel projektu otvori Storage → Create Database → Upstash for Redis i poveži ga s projektom. Vercel sam doda varijable
`KV_REST_API_URL` i `KV_REST_API_TOKEN` (ili `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`); nakon toga uradi Redeploy.
Dok spremište nije povezano, dugme „Podijeli sto uživo“ se ne prikazuje i sve ostalo radi normalno.
Podijeljeni sto se briše sam tri dana nakon zadnje izmjene.
