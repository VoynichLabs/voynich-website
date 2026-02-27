# Lobster Museum Funding Implementation Plan

**Author:** EgonBot  
**Date:** 2026-02-26  
**Status:** Draft  
**Target:** VoynichLabs/voynich-website repository  

---

## Executive Summary

This document outlines the implementation plan for adding donation/funding capabilities to the Lobster Museum. Instead of building a standalone payment system, we will **reuse Simon's existing Stripe account** configured for PlanExe. Donors will receive **PlanExe credits** as a thank-you, creating cross-promotion between the museum and the planning tool.

**Key Benefits:**
- No new Stripe account needed (reuse PlanExe's existing config)
- Donors get tangible value (PlanExe credits)
- Simple implementation (no user auth required for basic donations)
- Scalable to memberships, gift shop, and special exhibits later

---

## 1. Current State Analysis

### 1.1 PlanExe Stripe Implementation (Reference)

**Location:** `PlanExeOrg/PlanExe` repository

**Key Files:**
- `frontend_multi_user/src/app.py` (Stripe checkout and webhook handling)
- `docs/stripe.md` (Stripe integration documentation)
- `docs/user_accounts_and_billing.md` (Database schema)

**Stripe Checkout Endpoint:**
- File: `frontend_multi_user/src/app.py`
- Line: ~835
- Route: `/billing/stripe/checkout`
- Method: POST

```python
@self.app.route('/billing/stripe/checkout', methods=['POST'])
def stripe_checkout():
    stripe_secret = os.environ.get("PLANEXE_STRIPE_SECRET_KEY")
    # ... creates Stripe Checkout session
```

**Stripe Webhook Handler:**
- File: `frontend_multi_user/src/app.py`
- Line: ~860
- Route: `/billing/stripe/webhook`
- Processes `checkout.session.completed` events

**Environment Variables Used:**
| Variable | Purpose |
|----------|---------|
| `PLANEXE_STRIPE_SECRET_KEY` | Stripe API key |
| `PLANEXE_STRIPE_WEBHOOK_SECRET` | Webhook signature verification |
| `PLANEXE_CREDIT_PRICE_CENTS` | Price per credit (default: 100 cents = $1) |
| `PLANEXE_STRIPE_CURRENCY` | Currency (default: usd) |
| `PLANEXE_PUBLIC_BASE_URL` | Success/cancel redirect URL |

**Database Tables (for reference):**
- `UserAccount` — tracks user credits_balance
- `CreditHistory` — append-only ledger of credit changes
- `PaymentRecord` — completed payment details

**Full schema:** See `PlanExe/docs/user_accounts_and_billing.md`

### 1.2 Voynich-Website Structure

**Repository:** `VoynichLabs/voynich-website`  
**Tech Stack:** Astro (static site), Tailwind CSS, deployed on Railway

**Key Directories:**
```
src/
├── layouts/       # Base.astro, page templates
├── pages/
│   ├── index.astro
│   ├── lab/
│   │   ├── index.astro       # Lab gallery index
│   │   ├── chord-diagrams.astro
│   │   ├── reaction-diffusion.astro
│   │   └── strange-attractors.astro
│   ├── lobster-incubator/
│   │   ├── index.astro
│   │   └── blog.astro
│   └── ...other pages
├── components/    # Reusable UI components
└── styles/        # CSS files

public/
├── images/        # Static images
└── ...other assets
```

**Existing Museum Pages:**
- `/lobster-art-museum` — Main museum page
- `/lab` — Math visualization experiments (chord diagrams, reaction-diffusion, strange attractors)

---

## 2. Proposed Architecture

### 2.1 High-Level Flow

1. User visits Lobster Museum website
2. User clicks "Support the Museum" button
3. User selects a donation tier (e.g., $5, $10, $25)
4. User is redirected to PlanExe Stripe Checkout (same Stripe as PlanExe)
5. After payment, user is redirected back to museum with success message
6. **Key difference:** Instead of credits appearing in a PlanExe account, we create a simple "Donor" record that tracks:
   - Email (from Stripe checkout)
   - Amount donated
   - Date
   - Donor tier (if applicable)

### 2.2 Why This Approach Works

- **No new Stripe account** — Use Simon's existing PlanExe Stripe configuration
- **Simpler than full integration** — The museum site remains static; payment happens on PlanExe's infrastructure
- **Credits as incentive** — Donors receive PlanExe credits, making the donation more valuable
- **Cross-promotion** — Museum visitors discover PlanExe; PlanExe users learn about the museum

### 2.3 Alternative Approaches Considered

| Approach | Pros | Cons |
|----------|------|------|
| **This plan (reuse PlanExe Stripe)** | No new account, cross-promotion, credits for donors | Dependency on PlanExe infrastructure |
| Standalone Stripe for Voynich | Full control | Need new Stripe account, more complex |
| Payment links only | Simplest | No tracking, no webhook processing |
| Full user auth + payments | Complete solution | Overkill for initial donation system |

---

## 3. Implementation Details

### 3.1 Phase 1: Basic Donation Button (Priority: HIGH)

**Goal:** Add a "Support the Museum" button that redirects to PlanExe Stripe checkout.

**Changes Required:**

1. **Create donation tier config** (new file: `src/data/donation-tiers.json`):
```json
[
  { "id": "supporter", "name": "Lobster Supporter", "amount": 500, "credits": 50, "description": "Help us keep the lights on!" },
  { "id": "patron", "name": "Lobster Patron", "amount": 1000, "credits": 150, "description": "Get early access to special exhibits" },
  { "id": "benefactor", "name": "Lobster Benefactor", "amount": 2500, "credits": 500, "description": "Your name on the donor wall" }
]
```
- Amount is in **cents** ($5 = 500, $10 = 1000, $25 = 2500)
- Credits: How many PlanExe credits the donor receives

2. **Add donation component** (new file: `src/components/DonationButton.astro`):
   - Displays tier options
   - Handles click → POST to PlanExe checkout endpoint
   - **OR** simpler: Use Stripe Payment Links (no code needed, just config in Stripe Dashboard)

3. **Update museum page** (`src/pages/lobster-art-museum.astro` or similar):
   - Add DonationButton component
   - Add section explaining donation tiers and PlanExe credits

**Simpler Alternative for Phase 1:**
Use **Stripe Payment Links** — create preset payment links in Stripe Dashboard, embed them as buttons on the museum page. No backend code needed.

**Steps for Payment Links approach:**
1. Simon creates Payment Links in Stripe Dashboard for each tier
2. Each link includes metadata: `{ "tier": "supporter", "credits": 50 }`
3. Add buttons to museum page linking to Payment Links
4. Configure success/cancel redirect URLs back to museum

### 3.2 Phase 2: Webhook Processing (Priority: MEDIUM)

**Goal:** Process payment confirmations to:
- Send confirmation email to donor
- Add donor to database for tracking
- (Optional) Notify museum team of new donation

**Changes Required:**

1. **Add webhook endpoint to PlanExe** (or create new microservice):
   - File: `frontend_multi_user/src/app.py` (existing)
   - Add new route: `/webhooks/museum-donation`
   - Process `checkout.session.completed` events with metadata

2. **Add donor table** (if tracking locally):
   - New table: `MuseumDonor`
   - Fields: email, name, amount_cents, tier, stripe_payment_id, created_at

3. **Update success page**:
   - After redirect from Stripe, show personalized thank-you
   - Display "Check your email for your PlanExe credit code"

### 3.3 Phase 3: Donor Recognition (Priority: MEDIUM)

**Goal:** Recognize donors on the museum site.

**Changes Required:**

1. **Donor wall page** (`src/pages/donors.astro`):
   - List donors (with permission)
   - Filter by tier

2. **Email sequence**:
   - Thank you email (via Stripe or custom)
   - Credit redemption instructions

### 3.4 Phase 4: Future Enhancements (Priority: LOW)

- **Membership tiers** — Monthly recurring donations
- **Gift shop** — Physical/digital products
- **Special exhibits** — Pay-per-view exhibits with exclusive content
- **NFT badges** — Digital collectibles for donors

---

## 4. Technical Specifications

### 4.1 Integration Points

**PlanExe (backend):**
- Already has Stripe configured
- Endpoint: `POST /billing/stripe/checkout`
- Needs modification to accept "museum" as source and include metadata

**Voynich-Website (frontend):**
- New donation component
- New data file: `donation-tiers.json`
- Updated museum page

### 4.2 Environment Variables

If modifying PlanExe backend:

```env
# Existing (already configured)
PLANEXE_STRIPE_SECRET_KEY='sk_live_...'
PLANEXE_STRIPE_WEBHOOK_SECRET='whsec_...'

# New
PLANEXE_MUSEUM_DONATION_ENABLED=true
PLANEXE_MUSEUM_BASE_URL='https://voynichlabs.org'
```

### 4.3 Database Schema (Optional)

If tracking donors locally in PlanExe:

```sql
CREATE TABLE museum_donors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    amount_cents INTEGER NOT NULL,
    tier VARCHAR(50),
    stripe_payment_id VARCHAR(255),
    stripe_customer_id VARCHAR(255),
    planexe_credits_granted INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_museum_donors_email ON museum_donors(email);
CREATE INDEX idx_museum_donors_created_at ON museum_donors(created_at DESC);
```

### 4.4 File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/data/donation-tiers.json` | Create | Donation tier configuration |
| `src/components/DonationButton.astro` | Create | Donation UI component |
| `src/pages/lobster-art-museum.astro` | Modify | Add donation section |
| `src/pages/donors.astro` | Create | Donor recognition page |
| `frontend_multi_user/src/app.py` | Modify | Add museum webhook handler (PlanExe) |
| `docs/stripe.md` | Modify | Document museum integration |

---

## 5. Testing Plan

### 5.1 Stripe Test Mode

All testing uses Stripe test mode:
- Test card: `4242 4242 4242 4242`
- See `PlanExe/docs/stripe.md` for more test card numbers

### 5.2 Test Scenarios

| Scenario | Steps | Expected Result |
|----------|-------|-----------------|
| $5 donation | Click $5 button, complete checkout | Redirect to museum with success, donor receives 50 credits |
| $10 donation | Click $10 button, complete checkout | Redirect to museum with success, donor receives 150 credits |
| Payment decline | Use card `4000 0000 0000 0002` | Show error, no credits granted |
| Webhook failure | Disconnect during payment | Payment recorded but credits not applied (edge case) |

---

## 6. Deployment

### 6.1 Pre-requisites

1. Simon confirms PlanExe Stripe can accept museum donations
2. Stripe Payment Links created (if using simple approach) OR
3. PlanExe webhook updated to handle museum metadata

### 6.2 Rollout Steps

1. **Staging:** Deploy to `voynich-website-staging.up.railway.app`
2. **Test:** Run through all test scenarios with test Stripe keys
3. **Production:** Switch to live Stripe keys, deploy to production
4. **Monitor:** Check Stripe dashboard for successful payments

---

## 7. Open Questions

1. **Credit distribution:** How do donors receive their PlanExe credits?
   - Option A: Email them a promo code
   - Option B: Collect PlanExe email at checkout, auto-apply
   - Option C: Simple "thank you" with link to redeem on PlanExe

2. **Donor consent:** Should donors be listed on a public "Donor Wall"?
   - Need opt-in at checkout

3. **Receipts:** Who sends the receipt?
   - Stripe sends default receipt
   - Or custom receipt from museum email

4. **Tax deductibility:** Is this donation tax-deductible?
   - Need to clarify legal setup (501(c)(3) vs. not)

---

## 8. Next Steps

1. **Simon confirms** reuse of PlanExe Stripe account
2. **Decide approach:** Payment Links (simple) vs. custom webhook (flexible)
3. **Create Stripe Payment Links** or modify PlanExe webhook
4. **Implement frontend** donation component
5. **Deploy to staging** and test
6. **Deploy to production**

---

## Appendix: Related Documentation

- PlanExe Stripe docs: `PlanExe/docs/stripe.md`
- PlanExe billing schema: `PlanExe/docs/user_accounts_and_billing.md`
- Voynich-Website structure: `voynich-website/src/`
- Current museum page: `voynich-website/src/pages/lobster-art-museum.astro`
