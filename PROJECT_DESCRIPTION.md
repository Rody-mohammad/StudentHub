# StudentHub Project Description

## Overview

StudentHub is a responsive, multi-page student services website prototype. It brings student discounts, student benefits, housing options, and transportation information together in one interface. The current interface is localized in Arabic and English and adapts its page direction to the selected language.

The project is implemented as a collection of plain HTML, CSS, and JavaScript files. It has no build step or installed JavaScript dependencies. Listings in `js/data.js` are fictional demo records. The separate `js/benefits-data.js` catalog includes source-checked public online offers and a clearly labeled illustrative Fastlink $5 student-internet example; the Fastlink example is not verified as a real offer, and its billing period and terms are unspecified. Availability and eligibility for source-checked offers remain subject to each provider's current terms and region. The project does not include a server-side application, account system, or live local-offer database.

## What visitors can do

- Browse the homepage, which features student offers and previews housing and benefits content.
- Browse offer, benefit, housing, and transportation sections.
- View topic-specific pages for restaurant offers, gym offers, housing details, transport within Zakho, and transport between Zakho and other cities.
- Open a shared navigation drawer to move between the main sections, contact the project, switch between Arabic and English, or enable night mode.
- Open a record's detail view through a URL containing a section and record ID, for example `detail.html?section=deals&id=1`.

The homepage currently begins with the heading “Top exclusive offers.” Its welcome intro is shown on the homepage only, once per browser session when session storage is available and reduced motion is not requested. The intro fades out after a brief display. Its text follows the current site language.

## Pages

| Page | Purpose |
| --- | --- |
| `index.html` | Homepage with featured offers and previews of housing and student benefits. |
| `deals.html` | Student deals and offers. |
| `benefits.html` | Student benefits and services. |
| `housing.html` | Student housing options. |
| `housing-details.html` | Housing information and details. |
| `transportation.html` | Transportation categories and options. |
| `transport-zakho.html` | Transportation within Zakho. |
| `transport-external.html` | Transportation between Zakho and other cities. |
| `restaurant-offers.html` | Restaurant offers. |
| `gym-offers.html` | Gym offers. |
| `detail.html` | Shared detail view that selects a record from the URL's `section` and `id` parameters. |

## Interface and visual design

The site uses a compact, card-based interface intended for both desktop and mobile screens. Its shared stylesheet defines the application layout, headers, cards, offer badges, buttons, filters, navigation, and responsive behavior.

The central brand colors are navy (`#203F7A`), amber (`#F7B94B`), and gold (`#F4C542`), with a light gray page background (`#EEF2F5`). The shared font stack uses Readex Pro for Arabic-friendly text, followed by Inter and system fonts. The header logo is a circular image paired with a StudentHub wordmark; its appearance is shared across pages.

## Language and direction support

Arabic and English are the supported interface languages. `js/translations.js` stores interface strings and translated data. `js/i18n.js` manages the selected language, updates translated static content and page titles, and sets the root document's `lang` and `dir` attributes. Arabic uses right-to-left direction; English uses left-to-right direction. The language choice is saved in local storage when available.

Night mode is available in the shared navigation drawer. Its theme choice is applied before the stylesheet loads and saved in local storage independently of the language preference.

The shared drawer uses the document's direction attribute to choose its hidden edge and slide-in direction. The drawer also provides a backdrop, close control, keyboard dismissal, focus handling, and body scroll locking. The same navigation script initializes it on pages that have the shared header.

The welcome intro is created by `js/studenthub-intro.js`; it is separate from the shared navigation and is loaded by the homepage only. It observes the reduced-motion preference and listens for language changes while visible.

## Data and page behavior

`js/data.js` contains fictional structured demo records for deals, benefits, housing, and transportation. The shared detail-page logic in `js/main.js` reads the `section` and `id` query parameters, finds the corresponding record, and renders the relevant details. The data file comments explain that records can be edited there without a build step.

The project is a front-end prototype. Offer and service content should be treated as illustrative rather than verified, current listings. No real transaction, account, or provider integration is configured in the project files.

## Project structure

```text
.
├── index.html and other page HTML files
├── css/
│   └── style.css                 Shared visual styles and responsive rules
├── js/
│   ├── data.js                   Fictional demo records
│   ├── i18n.js                   Language and direction behavior
│   ├── main.js                   Detail rendering and shared page logic
│   ├── navigation.js             Shared drawer and language switcher
│   ├── studenthub-intro.js       Homepage welcome overlay
│   └── translations.js           Arabic and English UI/data translations
├── assets/
│   └── images/                   Logo and page imagery
└── scripts/
    └── validate-localization.js  Localization consistency checker
```

`localization-report.json` contains the most recently saved output of the localization checker. It reports 11 HTML pages, 174 interface translation keys, and 162 dynamic translation values, with Arabic and English values reported complete at the time the report was generated.

## Running locally

There is no package installation or compilation step. Open the project through a local static HTTP server or an editor extension such as Live Server, then visit `index.html`. Serving over HTTP is recommended for consistent browser behavior with session storage, local storage, and query-string detail routes.

The localization checker can be run from the project root with:

```sh
node scripts/validate-localization.js
```

The web fonts are loaded from Google Fonts, so their custom typefaces require an internet connection; system font fallbacks are defined in the stylesheet.
