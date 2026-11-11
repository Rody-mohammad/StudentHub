# StudentHub Project Structure

StudentHub is a static website built with plain HTML, CSS, and vanilla JavaScript. It has no build step, package manager dependencies, backend, or database. HTML entry pages remain at the repository root so their existing URLs continue to work. Supporting files are grouped by responsibility and page area.

## Directory tree

```text
.
├── index.html
├── about.html
├── benefits.html
├── book-discounts.html
├── deals.html
├── detail.html
├── events.html
├── digital-offers.html
├── gym-offers.html
├── housing-details.html
├── housing.html
├── restaurant-offers.html
├── software-guides.html
├── transport-external.html
├── transport-zakho.html
├── transportation.html
├── css/
│   └── style.css
├── js/
│   ├── data/
│   │   ├── benefits-catalog.js
│   │   ├── events.js
│   │   └── local-records.js
│   ├── localization/
│   │   ├── i18n.js
│   │   └── translations.js
│   ├── pages/
│   │   ├── benefits/
│   │   │   └── benefits.js
│   │   ├── events/
│   │   │   └── events.js
│   │   └── home/
│   │       ├── intro.js
│   │       └── offers.js
│   └── shared/
│       ├── catalog-pages.js
│       ├── events.js
│       └── navigation.js
├── scripts/
│   ├── test-events.js
│   ├── test-benefits.js
│   └── validate-localization.js
├── assets/
│   ├── icons/
│   │   ├── badge-percent.svg
│   │   ├── building-complex.svg
│   │   ├── bus.svg
│   │   ├── calendar.svg
│   │   ├── graduation-cap.svg
│   │   ├── house.svg
│   │   ├── info.svg
│   │   ├── menu.svg
│   │   └── x.svg
│   ├── logo.png
│   └── images/
│       ├── CREDITS.md
│       ├── event-demo-cover.svg
│       ├── StudentHubLogo.png
│       ├── Y5cafe.png
│       ├── golverdi.png
│       ├── image copy.png
│       ├── image.4B.png
│       ├── image.fastLink.png
│       ├── image.JB.png
│       ├── image.Visual.png
│       ├── image.png
│       ├── image1.png
│       ├── image3.png
│       ├── imagegemeni.png
│       ├── unibus.png
│       ├── vs.logo.png
│       └── -5370780119330398362_121.jpg
├── docs/
│   ├── PROJECT_DESCRIPTION.md
│   ├── PROJECT_STRUCTURE.md
│   └── StudentHub_Website_Documentation.md
├── reports/
│   └── localization-report.json
└── .gitignore
```

The backup folder and three root-level photos on some local checkouts are ignored by Git and are not runtime dependencies. They were left untouched because their ownership and archival purpose are uncertain. Several tracked image files are also not referenced by the current HTML, CSS, or JavaScript and are retained for the same reason.

## Pages

| Page | Responsibility |
|---|---|
| `index.html` | Home offer carousel and previews of student services. |
| `about.html` | Project information and business/contact details. |
| `deals.html` | Searchable local-offer list and category filters. |
| `restaurant-offers.html`, `gym-offers.html` | Existing category-specific deals views. |
| `benefits.html` | Overview linking to the benefits catalogs. |
| `book-discounts.html` | Booksellers and study spaces. |
| `digital-offers.html` | Online student offers and subscriptions. |
| `software-guides.html` | Software catalog and installation links. |
| `housing.html` | Search, filtering, sorting, and display of housing options. |
| `housing-details.html` | Existing housing information page. |
| `transportation.html` | Transportation directory. |
| `transport-zakho.html`, `transport-external.html` | Local and intercity transportation listings. |
| `detail.html` | Shared detail view selected by URL query parameters. |
| `events.html` | Searchable, filterable Events & Activities directory and featured demo event. |

All pages use `css/style.css`. Pages include only the data and behavior scripts they need, then load `js/shared/navigation.js` for shared navigation. HTML pages intentionally stay at the root to preserve existing links and direct page URLs.

## JavaScript responsibilities

| File | Responsibility |
|---|---|
| `js/data/local-records.js` | Classic-script data arrays for deals, legacy benefits, housing, and transportation. Its top-level `const` bindings are consumed by `js/shared/catalog-pages.js` and, on the homepage, `js/pages/home/offers.js`. Load it before those consumers. |
| `js/data/benefits-catalog.js` | `window.STUDENTHUB_BENEFITS`: book/study listings, online offers, software, and home-service records. |
| `js/data/events.js` | `window.eventsData`: fictional event records with dates, categories, locations, and registration metadata. |
| `js/localization/translations.js` | `window.STUDENTHUB_TRANSLATIONS`, with interface (`ui`) and record (`data`) translations. It must load before `js/localization/i18n.js`. |
| `js/localization/i18n.js` | Language persistence, static and dynamic translation lookup, document language/direction, page titles, and language-change subscribers. |
| `js/shared/catalog-pages.js` | Deals, housing, transportation and shared detail-page initialization/rendering, search, and filter utilities. |
| `js/shared/events.js` | Shared event date formatting and date-derived Upcoming/Ongoing/Past state for listing, home preview, and detail rendering. |
| `js/pages/events/events.js` | Events category/search/status/location filters and the homepage upcoming-events preview. Loaded on `events.html` and `index.html`. |
| `js/pages/benefits/benefits.js` | Search, sort, category/type filters, cards, and results for the three benefits subcatalogs. |
| `js/pages/home/offers.js` | Homepage skeleton cleanup, offer detail cards, carousels, and student-service showcase. Loaded only on `index.html`. |
| `js/shared/navigation.js` | Shared navigation drawer, language controls, theme switch, keyboard handling, and page links. Runs on pages with an `.app-bar`. |
| `js/pages/home/intro.js` | Homepage-only welcome intro. Uses session storage, the `welcome=1` query flag for replay, and the reduced-motion preference. |

Scripts are ordinary browser scripts, not modules. Preserve each page's existing dependency order; avoid loading page-specific behavior on unrelated pages. Existing classic-script globals are a deliberate compatibility pattern for this no-build project. The shared catalog renderer remains together because its search, category, detail, housing, and transportation behavior share helpers and data.

## Data and detail-page architecture

- `js/data/local-records.js` contains `dealsData`, `benefitsData`, `housingData`, and `transportationData`. Numeric record IDs are used in detail links and should remain stable.
- `js/data/benefits-catalog.js` contains the separate `STUDENTHUB_BENEFITS` catalogs, whose IDs are strings.
- `js/data/events.js` contains fictional event examples only. Their runtime status is derived from each event's date and time; registration links are empty unless a real HTTPS destination is verified.
- Deal cards and related listings link to `detail.html?section=<section>&id=<id>`.
- Event cards link to the same renderer with `detail.html?section=events&id=<id>`. Event detail requests use `js/shared/catalog-pages.js`, without a separate detail-page architecture.
- `js/shared/catalog-pages.js` maps `section` to the correct data source and renderer. It compares IDs as strings, displays a translated error for invalid sections or missing records, and selects section-specific back links where configured.
- Keep demo deals visibly identified as illustrative. Do not infer or imply that a discount or medical service is real unless it has been verified.

## Localization and direction

`js/localization/translations.js` holds interface and data translations for Arabic, English, and Bahdini Kurdish. Add UI labels under `ui` and localized record fields under `data.<section>.<id>.<field>`. Dynamic values should include `ar`, `en`, and `ku` variants. Keep source record IDs and translation IDs aligned.

`js/localization/i18n.js` persists the language in `localStorage` under `studenthubLanguage`; Arabic and Kurdish use RTL, and English uses LTR. It also updates the page title and notifies shared renderers on language changes. The theme is stored separately as `studenthubTheme`. The homepage intro's once-per-session state uses `sessionStorage`.

The translation dictionary currently contains a small set of repeated source phrases that map to different translation keys. `validate-localization.js` reports these as alias conflicts because plain-text alias matching cannot tell which key a duplicate phrase intended. When adding static copy, prefer unique source wording or add an explicit key-based localization mechanism rather than adding another ambiguous alias.

## Adding a page

1. Add a root-level HTML file using the existing document structure and mobile viewport; keeping it at the root preserves the page URL pattern.
2. Load `js/localization/translations.js` before `js/localization/i18n.js`; load only the data and page behavior scripts that the page needs, in dependency order.
3. Use the existing shared stylesheet and navigation markup pattern. Keep IDs referenced by page scripts unique and present.
4. Add a page-title translation and any visible UI copy in `js/localization/translations.js`.
5. Add the page to the required-page list in `scripts/validate-localization.js`.
6. Check all relative script, style, image, and link URLs from the new page.

## Adding a data category or record

For Deals, add a record to `dealsData` in `js/data/local-records.js`, add its category to the category list in `initDealsPage()` in `js/shared/catalog-pages.js`, add a label under `ui` in `js/localization/translations.js`, map the category in `js/localization/i18n.js`, and add it to `categoryKeyMap` in `scripts/validate-localization.js`. Add localized record fields under the matching `data.deals.<id>` key.

For events, add a stable-ID record to `js/data/events.js`, add its title, organizer, description, location, and participation requirements under `data.events.<id>` in `js/localization/translations.js`, and use an existing event category or add its translated category key. Provide an ISO date and 24-hour local start/end times; status is computed from these fields. Use an empty registration URL unless an official HTTPS URL is verified. Mark every prototype record as fictional demo content.

For benefits subcatalogs, add data in `js/data/benefits-catalog.js` and update the relevant category map and labels in `js/pages/benefits/benefits.js` and `js/localization/translations.js`. Keep provider status and illustrative records distinct.

## Local development and validation

No install or build step is required. From the project root, start a static server, for example:

```sh
python -m http.server 8000
```

Then open `http://localhost:8000/`. Live Server is also suitable.

Run the available checks from the project root:

```sh
node scripts/test-benefits.js
node scripts/test-events.js
node scripts/validate-localization.js
```

The localization validator writes its detailed results to `reports/localization-report.json`. Duplicate static aliases are reported separately and may require context-specific localization; do not remove or merge translated strings merely to suppress those warnings.

## Audit notes

- HTML pages remain at the root to preserve public URLs. JavaScript is grouped under `js/data/`, `js/localization/`, `js/pages/`, and `js/shared/`; project documentation and generated validation output are grouped under `docs/` and `reports/`.
- `css/style.css` is the shared responsive and theme stylesheet; no safe page-specific extraction was identified during this audit.
- Unused/archived images and `_backup_before_ui_v2/` are retained pending confirmation rather than deleted.
- The layout, palette, breakpoints, RTL/LTR behavior, and existing feature architecture were not redesigned.
