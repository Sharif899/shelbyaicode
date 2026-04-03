import type { InputMode, GeneratedDoc } from "../types";

const SYSTEM_PROMPT = `You are an expert API documentation writer. Generate beautiful, comprehensive API documentation.

When given REST API endpoints, document each endpoint with:
- Method, path, description
- Request parameters (path, query, body) with types and descriptions
- Request body schema with example JSON
- Response schema with example JSON
- Status codes and error responses
- A practical code example (curl + JavaScript fetch)

When given code (functions, classes, modules), document each with:
- Purpose and description
- Parameters with types and descriptions
- Return value with type
- Throws/errors
- Usage example

Output ONLY a JSON object with this exact structure (no markdown fences, no preamble):
{
  "title": "short descriptive title for the API/module",
  "markdown": "full markdown documentation string",
  "html": "full standalone HTML documentation page string"
}

The HTML must be a complete, beautiful, self-contained page with:
- Embedded CSS (dark theme, monospace accents, professional)
- Sidebar navigation for each endpoint/function
- Syntax-highlighted code blocks (use <pre><code> with CSS classes)
- Method badges (GET=green, POST=blue, PUT=amber, DELETE=red, PATCH=purple)
- Clean table layout for parameters
- Responsive design

The Markdown must be well-structured with:
- H1 title, H2 per endpoint/function, H3 for subsections
- Tables for parameters
- Fenced code blocks with language tags
- Clear hierarchy`;

export async function generateDocs(
  input: string,
  mode: InputMode
): Promise<GeneratedDoc> {
  const userPrompt =
    mode === "rest"
      ? `Generate API documentation for these REST endpoints:\n\n${input}`
      : `Generate API documentation for this code:\n\n${input}`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as any)?.error?.message ?? `API error ${response.status}`);
  }

  const data = await response.json();
  const text = data.content
    .filter((b: any) => b.type === "text")
    .map((b: any) => b.text)
    .join("");

  // Strip possible markdown fences
  const clean = text.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();

  try {
    const parsed = JSON.parse(clean);
    return {
      title: parsed.title ?? "API Documentation",
      markdown: parsed.markdown ?? "",
      html: parsed.html ?? "",
    };
  } catch {
    throw new Error("Failed to parse documentation output. Please try again.");
  }
}

