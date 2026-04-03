# ⌘ DocForge

> **AI-powered API documentation generator.** Paste your REST endpoints or code functions — get beautiful, downloadable documentation in seconds.

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Claude AI](https://img.shields.io/badge/Claude-Sonnet-D4A847?style=flat-square)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

---

## What this is

Writing API documentation is one of the most tedious parts of being a developer. DocForge eliminates it.

Paste your endpoints or functions — DocForge uses Claude AI to generate complete, professional documentation with:

- Full endpoint/function descriptions
- Parameter tables with types and descriptions
- Request/response examples with real JSON
- Status codes and error handling
- Code examples in curl and JavaScript
- **Side-by-side HTML preview and raw Markdown**
- **One-click download** of either format

No backend. No database. No login. Runs entirely in the browser.

---

## Demo

**REST endpoints input:**
```
GET /users
Returns a paginated list of all users.

POST /users
Creates a new user account.
Body: { name, email, password }

DELETE /users/:id
Deletes a user. Requires admin role.
```

**Output:** Full documentation page with method badges, parameter tables, request/response JSON, curl + fetch examples — rendered live in the preview pane and available as a `.html` or `.md` download.

---

## How it works

```
User input (REST / code)
        │
        ▼
  Claude Sonnet API
  (structured prompt → JSON response)
        │
        ▼
  { title, markdown, html }
        │
        ├──► HTML Preview (iframe)
        └──► Markdown view (raw)
```

The app sends a single structured prompt to the Anthropic API instructing Claude to return a JSON object containing both a complete HTML documentation page and full Markdown. The HTML is rendered live in a sandboxed iframe. The Markdown is shown in a monospace view. Both are downloadable.

**Key design decisions:**
- The entire generation is a single API call — fast and simple
- Claude generates the HTML styling itself (dark theme, method badges, syntax highlighting) — no extra libraries needed
- The JSON output format is enforced in the system prompt with strict instructions
- The `sandbox="allow-same-origin"` iframe prevents any injected scripts from running

---

## Getting started

### Prerequisites

- Node.js v18 or later
- An [Anthropic API key](https://console.anthropic.com)

### Install

```bash
git clone https://github.com/YOUR_USERNAME/docforge
cd docforge
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Set your API key

The app calls the Anthropic API directly from the browser. To avoid exposing your key in production, the app reads it from a prompt on first use — or you can hardcode it for local development.

For Vercel deployment, add this environment variable:

```
VITE_ANTHROPIC_API_KEY=sk-ant-XXXX
```

Then update `src/lib/generate.ts` to read it:

```ts
headers: {
  "Content-Type": "application/json",
  "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
  "anthropic-version": "2023-06-01",
  "anthropic-dangerous-direct-browser-access": "true",
},
```

> **Note:** For production apps, proxy the Anthropic API through your own backend to keep the key secret.

---

## Project structure

```
docforge/
├── src/
│   ├── main.tsx                  # React entry point
│   ├── App.tsx                   # Root component, state management
│   ├── types.ts                  # Shared TypeScript types
│   ├── components/
│   │   ├── Header.tsx            # Logo + tagline
│   │   ├── Editor.tsx            # Input panel (textarea + mode tabs)
│   │   └── DocOutput.tsx         # Output panel (preview + markdown tabs)
│   ├── lib/
│   │   └── generate.ts           # Claude API call + prompt
│   └── styles/
│       └── app.css               # Full design system
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

### Component overview

**`App.tsx`** — holds all state: `inputMode`, `input`, `loading`, `doc`, `error`. Passes everything down as props. No external state library needed.

**`Editor.tsx`** — the left panel. Two mode tabs (REST / Code), a monospace textarea with placeholder examples, and a generate button. Supports `⌘ + Enter` to generate.

**`DocOutput.tsx`** — the right panel. Two output tabs (HTML Preview / Markdown). HTML renders in a sandboxed iframe. Markdown renders in a `<pre>`. Copy and Download buttons for each format.

**`generate.ts`** — the Claude call. A system prompt instructs the model to return a strict JSON object `{ title, markdown, html }`. Response is parsed and returned. Markdown fences are stripped before parsing.

---

## Input modes

### REST Endpoints

Describe your API endpoints in plain text — no special format required. Be as detailed or as brief as you like. Examples:

```
GET /products
Returns all products with optional filtering.
Query params: category, minPrice, maxPrice, page, limit

POST /products
Creates a new product.
Body: { name: string, price: number, category: string, stock: number }
Requires: admin role
```

### Code / Functions

Paste any TypeScript, JavaScript, Python, or other code. Functions, classes, modules — DocForge handles all of it:

```typescript
async function sendEmail(to: string, subject: string, body: string): Promise<void>

class UserRepository {
  async findById(id: string): Promise<User | null>
  async create(data: CreateUserDto): Promise<User>
  async delete(id: string): Promise<void>
}
```

---

## Output formats

### HTML Preview

A complete, self-contained HTML page with:
- Dark professional theme
- Sidebar navigation per endpoint/function
- Coloured method badges (GET, POST, PUT, DELETE, PATCH)
- Parameter tables with types
- JSON request/response examples
- curl and JavaScript code examples
- Responsive layout

Download as `.html` — open in any browser, share as a file, or host statically.

### Markdown

Clean, structured Markdown with:
- H1 title, H2 per endpoint, H3 for subsections
- Tables for parameters
- Fenced code blocks with language tags

Paste directly into GitHub READMEs, Notion, Confluence, or any Markdown-capable tool.

---

## Keyboard shortcuts

| Shortcut | Action |
|---|---|
| `⌘ + Enter` (Mac) | Generate documentation |
| `Ctrl + Enter` (Win/Linux) | Generate documentation |

---

## Deployment

### Vercel (recommended)

1. Push to GitHub
2. Import repo on [vercel.com](https://vercel.com)
3. No environment variables needed for basic use
4. Deploy

### Build locally

```bash
npm run build    # outputs to dist/
npm run preview  # serve the build
```

The output is a fully static site — deploy anywhere: Netlify, Cloudflare Pages, GitHub Pages, S3.

---

## Tech stack

| Tool | Purpose |
|---|---|
| React 18 | UI framework |
| TypeScript | Type safety |
| Vite 6 | Build tool |
| Claude Sonnet | AI documentation generation |
| DM Mono + Fraunces | Typography |
| Vanilla CSS | Styling (zero UI libraries) |

No UI component library. No state management library. No markdown renderer library. Just React, TypeScript, and Claude.

---

## Extending this project

**Add a project name field** — let users set a project name that appears in the generated docs header.

**Persist history** — save generated docs to `localStorage` so users can return to previous generations.

**Export to PDF** — add a print stylesheet to the generated HTML and trigger `window.print()`.

**OpenAPI import** — accept a `.yaml` or `.json` OpenAPI spec file as input and parse it before sending to Claude.

**Multi-file code input** — accept multiple files and generate a full module documentation page.

**Share link** — encode the generated Markdown in the URL hash so docs can be shared via link.

---

## License

MIT — see [LICENSE](./LICENSE)

---

Built with [Claude AI](https://anthropic.com) · Powered by [Vite](https://vitejs.dev) · Styled with zero dependencies
