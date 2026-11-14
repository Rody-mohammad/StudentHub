# StudentHub Project Structure

StudentHub is a static website built with plain HTML, CSS, and vanilla JavaScript. It has no build step, package manager dependencies, backend, or database. HTML entry pages remain at the repository root so their existing URLs continue to work. Supporting files are grouped by responsibility and page area.

## Directory tree

```text
.
├── index.html
├── manifest.webmanifest
├── offline.html
├── service-worker.js
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
│       ├── navigation.js
│       └── pwa.js
├── scripts/
│   ├── test-pwa.js
│   ├── test-events.js
│   ├── test-benefits.js
│   └── validate-localization.js
├── assets/
│   ├── icons/
│   │   ├── badge-percent.svg
│   │   ├── building-complex.svg
│   │   ├── bus.svg
│   │   ├── calendar.svg
│   │   ├── app-icon-192.png
│   │   ├── app-icon-512.png
│   │   ├── app-icon-maskable-512.png
│   │   ├── app-icon-full-192.png
│   │   ├── app-icon-full-512.png
│   │   ├── app-icon-full-maskable-512.png
│   │   ├── apple-touch-icon.png
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
│       ├── inter_face.webp
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
| `events.html` | Searchable, filterable Events & Activities directory with demo listings and user-supplied poster listings. |

All application pages use `css/style.css`, load `js/shared/pwa.js` for PWA registration and offline status, and include only the data and behavior scripts they need. `offline.html` is the network-failure fallback. Pages with an app bar also load `js/shared/navigation.js`. HTML pages intentionally stay at the root to preserve existing links and direct page URLs.

## Progressive Web App foundation

- `manifest.webmanifest` declares the StudentHub app name, standalone display mode, brand theme color, a pure-white `background_color`, relative launch URL/scope, and install icons. Its `./` paths support deployment from a subdirectory.
- Android install icons `app-icon-full-192.png` and `app-icon-full-512.png` use manifest purpose `any`; `app-icon-full-maskable-512.png` uses purpose `maskable`. They are square PNGs derived from the supplied full-wordmark `assets/images/inter_face.webp`. They preserve the sun, graduation cap, and “STUDENT HUB” text on white; the maskable artwork stays within the central safe area. The existing browser favicon and 180px Apple touch icon are unchanged.
- Android Chrome uses the manifest's `StudentHub` name, standalone display mode, and standard/maskable full-logo icons. Since Android's native splash is based on the manifest icon and cannot reliably show the complete wordmark at a useful size, `index.html` adds an Android-standalone-only in-app splash using the supplied logo. It is centered on `#FFFFFF`, shown after the native splash, then fades after the page is ready. It is not shown in a browser tab or on iOS. There is no custom install button; Chrome controls whether and when its own install UI is available. Production installation requires a secure HTTPS origin. The updated Android launch screen has not been physically tested.
- All HTML pages include the Apple touch icon, standalone capability, app title, and default status-bar metadata. The iOS icon and its metadata are unchanged. On iOS, users add the site from Safari's Share menu; there is no Android-style `beforeinstallprompt` flow. The status-bar style is Safari's `default`, not a promise that it follows the page theme. iOS Add to Home Screen and standalone behavior were not device-tested.
- `js/shared/pwa.js` feature-detects service-worker support, registers the worker using a URL derived from the script's location, and displays localized offline/stale notices and an update action when a new worker is waiting.
- `offline.html` is the cached fallback for an unvisited page requested without a network connection. It supports Arabic, English, Kurdish, RTL/LTR, saved theme preferences, and retry.
- `service-worker.js` uses network-first for HTML navigation, caching each successful page by path (not query string) so the shared detail page can resolve different `section`/`id` parameters offline. Unvisited HTML falls back to `offline.html`.
- The worker precaches the offline shell, shared CSS/data JavaScript, manifest, app icons, full-logo Android splash image, and existing logo. Other same-origin CSS/JS and icons use cache-first; requested images are cached only from `assets/images/` when the response declares a size of 350 KB or less, with a maximum of 24 runtime images. External requests, failed responses, opaque responses, and non-HTML dynamic endpoints are not cached.
- Cache names are versioned with `CACHE_VERSION`. Activation removes only outdated caches whose names start with `studenthub-`; unrelated browser caches are preserved. A new worker waits rather than replacing an active app silently. Clients running this version show a localized update action; choosing it activates the worker and reloads the page after control changes. Clients still running an older cached page script retain the previous wait-for-tabs-to-close behavior until the new worker activates.
- Increment `CACHE_VERSION` when changing the precached JavaScript, CSS, image, or data records so the new worker installs a fresh static cache. The Android launch screen update uses cache version 7. New navigations are network-first and replace their path cache after a successful response.
- Cached pages and assets can be stale while offline. The page-level notice appears when `navigator.onLine` is false or the worker serves a cached navigation; online navigation otherwise remains network-first.
- A local HTTP test served the site from a URL-encoded subdirectory and verified successful HTML, manifest, worker, and icon responses with the expected MIME types; the browser resolved the launch URL and worker scope within that subdirectory. This does not verify a production host or replace HTTPS/device testing.
- The shared detail page keeps its existing query-driven behavior; the service worker caches its HTML by path without query parameters. Previously visited pages work offline from cache; an unvisited page falls back to the localized offline shell. These behaviors were code- and browser-smoke-checked, not validated on a physical installed device.

### Offline data freshness

- HTML pages are not precached as a complete site. After a successful online navigation, the worker stores that HTML path (up to 30 paths); its next offline navigation can use the saved HTML. Query strings are not part of the cache key, so cached `detail.html` continues to read the requested `section` and `id` from the URL.
- An HTML path not previously cached cannot show its requested page offline and instead receives the localized `offline.html` shell. Local listings and detail data are available offline only when their required precached JavaScript and data files are present.
- HTML is network-first and its saved copy is replaced after a successful online navigation. CSS, JavaScript/data, and icons are cache-first; dynamic same-origin images under `assets/images/` are cached only when small enough and the response declares its size. These assets can therefore remain old while offline or until a new static cache is installed. There is no backend or background data synchronization.
- The offline/stale notice indicates that a saved page or offline view is being shown; it does not display a fabricated timestamp or claim that listings are live. Cached offers, events, housing, and transport records can be outdated. Online page text refreshes on a successful navigation, but data/script changes require a released worker version (increment `CACHE_VERSION`) and the user's update action to install the new static cache.

### Static deployment requirements

- Production must use HTTPS; `localhost` is allowed for development. Keep the manifest, worker, HTML, and referenced assets available under the same application subdirectory so the relative manifest URLs and worker scope continue to resolve there.
- Serve `manifest.webmanifest` as `application/manifest+json` (or a browser-supported JSON MIME type), `service-worker.js` as JavaScript (for example `text/javascript`), and PNG icons as `image/png`. The worker must be served from the intended app scope. Do not rewrite direct `.html` page requests or strip their query parameters.
- Because filenames are not content-hashed, configure the host/CDN to revalidate the service worker and changing HTML/CSS/JavaScript/data files rather than serving stale copies after a release.

### Phase 4 deployment status

- **Platform and URL:** GitHub Pages is live at `https://rody-mohammad.github.io/StudentHub/`. On 2026-11-14 the homepage loaded over HTTPS in the browser, and `window.isSecureContext` was true. The repository source is served from the `/StudentHub/` subdirectory.
- **Hosting configuration:** the repository owner reports GitHub Pages is configured from `main` at `/(root)` with HTTPS enforcement. The site is a static multi-page website with no build step; no SPA fallback, redirects, or additional host configuration are required. Preserve direct `.html` paths and query parameters.
- **Production resource check (2026-11-14):** the manifest, service worker, offline page, and all three install icons returned HTTP 200. The manifest was served as `application/manifest+json`, the worker as `application/javascript`, and icons as `image/png`. The manifest's relative `./index.html` start URL and `./` scope resolve within `/StudentHub/`.
- **Service worker status:** the production browser exposed the expected `/StudentHub/` registration scope, but no active, installing, or waiting worker, no controller, and no `studenthub-*` cache were present during checks. Successful activation and control are not verified; installation, standalone launch, cached navigation, and the unvisited-page fallback remain unverified.
- **Release/update procedure:** review and commit approved changes to `main`, then push them to trigger a Pages deployment. Allow the deployment to finish and verify the updated site, worker, and critical assets. Do not add a build process or rewrite direct `.html` paths.
- **PWA and offline limits:** keep `manifest.webmanifest`, `service-worker.js`, `offline.html`, icons, and referenced files at their existing relative locations. The worker's intended behavior is to cache successfully visited pages and show the offline page for an unvisited page, but those behaviors were not confirmed in production. Cached listings may be stale. Device installation and offline behavior remain unverified until an active service worker is confirmed and those tests complete.

### Verification and device checklist

- Production checks on 2026-11-14: HTTPS homepage, Deals, Benefits, Events, Housing, Transportation, and `detail.html?section=deals&id=1` loaded successfully. The detail showed the requested deal and its back button returned to Deals. The header drawer navigated to Housing, and language switching rendered English/LTR, Kurdish/RTL, and Arabic/RTL. Dark mode persisted after reload. At 390x844, these pages had no horizontal overflow or broken loaded images; the run reported no JavaScript console errors or failed requests. The homepage contains no HTML `<footer>`, so footer navigation was not applicable.
- The production manifest, service worker, offline page, install icons, and worker core assets returned successful same-origin responses with expected MIME types. However, the browser did not expose an active worker/controller or its caches. Offline mode displayed the offline notice and one image request failed with `ERR_INTERNET_DISCONNECTED`; the full cached-page and unvisited-page navigation sequence could not be verified.
- In local VS Code embedded Chromium, smoke checks covered the homepage, deals, events, housing, transportation, and a query-driven detail page at a 390x844 viewport. Checks found no horizontal overflow, broken visible images or same-origin HTML links, JavaScript exceptions, or failed non-document requests. Titles, language/direction, viewport metadata, and basic keyboard focus were checked. This was not Android Chrome or iOS Safari.
- A focused color-contrast check found low-contrast housing and transportation filter labels; their light-theme colors were darkened, with lighter transportation accents specified for dark theme. The check was a targeted browser heuristic, not a complete WCAG audit.
- Lighthouse was not installed or available in the browser tools used for this audit, so no Lighthouse categories, scores, or installability diagnostics were produced. No physical Android/iOS devices were available; standalone installation and device-specific behavior remain unverified.
- Manual release checklist:
  1. After publishing the changes to GitHub Pages, uninstall any older StudentHub app. Open the HTTPS site in Android Chrome while online; tap “Update now” if the update notice appears, or close StudentHub tabs and reopen the site so the new service worker activates. Install again from Chrome's menu. Launch it and verify the native splash has a white background and no blue icon border, followed by a centered, undistorted full “STUDENT HUB” logo. Confirm it disappears after the homepage is ready and does not appear in a normal browser tab.
  2. Navigate between pages and detail query URLs, switch language/theme, test previously cached pages and an uncached page in airplane mode, then reconnect and accept a waiting update. The logo is precached; pages still need to have been visited online before their full content is available offline.
  3. On iOS Safari, use Share > Add to Home Screen, launch the saved app, verify navigation, language/theme and offline fallback, and confirm the status bar behavior on the target iOS version.

## JavaScript responsibilities

| File | Responsibility |
|---|---|
| `js/data/local-records.js` | Classic-script data arrays for deals, legacy benefits, housing, and transportation. Its top-level `const` bindings are consumed by `js/shared/catalog-pages.js` and, on the homepage, `js/pages/home/offers.js`. Load it before those consumers. |
| `js/data/benefits-catalog.js` | `window.STUDENTHUB_BENEFITS`: book/study listings, online offers, software, and home-service records. |
| `js/data/events.js` | `window.eventsData`: demo and poster-based event records with dates, categories, locations, and registration metadata. |
| `js/localization/translations.js` | `window.STUDENTHUB_TRANSLATIONS`, with interface (`ui`) and record (`data`) translations. It must load before `js/localization/i18n.js`. |
| `js/localization/i18n.js` | Language persistence, static and dynamic translation lookup, document language/direction, page titles, and language-change subscribers. |
| `js/shared/catalog-pages.js` | Deals, housing, transportation and shared detail-page initialization/rendering, search, and filter utilities. |
| `js/shared/events.js` | Shared event date formatting and date-derived Upcoming/Ongoing/Past state for listing, home preview, and detail rendering. |
| `js/pages/events/events.js` | Events category/search/status/location filters and the homepage upcoming-events preview. Loaded on `events.html` and `index.html`. |
| `js/pages/benefits/benefits.js` | Search, sort, category/type filters, cards, and results for the three benefits subcatalogs. |
| `js/pages/home/offers.js` | Homepage skeleton cleanup, offer detail cards, carousels, and student-service showcase. Loaded only on `index.html`. |
| `js/shared/navigation.js` | Shared navigation drawer, language controls, theme switch, keyboard handling, and page links. Runs on pages with an `.app-bar`. |
| `js/shared/pwa.js` | Feature-detects and registers the root-scoped service worker, reports offline/stale content, and lets the user apply a waiting update; does not affect pages when service workers are unavailable. |
| `js/pages/home/intro.js` | Homepage-only welcome intro. Uses session storage, the `welcome=1` query flag for replay, and the reduced-motion preference. |

`service-worker.js` owns cache versioning, the static shell cache, the bounded runtime page/image caches, and the navigation/static asset strategies.

Scripts are ordinary browser scripts, not modules. Preserve each page's existing dependency order; avoid loading page-specific behavior on unrelated pages. Existing classic-script globals are a deliberate compatibility pattern for this no-build project. The shared catalog renderer remains together because its search, category, detail, housing, and transportation behavior share helpers and data.

## Data and detail-page architecture

- `js/data/local-records.js` contains `dealsData`, `benefitsData`, `housingData`, and `transportationData`. Numeric record IDs are used in detail links and should remain stable.
- `js/data/benefits-catalog.js` contains the separate `STUDENTHUB_BENEFITS` catalogs, whose IDs are strings.
- `js/data/events.js` contains fictional demo events and poster-based listings. Poster details are not independently verified. Runtime status is derived from dates/times, including date-only ranges; registration links remain empty unless an official HTTPS destination is verified.
- Deal cards and related listings link to `detail.html?section=<section>&id=<id>`.
- Event cards link to the same renderer with `detail.html?section=events&id=<id>`. Event detail requests use `js/shared/catalog-pages.js`, without a separate detail-page architecture.
- `js/shared/catalog-pages.js` maps `section` to the correct data source and renderer. It compares IDs as strings, displays a translated error for invalid sections or missing records, and selects section-specific back links where configured.
- Keep demo deals visibly identified as illustrative. Names and images supplied for new local businesses can be listed, but do not infer or imply that a discount, medical service, or business detail is verified unless it has been confirmed.

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

For events, add a stable-ID record to `js/data/events.js`, add its title, organizer, description, location, and participation requirements under `data.events.<id>` in `js/localization/translations.js`, and use an existing event category or add its translated category key. Provide an ISO date and 24-hour local start/end times, or an `endDate` for a poster-based date range without times. Status is computed from these fields. Use an empty registration URL unless an official HTTPS URL is verified. Keep fictional demos distinct from poster details that have not been independently verified.

For benefits subcatalogs, add data in `js/data/benefits-catalog.js` and update the relevant category map and labels in `js/pages/benefits/benefits.js` and `js/localization/translations.js`. Keep provider status and illustrative records distinct.

## Local development and validation

No install or build step is required. From the project root, start a static server, for example:

```sh
python -m http.server 8000
```

Then open `http://localhost:8000/`. Live Server is also suitable.

Run the available checks from the project root:

```sh
node scripts/test-pwa.js
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
