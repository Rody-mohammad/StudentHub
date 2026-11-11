# StudentHub Website Documentation [Verified in code]

> Last code review: 2026-10-28. The current HTML, CSS, and JavaScript files are the source of truth. This project is a static front-end prototype with no build step or backend.
>
> **Source note:** The previous `docs/StudentHub_Website_Documentation.md` file was not present in the workspace. The project owner chose to create this file rather than update `docs/PROJECT_DESCRIPTION.md`. Therefore, previous documentation text could not be preserved, and code changes since the last documentation update cannot be established.

## 1. Project Status Dashboard [Verified in code]

In this table, “Exists?” refers to the page file, and “Translated” means there is an implemented UI translation. The current files do not implement `ku-Arab`. The presence of responsive CSS rules or a dark-mode mechanism does not mean they have been visually tested; therefore both test columns are marked “Not checked” for every page.

| Page | Exists? | Content type (real / demo / empty) | Translated (en/ar/ku) | Responsive checked | Dark mode checked | Status |
|---|---|---|---|---|---|---|
| `index.html` | Yes | Mixed: real + demo | en Yes / ar Yes / ku No | Not checked | Not checked | In progress |
| `deals.html` | Yes | demo | en Yes / ar Yes / ku No | Not checked | Not checked | In progress |
| `benefits.html` | Yes | Mixed: real + demo | en Yes / ar Yes / ku No | Not checked | Not checked | In progress |
| `housing.html` | Yes | demo | en Yes / ar Yes / ku No | Not checked | Not checked | In progress |
| `housing-details.html` | Yes | demo / points to the demo housing directory | en Yes / ar Yes / ku No | Not checked | Not checked | In progress |
| `transportation.html` | Yes | demo | en Yes / ar Yes / ku No | Not checked | Not checked | In progress |
| `transport-zakho.html` | Yes | demo | en Yes / ar Yes / ku No | Not checked | Not checked | In progress |
| `transport-external.html` | Yes | demo | en Yes / ar Yes / ku No | Not checked | Not checked | In progress |
| `restaurant-offers.html` | Yes | demo | en Yes / ar Yes / ku No | Not checked | Not checked | In progress |
| `gym-offers.html` | Yes | demo | en Yes / ar Yes / ku No | Not checked | Not checked | In progress |
| `detail.html` | Yes | Mixed: real + demo depending on `section` and `id` | en Yes / ar Yes / ku No | Not checked | Not checked | In progress |
| `about.html` | Yes | real: project information and contact method | en Yes / ar Yes / ku No | Not checked | Not checked | In progress |
| `software-guides.html` | Yes | real: software and tool names, no verification date | en Yes / ar Yes / ku No | Not checked | Not checked | In progress |
| `digital-offers.html` | Yes | real according to catalog records marked `checked` | en Yes / ar Yes / ku No | Not checked | Not checked | In progress |
| `book-discounts.html` | Yes | demo | en Yes / ar Yes / ku No | Not checked | Not checked | In progress |

**Summary:** All 15 of 15 page files exist, and 0 of 15 are complete according to this table’s criteria. This does not mean the pages are empty: Kurdish translation is missing, and no visual responsive or dark-mode checks are recorded for any page. `css/style.css` includes responsive rules, and `js/shared/navigation.js` provides a dark-mode switch.

## 2. Content Status [Verified in code]

> “Documented/verified in code” below describes what the code comments and fields say; I did not externally verify whether providers’ offers are still available or available in Zakho. Expiration assessments below use 2026-10-28 as the evaluation date.

### Data sources and classification [Verified in code]

| Source | Records | Classification from code | Notes |
|---|---:|---|---|
| `js/data/local-records.js` — `dealsData` | 8 | demo | The file comment says the content is fictional. Six records have demo month/year `valid_until` values, and two have no date. |
| `js/data/local-records.js` — `benefitsData` | 6 | demo | Names and descriptions are demo content. `last_verified` values are marked `Demo Date` and are not real verification dates. |
| `js/data/local-records.js` — `housingData` | 6 | demo | Names, addresses, prices, and contact numbers are demo content. |
| `js/data/local-records.js` — `transportationData` | 6 | demo | Routes, fares, schedules, and pickup points are illustrative/fictional according to the records themselves. |
| `js/data/benefits-catalog.js` — `books` | 3 | demo | Names and facilities are illustrative; no local discount or stock is confirmed. |
| `js/data/benefits-catalog.js` — `offers` | 9 | General digital offers; all have `verificationStatus: checked` | Records contain source or activation links and share the same `lastVerified` date. This describes the code, not an external verification performed in this review. |
| `js/data/benefits-catalog.js` — `software` | 13 | Software and tool list | Records have no verification or expiration dates; do not treat them as confirmed discount offers. |

### Offers with dates or verification status [Verified in code]

#### Local demo offers with `valid_until` [Verified in code]

All dates below are from content marked as demo and are in the past as of 2026-10-28; they are not real expired offers.

| Record | `valid_until` in data | Status as of 2026-10-28 |
|---|---|---|
| 4B restaurant and cafe | `Demo Date – Dec 2025` | Demo date has passed |
| Demo Cafe Aroma | `Demo Date – Mar 2026` | Demo date has passed |
| Demo FitZone Gym | `Demo Date – Jun 2026` | Demo date has passed |
| Demo Book Corner | `Demo Date – Sep 2025` | Demo date has passed |
| Demo Print & Copy | `Demo Date – Dec 2025` | Demo date has passed |
| Demo Pizza Stop | `Demo Date – Jan 2026` | Demo date has passed |

`Demo Restaurant Offer` and `Y5 coffee shop` have no expiration date. The latter record does not specify the drinks or offer terms.

#### Public digital offers in `js/data/benefits-catalog.js` [Verified in code]

| Offer | Last verification date recorded in code | Expiration | Assessment as of 2026-10-28 |
|---|---|---|---|
| Gemini / Google AI student offer | 2026-10-18 | 2026-12-31 | Expires in 64 days; outside the 60-day window, but it is the nearest expiration. |
| GitHub Copilot Student | 2026-10-18 | No date | Expiration cannot be assessed from the data. |
| GitHub Student Developer Pack | 2026-10-18 | No date | Expiration cannot be assessed from the data. |
| Office 365 Education A1 | 2026-10-18 | No date | Expiration cannot be assessed from the data. |
| JetBrains Student Pack | 2026-10-18 | No date | Expiration cannot be assessed from the data. |
| Autodesk Education Plan | 2026-10-18 | No date | Expiration cannot be assessed from the data. |
| ChatGPT Free | 2026-10-18 | No date | Expiration cannot be assessed from the data. |
| Educative via GitHub Student Pack | 2026-10-18 | No date | Expiration cannot be assessed from the data. |
| GitKraken Student Plan | 2026-10-18 | No date | Expiration cannot be assessed from the data. |

No offer in this list has a past expiration date or expires within 60 days of 2026-10-28. The code displays activation and source links for the general digital offers, and notes that availability, eligibility, and terms vary by country and provider.

#### Demo `last_verified` dates [Verified in code]

The six records in `js/data/local-records.js` have the following dates, but they are not real verification dates because they are prefixed with `Demo Date`: Demo Cloud Storage Pro — Oct 2025; Demo AI Writing Assistant — Aug 2025; Demo Dev Toolkit — Jul 2025; Demo Design Suite — Sep 2025; Demo Productivity Suite — Jun 2025; Demo Cloud Compute — May 2025.

The 13 programs in `software` are Visual Studio Code, Visual Studio Community, Python, JupyterLab, Git, Android Studio, AutoCAD, Blender, GIMP, LibreOffice, MySQL Workbench Community, PostgreSQL, and Wireshark. The catalog does not record verification or expiration dates for them.

## 3. What the Website Is Missing [Verified in code]

Priorities describe gaps visible in the files, not user-testing or external-audit results.

### Content gaps [Verified in code]

- **High** — Replace local demo deals, housing, and transportation data with verified information, or keep a clear demo label wherever it appears.
- **High** — The six `valid_until` dates in `js/data/local-records.js` are demo dates in the past, while two local deal records have no date; do not present these records as current real offers.
- **Medium** — The book data contains only three demo examples and states that no local discount or stock is confirmed.
- **Medium** — The Y5 coffee shop record lacks drink details, terms, date, location, and usage instructions.
- **Low** — Review the coverage and sizes of housing and local-content images; no visual inventory or image-size audit was performed.

### Functional gaps [Verified in code]

- **Medium** — There is no contact submission form or backend; `about.html` provides a `mailto` link, which depends on the visitor’s email configuration.
- **Medium** — No favorites mechanism is visible in the interface files.
- **Medium** — Local `data.js` deals are demo records and have no real provider or activation link. General digital offers do have activation and source links on their detail pages, so the lack of an action link does not apply to those offers.
- **Medium** — Call/WhatsApp links in housing details use demo numbers from `housingData`; they should not be presented as real contacts.
- **Low** — Search, filtering, sorting, and the empty-results state exist in `js/shared/catalog-pages.js` and `js/pages/benefits/benefits.js`; `scripts/test-benefits.js` passed, but no comprehensive test of every page flow is recorded.

### Localization gaps [Verified in code]

- **High** — There is no `ku-Arab` language or Kurdish translation key in the translation files or language switcher; only `en` and `ar` are currently implemented.
- **Medium** — The localization validator was run against the current files without saving its report: it found 15 pages, 468 UI translation keys, 182 dynamic translation values, 650 complete values for each of Arabic and English, and no missing keys or pages. However, it exits with `passed: false` because 13 groups of conflicting or duplicate keys/values need review.
- **Low** — The language group’s `aria-label` in `js/shared/navigation.js` is the hard-coded string `Language`, not translated into Arabic.

### Design and UX gaps [Verified in code]

- **Medium** — There are no recorded visual checks at mobile or other device sizes. Media queries in `css/style.css` do not prove every page works correctly in practice.
- **Medium** — There are no recorded visual checks of dark mode across all pages. The switch and persistence are implemented in `js/shared/navigation.js` and `js/localization/i18n.js`.
- **Low** — No comprehensive visual consistency review across the 15 pages has been performed.

### Accessibility gaps [Verified in code]

- **Medium** — No documented contrast measurement or WCAG audit has been performed, so contrast cannot be marked as passing.
- **Medium** — No comprehensive manual keyboard-navigation or screen-reader test has been performed. The interface includes some ARIA attributes and `:focus-visible` styles, but their presence alone does not establish complete accessibility.

### SEO and sharing gaps [Verified in code]

- **Medium** — `meta description` was found only in `about.html` and `detail.html`; the other pages need appropriate descriptions.
- **Medium** — No Open Graph metadata was found in the HTML pages.
- **Low** — A favicon reference appears only in `detail.html` and points to `assets/icon.png`, which is not present in the current project structure; verify the path and add the file or correct the reference.
- **Low** — No `sitemap.xml` was found in the project files.

### Performance gaps [Verified in code]

- **Low** — No documented audit of image sizes, dimensions, or loading has been performed.
- **Low** — Fonts load from Google Fonts; some pages include `preconnect` and others do not. Custom fonts depend on an internet connection, with CSS fallbacks available.

### Technical gaps [Verified in code]

- **Medium** — There are two separate sources for benefits content: demo data in `js/data/local-records.js` and the current benefits catalog in `js/data/benefits-catalog.js`. Clarify which source is intended for each section to avoid editing unused or conflicting data.
- **Medium** — `reports/localization-report.json` is older than the current validator output. The saved report shows 455 UI keys and 12 conflict groups; the current run shows 468 UI keys and 13 conflict groups. I did not overwrite the report during this review.
- **Low** — There is no backend or build step; this is documented as a project limitation, not a defect in the prototype.

## 4. Known Issues and Bugs [Verified in code]

1. **Local deal dates have passed but are demo dates.** File/field: `js/data/local-records.js`, `dealsData.valid_until`; status is displayed by `js/shared/catalog-pages.js`. **Severity: High.** Suggested fix: replace the records with real data and exact dates, or clearly label them as demo and avoid presenting them as active offers.
2. **`ku-Arab` support is missing.** Files: `js/localization/translations.js`, `js/localization/i18n.js`, `js/shared/navigation.js`; the language switch offers only `en` and `ar`. **Severity: High** relative to the language scope stated in the task. Suggested fix: add Kurdish values and keys, RTL direction, and a language option, then validate all dynamic strings.
3. **The localization validator fails because of 13 conflict/duplicate groups.** File: `scripts/validate-localization.js`, with data in `js/localization/translations.js`. The current run reports no missing keys or dynamic values, but returns `passed: false`. **Severity: Medium.** Suggested fix: review the conflict groups and remove ambiguity, or adjust the validator if some identical values are intentional; then save an updated report.
4. **The saved localization report is outdated.** File: `reports/localization-report.json`, compared with the current run. **Severity: Medium.** Suggested fix: update it after resolving the conflicts and rerunning the validator.
5. **The referenced favicon may be missing.** File: `detail.html` points to `assets/icon.png`, which does not appear in the current asset paths. **Severity: Low.** Suggested fix: add the file at that path or update `href` to an existing file.
6. **Local contact data is demo content.** File: `js/data/local-records.js`, `housingData.contact`; the detail interface generates contact links from the number. **Severity: Medium.** Suggested fix: provide verified numbers with the owners’ permission, or do not show functional contact buttons for demo data.
7. **Demo benefits data and the current catalog are separate sources.** Files: `js/data/local-records.js` and `js/data/benefits-catalog.js`. **Severity: Medium.** Suggested fix: document the intended use of each source or consolidate them after confirming which one should be authoritative.

No prior issues were removed or marked `Resolved`; the previous document was unavailable for comparison, and no application code was changed as part of this task.

## 5. Roadmap and Future Features [Not checked yet]

No roadmap or additions note was provided, so this section does not record commitments or deadlines that the project owner did not specify.

### Next (this week) [Not checked yet]

- No task was scheduled by the project owner in the available notes.

### Soon (this month) [Not checked yet]

- No task was scheduled by the project owner in the available notes.

### Later (ideas) [Not checked yet]

- No future idea was specified in the available notes.

### Suggestions [Not checked yet]

- Prioritize verification of local deals, housing, and transportation data before publishing them.
- Address the `ku-Arab` gap if it remains in the project scope.
- Resolve the translation conflict groups and update `reports/localization-report.json`.
- Run responsive, dark-mode, and accessibility checks on the pages.
- Complete metadata, Open Graph, favicon, and sitemap coverage.

## 6. Decisions Log [Not checked yet]

| Date | Decision | Reason |
|---|---|---|
| 2026-10-28 | Create a new `docs/StudentHub_Website_Documentation.md` instead of editing `docs/PROJECT_DESCRIPTION.md`. | The project owner chose this after clarifying that the two files are different. |
| 2026-10-28 | Treat the current code files as the source of truth when they disagree with the project description. | The project owner’s instruction for this review. |

## 7. Changelog [Verified in code]

| Date | What changed in the project | What changed in this document |
|---|---|---|
| 2026-10-28 | No change note or previous document was provided for comparison, so code changes since the last update cannot be established. I reviewed the current code only. | Created this document because the previous version was not available. Added page, data, date, and gap status; documented discrepancies with `docs/PROJECT_DESCRIPTION.md` and `reports/localization-report.json`. |
| 2026-10-28 | No project files were changed as part of this task. | The current localization validator reports 15 pages, 468 UI keys, 182 dynamic values, and 13 conflict groups; `docs/PROJECT_DESCRIPTION.md` lists older figures (11 pages, 174 UI keys, and 162 dynamic values), while the saved report lists 15 pages, 455 UI keys, 182 dynamic values, and 12 conflict groups. |

## 8. Open Questions [Not checked yet]

- Is support for Kurdish in Arabic script, `ku-Arab`, still required? No translation for it exists in the current code.
- Who can provide real local deals, housing, and transportation data approved for publication, with verification and expiration dates?
- Which additions or deadlines should be included in the roadmap? No planning note was provided.
- Should `docs/PROJECT_DESCRIPTION.md` later be updated to match the current page and translation counts?
