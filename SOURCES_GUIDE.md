# Greek News Sources Curation Guide

## Curation Methodology

This list is curated based on a multi-signal approach to ensure high reliability and minimize the impact of the highly polarized Greek media landscape.

### Primary Signals
1.  **Fact-Checking Accreditation:** Inclusion of outlets accredited by the **International Fact-Checking Network (IFCN)** (e.g., Ellinika Hoaxes, FactChecker.gr).
2.  **External Reliability Ratings:** Verification against **Media Bias/Fact Check (MBFC)** and **NewsGuard** (where available). Sources with "Mixed" or "Questionable" ratings are moved to the blacklist.
3.  **Investigative Integrity:** Prioritization of non-profit investigative networks like **Solomon** and **Reporters United**, which have transparent funding models and strong track records of independent reporting.
4.  **Institutional Reputation:** Inclusion of "newspapers of record" like **Kathimerini** and specialized outlets like **Naftemporiki**, cross-checked against the **Reuters Institute Digital News Report** trust scores.
5.  **International Cross-Checking:** Inclusion of Greek-language versions of international outlets (**DW**, **Euronews**) to provide a buffer against domestic political bias.

### Trust Thresholds
-   **High Trust (0.9+):** Fact-checkers and transparent investigative outlets.
-   **Medium Trust (0.7 - 0.89):** Established mainstream media with clear editorial standards but known political leanings.
-   **Low Trust (<0.7):** Sources with frequent sensationalism or those prone to government/corporate pressure (monitored but demoted).

## How to Use the JSON

The `sources_curated.json` file is designed for programmatic consumption by a news aggregator.

-   **Priority:** Use the `reliability_score` to weight content.
-   **Filtering:** Use `primary_topics` to route content to specific UI sections.
-   **Integration:** `integration_method` suggests whether to use RSS or if a paid/API subscription is needed.

## Revalidation and Reliability Drift

To ensure the list remains current and accurate, the following automated and manual steps are recommended:

### Automated Revalidation (Monthly)
1.  **Fact-Check Scraper:** Periodically check if sources in the curated list have failed new fact-checks via the IFCN database or Ellinika Hoaxes.
2.  **Domain Health:** Check for domain expiration or redirects to suspicious URLs.
3.  **Social Sentiment Monitoring:** (Optional) Monitor for sudden spikes in "propaganda" or "fake news" mentions in relation to the domain (use with caution).

### Human-Review Cadence (Quarterly)
-   **Review Blacklist:** Check if blacklisted sources have improved transparency or editorial standards.
-   **Funding Audit:** Re-verify the funding sources of investigative outlets to ensure continued independence.
-   **Trust Score Adjustment:** Update scores based on the latest annual **Reuters Institute Digital News Report** and **RSF World Press Freedom Index**.

## Rules for Demoting/Hiding
1.  **Demote:** If a source fails a major fact-check, reduce `reliability_score` by 0.2.
2.  **Hide:** If a source fails 3 major fact-checks within a 6-month period, or if it is acquired by a known propaganda-pushing entity, move to `sources_blacklist.json`.

---
*Sources used for this research: MBFC, Reuters Institute, RSF, IFCN, imedd.org.*
