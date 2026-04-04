import { useState } from "react";
import type { GeneratedDoc } from "../types";

interface DocOutputProps {
  doc: GeneratedDoc | null;
  loading: boolean;
  error: string | null;
}

type OutputTab = "preview" | "markdown";

export function DocOutput({ doc, loading, error }: DocOutputProps) {
  const [tab, setTab] = useState<OutputTab>("preview");
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!doc) return;
    const content = tab === "markdown" ? doc.markdown : doc.html;
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!doc) return;
    if (tab === "preview") {
      const blob = new Blob([doc.html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${doc.title.toLowerCase().replace(/\s+/g, "-")}-docs.html`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const blob = new Blob([doc.markdown], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${doc.title.toLowerCase().replace(/\s+/g, "-")}-docs.md`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <section className="output-panel">
      <div className="panel-header">
        <div className="mode-tabs">
          <button
            className={`mode-tab ${tab === "preview" ? "active" : ""}`}
            onClick={() => setTab("preview")}
          >
            HTML Preview
          </button>
          <button
            className={`mode-tab ${tab === "markdown" ? "active" : ""}`}
            onClick={() => setTab("markdown")}
          >
            Markdown
          </button>
        </div>

        {doc && (
          <div className="output-actions">
            <button className="action-btn" onClick={handleCopy}>
              {copied ? "✓ Copied" : "Copy"}
            </button>
            <button className="action-btn primary" onClick={handleDownload}>
              ↓ Download {tab === "preview" ? ".html" : ".md"}
            </button>
          </div>
        )}
      </div>

      <div className="output-body">
        {loading && (
          <div className="output-state">
            <div className="pulse-grid">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="pulse-cell" style={{ animationDelay: `${i * 0.08}s` }} />
              ))}
            </div>
            <p className="state-label">Generating your documentation…</p>
          </div>
        )}

        {error && !loading && (
          <div className="output-state">
            <div className="error-icon">⚠</div>
            <p className="state-label error">{error}</p>
          </div>
        )}

        {!doc && !loading && !error && (
          <div className="output-state empty">
            <div className="empty-illustration">
              <div className="empty-line" style={{ width: "60%" }} />
              <div className="empty-line" style={{ width: "80%" }} />
              <div className="empty-line" style={{ width: "40%" }} />
              <div className="empty-gap" />
              <div className="empty-line" style={{ width: "70%" }} />
              <div className="empty-line" style={{ width: "55%" }} />
              <div className="empty-line" style={{ width: "85%" }} />
            </div>
            <p className="state-label">Your docs will appear here</p>
          </div>
        )}

        {doc && !loading && (
          <>
            {tab === "preview" && (
              <iframe
                className="preview-frame"
                srcDoc={doc.html}
                title="Documentation Preview"
                sandbox="allow-same-origin"
              />
            )}
            {tab === "markdown" && (
              <pre className="markdown-view">
                <code>{doc.markdown}</code>
              </pre>
            )}
          </>
        )}
      </div>
    </section>
  );
}
