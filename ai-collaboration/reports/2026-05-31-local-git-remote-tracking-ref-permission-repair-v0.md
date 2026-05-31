# Local Git Remote-Tracking Ref Permission Repair v0

Date: 2026-05-31

## Summary

The local Git issue is confirmed as a filesystem permission/xattr problem on `.git` metadata, not a remote Git or history problem.

Remote pushes reach GitHub and `git ls-remote` reports the correct remote `staging` SHA, but local `git fetch` cannot update `FETCH_HEAD` and local remote-tracking refs because the Codex sandbox cannot write/remove affected `.git` files. The affected files/directories are owned by the current user with normal modes, but have `com.apple.provenance` extended attributes. Attempts to remove the xattr, delete/regenerate `FETCH_HEAD`, or write a test file under `.git/refs/remotes/origin` all returned `Operation not permitted`.

## Before State

- Working directory: `/Users/raylin/Projects/anyu-next`
- Branch: `staging`
- Initial status: `## staging...origin/staging [ahead 2]`
- `HEAD`: `eb43df86413174ae623a6444070102c0f3276348`
- Remote `staging` from `git ls-remote`: `eb43df86413174ae623a6444070102c0f3276348`
- Local `origin/staging`: `7d1c51b1629d4aa24702e6ef9dd2c3d2b1152422`
- Local `origin/main`: `1990fc034d745e7aaafdd34bb8221b494220d909`

## Failed Fetch Evidence

`git fetch origin --prune` failed with:

```text
error: cannot open '.git/FETCH_HEAD': Operation not permitted
fetch_exit=255
```

## Permission Inspection

Observed metadata:

- `.git/FETCH_HEAD`: owner `raylin`, group `staff`, mode `-rw-r--r--`, xattr `com.apple.provenance`
- `.git/refs/remotes/origin/staging`: owner `raylin`, group `staff`, mode `-rw-r--r--`, xattr `com.apple.provenance`
- `.git/refs/remotes/origin/main`: owner `raylin`, group `staff`, mode `-rw-r--r--`, xattr `com.apple.provenance`
- `.git/refs/remotes/origin/`: owner `raylin`, group `staff`, mode `drwxr-xr-x`, xattr `com.apple.provenance`

No `.lock` files were found by:

```bash
find .git -maxdepth 5 -name "*.lock" -ls
```

The sandbox could not run `ps aux | grep "[g]it"` because process inspection returned `Operation not permitted`.

## Repair Attempts

Attempted narrow repairs:

- Remove `com.apple.provenance` from `.git/FETCH_HEAD`, `.git/refs/remotes/origin/staging`, and `.git/refs/remotes/origin/main`.
- Remove/regenerate `.git/FETCH_HEAD`.
- Overwrite local `refs/remotes/origin/staging` with the verified remote SHA.
- Create a write-test file under `.git/refs/remotes/origin`.
- Re-run `git fetch origin --prune`.

All write/removal attempts on the affected `.git` paths returned `Operation not permitted`, so the repair could not be completed from this Codex sandbox.

## Root Cause

Most likely root cause: macOS sandbox / provenance metadata on `.git` files and directories prevents this Codex process from writing specific Git metadata paths, especially `FETCH_HEAD` and remote-tracking refs.

This is not caused by:

- a stale Git lock file
- wrong Unix owner/group/mode
- failed remote push
- divergent local branch commits

## Manual Repair Command

Run from a normal trusted Terminal outside the Codex sandbox:

```bash
cd /Users/raylin/Projects/anyu-next

# Optional backup of affected local Git metadata.
mkdir -p /private/tmp/anyu-git-repair-backup
cp .git/FETCH_HEAD /private/tmp/anyu-git-repair-backup/FETCH_HEAD.before 2>/dev/null || true
cp .git/refs/remotes/origin/staging /private/tmp/anyu-git-repair-backup/origin-staging.before 2>/dev/null || true
cp .git/refs/remotes/origin/main /private/tmp/anyu-git-repair-backup/origin-main.before 2>/dev/null || true

# Remove problematic macOS provenance metadata from local Git metadata.
xattr -dr com.apple.provenance .git

# Ensure user-writable local Git metadata.
chmod -R u+rwX .git

# Remove regenerable fetch metadata and stale lock files only.
rm -f .git/FETCH_HEAD
find .git -maxdepth 5 -name "*.lock" -type f -delete

# Rebuild local remote-tracking refs.
git fetch origin --prune
git status --short --branch
git rev-parse origin/staging
git rev-parse origin/main
git rev-list --left-right --count HEAD...origin/staging
```

If `xattr -dr` still returns `Operation not permitted`, run the same command from Terminal with Full Disk Access, or use:

```bash
sudo xattr -dr com.apple.provenance .git
sudo chmod -R u+rwX .git
```

## Expected After State

After manual repair and fetch:

- `git fetch origin --prune` should succeed.
- `origin/staging` should match remote `staging`.
- `git status --short --branch` should no longer falsely show local branch ahead due to stale `origin/staging`.
- Future pushes should no longer report `update_ref failed for ref 'refs/remotes/origin/staging'`.

## Worktree Safety

- No app/runtime files were changed by repair attempts.
- No `git reset`, `git checkout`, force push, or history rewrite was performed.
- No uncommitted work was discarded.
- Only local Git metadata was inspected and attempted.

## Validation

- `git ls-remote origin staging`: succeeded and confirmed remote `staging` SHA.
- `git fetch origin --prune`: still blocked by local filesystem permissions.
- Docs presence check: passed.
- Secret/private scan on new docs: passed.
- `git diff --check`: passed.

## Blockers

- The Codex sandbox cannot write/remove the affected `.git` metadata paths, so the local repair requires a normal Terminal outside this sandbox.

## Tech Debt Review

- New technical debt introduced: none.
- Existing technical debt observed: local Git metadata remains unrepaired until owner runs the manual command.
- Opportunistic cleanup completed: root cause narrowed to local `.git` xattr/permission problem with no stale locks found.
- Deferred cleanup candidates: none after manual repair; rerun fetch/status verification afterward.

## Suggested Next Step

Run the manual repair command above from a normal Terminal, then rerun:

```bash
git fetch origin --prune
git status --short --branch
git rev-parse origin/staging
git ls-remote origin staging
```
