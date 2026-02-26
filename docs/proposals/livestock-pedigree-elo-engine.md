# Blue-Ribbon Pedigree & Genetics Elo Engine

**Author:** Larry the Laptop Lobster  
**Date:** 26 February 2026  
**Purpose:** Implementation plan for a premium livestock ranking and genetics service

---

## Executive Summary

**The Idea:** Build an Elo-based ranking system for livestock (cattle, goats, sheep, dogs, horses) that scores animals based on performance data — milk yields, birth weights, show-ring wins, temperament, and genetic markers. Target customers are breeders, auction houses, and registries who currently rely on gut feelings and spreadsheets.

**The Hook:** "Lobster-Validated" performance scores — an objective, third-party ranking that helps breeders make data-driven decisions before the auction block.

**Business Model:** Subscription service (breeders pay for access to rankings and analytics) + premium certifications for top-ranked animals.

---

## Core Metrics (Livestock EPDs)

Drawing from cattle breeding's Expected Progeny Differences (EPDs), but adapted for multiple species:

| Metric | Description | Data Sources |
|--------|-------------|--------------|
| **Performance Score (PS)** | Overall ranking based on verified metrics | Shows, yields, weights |
| **Genetic Viability (GV)** | Health and fertility indicators | Vet records, breeding history |
| **Temperament Rating (TR)** | Handling ease, docility | Handler assessments |
| **Conformation Grade (CG)** | Physical structure quality | Judge scores, photos |
| **Progeny Performance (PP)** | How offspring perform | Offspring tracking |
| **Market Value Index (MVI)** | Auction price history | Sales data |

---

## Target Markets

### Primary (Start Here)
- **Texas Cattle Feeders** — Commercial cow-calf operators
- **Show Cattle Breeders** — Texas, Oklahoma, Kansas
- **American Goat Federation** — Registered Boer, Nubian, Alpine breeders

### Secondary
- **Show Dog Handlers** — AKC breeders and handlers
- **Horse Racing/Show Horses** — Quarter Horse, Thoroughbred registries
- **Sheep & Lamb Producers** — 4-H, FFA markets

### Tertiary
- **Exotic Livestock** — Alpaca, llama, bison breeders

---

## Product Tiers

### Tier 1: Basic Rankings (Free)
- Public leaderboard access
- Top 100 animals per species/breed

### Tier 2: Herd Manager ($9.99/month)
- Full ranking access
- Track up to 50 animals
- Basic analytics dashboard

### Tier 3: Registry Pro ($49.99/month)
- Unlimited animals
- Advanced analytics
- API access
- Custom branding options

### Tier 4: Certification ($199/animal)
- "Lobster-Validated" certification badge
- Verified pedigree verification
- Export to official registries

---

## Technical Architecture

### Database Schema (New Tables)

```sql
-- Animals table
CREATE TABLE animals (
    id UUID PRIMARY KEY,
    owner_id UUID REFERENCES users(id),
    species VARCHAR(50), -- 'cattle', 'goat', 'sheep', 'dog', 'horse'
    breed VARCHAR(100),
    name VARCHAR(255),
    registration_number VARCHAR(100),
    birth_date DATE,
    gender VARCHAR(10),
    sire_id UUID REFERENCES animals(id),
    dam_id UUID REFERENCES animals(id),
    elo_score DECIMAL(10,2) DEFAULT 1200,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Performance records
CREATE TABLE performance_records (
    id UUID PRIMARY KEY,
    animal_id UUID REFERENCES animals(id),
    event_type VARCHAR(50), -- 'show', 'milk_test', 'weight', 'health'
    event_date DATE,
    metric_name VARCHAR(100),
    metric_value DECIMAL(10,2),
    points_earned DECIMAL(10,2),
    verified BOOLEAN DEFAULT FALSE,
    source VARCHAR(255), -- 'judge_name', 'lab_name', etc.
    created_at TIMESTAMP DEFAULT NOW()
);

-- Rankings by category
CREATE TABLE rankings (
    id UUID PRIMARY KEY,
    species VARCHAR(50),
    breed VARCHAR(100),
    category VARCHAR(50), -- 'overall', 'bull', 'cow', 'doe', 'ram', etc.
    rank_position INTEGER,
    animal_id UUID REFERENCES animals(id),
    elo_score DECIMAL(10,2),
    computed_at TIMESTAMP DEFAULT NOW()
);
```

### Elo Implementation

Reference: Standard Elo with K-factor of 32

```python
# Pseudocode
def update_elo(winner_id, loser_id, k=32):
    winner = get_animal(winner_id)
    loser = get_animal(loser_id)
    
    expected_winner = 1 / (1 + 10 ** ((loser.elo - winner.elo) / 400))
    expected_loser = 1 - expected_winner
    
    winner.elo += k * (1 - expected_winner)
    loser.elo += k * (0 - expected_loser)
    
    save(winner)
    save(loser)
```

### API Endpoints (New)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/animals` | GET/POST | List or create animals |
| `/api/animals/:id` | GET/PUT | Get or update animal |
| `/api/performances` | POST | Submit performance record |
| `/api/rankings` | GET | Get current rankings |
| `/api/rankings/:species` | GET | Rankings by species |
| `/api/certify/:animal_id` | POST | Request certification |

### Reuse PlanExe Infrastructure

Since this is a new service but shares infrastructure with PlanExe:

- **Database:** Same PostgreSQL instance, new tables
- **User Accounts:** Reuse `UserAccount` table for breeder logins
- **Billing:** Reuse Stripe integration from PlanExe (or museum funding)
- **API:** New routes in `frontend_multi_user` or separate service
- **Frontend:** New Astro pages or separate React app

---

## Implementation Phases

### Phase 1: MVP (Weeks 1-4)
- [ ] Set up new database tables
- [ ] Basic animal CRUD API
- [ ] Manual performance record entry
- [ ] Elo calculation engine
- [ ] Simple leaderboard page

### Phase 2: Growth (Weeks 5-8)
- [ ] User registration and authentication
- [ ] Payment integration (Stripe)
- [ ] Tiered access control
- [ ] Analytics dashboard
- [ ] Import/Export functionality

### Phase 3: Scale (Weeks 9-12)
- [ ] API for third-party integrations
- [ ] Verification network (vets, judges)
- [ ] Certification program
- [ ] Mobile app (optional)

---

## Competition & Differentiation

### Existing Competitors
- **Cattle** — breedassociation databases, cattleIQ, Herdly
- **Goats** — American Goat Federation database
- **Dogs** — OFA, AKC, Embark

### Our Differentiation
1. **Cross-breed rankings** — Compare across breeds, not just within
2. **Elo scores** — Familiar gaming-style rankings, easy to understand
3. **Third-party verification** — Independent scoring, not self-reported
4. **Subscription model** — Not just one-time registration

---

## Questions to Answer

1. **Which species first?** Recommend cattle (Texas market is biggest)
2. **Verification network?** How do we verify performance data? (judges, vets, labs)
3. **Partnerships?** Work with existing registries or compete?
4. **Pricing?** Adjust based on competitor analysis
5. **Legal?** Animal data privacy, liability for rankings

---

## Next Steps

1. Market research: Interview 10 cattle breeders
2. Competitive analysis: Sign up for cattleIQ, Herdly, breed databases
3. Technical spike: Build Elo calculation and leaderboard
4. MVP scope: Define minimum features for Phase 1

---

**Related Ideas:**
- HUSP (Human Utility Scoreboard Pursuit) — Similar concept but for human workers/professionals
- Lobster Museum Funding — Uses same Stripe/billing infrastructure

---

**End of Proposal**