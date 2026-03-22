// L1 Estimate Engine — Trixie OS Layer 4
// Returns indicative price range (±25%) based on product interest + budget
// Powers the public enquiry form response

export interface L1Estimate {
  productMatch: string;
  productTier: string;
  priceRangeMin: number;
  priceRangeMax: number;
  priceDisplay: string;
  confidence: "high" | "medium" | "low";
  description: string;
  disclaimer: string;
}

const DISCLAIMER =
  "This is an L1 indicative estimate only (±25%). It is based on standard FORMA configurations and does not account for site-specific costs, approvals, or bespoke requirements. A detailed L2 feasibility estimate will be prepared after your consultation.";

// Budget band → numeric midpoint for comparison
const BUDGET_MIDPOINTS: Record<string, number> = {
  under_160k: 146000,
  "160k_200k": 180000,
  "200k_280k": 240000,
  "280k_350k": 315000,
  "350k_450k": 400000,
  "450k_600k": 525000,
  "600k_800k": 700000,
  "800k_1m": 900000,
  over_1m: 1200000,
};

function getBudgetMidpoint(budget: string | null | undefined): number | null {
  if (!budget) return null;
  return BUDGET_MIDPOINTS[budget] ?? null;
}

type Tier = "micro" | "duo" | "life";

function getTierFromInterest(interest: string | null | undefined): Tier | null {
  if (!interest) return null;
  const i = interest.toLowerCase();
  if (["studio", "office", "wellness", "pool_house", "micro"].some((k) => i.includes(k))) return "micro";
  if (["granny_flat", "secondary_dwelling", "secondary", "investment", "airbnb", "ndis", "duo"].some((k) => i.includes(k))) return "duo";
  if (["primary_dwelling", "primary", "duplex", "family_home", "life"].some((k) => i.includes(k))) return "life";
  return null;
}

function getTierFromBudget(midpoint: number | null): Tier | null {
  if (midpoint === null) return null;
  if (midpoint < 150000) return "micro";
  if (midpoint <= 350000) return "duo";
  return "life";
}

function getMicroEstimate(): L1Estimate {
  return {
    productMatch: "Micro Forma (Studio / Wellness Pod)",
    productTier: "Micro Forma",
    priceRangeMin: 41000,
    priceRangeMax: 146000,
    priceDisplay: "$41k – $146k",
    confidence: "medium",
    description:
      "A compact FORMA studio or wellness pod — perfect for a home office, retreat, or secondary space. CDC-exempt options available.",
    disclaimer: DISCLAIMER,
  };
}

function getDuoEstimate(budget: string | null | undefined): L1Estimate {
  // Narrow within Duo Forma based on budget band
  if (budget === "under_160k") {
    return {
      productMatch: "Madison 30",
      productTier: "Duo Forma",
      priceRangeMin: 120000,
      priceRangeMax: 146000,
      priceDisplay: "$120k – $146k",
      confidence: "high",
      description:
        "The Madison 30 is our most accessible Duo Forma — a smart, compact secondary dwelling ideal for first-time investors or tight sites.",
      disclaimer: DISCLAIMER,
    };
  }
  if (budget === "160k_200k") {
    return {
      productMatch: "Djua 1-Bed or Yarra Hut 1-Bed",
      productTier: "Duo Forma",
      priceRangeMin: 167000,
      priceRangeMax: 193000,
      priceDisplay: "$167k – $193k",
      confidence: "high",
      description:
        "A 1-bedroom Duo Forma granny flat — the Djua or Yarra Hut. All-inclusive, CDC pathway, factory-built and site-installed in days.",
      disclaimer: DISCLAIMER,
    };
  }
  if (budget === "200k_280k") {
    return {
      productMatch: "Raglan 2-Bed or Karri 2-Bed",
      productTier: "Duo Forma",
      priceRangeMin: 172000,
      priceRangeMax: 220000,
      priceDisplay: "$172k – $220k",
      confidence: "high",
      description:
        "A 2-bedroom Duo Forma — the Raglan or Karri. Ideal for families, NDIS, or dual-income Airbnb investment.",
      disclaimer: DISCLAIMER,
    };
  }
  if (budget === "280k_350k") {
    return {
      productMatch: "Arramont 3-Bed",
      productTier: "Duo Forma",
      priceRangeMin: 193000,
      priceRangeMax: 280000,
      priceDisplay: "$193k – $280k",
      confidence: "high",
      description:
        "The Arramont 3-bedroom — our largest Duo Forma product. Maximum return for investors or multi-generational living.",
      disclaimer: DISCLAIMER,
    };
  }
  // Default Duo
  return {
    productMatch: "Duo Forma (1–3 Bed Granny Flat)",
    productTier: "Duo Forma",
    priceRangeMin: 133000,
    priceRangeMax: 250000,
    priceDisplay: "$133k – $250k",
    confidence: "medium",
    description:
      "A Duo Forma secondary dwelling — factory-built, CDC-approvable, and installed in days. We'll match the right product to your site and budget.",
    disclaimer: DISCLAIMER,
  };
}

function getLifeEstimate(budget: string | null | undefined): L1Estimate {
  const mid = getBudgetMidpoint(budget);
  if (mid && mid >= 600000) {
    return {
      productMatch: "Life Forma — Custom Multi-Module",
      productTier: "Life Forma",
      priceRangeMin: 450000,
      priceRangeMax: 900000,
      priceDisplay: "$450k – $900k",
      confidence: "medium",
      description:
        "A premium Life Forma primary home — multi-module, fully engineered, DA or CDC pathway. We'll design around your site and brief.",
      disclaimer: DISCLAIMER,
    };
  }
  return {
    productMatch: "Acacia 4-Bed (Life Forma)",
    productTier: "Life Forma",
    priceRangeMin: 380000,
    priceRangeMax: 520000,
    priceDisplay: "$380k – $520k",
    confidence: "medium",
    description:
      "The Acacia is our flagship Life Forma — a 4-bedroom, 142m² primary home. Factory-built to the same quality as traditional construction, delivered faster.",
    disclaimer: DISCLAIMER,
  };
}

export function generateL1Estimate(lead: {
  productInterest?: string | null;
  expectedBudget?: string | null;
  dwellingSize?: string | null;
}): L1Estimate {
  const budgetMid = getBudgetMidpoint(lead.expectedBudget);
  const tierFromInterest = getTierFromInterest(lead.productInterest);
  const tierFromBudget = getTierFromBudget(budgetMid);

  // Budget takes precedence if they conflict
  let tier: Tier;
  if (tierFromBudget && tierFromInterest && tierFromBudget !== tierFromInterest) {
    tier = tierFromBudget; // budget wins
  } else {
    tier = tierFromBudget ?? tierFromInterest ?? "duo"; // default to Duo (primary sales focus)
  }

  switch (tier) {
    case "micro":
      return getMicroEstimate();
    case "life":
      return getLifeEstimate(lead.expectedBudget);
    case "duo":
    default:
      return getDuoEstimate(lead.expectedBudget);
  }
}
