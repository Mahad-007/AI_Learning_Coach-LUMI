# AI Learning Coach MCP Server

This package exposes the core AI Learning Coach capabilities as Model Context Protocol (MCP) tools that can be deployed to [Smithery](https://smithery.ai) and consumed by compatible clients (Cursor, Claude Desktop, etc.). It wraps the existing Supabase + Gemini integrations used by the React application and makes them available through three high-level tools:

| Tool | Description |
|------|-------------|
| `generate_lesson` | Uses Gemini to create a structured lesson, stores it in Supabase, and initializes user progress |
| `generate_quiz` | Builds a quiz from a lesson using Gemini and saves the questions + XP reward |
| `chat_with_student` | Generates an AI tutor reply, logs the exchange to Supabase, and awards chat XP |

## Project Layout

```
mcp/
├── package.json        # Independent Node/TypeScript project
├── smithery.yaml       # Smithery deployment configuration
├── src/
│   └── index.ts        # MCP server definition and tool handlers
└── tsconfig.json
```

The server is self-contained and does not import any browser-specific code. It creates its own Supabase and Gemini clients using the same schemas and prompt logic as the frontend services.

## Prerequisites

- Node.js 18+
- Supabase project with the schema defined in this repository (`supabase/schema.sql`)
- Google Gemini API key with access to the chosen model (defaults to `gemini-2.0-flash-exp`)
- Smithery CLI (`npm install -g @smithery/cli`) if you plan to test or deploy

## Configuration

The server reads configuration from either Smithery connection settings or environment variables. The following keys are required:

| Key | Description | Environment variable |
|-----|-------------|----------------------|
| `supabaseUrl` | Supabase project URL | `VITE_SUPABASE_URL` / `SUPABASE_URL` |
| `supabaseServiceRoleKey` | Supabase service role key (preferred) | `SUPABASE_SERVICE_ROLE_KEY` |
| `supabaseAnonKey` | Supabase anonymous key (fallback if service role is unavailable) | `VITE_SUPABASE_ANON_KEY` / `SUPABASE_ANON_KEY` |
| `geminiApiKey` | Google Gemini API key | `VITE_GEMINI_API_KEY` / `GEMINI_API_KEY` |
| `geminiModel` | (Optional) Gemini model override | `VITE_GEMINI_MODEL` / `GEMINI_MODEL` |

If you run the server locally, create a `.env` file inside `mcp/`:

```
VITE_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
VITE_GEMINI_API_KEY=...
VITE_GEMINI_MODEL=gemini-2.0-flash-exp
```

> The service role key allows the MCP server to bypass RLS when awarding XP or logging chat transcripts. If you only provide the anon key, make sure your policies allow these mutations for the connected user.

## Local Development

```bash
cd mcp
npm install
npm run build         # Type-checks and compiles to dist/
smithery dev          # Starts the MCP server with hot reload
```

When using `smithery dev`, you can interact with the tools via the Smithery playground or connect from a compatible client using the development endpoint that the CLI prints.

## Deploying to Smithery

1. Commit the contents of `mcp/` to your repository.
2. Push to GitHub and connect the repo inside the Smithery dashboard.
3. On your server’s page, provide the Supabase + Gemini secrets via **Settings → Environment Variables** or the Smithery configuration UI.
4. Trigger **Deploy**. Smithery will run `npm install` and `npm run build` automatically and host the compiled output (`dist/index.js`).
5. After deployment, install the server for your target client:

   ```bash
   smithery install ai-learning-coach-mcp --client cursor
   ```

   Replace the client name as needed (e.g., `claude-desktop`, `dust`).

## Tool Reference

### `generate_lesson`
- **Inputs**: `userId`, `subject`, `topic`, `difficulty`, `duration`, optional `persona`, optional `model`
- **Output**: JSON containing the saved lesson row and XP reward

### `generate_quiz`
- **Inputs**: `userId`, `lessonId`, `difficulty`, optional `numQuestions`, optional `model`
- **Output**: JSON containing the saved quiz row and XP reward

### `chat_with_student`
- **Inputs**: `userId`, `message`, optional `topic`, optional `persona`, optional `context[]`, optional `model`
- **Output**: Chat reply text, XP gained, Supabase message ID, and timestamp

All tools return both human-readable text (for chat clients) and structured JSON that Smithery can validate and surface to downstream consumers.

## Troubleshooting

- **Missing env vars**: The server throws during startup if Supabase or Gemini credentials are absent. Set them via `.env` or Smithery config.
- **RLS errors**: Use the service role key or update Supabase policies so the configured user can insert into `lessons`, `quizzes`, `chat_history`, and `user_progress` tables and update `users`.
- **Gemini quota**: The Gemini SDK will surface quota/permission errors directly in the tool response. Consider switching to a different model via the `model` parameter if needed.

## Next Steps

- Add more tools (leaderboard reports, dashboard stats, XP badges, whiteboard sessions, etc.).
- Register prompt templates or resources once the MCP clients you use support them.
- Wire automated deployment by adding a Smithery workflow file or GitHub Actions step that pings the Smithery build API after merges.

