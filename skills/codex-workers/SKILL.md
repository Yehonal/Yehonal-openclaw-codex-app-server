---
name: codex-workers
description: Use only when the user explicitly asks OpenClaw to use CAS, Codex App Server, a Codex worker, or the codex_workers_* tools for delegated worker execution. Do not use for normal shell, git, filesystem, memory, or local coding actions.
user-invocable: true
---

# Codex Workers

This skill is the explicit entrypoint for OpenClaw to orchestrate Codex App Server workers through the `codex_workers_*` tools.

## Activation Policy

Use this skill only when the user explicitly asks for one of these:

- "use CAS"
- "use Codex App Server"
- "use a Codex worker"
- "use `codex_workers_*`"
- a worker-style delegation that specifically names CAS or Codex workers

Do not activate this skill just because a task involves code, shell commands, git, files, tests, memory recovery, or normal OpenClaw automation. For ordinary local work, use the normal OpenClaw tools directly.

## Tool Policy

When this skill is active, the allowed CAS worker tools are:

- `codex_workers_describe_endpoints`
- `codex_workers_list_threads`
- `codex_workers_run_task`
- `codex_workers_read_thread_context`

Before calling a CAS worker tool:

1. Confirm the current user request explicitly asked for CAS/Codex worker orchestration.
2. Prefer direct local OpenClaw tools if the user did not explicitly request CAS.
3. Keep prompts self-contained; CAS workers do not automatically inherit the full OpenClaw conversation, memory bootstrap, or local policy context.
4. Include only the minimum relevant context needed by the worker.
5. Use `permissionsMode: "default"` unless the user explicitly requested full access for CAS.

## Commands Versus Tools

User command path:

- `/cas_resume` and other `/cas_*` commands are explicit user control of CAS conversations.

Agent orchestration path:

- Use `codex_workers_*` only under this skill and only for explicit CAS/Codex worker requests.

Automatic inbound routing from normal chat messages is intentionally not part of this skill.
