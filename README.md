<div align="center">

# 🏥 DICOM Image Viewer

### Clinical-grade medical image viewer — built with modern web technologies

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript)](https://typescriptlang.org)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-000?logo=vercel)](https://vercel.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

<br />

**A professional DICOM viewer for clinical image analysis — supporting Window/Level, Pan, Zoom, Invert, Reset, and multi-file batch viewing with patient metadata extraction.**

[Live Demo](https://your-vercel-url.vercel.app) · [Report Bug](https://github.com/your-username/DICOM-Image-Viewer/issues) · [Request Feature](https://github.com/your-username/DICOM-Image-Viewer/issues)

</div>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔬 **DICOM Rendering** | Real-time medical image display powered by Cornerstone.js |
| 🩺 **Clinical Tools** | Window/Level, Pan, Zoom, Invert, and Reset — all keyboard-accessible |
| 📁 **Batch Upload** | Drag & drop multiple `.dcm` files with instant metadata extraction |
| 🌙 **Dark Mode** | Eye-friendly dark theme with smooth transitions |
| 🌐 **i18n** | English & Persian (Farsi) with full RTL support |
| 📱 **Responsive** | Mobile-optimized with sticky action columns and touch-friendly toolbar |
| ⌨️ **Keyboard Shortcuts** | 10+ shortcuts for clinical workflow efficiency |
| 📊 **Patient Metadata** | Auto-extracted Patient ID, Name, Modality, Series, and Study Date |

---

## 🏗️ Architecture

```
DICOM-Image-Viewer/
├── web/
│   ├── src/
│   │   ├── app/
│   │   │   ├── [locale]/
│   │   │   │   ├── layout.tsx        # Root layout with i18n provider
│   │   │   │   ├── page.tsx          # Home page
│   │   │   │   └── HomeClient.tsx    # Client-side home with DicomViewer
│   │   │   ├── globals.css           # Full design system with CSS variables
│   │   │   ├── icon.svg              # Custom SVG favicon
│   │   │   └── apple-icon.svg        # Apple touch icon
│   │   ├── components/
│   │   │   ├── DicomViewer/
│   │   │   │   ├── DicomViewer.tsx   # Core viewer (~800 lines)
│   │   │   │   ├── DicomViewer.types.ts
│   │   │   │   ├── Icons.tsx         # SVG icon components
│   │   │   │   └── utils.ts          # DICOM parsing utilities
│   │   │   └── LanguageSwitcher/
│   │   │       └── LanguageSwitcher.tsx
│   │   ├── i18n/
│   │   │   ├── routing.ts            # Locale routing config
│   │   │   ├── request.ts            # Server-side i18n
│   │   │   └── navigation.ts         # Client-side navigation
│   │   └── middleware.ts             # Locale redirect middleware
│   ├── messages/
│   │   ├── en.json                   # English translations
│   │   └── fa.json                   # Persian translations
│   ├── next.config.mjs               # Next.js + next-intl config
│   ├── tsconfig.json
│   ├── eslint.config.mjs
│   ├── .nvmrc                        # Node.js 24
│   └── package.json
├── README.md
└── .gitignore
```

---

## 🛠️ Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.3.0 |
| UI Library | React | 19.2.8 |
| Language | TypeScript | 6.0.3 |
| Medical Imaging | Cornerstone.js | 2.6.1 |
| DICOM Parsing | dicom-parser | 1.8.21 |
| Touch Gestures | Hammer.js | 2.0.8 |
| i18n | next-intl | 4.13.5 |
| Linting | ESLint + typescript-eslint | 10.8.1 |
| Package Manager | pnpm | 10.30.1 |
| Deployment | Vercel | — |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 24
- **pnpm** ≥ 10

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

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `W` | Window/Level mode |
| `P` | Pan mode |
| `Z` | Zoom mode |
| `I` | Invert image |
| `R` | Reset view |
| `↑` / `↓` | Adjust window width |
| `←` / `→` | Adjust window center |
| `Esc` | Close modal |
| `D` | Toggle dark mode |

---

## 🌐 Internationalization

Full bilingual support with automatic RTL detection:

| Language | Direction | ICU Pluralization |
|----------|-----------|-------------------|
| English | LTR | ✅ |
| Persian (فارسی) | RTL | ✅ |

Locale routing is handled via `next-intl` with middleware-based detection.

---

## 🧠 Technical Highlights

### Smart Metadata Merging
When uploading multiple DICOM files from the same study, metadata is intelligently merged — fields present in all files are shared, while file-specific values (like `instanceNumber`) are preserved per-file.

### Optimized Image Loading
Cornerstone image loaders are initialized once globally. Each file gets its own unique image ID to prevent cache collisions during batch viewing.

### Sticky Action Column
The table's View button uses `position: sticky` to remain visible during horizontal scroll — critical for mobile users viewing wide metadata tables.

### CSS Custom Properties Design System
Complete theming via CSS variables with automatic dark mode support — no JavaScript theme switching needed.

---

## 📦 Deployment

Deploy to Vercel with zero configuration:

```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy
cd web
vercel
```

Or connect your GitHub repository to Vercel for automatic deployments on every push.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file for details.

---

<div align="center">

**Built with ❤️ for medical imaging professionals**

</div>
