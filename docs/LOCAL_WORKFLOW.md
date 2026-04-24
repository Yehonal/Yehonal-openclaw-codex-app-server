# LOCAL_WORKFLOW.md

## Repository model

Canonical repo:
- `/root/.openclaw/workspace/openclaw-codex-app-server`

Live plugin path:
- `/root/.openclaw/extensions/openclaw-codex-app-server`
- this is a symlink to the live runtime worktree, currently `worktrees/openclaw-codex-app-server/runtime-integration`
- it is not a separate copy, but it is also not the repo root checkout

Remotes:
- `origin` = public upstream repository
- `fork` = personal fork repository

Important:
- do not assume `origin` is the fork in this repo
- do not do active feature work in the repo root checkout
- the live runtime path is the dedicated runtime worktree through `/root/.openclaw/extensions/openclaw-codex-app-server`
- that means the runtime worktree, not the repo root checkout, must match the code you actually want OpenClaw to load on restart

## Branch roles

- `main` -> local mirror of upstream main
- `pr/*` -> one clean review surface per PR
- `integration/*` -> combined runtime branch for local use when multiple unmerged streams must coexist
- `prep/*` -> temporary extraction/restack branches during syncwheel work
- `backup/*` -> safety branches created before a rewrite or restack

## Worktree rule

Use one worktree per active PR/integration stream.

Current layout:
- repo root: administrative checkout only
- `worktrees/openclaw-codex-app-server/pr-discord-thread-scope-fix`
- `worktrees/openclaw-codex-app-server/pr-inbound-audio-transcription`
- `worktrees/openclaw-codex-app-server/pr-autonomous-codex-worker-tools-standalone`
- `worktrees/openclaw-codex-app-server/runtime-integration`
- other `prep/*` worktrees only when doing syncwheel/restack work

The repo root should stay clean and should normally be used only as an administrative checkout.

Because the live plugin path points to the dedicated runtime worktree, the repo root does not need to mirror the runtime branch. Detached HEAD in the repo root is acceptable here. The important rule is: do not use the repo root as an active feature workspace.

## Daily operating rules

### 1. Before starting

```bash
cd /root/.openclaw/workspace/openclaw-codex-app-server
git fetch --all --prune
git worktree list
git branch -vv
git stash list
```

### 2. Work on the correct worktree

Examples:

```bash
cd /root/.openclaw/workspace/worktrees/openclaw-codex-app-server/pr-discord-thread-scope-fix
```

```bash
cd /root/.openclaw/workspace/worktrees/openclaw-codex-app-server/runtime-integration
```

Do not edit from the repo root unless the task is specifically repo administration.

### 3. PR branch policy

Each public PR branch must contain only one coherent reviewable change set.

Preferred model:
- branch from `origin/main`
- implement or cherry-pick only the intended commits
- validate in that worktree
- push only that PR branch

### 4. Integration branch policy

`integration/yehonal-cas-stack` is the local combined runtime branch.

Use it when:
- several unmerged PR streams must run together
- local testing needs the whole stack
- a reconciliation commit is needed that should not live in any single public PR

Do not confuse integration with a review branch.

## Standard commands

### Reset repo root to a healthy admin checkout

```bash
cd /root/.openclaw/workspace/openclaw-codex-app-server
git fetch --all --prune
git switch --detach origin/main
```

### Set the live runtime checkout

```bash
cd /root/.openclaw/workspace/worktrees/openclaw-codex-app-server/runtime-integration
git fetch --all --prune
git checkout integration/yehonal-cas-stack
```

### Create a PR worktree

```bash
cd /root/.openclaw/workspace/openclaw-codex-app-server
git fetch --all --prune
git branch pr/my-change origin/main
git worktree add /root/.openclaw/workspace/worktrees/openclaw-codex-app-server/pr-my-change pr/my-change
```

### Create an integration worktree

```bash
cd /root/.openclaw/workspace/openclaw-codex-app-server
git fetch --all --prune
git branch integration/my-stack origin/main
git worktree add /root/.openclaw/workspace/worktrees/openclaw-codex-app-server/runtime-my-stack integration/my-stack
```

### Publish a PR branch

```bash
cd /root/.openclaw/workspace/worktrees/openclaw-codex-app-server/pr-my-change
git status
git push -u fork pr/my-change
```

### Publish integration

```bash
cd /root/.openclaw/workspace/worktrees/openclaw-codex-app-server/runtime-integration
git status
git push -u fork integration/yehonal-cas-stack
```

## Syncwheel notes for this repo

When running syncwheel here:
- recover remotes first
- recover worktrees and stash state before editing
- keep PR branches clean and isolated
- keep integration intentionally ahead when needed
- prefer extraction/cherry-pick over piling unrelated work into one PR branch

Current known important stash:
- `stash@{0}` on `pr/discord-thread-scope-fix` from the 2026-04-22 syncwheel recovery

Do not drop stashes casually.

## Non-regression rules

- never assume `extensions/openclaw-codex-app-server` is a separate runtime copy
- never do unrelated work directly on a public PR branch
- never use integration history as proof that a PR is clean
- never use the repo root as an active feature workspace just because it is convenient
- detached HEAD in the repo root is acceptable here when `main` already lives in the dedicated `upstream-main` worktree
- before restarting OpenClaw, verify that the runtime worktree checkout matches the runtime code you actually want loaded

## Documentation links

- persistent project workflow memory: `/root/.openclaw/workspace/memory/projects/openclaw-codex-app-server-workflow.md`
- syncwheel skill: `/root/.openclaw/workspace/skills/syncwheel/SKILL.md`
- public syncwheel article source: `/root/.openclaw/workspace/shared/syncwheel-public-article.md`
