# Moja Micha — GitHub Copilot Instructions

## Project

Offline-first React Native meal diary and calorie tracker. Android-first. No backend in the app.

Stack: TypeScript, Expo Managed Workflow, expo-sqlite + Drizzle ORM, React Navigation, i18next, react-native-calendars, @gorhom/bottom-sheet.

## Language Rules

- Communicate with the human in Polish.
- Keep code, comments, documentation, and commit messages in English.

## Custom Agents

Canonical agent location for this repository: `.claude/agents/`

Workflow artifact locations:

- `docs/knowledge/lessons-learned.md` for reusable lessons
- `docs/tasks/TASK-###-plan.md` and `docs/tasks/TASK-###-complete.md` for task lifecycle artifacts
- `docs/reviews/TASK-###-review.md` for review reports
- `docs/testing/TASK-###-test.md` for test plans and results
- `docs/reviews/TEMPLATE-review.md` and `docs/testing/TEMPLATE-test.md` as reusable report templates

Use these custom agents:

- `.claude/agents/orchestrator.agent.md` as the main orchestration agent (human-driven, approval gates)
- `.claude/agents/autonomous-orchestrator.agent.md` as a fully autonomous variant (no approval gates, runs commits)
- `.claude/agents/planning-subagent.agent.md` for research
- `.claude/agents/implement-subagent.agent.md` for implementation
- `.claude/agents/code-review-subagent.agent.md` for review
- `.claude/agents/testing-subagent.agent.md` for testing

If your Copilot build does not auto-discover agents from `.claude/agents/`, register these files manually via the custom agent configuration UI or copy them to the user-level Copilot prompts location.

Subagent troubleshooting checklist:

- Ensure the selected chat mode is `orchestrator` or `autonomous-orchestrator` (custom agent), not generic chat.
- In Chat -> Tools, confirm `runSubagent` is enabled for the current session.
- If needed, use `/agents` to reconfigure and reselect custom agents.
- If the agent reports unavailable tools, rerun once in a new chat session after reselecting the Conductor agent.
- If `runSubagent` still fails, treat it as a runtime/tooling issue and report concrete failure evidence. Do not switch the Conductor into single-agent execution.
- If repository search is unstable, prefer `fileSearch` + `listDirectory` + `readFile` + `textSearch` over one broad search request.
- Use `code-review-subagent` only for reviewing concrete current changes, not for general architecture exploration.
- If `planning-subagent` fails twice to return final findings, the orchestrator must stop that phase as blocked with evidence instead of performing the planning research itself.

## Coding Standards

- TypeScript strict; no implicit `any`
- Functional components and hooks only
- All user-visible text through i18n keys
- Theme colors only through the theme system
- DB access only through the `db/` layer
- Add `testID` to interactive UI elements where practical

## Security

- Never hardcode secrets or API keys in source files
- OpenAI API access must go through a server-side proxy
- Validate user inputs before persistence

## Guardrails

- Prefer minimal, focused changes
- Check `docs/knowledge/lessons-learned.md` before work on a known area and append reusable lessons after non-trivial fixes
- Use task IDs in the form `TASK-001`, `TASK-002`, ... for task-scoped docs
- Run relevant checks after code changes
- Prepare work for the human by default: stage the commit candidate, write review/test docs, and provide exact run/commit commands
- Keep fixes, re-review, re-testing, and documentation updates under the same `TASK-###` as the original implementation thread
- Before any commit handoff, ensure the full task candidate is cached: code + updated docs for the same `TASK-###`, with no unstaged leftovers for that task
- Before review, enforce staging-scope hygiene: staged diff must contain only task-relevant files and must match expected review scope
- `orchestrator` never runs `git commit`; `autonomous-orchestrator` may commit only after passing review, completing required testing, and only when no manual test stop is still pending
- At handoff, prefer returning file handles (`docs/tasks/TASK-###-complete.md`, `docs/testing/TASK-###-test.md`, `docs/reviews/TASK-###-review.md`) instead of relying only on chat text for commit/test instructions

## Temporary Files Policy

- Never create temporary files under `/tmp`.
- Use repository-local temporary files only under `./tmp/`.
- Ensure `./tmp/` exists before use (`mkdir -p ./tmp`).
- Clean up temporary artifacts after use and before final handoff.
- If environment policy blocks write operations outside the workspace, treat that as expected and retry using `./tmp/` paths.
