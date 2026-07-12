# AGENTS.md

Operating notes for any agent working in this repository. It holds several
independent, unrelated small projects — check which one you're in before assuming
conventions carry over between them.

## habit-app/

A single-user habit tracker (static PWA, local storage, no backend).

**Read [`habit-app/product.md`](habit-app/product.md) before making any product or
feature decision here.** It is the source of truth for what this product's core
terms mean (what counts as a "habit," what "streak" and "completion rate" mean),
the entity model, and a dated log of decisions already made. Two entity model
options are drafted there and not yet chosen — don't pick one unilaterally in code
without checking whether it's been resolved, and don't invent a third without
recording it.

If you make or learn a product decision while working here, add it to
`product.md`'s Decision log with the date — don't let it live only in a commit
message or your own memory.

Architecture: plain HTML/CSS/JS, no build step, `localStorage` for persistence,
installable as an iOS home-screen app via `manifest.json` + `sw.js`. This mirrors
`budget-app/` below — keep that pattern unless `product.md` says otherwise.

## budget-app/

A single-user budgeting app (static PWA, local storage, no backend). Same
architecture pattern as `habit-app/` (plain JS, no build step, installable PWA).
No `product.md` yet — infer conventions from the existing code.

## client/ + server/

An NBA player rankings web app (React client + Node/Express-style server, per
`package.json` in each). Separate from the two static apps above — has its own
build tooling. No `product.md` yet.

## General

- `CLAUDE.md` at the repo root holds context about the repo owner, not product
  decisions — don't confuse the two files.
- Don't assume a convention from one sub-project applies to another; each is
  independent.
