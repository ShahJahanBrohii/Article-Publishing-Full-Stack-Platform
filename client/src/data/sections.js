/** Section hubs + topic slugs (aligned with Navbar mega menus) */

export const SECTION_IDS = ['investing', 'personal-finance', 'financial-education', 'guides'];

export const SECTIONS = {
  investing: {
    title: 'Investing',
    kicker: 'Markets & portfolios',
    description:
      'Analysis and explainers on stocks, bonds, funds, and building wealth with discipline — the same editorial lens as our lead coverage.',
    topics: [
      { slug: 'investing-basics', title: 'Investing Basics', blurb: 'Core concepts every investor should own before buying a single share.', relatedArticleId: 1 },
      { slug: 'stocks-bonds', title: 'Stocks & Bonds', blurb: 'How equities and fixed income fit together in a balanced portfolio.', relatedArticleId: 2 },
      { slug: 'etfs', title: 'ETFs', blurb: 'Index funds, sector ETFs, and what to watch in fees and tracking error.', relatedArticleId: 3 },
      { slug: 'mutual-funds', title: 'Mutual Funds', blurb: 'Active vs passive funds, loads, and how to read a prospectus.', relatedArticleId: 1 },
      { slug: 'real-estate', title: 'Real Estate', blurb: 'REITs, direct property, and interest-rate sensitivity.', relatedArticleId: 2 },
      { slug: 'portfolio-management', title: 'Portfolio Management', blurb: 'Rebalancing, risk budgets, and staying invested through cycles.', relatedArticleId: 3 },
      { slug: 'investing-strategies', title: 'Investing Strategies', blurb: 'Value, growth, income, and rules-based approaches.', relatedArticleId: 1 },
    ],
  },
  'personal-finance': {
    title: 'Personal Finance',
    kicker: 'Your money life',
    description:
      'Budgeting, debt, emergency funds, retirement, taxes, and insurance — practical guidance for readers building financial security.',
    topics: [
      { slug: 'budgeting-and-saving', title: 'Budgeting and Saving', blurb: 'Cash flow, sinking funds, and the habit of paying yourself first.', relatedArticleId: 2 },
      { slug: 'debt-and-credit', title: 'Debt and Credit', blurb: 'Good debt vs bad debt, credit scores, and payoff strategies.', relatedArticleId: 3 },
      { slug: 'emergency-funds', title: 'Emergency Funds', blurb: 'How much to hold, where to park it, and when to tap it.', relatedArticleId: 1 },
      { slug: 'retirement', title: 'Retirement', blurb: '401(k)s, IRAs, and the math of compounding over decades.', relatedArticleId: 2 },
      { slug: 'taxes', title: 'Taxes', blurb: 'Withholding, deductions, and long-term tax-aware investing.', relatedArticleId: 3 },
      { slug: 'insurance', title: 'Insurance', blurb: 'Life, health, and property coverage without overpaying.', relatedArticleId: 1 },
    ],
  },
  'financial-education': {
    title: 'Financial Education',
    kicker: 'Foundations',
    description:
      'Foundational ideas in finance and economics — how markets, institutions, and incentives shape the world you invest in.',
    topics: [
      { slug: 'foundations', title: 'Foundations', blurb: 'Time value of money, risk vs return, and diversification.', relatedArticleId: 1 },
      { slug: 'financial-education', title: 'Financial Education', blurb: 'Why financial literacy compounds like capital.', relatedArticleId: 2 },
      { slug: 'corporate-finance', title: 'Corporate Finance', blurb: 'Capital structure, dividends, and what balance sheets reveal.', relatedArticleId: 3 },
      { slug: 'investment-principles', title: 'Investment Principles', blurb: 'Margin of safety, patience, and avoiding permanent loss.', relatedArticleId: 1 },
      { slug: 'financial-markets', title: 'Financial Markets', blurb: 'How prices form, liquidity, and the role of intermediaries.', relatedArticleId: 2 },
      { slug: 'financial-institutions', title: 'Financial Institutions', blurb: 'Banks, brokers, and systemic risk in plain language.', relatedArticleId: 3 },
      { slug: 'economic-foundations', title: 'Economic Foundations', blurb: 'Growth, inflation, and policy — the backdrop for portfolios.', relatedArticleId: 1 },
    ],
  },
  guides: {
    title: 'Guides',
    kicker: 'Step-by-step',
    description:
      'Long-form guides for getting started, building wealth, and making calmer decisions when markets move against you.',
    topics: [
      { slug: 'getting-started', title: 'Getting Started', blurb: 'Your first brokerage account, first index fund, first plan.', relatedArticleId: 1 },
      { slug: 'wealth-building', title: 'Wealth Building', blurb: 'Earn, save, invest — in that order, for decades.', relatedArticleId: 2 },
      { slug: 'financial-planning', title: 'Financial Planning', blurb: 'Goals, timelines, and aligning investments with life stages.', relatedArticleId: 3 },
      { slug: 'portfolio-building', title: 'Portfolio Building', blurb: 'Asset allocation templates and how to iterate.', relatedArticleId: 1 },
      { slug: 'risk-management', title: 'Risk Management', blurb: 'Sizing positions, hedging basics, and emotional guardrails.', relatedArticleId: 2 },
      { slug: 'investment-decision-making', title: 'Investment Decision-Making', blurb: 'Journals, checklists, and avoiding narrative-driven trades.', relatedArticleId: 3 },
    ],
  },
};

export function getSection(sectionId) {
  return SECTIONS[sectionId] || null;
}

export function getTopic(sectionId, topicSlug) {
  const sec = getSection(sectionId);
  if (!sec) return null;
  return sec.topics.find((t) => t.slug === topicSlug) || null;
}
