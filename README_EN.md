[中文](README.md) · [English](README_EN.md)

# Germany Migration Intelligence Dashboard

[![Live site](https://img.shields.io/badge/GitHub_Pages-Live-0969da?logo=github)](https://zubin-li.github.io/germany-migration-dashboard/)
[![Data source](https://img.shields.io/badge/Data-Destatis-005ea8)](https://www-genesis.destatis.de/)
[![License: MIT](https://img.shields.io/badge/Code-MIT-yellow.svg)](LICENSE)

A bilingual interactive dashboard built from local snapshots of Germany's Federal Statistical Office (Destatis) GENESIS-Online data. It supports exploration of cross-border migration, German-citizen emigration, state-level patterns, and naturalisation trends.

**Live dashboard:** <https://zubin-li.github.io/germany-migration-dashboard/>

**Standalone findings report:** <https://zubin-li.github.io/germany-migration-dashboard/findings.html>

## Questions the project addresses

- How have immigration, emigration, and net migration changed over time?
- How do the trends differ for German citizens, other EU citizens, and non-EU citizens?
- What patterns appear for selected nationalities and federal states?
- Why must cross-border migration (`Wanderung`) and naturalisation (`Einbürgerung`) be interpreted separately?
- Can a specific viral statistic be reproduced from the current public-data snapshot?

The site includes Chinese and English interfaces, light and dark themes, interactive charts, filters, and a data table. `findings.html` is a standalone narrative web report; it is not a PDF file.

## Data status

| Dataset | Coverage | Status in this repository |
| --- | --- | --- |
| Annual cross-border migration | 2000–2025 | Final through 2024; preliminary for 2025 |
| Monthly cross-border migration | 2020-01–2026-08 | Preliminary monthly results |
| Migration by nationality | 2000–2025 | Preliminary for 2025 |
| Migration by federal state | 2015–2025 | Preliminary for 2025 |
| Naturalisation | 2000–2025 | Preliminary for 2025 |

The repository contains dated local snapshots, not live Destatis queries. Table identifiers, refresh dates, and definitions are documented in [`data/metadata.json`](data/metadata.json), [`docs/data_dictionary.md`](docs/data_dictionary.md), and [`docs/citations.md`](docs/citations.md).

> [!IMPORTANT]
> `Wanderung` measures cross-border residential moves; `Einbürgerung` measures acquisition of German citizenship. Moving to Germany is not the same as becoming a German citizen. Preliminary results may be revised. The dashboard is not immigration, legal, or investment advice.

## Run locally

Python 3 is required. The data and ECharts runtime are included in the repository.

```bash
git clone https://github.com/zubin-li/germany-migration-dashboard.git
cd germany-migration-dashboard
python3 server.py
```

Open <http://127.0.0.1:8080>. You can also run `./run.sh`. Serving the files over HTTP is recommended because it matches the GitHub Pages loading model.

## Verification

```bash
npm test
```

This runs static DOM/link and i18n checks, chart-data contract checks, CSS layout-rule checks, and data-identity validation. Static checks do not replace visual and interaction acceptance in a real browser; browser regression checks should record viewport, language, theme, and console errors separately.

## Repository map

| Path | Purpose |
| --- | --- |
| `index.html`, `app.js`, `styles.css` | Main dashboard and interaction logic |
| `findings.html`, `findings.js` | Standalone findings report |
| `data/`, `data.js` | Data snapshots and browser data bundle |
| `etl/` | Fetch, cleaning, and validation scripts |
| `tests/` | Static, data, and browser regression checks |
| `docs/` | Dictionary, quality notes, citations, and user guide |
| `vendor/` | Local ECharts and map assets |

## Research and interpretation limits

- The project primarily uses Destatis tables `12711-0005`, `12711-0007`, `12711-0011`, `12711-0008`, `12711-0023`, `12511-0001`, and `12511-0002`.
- Claims should be traceable to repository data and source notes. Granular figures that cannot be independently reproduced from a public table must be labelled accordingly.
- Selected nationalities, years, and geographic levels are not a complete representation of migration in Germany.
- Interpretations in the findings report are analysis, not statements by the official statistics agency.

For data-definition, citation, or interface defects, open a [GitHub issue](https://github.com/zubin-li/germany-migration-dashboard/issues) with the page, filter state, and reproduction steps.

## Maintainers and contributions

- [Zubin Li](https://github.com/zubin-li) — project lead, data architecture, and analysis
- Antigravity — AI development assistant; frontend implementation and quality checks

## License and citation

Project code is released under the [MIT License](LICENSE). Destatis source data remains subject to its own licence and attribution terms; see [`docs/citations.md`](docs/citations.md). Use [`CITATION.cff`](CITATION.cff) to cite the software.
