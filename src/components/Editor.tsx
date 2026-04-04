import type { InputMode } from "../types";

const REST_PLACEHOLDER = `GET /users
Returns a paginated list of all users.

POST /users
Creates a new user account.
Body: { name, email, password }

GET /users/:id
Returns a single user by ID.

DELETE /users/:id
Deletes a user by ID. Requires admin role.`;

const CODE_PLACEHOLDER = `async function getUser(id: string): Promise<User> {
  // Fetches a user from the database by ID
  const user = await db.users.findOne({ id });
  if (!user) throw new Error('User not found');
  return user;
}

async function createUser(data: CreateUserInput): Promise<User> {
  // Validates input and creates a new user
  const validated = validateUser(data);
  return await db.users.create(validated);
}`;

interface EditorProps {
  inputMode: InputMode;
  onModeChange: (mode: InputMode) => void;
  value: string;
  onChange: (val: string) => void;
  onGenerate: () => void;
  loading: boolean;
}

export function Editor({
  inputMode,
  onModeChange,
  value,
  onChange,
  onGenerate,
  loading,
}: EditorProps) {
  const placeholder =
    inputMode === "rest" ? REST_PLACEHOLDER : CODE_PLACEHOLDER;

  const handleKey = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      onGenerate();
    }
  };

  return (
    <section className="editor-panel">
      <div className="panel-header">
        <div className="mode-tabs">
          <button
            className={`mode-tab ${inputMode === "rest" ? "active" : ""}`}
            onClick={() => onModeChange("rest")}
          >
            REST Endpoints
          </button>
          <button
            className={`mode-tab ${inputMode === "code" ? "active" : ""}`}
            onClick={() => onModeChange("code")}
          >
            Code / Functions
          </button>
        </div>
      </div>

      <div className="editor-wrap">
        <textarea
          className="editor-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKey}
          placeholder={placeholder}
          spellCheck={false}
        />
      </div>

      <div className="editor-footer">
        <span className="hint">⌘ + Enter to generate</span>
        <button
          className={`generate-btn ${loading ? "loading" : ""}`}
          onClick={onGenerate}
          disabled={loading || !value.trim()}
        >
          {loading ? (
            <>
              <span className="btn-spinner" />
              Generating…
            </>
          ) : (
            <>Generate docs</>
          )}
        </button>
      </div>
    </section>
  );
}
