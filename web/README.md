<div align="center">

# 🏥 DICOM Medical Image Viewer

**A modern, browser-based DICOM medical image viewer built with Next.js 16 & React 19**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel)](https://vercel.com)


Upload and view DICOM medical images directly in your browser — no installation required.

</div>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🖼️ **DICOM Rendering** | Full DICOM image support powered by Cornerstone.js — display `.dcm` files with native quality |
| 🎛️ **Clinical Tools** | Window/Level, Pan, Zoom, Invert, and Reset — all accessible via toolbar or keyboard shortcuts |
| 📂 **Drag & Drop Upload** | Drop multiple DICOM files at once — metadata is auto-extracted and grouped by patient |
| 🌙 **Dark Mode** | One-click theme switching with smooth transitions |
| 🌐 **i18n (EN/FA)** | Full English & Persian (فارسی) support with RTL layout, medical terminology, and ICU pluralization |
| 📱 **Responsive Design** | Optimized for desktop, tablet, and mobile — sticky action columns, compact modals on small screens |
| ⌨️ **Keyboard Shortcuts** | `W` Window/Level · `P` Pan · `Z` Zoom · `I` Invert · `R` Reset · `+/-` Zoom · `Esc` Close |
| 🔍 **Patient Metadata Table** | Auto-parsed Patient ID, Modality, Study Date, Series UID with sortable columns |

## 🏗️ Architecture

```
web/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── [locale]/               # i18n dynamic routes
│   │   │   ├── layout.tsx          # Root layout with fonts + RTL
│   │   │   └──page.tsx             # Client component
│   │   │ 
│   │   ├── globals.css             # Design tokens + responsive styles
│   │   ├── icon.svg                # Custom DICOM-themed favicon
│   │   └── apple-icon.svg          # Apple touch icon
│   ├── components/
│   │   ├── DicomViewer/            # Core viewer component
│   │   │   ├── DicomViewer.tsx     # Main component (800+ lines)
│   │   │   ├── DicomViewer.types.ts
│   │   │   ├── Icons.tsx           # 20+ memoized SVG icons
│   │   │   └── utils.ts            # DICOM metadata helpers
│   │   └── LanguageSwitcher/       # Bilingual toggle component
│   ├── i18n/                       # Internationalization config
│   │   ├── routing.ts              # Locale routing rules
│   │   ├── request.ts              # Server-side locale detection
│   │   └── navigation.ts           # Navigation helpers
│   └── @types/                     # Custom type declarations
├── proxy.ts                        # next-intl locale middleware
├── messages/                       # Translation files
│   ├── en.json
│   └── fa.json
├── eslint.config.mjs               # ESLint 10 flat config
├── next.config.mjs                 # Next.js + next-intl plugin
└── tsconfig.json                   # TypeScript 6 config
```

## 🛠️ Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | Next.js (App Router) | 16.3.0 |
| **UI Library** | React | 19.2.8 |
| **Language** | TypeScript | 6.0.3 |
| **DICOM Engine** | Cornerstone.js | 2.6.1 |
| **Image Loading** | cornerstone-wado-image-loader | 4.13.2 |
| **DICOM Parsing** | dicom-parser | 1.8.21 |
| **Math Utilities** | cornerstone-math | 0.1.10 |
| **Touch Gestures** | Hammer.js | 2.0.8 |
| **i18n** | next-intl | 4.13.5 |
| **Linting** | ESLint (flat config) | 10.8.1 |
| **Package Manager** | pnpm | 10.30.1 |
| **Node.js** | Node | ≥24 |

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 24
- pnpm ≥ 10

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/DICOM-Image-Viewer.git
cd DICOM-Image-Viewer/web

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
pnpm build
pnpm start
```

## 🎯 Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `W` | Window/Level tool |
| `P` | Pan tool |
| `Z` | Zoom tool |
| `I` | Invert image |
| `R` | Reset view |
| `+` / `-` | Zoom in / out |
| `Esc` | Close viewer |

## 🌍 Internationalization

Full support for:

- 🇬🇧 **English** — Complete with plural forms and medical terminology
- 🇮🇷 **فارسی (Persian)** — RTL layout, natural medical translations, ICU message format

## 🧪 Technical Highlights

- **Pure merge algorithm** for deduplicating DICOM files by `name:size:lastModified` — race-safe with functional state updaters
- **Concurrent image loading** with configurable `MAX_CONCURRENT` workers for parallel DICOM rendering
- **Sticky columns** on horizontal scroll for always-visible action buttons
- **CSS custom properties** for seamless dark/light theming with `data-theme` attribute
- **Async params** pattern for Next.js 16 server components
- **Zero unused dependencies** — every package is intentionally selected

## 📦 Deployment

This project is deployed on [Vercel](https://vercel.com):

```bash
# Deploy to Vercel
vercel deploy
```


