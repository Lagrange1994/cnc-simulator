# TODOS

## Cutting Simulation

### Real cutting physics core + machining data model

**What:** Add RPM/feed-rate range validation, and add a `Material` type
(hardness, density, cutting coefficient) plus extend `Tool` with flute count,
tool material, and coating, feeding a real MRR/chip-load spindle & feed load
calculation.

**Status:** The two fake gauges in `Sidebar.tsx` are already fixed (spindle
load and feed load now read `loadFillPercent(value, max)` against fixed
machine-rated limits in `lib/machine/spec.ts` — see `MACHINE_SPEC`) instead of
hardcoding `80`/`40` while simulating. That was the **simplified formula**
half of the decision below; this remaining item is the **real MRR/chip-load**
half, which still needs the Material/Tool schema.

**Why:** This is the actual substance of "cutting calculation simulator" —
today it only has machine-rated-limit gauges, not per-cut load derived from
material/tool. A full repo-wide search for hardness/chipload/cutting-force/
MRR/chatter/torque returns nothing real yet. The app is currently a G-code
line-stepper + SVG toolpath visualizer, not a physics simulator, despite
being pitched as one.

**Context:** Surfaced during `/plan-eng-review` on 2026-08-20 (Engineering
Manager persona review, answering: does the cutting core handle extreme
values like RPM near zero or material hardening limits?). Cross-model review
(independent Claude subagent) flagged that adding the Material/Tool schema
fields before the physics logic exists would produce dead fields with no
consumer and likely the wrong shape — do this data model addition *together*
with the physics logic, not before it. User decided (2026-08-21) to ship the
simplified machine-rated-limit gauges now and defer the real MRR/chip-load
model — that decision drives the schema shape when this is picked up.

**Effort:** L
**Priority:** P2
**Depends on:** Deciding the Material/Tool schema shape for real MRR/chip-load
formulas (deferred, not yet started).

### MachineKinematics abstraction (defer until a second machining method is planned)

**What:** When turning (X/Z + C-axis) or 5-axis (A/B/C rotary heads) actually
enters the roadmap, extract a `MachineKinematics` interface with the current
3-axis milling behavior as `CartesianMillKinematics`. At the same time, fix
the cartesian→screen-space projection math (`500 + x*2, 300 - y*2`) that's
currently duplicated 3x in `Viewport.tsx` (toolpath rendering, tool marker,
coordinate tag) — a kinematics interface alone won't fix that duplication,
since it's a separate screen-projection concern.

**Why:** Building this today would be premature (YAGNI) — one implementation,
zero second consumer, no confirmed follow-on plan, in a ~1500-line 3-file app.
But without it, adding a second machining method later means rewriting
`App.tsx`'s simulation loop and `Viewport.tsx`'s rendering math from scratch
instead of implementing an interface.

**Context:** Surfaced during `/plan-eng-review` on 2026-08-20. Originally
proposed as "build now" by the main review; an independent cross-model
subagent review pushed back specifically on the premature-abstraction risk
and the fact that the interface as scoped wouldn't even solve the real
duplication (the screen-projection math, not the kinematics). User accepted
the subagent's recommendation to scale back to just extracting the shared
G-code parser now, and defer this abstraction until it has a real second use
case.

**Effort:** M
**Priority:** P3
**Depends on:** A confirmed decision to support turning or 5-axis machining.
