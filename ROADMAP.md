# Read This When — prototype feature roadmap

Exploratory ideas for the site, kept separate from the business roadmap
and Alice's launch timeline. Nothing here is scheduled — this is a list
to pull from when there's appetite to build, not a commitment. Ordered
roughly by how much it matters, not how easy it is.

---

## 1. Animated fulfillment journey — ✅ shipped

**Pitch:** Turn "How it works" from three paragraphs of prose into a
short scroll-driven illustrated sequence: a message arrives, Alice
pulls books from her shelf, the parcel gets wrapped and labelled,
it's posted, it lands at the chair.

**Why it matters:** This is the one aimed at conversion, not delight.
The hero already opens on "hand delivers parcel to an empty chair" and
the footer already closes on "parcel resting on that same chair" — the
journey animation is the missing middle of a story the site is already
telling in its bookends. Right now the actual mechanics of the service
are the least visually interesting part of the page.

**Shape:** Built on the GSAP + ScrollTrigger system already wired up
sitewide, so no new dependency. Needs new illustration assets in the
existing halftone style (a small set of "scene" frames, not full
animation) — the biggest cost here is art, not code.

---

## 2. A recipient companion page

**Pitch:** A QR code or short URL on the packaging opens a small,
private page for the *recipient* — the handwritten note rendered
again, maybe a line from Alice on why these books.

**Why it matters:** Every digital touchpoint on the site right now is
for the giver. The site's own pitch is "chosen for them, not by you,"
but the "them" never gets anything except a box. This is the most
distinctive idea on this list because almost nobody in gifting builds
for the person who didn't do the buying.

**Shape:** Needs a stable per-order URL/token, so it's the one item
here that has a real dependency on the order-book work in the business
roadmap (can't generate a private link without somewhere to generate
it from). Worth returning to once that exists.

---

## 3. A generative keepsake at the end of `/start`

**Pitch:** Finishing the builder currently just shows "Sealed and
sent." Instead, generate a small one-off wax-seal or postmark image —
the chosen moment, the date, stamped in the site's own illustration
style — as something downloadable or shareable.

**Why it matters:** Reuses the wax-seal motif that's already all over
the brand (the success state, the footer, the illustration set), so it
extends existing visual language instead of adding a new one.

**Shape:** Canvas or SVG composition in the browser, no server needed.
A genuinely fun, contained thing to build well.

---

## 4. Homepage note-writing teaser

**Pitch:** The best trick in `/start` is watching the handwritten note
assemble itself as you answer questions. Nothing on the homepage does
that. A small looping teaser near the hero or closer section, cycling
through a few example notes in the same handwriting font, would bring
that charm to the page most people actually land on first.

**Why it matters:** Cheapest item on this list. The mechanic, the
font, and the copy voice all already exist in `/start` — this is
mostly wiring, not design.

**Shape:** Small, self-contained JS loop; no new assets.

---

## 5. Business mini-configurator

**Pitch:** A lighter version of `/start` for the "For business"
corner — team size, occasion, rough budget in, an estimate out —
instead of the single paragraph and link that's there now.

**Why it matters:** For-business is currently the most under-built
part of the site relative to how it's framed elsewhere (its own nav
link, its own aside). This would give it the same guided, considered
feel the consumer side already has.

**Shape:** Medium — a shorter, linear version of the `/start` pattern,
reusing its option-button and progress mechanics rather than inventing
new ones.

---

## 6. A footer that knows what time it is — ✅ shipped

**Pitch:** The footer is already a night scene with a lantern. Tie its
lighting to the visitor's actual local time (or season) instead of
being static.

**Why it matters:** Purely cosmetic, costs nothing functionally, and
rewards someone who visits more than once — a small technical flex in
keeping with the site's craft-over-flash direction.

**Shape:** Small — CSS custom properties driven by `Date()`, layered
onto the existing footer background/scrim setup. No new assets
strictly required, though a couple of lighting variants would sell it
better than one.

---

## Modern accents

A second, smaller list — restrained motion and surface treatments,
not a redesign. The brief here: keep the current warm/craft feel as
the foundation and layer a bit more polish and kinetic life on top,
the way the button depth and journey animation already have. Nothing
in this section replaces existing layout or changes the site's tone;
each item reuses a mechanism or motif that's already in the codebase
rather than introducing a new visual language.

---

## 7. Frosted-glass header — ✅ shipped

**Pitch:** Add `backdrop-filter: blur()` to `.site-header` in both its
states — transparent-over-hero and `.site-header--scrolled` — so the
nav reads as a pane of glass over whatever's beneath it instead of a
flat tint. Same bar, same position, same links; no floating pill, no
detaching it from the top of the page.

**Why it matters:** This is the one idea from the outside critique
that's genuinely worth having — it's a small, modern surface upgrade
that costs nothing structurally. Deliberately scoped down from "glass
nav bar" as a whole new floating component, which would fight the
site's grounded, page-anchored layout.

**Shape:** A few lines of CSS on the existing `.site-header` and
`.site-header--scrolled` rules. Needs a fallback background-color for
browsers without `backdrop-filter` support, and a check against the
transparent-over-hero state specifically, since blur only reads as
"glass" when there's something visible moving underneath it.

---

## 8. Kinetic type accents — ✅ shipped

**Pitch:** Let a small number of key headings (hero line, section
intros) animate in with a little more character than the current
uniform fade/rise — letter or word-level stagger on entrance, tied to
the same ScrollTrigger reveals already driving `[data-reveal]`.

**Why it matters:** Was the one thing from the outside critique that
still appealed on its own merits, separate from the glass nav.
Explicitly *not* the "morph into handwritten script" version that
review suggested — that reads as a gimmick performed once and never
again. A restrained stagger is a texture, not a trick.

**Shape:** GSAP's `SplitText`-style word/char wrapping (or a small
hand-rolled span-splitter, to avoid a second paid plugin) feeding into
the existing `gsap.from(...)` reveal calls in `main.js`. Scoped to a
handful of headings, not applied sitewide — this stops being subtle
fast if every heading on the page does it.

---

## 9. Scroll-progress thread — ✅ shipped

**Pitch:** A thin vertical line that fills in as the visitor scrolls
down the page — not a generic progress bar, but styled as the same
dashed/thread motif already used for the journey connectors, running
the full height of the page rather than just between four frames.

**Why it matters:** Direct answer to "more scroll choreography"
without adding a new visual idiom — it's the journey connector,
already built, stretched to page-length. Gives the site a small piece
of the kinetic feel the critique was reaching for, using furniture
that already exists.

**Shape:** A fixed-position element, height driven by
`scrollY / (document height - viewport height)`, most simply as a
`transform: scaleY()` on a thread-styled div. No new dependency —
plain scroll listener, same pattern as `startAccentDrift`.

---

## 10. "You are here" nav tracking — ✅ shipped

**Pitch:** As the visitor scrolls through sections, the matching nav
link picks up the site's existing `.ink-link` underline-draw treatment
automatically, instead of that hover effect only firing on mouseover.

**Why it matters:** Cheap, and answers "does the nav feel alive" with
something more useful than decoration — it's wayfinding. Reuses
`.ink-link` exactly as it already renders on hover, just triggered by
scroll position (via `IntersectionObserver` on each section) instead
of by the pointer.

**Shape:** Small — one `IntersectionObserver` watching section
anchors, toggling an `is-active` class on the matching `.nav a` that
maps to the existing `.ink-link` CSS. No new assets, no new plugin.
