# Lobster Museum Funding System - Implementation Plan

**Author:** Larry the Laptop Lobster  
**Date:** 26 February 2026  
**Purpose:** Comprehensive implementation guide for another developer to build the Lobster Museum donation, membership, and gift shop system.

---

## Overview

This document provides a detailed implementation plan for adding funding capabilities to the Voynich Labs Lobster Museum. The system should allow visitors to:
1. Make one-time donations to support the museum
2. Purchase membership tiers with benefits
3. Buy items from a digital gift shop

**Target Repository:** `VoynichLabs/voynich-website`  
**Location:** `/mnt/d/1Projects/voynich-website/`

---

## Architecture Decision

### Key Constraint
The voynich-website is a **static Astro site** (Astro 5 + Tailwind 3). It has no backend server.

### Recommended Approach: Stripe Payment Links

For a static site, **Stripe Payment Links** are the simplest solution:

- Create payment links in Stripe Dashboard for each donation tier/product
- Add buttons on the website that redirect to Stripe's hosted checkout
- No backend required - Stripe handles the entire checkout flow
- Can customize success/cancel redirect URLs back to the museum site

**Alternative (if custom tracking needed):**
Add a small backend service (Flask/Node) to handle webhook callbacks and store donor data. See PlanExe implementation below for reference.

---

## Phase 1: Simple Donations (Start Here)

### Step 1.1: Create Stripe Products

In [Stripe Dashboard](https://dashboard.stripe.com/test/products):

Create products for donation tiers:

| Product Name | Price | Description |
|--------------|-------|-------------|
| Lobster Lover | $5 | Support the museum with a small donation |
| Crab Champion | $25 | Help us keep the lights on |
| Octopus Patron | $100 | Major supporter - name on donor wall |
| Custom Amount | Variable | Let donors choose their own amount |

For each product:
1. Go to Products → Create Product
2. Set name, description, and price
3. Copy the **Payment Link URL** for each

### Step 1.2: Add Donation Page

**File:** `src/pages/donate.astro` (new file)

Reference existing page structure:
- `src/pages/index.astro` (lines 1-50 for imports/layout)
- `src/layouts/Base.astro` (for the base template)

```astro
---
// Author: [Developer]
// Date: 26 February 2026
// PURPOSE: Donation page for Lobster Museum funding
// SRP/DRY check: Pass - new page for donations
import Base from '../layouts/Base.astro';
---

<Base title="Support the Lobster Museum">
  <div class="max-w-4xl mx-auto py-12">
    <h1 class="text-4xl font-bold mb-4">Support the Lobster Museum</h1>
    <p class="mb-8">Your donation helps us care for our lobsters and create new exhibits.</p>
    
    <!-- Donation tier cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Each card links to Stripe Payment Link -->
    </div>
  </div>
</Base>
```

### Step 1.3: Add Navigation Link

**File:** `src/layouts/Base.astro` (around line 50-70)

Find the navigation section and add a Donate link.

### Step 1.4: Environment Variables (if using API)

**File:** `.env` (create if not exists)

```bash
# Stripe (for future API-based implementation)
VOYNICH_STRIPE_SECRET_KEY='sk_test_...'
VOYNICH_STRIPE_PUBLISHABLE_KEY='pk_test_...'
```

---

## Phase 2: Membership Tiers

### Step 2.1: Define Membership Tiers

| Tier | Monthly | Annual | Benefits |
|------|---------|--------|----------|
| Shell Member | $5/mo | $50/yr | Name on donor wall, monthly newsletter |
| Claw Member | $20/mo | $200/yr | + Early access to new exhibits, 10% gift shop discount |
| Royal Lobster | $100/mo | $1000/yr | + VIP tour (when available), free merchandise |

### Step 2.2: Create Stripe Products (Recurring)

In Stripe Dashboard, create products with **Recurring** pricing:
- Use "Subscribe" mode in Payment Links
- Or use Stripe Checkout with `mode: 'subscription'`

### Step 2.3: Membership Page

**File:** `src/pages/membership.astro` (new file)

Similar structure to donate.astro, but with recurring pricing and benefits comparison.

---

## Phase 3: Gift Shop

### Step 3.1: Product Data

**File:** `src/content/gift-shop/` (new content collection)

Create product definitions:

```typescript
// src/content/config.ts - add giftShop collection
import { defineCollection, z } from 'astro:content';

const giftShop = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    price: z.number(),
    stripePriceId: z.string(), // Stripe Price ID for checkout
    image: z.string(), // path to product image
    inStock: z.boolean(),
  }),
});
```

### Step 3.2: Gift Shop Page

**File:** `src/pages/gift-shop.astro` (new file)

Product grid that links to Stripe Payment Links.

### Step 3.3: Inventory Management

For simple inventory tracking:
- Store product data in Stripe (use Stripe API to check inventory)
- Or use a simple JSON file `src/data/gift-shop-products.json`

---

## Reference: PlanExe Stripe Implementation

For a more custom implementation (with backend), see the PlanExe implementation:

### Key Files

| File | Purpose |
|------|---------|
| `frontend_multi_user/src/app.py` (lines 2340-2500) | Stripe checkout and webhook endpoints |
| `database_api/model_payment_record.py` | Payment record database model |
| `database_api/model_credit_history.py` | Credit history ledger model |
| `docs/stripe.md` | Stripe integration documentation |
| `docs/user_accounts_and_billing.md` | Billing database schema |

### Stripe Checkout Endpoint

**Location:** `/mnt/d/1Projects/PlanExe2026/frontend_multi_user/src/app.py`, lines 2340-2420

```python
@app.route('/billing/stripe/checkout', methods=['POST'])
@login_required
def stripe_checkout():
    # 1. Get credits amount from form
    credits = int(request.form.get("credits", "1"))
    
    # 2. Calculate price
    price_per_credit = int(os.environ.get("PLANEXE_CREDIT_PRICE_CENTS", "100"))
    amount = credits * price_per_credit
    
    # 3. Create Stripe Checkout Session
    session_obj = stripe.checkout.Session.create(
        mode="payment",
        success_url=...,
        cancel_url=...,
        line_items=[{
            "price_data": {
                "currency": "usd",
                "product_data": {"name": "PlanExe credits"},
                "unit_amount": amount,
            },
            "quantity": 1,
        }],
        metadata={
            "user_id": str(current_user.id),
            "credits": str(credits),
        },
    )
    
    # 4. Redirect to Stripe
    return redirect(session_obj.url)
```

### Stripe Webhook Handler

**Location:** `/mnt/d/1Projects/PlanExe2026/frontend_multi_user/src/app.py`, lines 2420+

```python
@app.route('/billing/stripe/webhook', methods=['POST'])
def stripe_webhook():
    # 1. Verify signature
    event = stripe.Webhook.construct_event(
        payload, sig_header, webhook_secret
    )
    
    # 2. Handle checkout.session.completed
    if event_type == "checkout.session.completed":
        session_obj = event["data"]["object"]
        user_id = session_obj["metadata"]["user_id"]
        credits = session_obj["metadata"]["credits"]
        
        # 3. Apply credits to user account
        # 4. Create PaymentRecord
        # 5. Create CreditHistory entry
    
    return "ok"
```

### Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `PLANEXE_STRIPE_SECRET_KEY` | Stripe secret API key | `sk_test_...` |
| `PLANEXE_STRIPE_WEBHOOK_SECRET` | Webhook signing secret | `whsec_...` |
| `PLANEXE_STRIPE_CURRENCY` | Currency code | `usd` |
| `PLANEXE_CREDIT_PRICE_CENTS` | Price per credit in cents | `100` |

### Database Schema (for reference)

**PaymentRecord** (`database_api/model_payment_record.py`):
```python
class PaymentRecord(db.Model):
    id = db.Column(UUIDType, default=uuid.uuid4, primary_key=True)
    user_id = db.Column(UUIDType, nullable=False, index=True)
    provider = db.Column(db.String(32), nullable=False)  # 'stripe'
    provider_payment_id = db.Column(db.String(256), nullable=False)
    credits = db.Column(Numeric(18, 9), nullable=False)
    amount = db.Column(db.Integer, nullable=False)  # minor units
    currency = db.Column(db.String(16), nullable=False)
    status = db.Column(db.String(32), nullable=False)
    raw_payload = db.Column(JSON, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.now)
```

**CreditHistory** (`database_api/model_credit_history.py`):
```python
class CreditHistory(db.Model):
    id = db.Column(UUIDType, default=uuid.uuid4, primary_key=True)
    user_id = db.Column(UUIDType, nullable=False, index=True)
    delta = db.Column(Numeric(18, 9), nullable=False)  # + or -
    reason = db.Column(db.String(128), nullable=False)
    source = db.Column(db.String(32), nullable=False)  # 'stripe', 'telegram'
    external_id = db.Column(db.String(256), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.now)
```

---

## Voynich-Website File Structure Reference

### Existing Pages

| File | Route | Purpose |
|------|-------|---------|
| `src/pages/index.astro` | `/` | Homepage |
| `src/pages/lobster-art-museum.astro` | `/lobster-art-museum` | Art gallery |
| `src/pages/about.astro` | `/about` | About page |
| `src/pages/projects.astro` | `/projects` | Projects listing |
| `src/layouts/Base.astro` | - | Main layout template |

### Static Assets

| Directory | Purpose |
|-----------|---------|
| `public/generated/` | AI-generated artwork |
| `public/` | Static files (favicon, etc.) |

### Content Collections

| Collection | Location | Purpose |
|------------|----------|---------|
| `lobster-blog` | `src/content/lobster-blog/` | Blog posts |

---

## Development Workflow

1. **Plan first:** Create a plan document before substantive work
2. **Test locally:** Use `npm run dev` to run local server at `localhost:4321`
3. **Build verification:** Run `npm run build` before committing
4. **No mocks:** Don't leave placeholder data in shipped pages
5. **Changelog:** Update `CHANGELOG.md` with any changes

---

## Next Steps

1. Create Stripe account (if not exists) at https://stripe.com
2. Create donation products in Stripe Dashboard
3. Create `src/pages/donate.astro` 
4. Add donate link to navigation in `Base.astro`
5. Test the flow locally
6. Deploy to production

---

## Questions for Future Development

- Should donor names be displayed publicly? (affects privacy considerations)
- Do we need email receipts? (Stripe can handle this)
- Should we track donors in a database? (requires backend)
- What's the gift shop inventory system? (simple JSON vs. database)

---

**End of Implementation Plan**