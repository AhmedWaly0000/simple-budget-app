# Habit Tracker — Product Decisions

This file is the source of truth for what this product means by its core terms, and
a running log of decisions made about it. If a decision here conflicts with the code,
the code is wrong (or this file is stale and needs updating — don't just silently diverge).

## What this is

A single-user habit tracker. No accounts, no server — local-first, same pattern as
`budget-app/` elsewhere in this repo. The goal is to see, at a glance, whether a
regular routine is actually being kept, and to hold a short list of routines not
started yet.

## Core definition

> A **habit** is an action, tied to a regular trigger point, repeated often enough
> that it becomes automatic and moves something that matters in the person's life.

Example given while defining this: **"Brush teeth at 7:00 AM when I wake up."**
Broken down, every habit has three parts:

| Part | In the example | What it means |
|---|---|---|
| **Action** | Brush teeth | The thing actually done |
| **Anchor** | 7:00 AM / on waking | *When* it happens — a clock time or a named moment |
| **Cadence** | Every day | How often it repeats |

A habit in this product is never just a vague goal like "read more" — it names the
action and states when it happens. That's the bar a habit must clear to belong in
the active list rather than the wishlist.

## Entities

Two candidate models for how to represent this in data. Neither is committed yet —
pick one, or ask for a merge, before more feature work is built on top.

### Option A — Anchored Habit (strict)

Matches the definition literally: the anchor is a required, structured field, and
completions are their own entity so later analysis (e.g. "did on time" vs "did late")
is possible without reshaping the model.

```
Habit
  id
  name          — the action, e.g. "Brush teeth"
  anchor        — required. { type: "time", value: "07:00" }
                            or { type: "moment", value: "on waking" }
  cadence       — "daily" | { type: "weekly", day: "Sunday" }
  status        — "active" | "planned"
  createdAt

Completion
  id
  habitId
  date          — the day it counts for
  completedAt   — actual timestamp, optional (lets you see "done but late")
```

Trade-off: more setup per habit (you must state an anchor to add one), more honest
to the definition above, and leaves room to grow (streak-by-time-of-day, "how close
to your anchor" stats) without a rework.

### Option B — Flexible Routine (simple)

Keeps the single-entity shape already used in the working MVP (`app.js`): a habit
holds its own completions as a plain array of dates. The anchor becomes an optional,
free-text label rather than a validated field — descriptive, not enforced.

```
Habit
  id
  name          — the action
  trigger       — optional free text, e.g. "7:00 AM" or "mornings" or blank
                  (not yet implemented in code — see decision log 2026-07-11)
  category      — "faith" | "body" | "craft"  (added when building the Momentum
                  visual direction, for card color-coding; not part of the
                  original definition — revisit if it starts feeling forced)
  cadence       — "daily" | "weekly"
  status        — "active" | "planned"
  createdAt
  completions   — [ "2026-07-11", "2026-07-10", ... ]
```

Trade-off: faster to add a habit, no validation friction, but doesn't force the
specificity the definition calls for — someone could add "read more" with no
trigger and the product wouldn't stop them. Least rework: this is what's already built.

### Shared vocabulary (true under either option)

- **Active** — currently being tracked; shows in the daily/weekly list.
- **Planned** — a habit the person wants to develop but hasn't started tracking yet
  ("habits you want to develop"). Moving planned → active resets `createdAt` to the
  start date, so streak math isn't inflated by the time it sat idle.
- **Streak** — consecutive daily days, or consecutive weeks with at least one
  completion, ending at today/this week. Doesn't break just because today isn't
  over yet — only breaks on a truly skipped prior day/week.
- **Completion rate** — % of the tracking window (last 30 days for daily habits,
  last ~8 weeks for weekly ones) that were completed.

## Open decisions (not yet resolved)

These were asked and deliberately deferred — don't assume an answer, ask again if
they become blocking:

- Is the anchor **required** for every habit, or optional? (Option A vs. B above
  hinges on this.)
- For weekly habits, is a specific day + time required (e.g. "Sundays, 6 PM, call
  home"), just a target day, or left loose ("sometime this week")?

## Non-goals for MVP

- No multi-user / accounts / sync — local storage only.
- No push notifications or reminders.
- No backend — static, installable PWA, matching `budget-app/`.

## Decision log

- **2026-07-11** — Defined "habit" as action + anchor + cadence (see Core
  definition above). Source: direct conversation, teeth-brushing example.
- **2026-07-11** — Explored three divergent visual directions for the tracker
  before settling a design system: *Rule of Life* (devotional ledger, serif/gold),
  *Momentum* (training-log/scoreboard, bold condensed), *Field Notes* (data-dense
  dashboard, monospace/heatmap).
- **2026-07-11** — Deferred: whether the anchor is required, and whether weekly
  habits need a specific day/time. See Open decisions.
- **2026-07-11** — Two entity model options drafted (Option A / B above), pending
  a decision before further feature work.
- **2026-07-11** — **Momentum** chosen as the visual direction. Built the working
  MVP (`index.html`, `app.js`) on top of it. Two implementation calls made along
  the way, both provisional, not full resolutions of the open decisions above:
  - Used **Option B** (Flexible Routine) as the entity model — least rework, and
    the anchor question was still unresolved so nothing forced Option A. The
    `trigger` field from Option B is still **not implemented** — habits currently
    have no anchor at all in the running code. Still open.
  - Added a **category** field (`faith` / `body` / `craft`) not in either
    original option, needed for Momentum's color-coded cards. Noted inline in
    Option B above.
  - Fixed a real bug hit while testing: date math used `toISOString()` (UTC),
    which rolled "today" over early for anyone west of UTC in the evening.
    Switched to local-date construction throughout.
