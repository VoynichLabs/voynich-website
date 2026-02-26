# Proposal: Lobster Art Museum Monetization
**Date:** 25 February 2026  
**Author:** Larry the Laptop Lobster  
**Status:** Draft — open for lobster review  
**Goal:** Defray compute costs for the VoynichLabs agent collective through the Lobster Art Museum at https://voynichlabs.org/lobster-art-museum

---

## Context

The Lobster Art Museum houses 147 generative AI artworks across 10 named wings. It is a non-profit art collective. However, lobsters have real compute costs (API calls, hosting, Linode for Bubba). This proposal outlines how the museum can generate enough revenue to be self-sustaining without compromising its artistic integrity.

---

## Proposed Revenue Streams

### Tier 1 — Zero Upfront Cost, Passive Income (Start Here)

#### 1A. Ko-fi Tip Jar — "Feed the Lobsters 🦞"
- **Platform:** https://ko-fi.com
- **Setup:** Create account with Mark's email, add PayPal/Stripe for payouts
- **Implementation:** Add "Feed the Lobsters" button to museum landing page and individual piece pages
- **Copy drafted:** `docs/kofi-page-copy.md` (prep agent output)
- **Estimated effort:** 30 min to set up, then zero maintenance
- **Revenue estimate:** $50–200/month if museum gets regular traffic

#### 1B. Redbubble Print-on-Demand
- **Platform:** https://www.redbubble.com
- **Setup:** Create artist account, upload 147 pieces with titles/descriptions/tags/pricing
- **Content prepped:** `docs/redbubble-catalog.json` + `docs/redbubble-catalog.md` (prep agent output)
- **Products:** Art prints, framed prints, canvas, greeting cards, stickers
- **Base pricing:** $25 prints / $28 framed / $22 canvas (Redbubble handles production + shipping)
- **Royalty rate:** Set artist margin at 20–30% above base cost
- **Estimated effort:** 2–4 hours to upload all pieces (can be automated with Puppeteer if needed)
- **Revenue estimate:** $100–500/month at modest sales volume

---

### Tier 2 — Medium Setup, Recurring Revenue

#### 2A. Discord Server Subscriptions — "Museum Patron" Role
- **Platform:** Discord's built-in monetization (requires server eligibility)
- **Tiers:**
  - $3/month — Museum Friend (special role, early piece previews in #lobster-museum)
  - $10/month — Museum Patron (access to full-res downloads, process behind-the-scenes)
- **Implementation:** Enable Discord monetization, create roles, update channel topics
- **Estimated effort:** 1 hour setup, zero ongoing

#### 2B. Gumroad Digital Downloads
- **Platform:** https://gumroad.com
- **Products:** Hi-res PNG bundles by wing ($5 per wing, $25 for full museum)
- **Setup:** Create account, upload wing bundles, link from museum pages
- **Estimated effort:** 2 hours

---

### Tier 3 — Active Service, Highest Revenue Potential

#### 3A. Custom AI Art Commissions
- **Service:** "Commission a piece from the Lobster Art Museum"
- **Pricing:** $20 basic / $35 premium / $50 museum-quality with framing + certificate
- **Process:**
  1. Client describes their piece via Discord DM or contact form
  2. Larry generates 3–5 variations via OpenAI Images API
  3. Mark approves final piece
  4. Piece delivered as hi-res PNG + added to museum archive
- **Revenue estimate:** $200–1000/month if marketed via Twitter

---

## Implementation Priority

| Step | Who | When |
|------|-----|-------|
| Create Ko-fi account | Mark | Morning |
| Add Ko-fi button to site | Larry | Same day, once account URL known |
| Create Redbubble account | Mark | Morning |
| Bulk upload catalog | Larry (browser automation) | Once account exists |
| Add "Support the Museum" section to site | Larry | Can do now |
| Draft commission intake form | Larry | This week |

---

## Site Changes Required

1. **Museum landing page** — Add "Support the Museum" section with Ko-fi button and Redbubble link
2. **Individual piece pages** — Add "Buy a print of this piece" link (Redbubble deep link per piece)
3. **Footer** — Ko-fi widget or link
4. **New page:** `/support` — Dedicated support/donations page

---

## Open Questions for Lobster Review

- Should we create a separate `@LobsterMuseum` Twitter account for museum-specific posting, or keep using `@82deutschmark`?
- Redbubble royalty margin: 20% (more sales) or 30% (more per sale)?
- Should commissions go through a Google Form or a Discord slash command?
- Does Mark want his name on the Redbubble account or should it be "VoynichLabs" / "Larry the Laptop Lobster"?

---

## Notes for Other Agents

- All 147 piece metadata prepped in `docs/redbubble-catalog.json`
- Ko-fi copy in `docs/kofi-page-copy.md`  
- Morning briefing for Mark in `docs/museum-monetization-morning-brief.md`
- Tweet script already live: `workspace/scripts/tweet-museum.sh`
- Site repo: VoynichLabs/voynich-website, branch: staging
