# Lobster Museum Stripe Routing Proposal

**Author:** EgonBot  
**Date:** 2026-02-26  
**Status:** Draft

## Overview
Voynich website is a static Astro site. We are already displaying a “Tip the Lobster” support block with crypto addresses and a temporary fallback Stripe button that points to <https://home.planexe.org/account>. This proposal provides the recommended backend routing architecture to:

1. Keep all Stripe billing under PlanExe (Simon’s account)
2. Allow the Lobster button to redirect users to a dedicated museum donation lane inside PlanExe
3. Maintain a clear migration path (phase 0 → academy) while separating museum donations from normal credit purchases
4. Surface the donation data/confirmation back to Voynich for thank-you messaging and donor walls

## Architecture

### 1. Source of truth: PlanExe backend
- Endpoint: `/billing/stripe/checkout` (PlanExe `frontend_multi_user/src/app.py` lines ~830-870)
- Webhook: `/billing/stripe/webhook` (lines ~870+)

PlanExe already accepts credit purchases and records them (CreditHistory, PaymentRecord). We will reuse that endpoint but augment it with metadata describing a museum donation (`source=lobster_museum`). No new Stripe account or key is needed.

### 2. Voynich frontend behavior
The Lobster Museum page (`src/pages/lobster-art-museum.astro`) should send visitors to PlanExe using one of two variants:

**Option A: Simple redirect:**
`https://home.planexe.org/account?source=lobster_museum&tier=supporter`

**Option B: API-driven session (preferred long-term):**
1. Voynich makes a POST to `https://home.planexe.org/api/museum-checkout` with tier details (tier_id, amount, credits, callback).
2. PlanExe creates a Stripe Checkout session with metadata (`source=lobster_museum`, `tier=benefactor`) and returns the `session_url`.
3. Voynich redirects the user to that URL.

Option B gives us control over tiers and adds validation, but both options keep the actual payment handled by PlanExe.

### 3. Data handling on PlanExe
**PaymentRecord** updates:
- `source` field (`lobster_museum`) to filter reports.
- `metadata` JSON containing `tier`, `credits_awarded`, `redirect_url`.

**Credit granting:**
- Donations can still grant PlanExe credits (per tier) via `_apply_credit_delta` and ledger entries.

**Webhook events:**
- After Stripe confirms the payment (`checkout.session.completed`), log the donation and optionally fire a webhook or push event to Voynich (for thank-you page updates).
- Add a lightweight `MuseumDonation` record (optional) to track donor email, tier, and timestamp.

### 4. Voynich feedback loop (optional)
PlanExe can POST to `https://voynich-website-endpoint/api/donations` (new static-hosted lambda or Edge function) with donation metadata so the static site can:
- Show a thank-you message with the donor’s name/tier (if they allow sharing)
- Update a donor wall or public honor roll (static JSON file regenerated via automation)

## Migration path
| Phase | Description |
|-------|-------------|
| Phase 0 | Current state: button redirects to `https://home.planexe.org/account` with no metadata. Crypto addresses remain live. |
| Phase 1 | Add query params (`source=lobster_museum`, `tier=...`). PlanExe logs the source and tier in `PaymentRecord`. Voiych just redirects to the account page. |
| Phase 2 | Launch `/api/museum-checkout` (PlanExe) so Voynich can generate targeted Checkout sessions for each tier and pass `success_url`. Optionally return `tier_id` for analytics. |
| Phase 3 | PlanExe notifies Voynich (webhook or shared datastore) after each donation. Voynich surfaces donor badges, send email/thank you overlays.

## File references
- `voynich-website/src/pages/lobster-art-museum.astro` (add tier config, update button to call API or redirect).
- `voynich-website/src/components/DonationButton.astro` (create component for the donation lanes).
- `PlanExe/frontend_multi_user/src/app.py` (update `stripe_checkout` to accept `source` metadata and add new `/api/museum-checkout` route).
- `PlanExe/docs/stripe.md` (document new tiers/metadata). Add a section describing the `lobster_museum` campaign.
- `PlanExe/database_api/model_payment_record.py` (add `source` + metadata fields). Keep `CreditHistory` logic unchanged.

## Deployment considerations
- No new Stripe keys or accounts required --- reuse Simon’s PlanExe keys.
- The PlanExe webhook must remain accessible from Stripe (update `PLANEXE_PUBLIC_BASE_URL` if needed).
- Automate deployment: Run the PlanExe backend w/ new routes, then update the Voynich button to hit the new endpoint.

## Summary
We are routing all Stripe traffic through PlanExe (Simon’s account) so that museum donations are tracked alongside existing credits. Voynich remains static, simply redirecting visitors or calling an API to generate Stripe sessions, while PlanExe captures metadata and issues credit rewards.

Would you like me to expand this into a `docs/proposals` page with diagrams and API samples for the next developer?