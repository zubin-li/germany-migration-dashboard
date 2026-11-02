# 德国移民数据智能分析平台 — 官方数据源与学术引用指南
## Data Provenance, Official Sources & Academic Citation Standards

本文档为平台所使用的所有数据源、官方数据表编码、法律法规依据及学术引用格式提供全面完整的溯源指引。所有数据结论均建立在严格的官方原始数据、恒等式计算及可公开复核的文献基准之上。

---

## 一、官方权威统计数据源清单 (Destatis Primary Sources)

本平台全部历史年度与最新月度数据均直接抽取自**德国联邦统计局（Statistisches Bundesamt - Destatis）GENESIS-Online 官方数据库**及联邦移民与难民局（BAMF）官方通报：

| 官方表号 | 德文官方统计表名称 | 数据时间跨度 | 核心变量与口径说明 | 官方检索永久链接 |
| :--- | :--- | :---: | :--- | :--- |
| **`12711-0005`** | Wanderungen zwischen Deutschland und dem Ausland: Deutschland, Jahre, Nationalität, Geschlecht | 2000—2025 | 年度跨国移入（Zuzüge）、迁出（Fortzüge）、净差额（Wanderungssaldo），按德国籍/外国籍及性别分类 | [Destatis 12711-0005](https://genesis.destatis.de/datenbank/online?operation=table&code=12711-0005) |
| **`12711-0011`** | Wanderungen zwischen Deutschland und dem Ausland: Deutschland, Monate, Nationalitätsgruppen, Geschlecht | 2020/01—2026/08 | 初步月度迁移监测数据，按月划分德国公民、欧盟公民及第三国公民（Drittstaaten） | [Destatis 12711-0011](https://genesis.destatis.de/datenbank/online?operation=table&code=12711-0011) |
| **`12711-0007`** | Wanderungen zwischen Deutschland und dem Ausland: Deutschland, Jahre, Ausgewählte Staatsangehörigkeiten | 2000—2025 | 年度具体国籍细分（涵盖中国、印度、越南、叙利亚、阿富汗、乌克兰、波兰、罗马尼亚等数百个国家） | [Destatis 12711-0007](https://genesis.destatis.de/datenbank/online?operation=table&code=12711-0007) |
| **`12711-0008`** | Wanderungen zwischen Deutschland und dem Ausland: Herkunfts- und Zielländer | 2000—2025 | 国际迁入来源国与德国本土公民外迁目的国矩阵（含瑞士、奥地利、美国、英国等） | [Destatis 12711-0008](https://genesis.destatis.de/datenbank/online?operation=table&code=12711-0008) |
| **`12711-0023`** | Wanderungen zwischen Deutschland und dem Ausland: Bundesländer, Jahre, Geschlecht | 2000—2025 | 德国 16 联邦州（Bundesländer）国际迁移时空分布数据 | [Destatis 12711-0023](https://genesis.destatis.de/datenbank/online?operation=table&code=12711-0023) |
| **`12511-0001`** | Einbürgerungen von Ausländern: Deutschland, Jahre | 2000—2025 | 德国全境年度入籍总人数演进（2024新国籍法改革历史极值跟踪） | [Destatis 12511-0001](https://genesis.destatis.de/datenbank/online?operation=table&code=12511-0001) |
| **`12511-0002`** | Einbürgerungen von Ausländern: Deutschland, Jahre, Bisherige Staatsangehörigkeit | 2014—2025 | 入籍人群原国籍来源结构分布与性别占比 | [Destatis 12511-0002](https://genesis.destatis.de/datenbank/online?operation=table&code=12511-0002) |
| **`BAMF-AZR`** | Ausländerzentralregister (AZR) & Wanderungsmonitoring | 2024—2026 | 外事局中央登记册快报，提供未包含在 GENESIS 月度公开库中的非欧盟专项人才/留学月度估算基准 | [BAMF Monitoring](https://www.bamf.de/DE/Themen/Forschung/Veroeffentlichungen/Wanderungsmonitoring/wanderungsmonitoring-node.html) |

---

## 二、官方数据授权与使用许可声明 (Open Data License)

根据德国联邦政府开放数据条例，德国联邦统计局数据采用如下法定开放许可协议：

* **许可协议**：`Datenlizenz Deutschland – Namensnennung – Version 2.0`（简称 **dl-de/by-2-0**）
* **知识产权署名**：© Statistisches Bundesamt (Destatis), Wiesbaden, 2026.
* **使用条款**：允许在注明官方数据来源的前提下进行商业与非商业性质的提取、重组、分析、可视化与传播。
* **协议原文**：[https://www.govdata.de/dl-de/by-2-0](https://www.govdata.de/dl-de/by-2-0)

---

## 三、学术与研究引用格式规范 (Citation Formats)

如需在学术论文、研究报告、咨询简报或媒体文章中引用本平台生成的数据或结论，推荐使用以下格式：

### 1. APA 格式 (7th Edition)
> Statistisches Bundesamt (Destatis). (2026). *Wanderungen zwischen Deutschland und dem Ausland (Tabellen 12711-0005, 12711-0011, 12711-0007, 12511-0001)*. GENESIS-Online Datenbank. Synthesized by Germany Migration Intelligence Dashboard (v2.6.0). Retrieved November 2, 2026, from https://zubin-li.github.io/germany-migration-dashboard/

### 2. BibTeX 格式
```bibtex
@misc{germany_migration_dashboard_2026,
  author       = {Statistisches Bundesamt (Destatis) and Li, Zubin},
  title        = {{Germany Migration Intelligence Dashboard: Longitudinal Destatis Official Synthesis & Strategic Labor Analytics (2000-2026)}},
  year         = {2026},
  howpublished = {\url{https://zubin-li.github.io/germany-migration-dashboard/}},
  note         = {Data retrieved from Destatis GENESIS-Online Tables 12711 and 12511. Open Data License dl-de/by-2-0}
}
```

### 3. Chicago / Turabian 格式 (Notes and Bibliography)
> Statistisches Bundesamt. "Wanderungsstatistik und Einbürgerungsstatistik (2000–2026)." Destatis GENESIS-Online. Analyzed and visualized in *Germany Migration Intelligence Dashboard*, 2026. https://zubin-li.github.io/germany-migration-dashboard/.

---

## 四、核心结论数学归因链与可复核公式 (Methodological Reproducibility)

本平台所有归因分析均完全公开计算公式，支持任何人独立复算：

1. **净移民恒等式 (Net Migration Identity)**：
   $$\text{Saldo}_t = \text{Zuzüge}_t - \text{Fortzüge}_t$$
   *(2000年至2026年所有27个年度与80个月度记录在 `etl/validate_data.py` 中 100% 自动通过，无一例截断误差)*

2. **跨期变动差分分解 (Dynamic Decomposition Formula)**：
   $$\Delta \text{Saldo} = \Delta \text{Zuzüge} - \Delta \text{Fortzüge} = (\text{Zuzüge}_{t_2} - \text{Zuzüge}_{t_1}) - (\text{Fortzüge}_{t_2} - \text{Fortzüge}_{t_1})$$
   * 2022年峰值（+151.6万）至 2025年（+23.5万）的 -128.1万 净降幅中：
     * 移入减少贡献率：$\frac{|\Delta \text{Zuzüge}|}{|\Delta \text{Zuzüge}| + |\Delta \text{Fortzüge}|} = \frac{1,250,020}{1,250,020 + 30,735} = \mathbf{97.6\%}$
     * 迁出增加贡献率：$\frac{|\Delta \text{Fortzüge}|}{|\Delta \text{Zuzüge}| + |\Delta \text{Fortzüge}|} = \frac{30,735}{1,250,020 + 30,735} = \mathbf{2.4\%}$
   * 证明了净移民回落主要是由于乌克兰等避难人道移入回潮，而非“德国人口大规模出逃”。

3. **互斥人群加和性 (Mutually Exclusive Demographic Exhaustion)**：
   $$\text{Saldo}_{\text{Gesamt}} \approx \text{Saldo}_{\text{Deutsche}} + \text{Saldo}_{\text{EU-Ausländer}} + \text{Saldo}_{\text{Drittstaaten}}$$
   *(2026年1—8月初步月度：$-91,773 + (-42,862) + 151,473 = +16,838$，与官方总计 $+16,841$ 仅差 3 人，系未标明及无国籍修约差)*

---

## 五、项目贡献者 (Contributors)

* **Zubin Li** ([@zubin-li](https://github.com/zubin-li)) — 项目发起人与总体架构设计
* **Antigravity** ([@antigravity](https://github.com/antigravity)) — 自主 AI Agent 全栈协同架构与自动化工程交付

