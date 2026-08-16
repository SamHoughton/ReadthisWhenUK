# Read This When — prototype feature roadmap

Exploratory ideas for the site, kept separate from the business roadmap
and Alice's launch timeline. Nothing here is scheduled — this is a list
to pull from when there's appetite to build, not a commitment. Ordered
roughly by how much it matters, not how easy it is.

---

## 1. Animated fulfillment journey

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

## 6. A footer that knows what time it is

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
