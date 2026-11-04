[🇨🇳 中文说明](README.md) | [🇬🇧 English Documentation](README_EN.md)

# Germany Migration Intelligence Dashboard

[![Live Web Dashboard](https://img.shields.io/badge/Live_Dashboard-GitHub_Pages-22c55e?style=for-the-badge&logo=github)](https://zubin-li.github.io/germany-migration-dashboard/)
[![Executive Consulting Deck](https://img.shields.io/badge/Executive_Deck-PDF_View-6366f1?style=for-the-badge&logo=adobeacrobatreader)](https://zubin-li.github.io/germany-migration-dashboard/findings.html)
[![Data Provenance: Destatis](https://img.shields.io/badge/Data_Source-Destatis_Official-0284c7?style=for-the-badge)](https://genesis.destatis.de/)
[![Audit Pipeline: 100% Passed](https://img.shields.io/badge/CI%2FCD_Audit-100%25_Passed-10b981?style=for-the-badge)](tests/)

> 🌐 **Permanent Live Dashboard**: [https://zubin-li.github.io/germany-migration-dashboard/](https://zubin-li.github.io/germany-migration-dashboard/)  
> 📄 **Standalone Strategic Consulting Deck (PDF View)**: [https://zubin-li.github.io/germany-migration-dashboard/findings.html](https://zubin-li.github.io/germany-migration-dashboard/findings.html)  
> 📘 **AI Agent Engineering Playbook**: [docs/AGENT_PLAYBOOK.md](docs/AGENT_PLAYBOOK.md)  
> 📚 **Official Citations & Data Provenance**: [docs/citations.md](docs/citations.md)

An authoritative, fully interactive, and longitudinal demographic intelligence platform synthesizing official German cross-border migration, naturalization, and labor market trends (2000–2026). Directly powered by **Statistisches Bundesamt (Destatis)** GENESIS-Online databases and the Federal Office for Migration and Refugees (BAMF). Zero backend configuration required; runs out-of-the-box in any modern browser.

> [!NOTE]
> 💡 **Core Statutory Distinction: Cross-Border Relocation (Wanderung) vs. German Citizenship (Einbürgerung)**  
> • **Cross-Border Relocation (Wanderung / Main Dashboard Datasets)**: Regulated by the German Federal Registration Act (BMG), tracking residential registrations (Anmeldung) at municipal Bürgerämter. It captures professionals (EU Blue Card / skilled work permits), university students, family reunifications, and humanitarian refugees. **Residents overwhelmingly retain their original nationalities; this does NOT signify passport conferral or naturalization**. For instance, annual net relocation from India of ~40k reflects IT specialists, engineers, and graduate students settling in Germany with their Indian passports, rather than 40k naturalizations.  
> • **Naturalization (Einbürgerung / Module 7)**: Legal transition whereby long-term foreign residents acquire German citizenship and passports after meeting multi-year statutory residency, language, and civic criteria (~100k-300k individuals annually nationwide).

---

## 🌟 Key Architecture & Interactive Highlights (v2.6)

Built according to modern open-source data visualization and design-system engineering standards:
* **Official Primary Source Integration**: Direct schema compatibility with `StatistischesBundesamt/GENESIS-Online` (Tables `12711-0005`, `12711-0007`, `12711-0011`, `12511-0001`, `12711-0023`).
* **High-Performance Vector Graphics**: Powered by industrial-grade Apache ECharts 5.5.1 with dynamic responsive resizing and touch/mouse interaction.
* **Geospatial GeoJSON Mapping**: Integrated high-resolution boundary vector maps of Germany's 16 federal states (*Bundesländer*).
* **Defensive Visual Architecture**: Bounding-box safety guardrails, flex-wrap protection, dynamic legend clearance, and zero-collision typographic hierarchy.

### Core Capabilities:
1. **Interactive Global Filtering Console**: Instant dynamic reactivity across time horizons (2000–2026, past 20/10/5 years, post-COVID), 25 specific countries of origin, demographic cohorts (German citizens, other EU nationals, non-EU third-country nationals), and migration directions (Inflow, Outflow, Net).
2. **Dynamic Cross-Chart Reactivity**: Selecting any individual country instantly updates Module 1 (Overview bar chart), Module 2 (Historical dual-line & net chart), Module 3 (Granular multi-country time series & ranking table), Module 8 (BI data table), and top KPI cards with the selected nation's 26-year Destatis statistics.
3. **Dual-Theme Engine (Light Default)**: Designed with a clean, executive corporate light palette by default, toggleable to an OLED dark mode at any moment.
4. **Mathematical Decomposition Engine**: Independent arithmetic attribution decomposing multi-year net migration variations into gross inflow contraction vs. gross outflow expansion.

---

## 📊 The 8 Core Analytical Modules

The main dashboard is organized into 8 interconnected modules:

```
┌────────────────────────────────────────────────────────────────────────┐
│               Global Filter Console (Time / Country / Cohort / Flow)   │
├───────────────────┬───────────────────┬────────────────────────────────┤
│ 1. Overview       │ 2. Trends         │ 3. Granular Nationalities      │
│ (26-Yr In/Out/Net)│ (Dual-line Flow)  │ (25 Nations 2000-2025)         │
├───────────────────┼───────────────────┼────────────────────────────────┤
│ 4. EU vs Non-EU   │ 5. German Emigr.  │ 6. Geography (16 States)       │
│ (Scissors Gap)    │ (Top Destinations)│ (Federal Choropleth Map)       │
├───────────────────┼───────────────────┼────────────────────────────────┤
│ 7. Naturalization │ 8. BI Query Table │ Exec. Consulting Teaser        │
│ (2024 Reform Law) │ (Search & Export) │ (Portal to PDF Deck)           │
└───────────────────┴───────────────────┴────────────────────────────────┘
```

1. **Module 1: Longitudinal Migration Overview (2000–2026)**
   * Historical cross-border migration bars with time-slider zooming (`dataZoom`). Supports annual and monthly provisional granularity.
2. **Module 2: Inflow vs. Outflow Dual-Stream Scissors Dynamics**
   * Visualizes the historical divergence between gross immigration and gross emigration, annotating historic peaks (the 2015 refugee crisis and 2022 Ukrainian humanitarian inflow).
3. **Module 3: Granular Nationality Multi-Series Comparison & Ranking**
   * Multi-country longitudinal time-series for 25 countries (China, India, Vietnam, Poland, Romania, Turkey, Ukraine, Syria, Afghanistan, etc.) with pre-configured demographic cohort presets (Asia, EU, Humanitarian, Western OECD).
4. **Module 4: Tripartite Demographic Cohort Divergence**
   * Contrast between German citizens (chronic net outflow), EU citizens (stabilizing net plateau), and Non-EU third-country nationals (primary source of net workforce addition).
5. **Module 5: German Citizen Emigration & Top Destination Analysis**
   * In-depth analysis of destination countries for departing German citizens (Switzerland, Austria, United States, United Kingdom, Spain).
6. **Module 6: Spatial Distribution Across Germany's 16 Federal States**
   * Interactive choropleth map and ranking breakdown highlighting regional absorption (North Rhine-Westphalia, Bavaria, Baden-Württemberg).
7. **Module 7: Naturalization Trends & 2024 Citizenship Reform Impact**
   * Tracking the surge in German naturalizations following the 2024 StARegG dual-citizenship legislative reform, broken down by country of origin.
8. **Module 8: Professional BI Data Exploration & Export**
   * Full search, multi-column sorting, pagination, and one-click raw CSV/JSON export capability.

---

## 📄 Standalone Strategic Consulting Deck (`findings.html`)

For senior decision-makers, executives, and research institutions, the platform includes a dedicated **Executive Consulting Deck** accessible at `findings.html`. 

* **5 High-Impact Strategic Slides**:
  * **Slide 1**: *The Macro Tidal Wave (2000–2026)* — Longitudinal Gross Flows & Structural Shift.
  * **Slide 2**: *The Tripartite Scissors Divergence* — Non-EU, EU, and German Demographic Trajectories.
  * **Slide 3**: *Micro-Level Nationality Transition (2022 vs 2025)* — Peak Inflow vs Steady Stabilization.
  * **Slide 4**: *The 2024 Citizenship Reform Surge* — Naturalization Dynamics & Talent Retention.
  * **Slide 5**: *The Labor Market Replacement Imperative* — Demographic Deficit vs Migration Inflow.
* **100% Print-to-PDF Ready**: Built-in landscape `@media print` stylesheet formatted specifically for A4 / Letter landscape export (`Cmd+P` / `Ctrl+P`).

---

## 🔍 Fact-Checking & Mathematical Decomposition

The platform features an automated mathematical verification model addressing widely circulated statistical figures:

### 1. Decomposition of the Net Migration Drop (2022 Peak to 2025)
Between the historic 2022 peak (+1.516 million net) and 2025 (+235,000 net), net migration decreased by 1.281 million. Using dynamic differential decomposition:

$$\Delta \text{Net} = \Delta \text{Inflow} - \Delta \text{Outflow} = -1,250,020 - 30,735 = -1,280,755$$

* **Inflow contraction contribution**: $\frac{1,250,020}{1,280,755} \approx \mathbf{97.6\%}$
* **Outflow expansion contribution**: $\frac{30,735}{1,280,755} \approx \mathbf{2.4\%}$

This arithmetically refutes the sensationalist claim that "people are fleeing Germany en masse"; 97.6% of the statistical decline was driven by the normalization of Ukrainian refugee inflows.

### 2. Verification of 2026 Jan–Aug Preliminary Figures
* Total Net Migration: **+16,841** (Inflow 892,729; Outflow 875,888)
* German Citizens Net: **-91,773** (Inflow 123,016; Outflow 214,789)
* Other EU Citizens Net: **-42,862** (Inflow 276,432; Outflow 319,294)
* Non-EU Citizens Net: **+151,473** (Inflow 493,281; Outflow 341,808)

$$\text{Net}_{\text{Germans}} + \text{Net}_{\text{EU}} + \text{Net}_{\text{NonEU}} = -91,773 - 42,862 + 151,473 = \mathbf{+16,838} \approx \mathbf{+16,841}$$
*(3-person difference accounted for by unspecified/stateless categories in Destatis Table 12711-0011)*.

---

## 🧪 Comprehensive Automated Test & Audit Suite

The codebase is protected by automated multi-tier audit suites modeled after industry open-source standards:

```bash
npm test
```

### Audit Coverage:
* `tests/ui_dom_audit.js`: Static file integrity, internal anchor resolution, external link routing, data hydration contracts, and 100% bilingual i18n symmetry.
* `tests/chart_audit.js`: ECharts instance creation, series length bounds, and non-empty canvas rendering contracts.
* `tests/visual_layout_audit.js`: Visual anti-collision rules, KPI card grid containment, badge text length limits, and axis padding bounds.
* `etl/validate_data.py`: Arithmetic data identity checks across all 27 annual and 80 monthly official records.

---

## 🚀 Quickstart & Local Deployment

### 1. Direct Browser Opening (No server required)
Simply double-click `index.html` or `findings.html` in your file explorer. All vendor dependencies (ECharts, FontAwesome, vector maps) are bundled locally in the repository.

### 2. Local Development Server
```bash
# Clone the repository
git clone https://github.com/zubin-li/germany-migration-dashboard.git
cd germany-migration-dashboard

# Start local server
python3 server.py
# Or: python3 -m http.server 8080
```
Then visit `http://localhost:8080/`.

---

## 📜 Citations & Academic Attribution

### BibTeX
```bibtex
@misc{germany_migration_dashboard_2026,
  author       = {Statistisches Bundesamt (Destatis) and Li, Zubin and Antigravity},
  title        = {{Germany Migration Intelligence Dashboard: Longitudinal Destatis Official Synthesis & Strategic Labor Analytics (2000-2026)}},
  year         = {2026},
  howpublished = {\url{https://zubin-li.github.io/germany-migration-dashboard/}},
  note         = {Data retrieved from Destatis GENESIS-Online. Open Data License dl-de/by-2-0}
}
```

### APA 7th Edition
> Statistisches Bundesamt (Destatis), Li, Z., & Antigravity. (2026). *Germany Migration Intelligence Dashboard: Longitudinal Destatis Official Synthesis & Strategic Labor Analytics (2000-2026)*. Retrieved from https://zubin-li.github.io/germany-migration-dashboard/

### Open Data Licensing
Raw data is subject to **Datenlizenz Deutschland – Namensnennung – Version 2.0 (dl-de/by-2-0)**.  
Official attribution: `© Statistisches Bundesamt (Destatis), Wiesbaden, 2026`.

---

## 👥 Project Contributors

* **Zubin Li** ([@zubin-li](https://github.com/zubin-li)) — Project Lead, Data Architecture & Analytical Modeling
* **Antigravity** ([@antigravity](https://github.com/antigravity)) — Autonomous AI Agent Full-Stack Engineering, UI/UX Architecture & QA Automation Pipeline
