import { useState, useCallback } from "react";
import { Editor } from "./components/Editor";
import { DocOutput } from "./components/DocOutput";
import { Header } from "./components/Header";
import { generateDocs } from "./lib/generate";
import type { InputMode, GeneratedDoc } from "./types";
import "./styles/app.css";

export default function App() {
  const [inputMode, setInputMode] = useState<InputMode>("rest");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [doc, setDoc] = useState<GeneratedDoc | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    setDoc(null);
    try {
      const result = await generateDocs(input, inputMode);
      setDoc(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  }, [input, inputMode]);

  return (
    <div className="app">
      <Header />
      <main className="main">
        <Editor
          inputMode={inputMode}
          onModeChange={setInputMode}
          value={input}
          onChange={setInput}
          onGenerate={handleGenerate}
          loading={loading}
        />
        <DocOutput doc={doc} loading={loading} error={error} />
      </main>
    </div>
  );
}
