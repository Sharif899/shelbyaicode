import React, { useState, useCallback } from "react";
import ReactDOM from "react-dom/client";

// ── Types ──────────────────────────────────────────────────────────────────
type InputMode = "rest" | "code";

interface GeneratedDoc {
  title: string;
  markdown: string;
  html: string;
}

// ── Claude API ─────────────────────────────────────────────────────────────
async function generateDocs(input: string, mode: InputMode): Promise<GeneratedDoc> {
  const systemPrompt = `You are an expert API documentation writer. Generate beautiful, comprehensive API documentation.

When given REST API endpoints, document each with: method, path, description, parameters table (name/type/required/description), request body with example JSON, response with example JSON, status codes, curl + fetch code examples.

When given code/functions, document each with: purpose, parameters table, return value, throws, usage example.

Output ONLY a raw JSON object, no markdown fences, no preamble:
{
  "title": "short descriptive title",
  "markdown": "complete markdown documentation",
  "html": "complete standalone HTML page with embedded CSS and all content"
}

The HTML page must have: dark professional theme with embedded CSS, sidebar nav per endpoint/function, method badges (GET=green POST=blue PUT=amber DELETE=red), parameter tables, JSON examples in code blocks, curl and JS fetch examples, fully self-contained.

The markdown must have: H1 title, H2 per endpoint, tables for parameters, fenced code blocks with language tags.`;

  const userPrompt = mode === "rest"
    ? `Generate API documentation for these REST endpoints:\n\n${input}`
    : `Generate API documentation for this code:\n\n${input}`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": (window as any).__ANTHROPIC_KEY__ || "",
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const err: any = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `API error ${response.status}`);
  }

  const data = await response.json();
  const text = data.content
    .filter((b: any) => b.type === "text")
    .map((b: any) => b.text)
    .join("");

  const clean = text.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();

  try {
    const parsed = JSON.parse(clean);
    return {
      title: parsed.title ?? "API Documentation",
      markdown: parsed.markdown ?? "",
      html: parsed.html ?? "",
    };
  } catch {
    throw new Error("Failed to parse response. Please try again.");
  }
}

// ── Placeholders ───────────────────────────────────────────────────────────
const REST_PLACEHOLDER = `GET /users
Returns a paginated list of all users.
Query params: page, limit, search

POST /users
Creates a new user account.
Body: { name, email, password }

GET /users/:id
Returns a single user by ID.

DELETE /users/:id
Deletes a user. Requires admin role.`;

const CODE_PLACEHOLDER = `async function getUser(id: string): Promise<User> {
  const user = await db.users.findOne({ id });
  if (!user) throw new Error('User not found');
  return user;
}

async function createUser(data: CreateUserInput): Promise<User> {
  const validated = validateUser(data);
  return await db.users.create(validated);
}`;

// ── Styles ─────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Fraunces:ital,opsz,wght@0,9..144,400;1,9..144,300&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; }

  body {
    font-family: 'DM Sans', sans-serif;
    background: #0d0d0b;
    color: #e8e6dc;
    font-size: 14px;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }

  .app { display: flex; flex-direction: column; height: 100vh; overflow: hidden; }

  .header {
    border-bottom: 1px solid rgba(255,255,255,0.06);
    padding: 0 2rem;
    height: 54px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
    background: #0d0d0b;
  }

  .logo { display: flex; align-items: center; gap: 10px; }
  .logo-mark { font-size: 20px; color: #d4a847; }
  .logo-name { font-family: 'Fraunces', serif; font-size: 20px; color: #e8e6dc; letter-spacing: -0.02em; }
  .logo-tag { font-size: 12px; color: #5a5850; font-style: italic; }

  .api-key-form { display: flex; align-items: center; gap: 8px; }
  .api-key-input {
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    padding: 5px 12px;
    border-radius: 6px;
    border: 1px solid rgba(255,255,255,0.1);
    background: #1a1a16;
    color: #e8e6dc;
    width: 260px;
    outline: none;
  }
  .api-key-input::placeholder { color: #5a5850; }
  .api-key-input:focus { border-color: #d4a847; }

  .main {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    overflow: hidden;
  }

  .panel { display: flex; flex-direction: column; overflow: hidden; }
  .panel-left { border-right: 1px solid rgba(255,255,255,0.06); }

  .panel-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1rem;
    height: 42px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    background: #131310;
    flex-shrink: 0;
    gap: 8px;
  }

  .tabs { display: flex; gap: 2px; background: #1a1a16; padding: 3px; border-radius: 6px; }
  .tab {
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    padding: 3px 12px;
    border-radius: 4px;
    border: none;
    background: transparent;
    color: #5a5850;
    cursor: pointer;
    transition: all 0.15s;
    white-space: nowrap;
  }
  .tab:hover { color: #908e82; }
  .tab.active { background: #262620; color: #e8e6dc; }

  .editor {
    flex: 1;
    padding: 1.25rem;
    font-family: 'DM Mono', monospace;
    font-size: 12.5px;
    line-height: 1.75;
    color: #e8e6dc;
    background: #0d0d0b;
    border: none;
    outline: none;
    resize: none;
    caret-color: #d4a847;
  }
  .editor::placeholder { color: #3a3830; font-style: italic; }

  .editor-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.6rem 1rem;
    border-top: 1px solid rgba(255,255,255,0.06);
    background: #131310;
    flex-shrink: 0;
  }

  .hint { font-size: 11px; color: #3a3830; font-family: 'DM Mono', monospace; }

  .btn-generate {
    display: flex;
    align-items: center;
    gap: 7px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 500;
    padding: 7px 18px;
    border-radius: 6px;
    border: 1px solid #d4a847;
    background: rgba(212,168,71,0.1);
    color: #e8c870;
    cursor: pointer;
    transition: all 0.15s;
  }
  .btn-generate:hover:not(:disabled) { background: #d4a847; color: #0d0d0b; }
  .btn-generate:disabled { opacity: 0.35; cursor: not-allowed; }

  .spinner {
    width: 12px; height: 12px;
    border: 1.5px solid currentColor;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    flex-shrink: 0;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .output-body { flex: 1; overflow: hidden; position: relative; }

  .output-actions { display: flex; gap: 6px; }
  .btn-action {
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    padding: 3px 10px;
    border-radius: 5px;
    border: 1px solid rgba(255,255,255,0.1);
    background: transparent;
    color: #908e82;
    cursor: pointer;
    transition: all 0.15s;
    white-space: nowrap;
  }
  .btn-action:hover { color: #e8e6dc; border-color: rgba(255,255,255,0.2); }
  .btn-action.gold { border-color: #d4a847; color: #d4a847; }
  .btn-action.gold:hover { background: #d4a847; color: #0d0d0b; }

  .state {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    height: 100%; gap: 1rem; padding: 2rem;
  }
  .state-text { font-size: 13px; color: #3a3830; text-align: center; }
  .state-text.err { color: #e05c5c; }

  .pulse { display: flex; gap: 5px; }
  .pulse-dot {
    width: 6px; height: 6px;
    background: #d4a847;
    border-radius: 50%;
    animation: pulse 1.2s ease-in-out infinite;
  }
  .pulse-dot:nth-child(2) { animation-delay: 0.2s; }
  .pulse-dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes pulse { 0%,100% { opacity: 0.2; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1); } }

  .empty-lines { display: flex; flex-direction: column; gap: 8px; width: 160px; opacity: 0.12; }
  .empty-line { height: 7px; background: #908e82; border-radius: 4px; }

  .preview-frame { width: 100%; height: 100%; border: none; background: #fff; }

  .markdown-view {
    width: 100%; height: 100%;
    overflow: auto;
    padding: 1.25rem;
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    line-height: 1.8;
    color: #908e82;
    background: #0d0d0b;
    white-space: pre-wrap;
    word-break: break-word;
  }

  @media (max-width: 800px) {
    .main { grid-template-columns: 1fr; grid-template-rows: 1fr 1fr; }
    .panel-left { border-right: none; border-bottom: 1px solid rgba(255,255,255,0.06); }
    .logo-tag { display: none; }
    .api-key-input { width: 160px; }
  }
`;

// ── App ────────────────────────────────────────────────────────────────────
export default function App() {
  const [apiKey, setApiKey] = useState("");
  const [mode, setMode] = useState<InputMode>("rest");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [doc, setDoc] = useState<GeneratedDoc | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [outTab, setOutTab] = useState<"preview" | "markdown">("preview");
  const [copied, setCopied] = useState(false);

  const handleGenerate = useCallback(async () => {
    if (!input.trim() || !apiKey.trim()) return;
    (window as any).__ANTHROPIC_KEY__ = apiKey;
    setLoading(true);
    setError(null);
    setDoc(null);
    try {
      const result = await generateDocs(input, mode);
      setDoc(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  }, [input, mode, apiKey]);

  const handleKey = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handleGenerate();
  };

  const handleCopy = async () => {
    if (!doc) return;
    await navigator.clipboard.writeText(outTab === "markdown" ? doc.markdown : doc.html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!doc) return;
    const content = outTab === "preview" ? doc.html : doc.markdown;
    const ext = outTab === "preview" ? "html" : "md";
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${doc.title.toLowerCase().replace(/\s+/g, "-")}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        {/* Header */}
        <header className="header">
          <div className="logo">
            <span className="logo-mark">⌘</span>
            <span className="logo-name">DocForge</span>
            <span className="logo-tag">Paste code. Get docs.</span>
          </div>
          <div className="api-key-form">
            <input
              className="api-key-input"
              type="password"
              placeholder="Paste your Anthropic API key…"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>
        </header>

        <main className="main">
          {/* Left: Editor */}
          <div className="panel panel-left">
            <div className="panel-bar">
              <div className="tabs">
                <button className={`tab ${mode === "rest" ? "active" : ""}`} onClick={() => setMode("rest")}>
                  REST Endpoints
                </button>
                <button className={`tab ${mode === "code" ? "active" : ""}`} onClick={() => setMode("code")}>
                  Code / Functions
                </button>
              </div>
            </div>

            <textarea
              className="editor"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={mode === "rest" ? REST_PLACEHOLDER : CODE_PLACEHOLDER}
              spellCheck={false}
            />

            <div className="editor-footer">
              <span className="hint">⌘ Enter to generate</span>
              <button
                className="btn-generate"
                onClick={handleGenerate}
                disabled={loading || !input.trim() || !apiKey.trim()}
              >
                {loading ? <><span className="spinner" /> Generating…</> : "Generate docs"}
              </button>
            </div>
          </div>

          {/* Right: Output */}
          <div className="panel">
            <div className="panel-bar">
              <div className="tabs">
                <button className={`tab ${outTab === "preview" ? "active" : ""}`} onClick={() => setOutTab("preview")}>
                  HTML Preview
                </button>
                <button className={`tab ${outTab === "markdown" ? "active" : ""}`} onClick={() => setOutTab("markdown")}>
                  Markdown
                </button>
              </div>
              {doc && (
                <div className="output-actions">
                  <button className="btn-action" onClick={handleCopy}>
                    {copied ? "✓ Copied" : "Copy"}
                  </button>
                  <button className="btn-action gold" onClick={handleDownload}>
                    ↓ .{outTab === "preview" ? "html" : "md"}
                  </button>
                </div>
              )}
            </div>

            <div className="output-body">
              {loading && (
                <div className="state">
                  <div className="pulse">
                    <div className="pulse-dot" />
                    <div className="pulse-dot" />
                    <div className="pulse-dot" />
                  </div>
                  <p className="state-text">Generating your documentation…</p>
                </div>
              )}
              {error && !loading && (
                <div className="state">
                  <p className="state-text err">{error}</p>
                </div>
              )}
              {!doc && !loading && !error && (
                <div className="state">
                  <div className="empty-lines">
                    <div className="empty-line" style={{ width: "60%" }} />
                    <div className="empty-line" style={{ width: "85%" }} />
                    <div className="empty-line" style={{ width: "45%" }} />
                    <div className="empty-line" style={{ width: "70%" }} />
                    <div className="empty-line" style={{ width: "55%" }} />
                  </div>
                  <p className="state-text">Your docs will appear here</p>
                </div>
              )}
              {doc && !loading && outTab === "preview" && (
                <iframe className="preview-frame" srcDoc={doc.html} title="Preview" sandbox="allow-same-origin" />
              )}
              {doc && !loading && outTab === "markdown" && (
                <pre className="markdown-view"><code>{doc.markdown}</code></pre>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

// ── Mount ──────────────────────────────────────────────────────────────────
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

