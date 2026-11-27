# Coordination - Next.js

Nowa, niezależna od WordPressa wersja strony głównej Coordination. Projekt używa Next.js App Router, TypeScript i CSS Modules. Wszystkie obrazy oraz fonty używane przez stronę są przechowywane lokalnie w `public/`.

## Uruchomienie

```bash
npm install
npm run dev
```

Strona będzie dostępna pod adresem [http://localhost:3000](http://localhost:3000).

## Weryfikacja produkcyjna

```bash
npm run lint
npm run build
npm start
```

## Cloudflare Workers

Strona jest hostowana na Cloudflare Workers przez adapter [OpenNext](https://opennext.js.org/cloudflare). Konfiguracja Workera jest w `wrangler.jsonc`, adaptera w `open-next.config.ts`.

```bash
npm run preview   # build i podgląd w lokalnym runtime Workers (workerd)
npm run deploy    # build i wdrożenie na Cloudflare
```

- `npm run preview` i `npm run deploy` wywołują `next build` w `.next`, więc nie odpalaj ich obok działającego `npm run dev`, bo nadpiszą mu pliki.
- Klucze Resend ustawia się w Workerze: `npx wrangler secret put RESEND_API_KEY` (tak samo `RESEND_FROM_EMAIL` i `CONTACT_EMAIL`). Zmienne do lokalnego podglądu Workera trzymamy w `.dev.vars`.
- Adres strony w canonicalach, Open Graph, sitemapie i robots.txt jest stały: `https://coordination.pl` (`lib/site.ts`). Główny adres `*.workers.dev` przekierowuje (301) na coordination.pl, a podglądy wersji na `*.workers.dev` dostają `X-Robots-Tag: noindex`, żeby Google nie indeksował duplikatów (`worker.ts`).
- `next/image` optymalizuje obrazy przez binding Cloudflare Images (`IMAGES`).
- W Workers Builds komenda buildu to `npx opennextjs-cloudflare build`, a deployu `npx opennextjs-cloudflare deploy`. Sam `wrangler deploy` nie wgra stron statycznych do cache w KV.

### Limit CPU w darmowym planie

Darmowy plan Workers daje żądaniu 10 ms CPU, a render strony przez Reacta zajmuje 20-80 ms (pierwszy w świeżym izolacie nawet 250-580 ms). Cloudflare ubija część takich żądań (503), a następne żądanie w tym izolacie potrafi skończyć się błędem 500. Dlatego odwiedzający prawie nigdy nie uruchamiają renderu:

- **Wejście Workera to `worker.ts`, a nie `.open-next/worker.js`.** `/media/*` (zdjęcia z KV) i `/api/home` (dwa małe zapytania do D1 w jednym `batch`) obsługuje bez Next.js w mniej niż 1 ms. Resztę przekazuje do OpenNext. W `npm run dev` te same adresy obsługują `app/media/[...key]/route.ts` i `app/api/home/route.ts`.
- **Wyrenderowane strony leżą w KV** (binding `NEXT_INC_CACHE_KV`, `open-next.config.ts`), a odpowiedź z cache kosztuje 2-4 ms. Strony statyczne renderuje build, a deploy wgrywa je do KV. Wpisy, `/wiedza` i `/faq` renderują się przy pierwszym wejściu i zostają w cache. Zapis w panelu, który zmienia coś widocznego, oznacza je jako nieaktualne (`lib/blog/cache.ts`, `lib/faq/cache.ts`, tagi w D1 pod bindingiem `NEXT_TAG_CACHE_D1`), więc następne wejście renderuje je od nowa.
- **Strona główna jest statyczna**, a najnowszy wpis i pierwsze pytania z FAQ dociąga przeglądarka jednym żądaniem do `/api/home` (`lib/home-feed.ts`, wspólne dla `LatestPost` i `HomeFaq`).
- **Cron co godzinę** (`scheduled` w `worker.ts`) wypuszcza na strony wpisy z datą publikacji w przyszłości, gdy ta nadejdzie, i usuwa z KV strony z poprzednich buildów (klucze zawierają identyfikator buildu).
- **Panel admina ponawia** żądania zakończone błędem 500/503, poza tworzeniem wpisu i pytania.

`sitemap.xml` i panel admina dalej renderują się przy każdym żądaniu. Plan Workers Paid (limit 30 s CPU) usunąłby ograniczenie, ale cache dalej by się przydał.

## Blog i panel `/admin`

Wpisy bloga leżą w bazie: na Cloudflare w D1 (binding `DB`), a w `npm run dev` w lokalnym pliku SQLite `.data/blog.sqlite` (wbudowany `node:sqlite`, migracje z `migrations/` aplikują się same). Zdjęcia trafiają do Workers KV (binding `MEDIA`), lokalnie do `.data/media/`, i są serwowane pod `/media/...`. KV zamiast R2, bo R2 wymaga podpięcia karty do konta, a KV jest w darmowym planie (do 25 MiB na plik, 1 GB, 1000 zapisów dziennie).

- Opublikowane wpisy są pod `/<slug>`, tak jak w WordPressie (stare adresy z `/` na końcu przekierowują 308), a lista pod `/wiedza`, kolejne strony pod `/wiedza/strona/<n>`. Wpisy i lista idą z cache, który zapis w panelu unieważnia, więc zmiana jest widoczna od razu (patrz „Limit CPU w darmowym planie”). Wpis z datą publikacji w przyszłości pojawi się w ciągu godziny od tej daty.
- Panel jest pod `/admin`. Logowanie kodem `ADMIN_CODE` z `.env` (lokalnie) albo z sekretu Workera. Po zalogowaniu kod zostaje w `localStorage` i idzie do API jako `Authorization: Bearer <kod>`.
- Edytor układa treść w wiersze z kolumnami (1-4) i bloki tekstu lub zdjęć. Treść zapisuje się jako JSON w `posts.content` (typy w `lib/blog/content.ts`).
- Każde wgrane zdjęcie jest konwertowane do WebP (jakość 80, dłuższy bok najwyżej 1920 px): na Cloudflare przez binding `IMAGES`, lokalnie przez `sharp`. SVG zostają bez zmian.
- Import eksportu z WordPressa (`coordination wpisy/blog/posts`) idzie przez API, więc działa tak samo lokalnie i na produkcji. Ponowne uruchomienie aktualizuje wpisy (po `wp_id`) i nie wgrywa zdjęć drugi raz:

```bash
npm run blog:import                                              # do działającego npm run dev
npm run blog:import -- --url https://<adres-workera> --code <ADMIN_CODE>
```

Pierwsze wdrożenie na Cloudflare:

```bash
npx wrangler d1 create coordination        # database_id wpisz w wrangler.jsonc
npx wrangler kv namespace create coordination-media        # id wpisz w wrangler.jsonc (MEDIA)
npx wrangler kv namespace create coordination-page-cache   # id wpisz w wrangler.jsonc (NEXT_INC_CACHE_KV)
npm run db:migrate:remote
npx wrangler secret put ADMIN_CODE
```

Do `npm run preview` potrzebne są `npm run db:migrate:local` i `ADMIN_CODE` w `.dev.vars`.

## FAQ i panel `/admin/faq`

Pytania leżą w tej samej bazie co wpisy, w tabeli `faq_questions` (`migrations/0004_faq.sql`). `migrations/0005_faq_doradztwo.sql` dodaje 14 pytań z odpowiedziami z FAQ starej strony `/doradztwo-dla-firm`. Lokalnie migracje aplikują się same, na Cloudflare przy wdrożeniu trzeba uruchomić `npm run db:migrate:remote`. Do tego czasu `/faq` nie znajdzie tabeli, a strona główna pokaże sam najnowszy wpis, bez pytań.

- Formularz na `/faq` (`POST /api/faq`) zapisuje pytanie ze statusem „do odpowiedzi”, a potem wysyła powiadomienie na `CONTACT_EMAIL` z linkiem do panelu. Brak konfiguracji Resend albo błąd wysyłki trafia tylko do logów: pytanie i tak czeka w panelu. Przed spamem chroni ukryte pole (honeypot) i limit 20 pytań na godzinę dla całej strony. Limity pól są wspólne dla formularza i API (`lib/faq/limits.ts`).
- W panelu (`/admin/faq`) admin widzi treść zgłoszenia, imię i e-mail (nigdy nie trafiają na stronę), redaguje publiczną treść pytania, pisze odpowiedź w tym samym edytorze co wpisy, nadaje kategorię i może przypiąć pytanie. Przypięte są pierwsze na `/faq` i na stronie głównej (tam 6 pierwszych, `HOME_FAQ_LIMIT` w `lib/faq/rows.ts`). „Dodaj pytanie” pozwala napisać pytanie i odpowiedź od zera.
- Jeśli autor zostawił e-mail, przy publikacji panel proponuje wysłanie mu linku do odpowiedzi (`/faq#pytanie-<id>`). Wysyłka jest jednorazowa (`notified_at`); gdy Resend zawiedzie, publikacja i tak się udaje, a panel o tym informuje.
- `/faq` idzie z cache tak jak `/wiedza`. Unieważnia go tylko zmiana widoczna dla odwiedzających: publikacja, cofnięcie publikacji, usunięcie albo edycja opublikowanego pytania. Nowe pytanie z formularza i edycja nieopublikowanych niczego nie unieważniają.

## Struktura projektu

- `app/page.tsx` - układ sekcji strony głównej dostępnej pod `/`;
- `app/layout.tsx` - główny layout i metadane;
- `app/globals.css` - reset, tokeny i lokalne fonty;
- `app/api/contact/route.ts` - obsługa formularza kontaktowego;
- `app/api/faq/route.ts` - zapis pytań z formularza FAQ, `app/api/home/route.ts` - dane strony głównej w `npm run dev`;
- `worker.ts` - wejście Workera: zdjęcia i `/api/home` bez Next.js, cron, reszta do OpenNext;
- `app/[slug]/` - strona wpisu, `app/wiedza/[[...page]]/` - lista wpisów, `app/faq/[[...rest]]/` - FAQ, `app/admin/` - panel bloga i FAQ, `app/api/admin/` - jego API, `app/media/` - serwowanie zdjęć w `npm run dev`;
- `lib/db.ts`, `lib/media.ts`, `lib/blog/`, `lib/faq/` - baza (D1 / SQLite), zdjęcia (KV / dysk), wpisy i pytania FAQ; `lib/home-feed.ts` - pobieranie `/api/home` w przeglądarce;
- `migrations/` - schemat bazy dla D1 i lokalnego SQLite;
- `scripts/import-blog.mts` - import wpisów z eksportu WordPressa;
- `components/` - sekcje strony i komponenty współdzielone; każdy komponent ma swój katalog ze stylami CSS Modules;
- `public/assets/` - grafiki i modele 3D;
- `public/fonts/` - lokalne fonty;
- `.env.example` - przykładowa konfiguracja formularza kontaktowego i kodu do panelu.
