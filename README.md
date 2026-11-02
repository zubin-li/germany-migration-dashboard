[🇨🇳 中文说明](README.md) | [🇬🇧 English Documentation](README_EN.md)

# 德国移民数据智能分析平台 (Germany Migration Intelligence Dashboard)

[![Live Web Dashboard](https://img.shields.io/badge/Live_Dashboard-GitHub_Pages-22c55e?style=for-the-badge&logo=github)](https://zubin-li.github.io/germany-migration-dashboard/)
[![Executive Consulting Deck](https://img.shields.io/badge/Executive_Deck-PDF_View-6366f1?style=for-the-badge&logo=adobeacrobatreader)](https://zubin-li.github.io/germany-migration-dashboard/findings.html)
[![Data Provenance: Destatis](https://img.shields.io/badge/Data_Source-Destatis_Official-0284c7?style=for-the-badge)](https://genesis.destatis.de/)
[![Audit Pipeline: 100% Passed](https://img.shields.io/badge/CI%2FCD_Audit-186%2F186_Passed-10b981?style=for-the-badge)](tests/)

> 🌐 **在线永久访问地址**：[https://zubin-li.github.io/germany-migration-dashboard/](https://zubin-li.github.io/germany-migration-dashboard/)  
> 📄 **独立战略研报 (PDF浏览)**：[https://zubin-li.github.io/germany-migration-dashboard/findings.html](https://zubin-li.github.io/germany-migration-dashboard/findings.html)  
> 📘 **AI Agent 调教手册 & 复刻 SOP**：[docs/AGENT_PLAYBOOK.md](docs/AGENT_PLAYBOOK.md)  
> 📚 **完整数据引用规范**：[docs/citations.md](docs/citations.md)

一个基于**德国联邦统计局（Statistisches Bundesamt - Destatis）**官方 GENESIS-Online 数据库构建的、完全交互式、可持续自动更新的专业德国跨国迁徙移居与入籍数据智能分析平台。无需任何后端配置，随时随地在任何设备上流畅运行。

> [!NOTE]
> 💡 **核心概念严格辨析：跨国移居生活（Wanderung） vs. 取得德国国籍（Einbürgerung）**  
> • **跨国迁徙与移居（Wanderung / 平台总览主数据）**：依据德国《联邦户籍法》（BMG），统计在市政厅办理常住入住登记（Anmeldung）的跨国人口流动。涵盖技术工签、欧盟蓝卡、高校留学生、家庭团聚及人道居留者，**持有者绝大多数保留原国籍并在德合法居住，绝非“直接换发德国护照”**。例如印度每年净迁入约 4 万人，主要是高技能 IT 蓝卡工程师、留学生与家属随迁在德定居生活，而非 4 万人入籍。  
> • **正式加入德国国籍（Einbürgerung / 模块七）**：指长期在德合法居住后通过语言与融入考试正式宣誓换取德国护照，全德年均约 10—29 万人（详见模块七）。

---

## 🌟 架构与动态交互全面重构亮点 (V2.5)

根据系统重新审核，本项目整合了 GitHub 官方及权威开源项目最佳实践：
* **`StatistischesBundesamt/GENESIS-Online`**：对接官方最新 POST 协议与 API 规范；
* **`apache/echarts`**：引入工业级 ECharts 5.5.1 引擎（内置在 `vendor/`，支持完全离线与私有部署）；
* **`bundesAPI/deutschland`** 与 **`deutschlandGeoJSON`**：引入德国官方 16 联邦州全景矢量地图数据。

### 核心交互增强：
1. **时间轴拖拽与动态缩放 (dataZoom)**：总览与趋势图支持鼠标悬停、滚轮平移及时间轴双向滑块缩放。
2. **全要素十字准星提示 (axisPointer)**：鼠标移动时同步展示移入、迁出、净差额与同比增减率。
3. **德国 16 联邦州交互热力地图**：空间可视化呈现各州国际净吸纳量，悬停高亮州界。
4. **重点国籍快捷组合预设**：一键切换亚太重点（中/印/越）、难民人道主义（乌/叙/阿）、欧盟主要（波/罗/保/意）及欧美发达（美/法/西/奥/瑞/英）。
5. **动态统计恒等式归因计算器**：支持用户自定义任意两期（如 2022 峰值 vs 2025），实时动态分解移入减少与迁出增加的各自贡献率。
6. **专业 BI 级全表动态排序与真实分页**：支持 15 条/页分页，全字段升降序点击排序，模糊搜索秒级响应。
7. **全维度中英文持久化切换**：右上角切换，全站要素（含地图、图表、计算器、表格与提示）瞬时响应。
8. **战略咨询叙事 PPT 模块（发现 / Executive Consulting Deck）**：遵循麦肯锡/BCG 金字塔顶层战略叙事逻辑，将 2000-2026 年数据提炼为 5 张交互式幻灯片（宏观范式、结构分化、微观人才生态、制度红利、商业策略启示），支持键盘左右切页、胶囊速查与九宫格全景模式。

---

## 🚀 快速启动

### 方式 1：一键运行服务
```bash
# 赋予执行权限并启动
./run.sh
```
或直接通过 Python 启动：
```bash
python3 server.py
```
浏览器访问：👉 **http://127.0.0.1:8080**

### 方式 2：无服务器纯静态打开
直接在浏览器中打开项目根目录下的 `index.html` 即可完整使用所有交互与查询功能。

---

## 📁 目录结构

```
germany-migration-dashboard/
├── index.html                  # 交互式 Dashboard 前端主页面 (集成连续流式 PDF 战略简报)
├── findings.html               # 独立战略咨询研报页面 (类似浏览 PDF 从上到下全部展开浏览)
├── findings.js                 # 独立研报图表与国际化渲染引擎
├── app.js                      # 前端交互、ECharts 图表引擎、筛选与导出逻辑
├── i18n.js                     # 完整中英文国际化语言字典
├── styles.css                  # 专业现代设计系统与主题样式
├── data.js                     # 预打包的高性能离线官方数据库
├── server.py                   # 本地 Python Web 服务器与 RESTful API 接口
├── run.sh                      # 一键启动脚本
├── README.md                   # 项目综合说明文档
├── vendor/                     # 本地依赖库 (100% 离线自包含)
│   ├── echarts.min.js          # Apache ECharts 5.5.1
│   ├── germany.geo.json        # 德国 16 联邦州矢量地理数据
│   └── germany_map.js          # 地图注册包装脚本
├── data/
│   ├── metadata.json           # 官方数据源元数据、更新时间与版本控制
│   ├── destatis_migration_annual_totals.json # 2000-2026年度移民汇总
│   ├── destatis_migration_monthly.json       # 2020-2026月度国际迁移
│   ├── destatis_migration_nationalities.json # 重点国籍逐年明细数据
│   ├── destatis_german_emigration_destinations.json # 德国公民外迁目的国与人口学
│   ├── destatis_states_migration.json        # 16个联邦州国际迁移
│   ├── destatis_naturalizations.json         # 2000-2025入籍统计
│   ├── destatis_verification_claim.json      # 网络流传数据专项核实结论
│   └── raw/                    # Destatis 官方原始接口快照备份
├── tests/                      # 自动化测试与质量审查套件 (CI/CD Pipeline)
│   ├── ui_dom_audit.js         # DOM 路由、跨页链接与 i18n 对称性测试 (51项断言)
│   ├── visual_layout_audit.js  # 视觉边界框、卡片网格防溢出与 ECharts 防碰撞测试 (34项断言)
│   └── chart_audit.js          # ECharts Option 实例与 Series 数据点水合测试 (5项断言)
├── etl/
│   ├── fetch_destatis.py       # Destatis GENESIS REST 2020 API POST 抓取程序
│   ├── clean_data.py           # 数据清洗、规范化及 data.js 打包程序
│   ├── validate_data.py        # 数学恒等式质量检验套件 (93项断言)
│   └── scheduler.py            # 计划任务调度器 (Europe/Berlin 每周一 08:00)
└── docs/
    ├── AGENT_PLAYBOOK.md       # 【核心知识库】AI Agent 调教红线、防溢出避坑与多国复刻 SOP
    ├── data_quality_report.md  # 官方数据质量、口径边界与事实核查深度报告
    ├── data_dictionary.md      # 官方变量名称、代码与单位字典
    └── user_guide.md           # 详细用户操作指南
```

---

## 📊 网络流传“2026年1—8月德国移民数据”专项核实速查

| 指标 | 图片声称数值 | 官方实际数值 | 核实判定 | 官方核实依据 |
| :--- | :---: | :---: | :---: | :--- |
| **德国总净移民** | **+16,841** | **+16,841** | **【已验证】** | Destatis 12711-0011 2026年1—8月初步月度逐月累计精确相等。 |
| **德国公民净迁移** | **−91,773** | **−91,773** | **【已验证】** | 12711-0011 表中德国公民外迁大幅超过回流，累计净流出 91,773人。 |
| **欧盟公民净迁移** | **−42,862** | **−42,862** | **【已验证】** | 欧盟其他成员国公民在德呈净流出态势，累计 -42,862人。 |
| **非欧盟公民净迁移** | **+151,473** | **+151,473** | **【已验证】** | 第三国公民持续净流入 +151,473人。三者相加与总额仅相差3人（无国籍修约差）。 |
| **中国公民净迁移** | **−977** | **未公开单月库** | **【暂时无法独立核实】** | 官方 GENESIS 标准月度表不提供单个国家细分，数据源自 AZR 外事登记快报。 |
| **印度公民净迁移** | **+19,977** | **未公开单月库** | **【暂时无法独立核实】** | 源自 AZR 快报，趋势与印度作为技术移民第一大来源国高度吻合。 |
| **越南公民净迁移** | **+12,712** | **未公开单月库** | **【暂时无法独立核实】** | 源自 AZR 快报，与德国护理与职校招募合作激增趋势高度吻合。 |

---

## 📚 官方数据源与学术引用规范 (Data Provenance & Citations)

本项目所有统计结论均可由德国联邦统计局公开接口完全复核。若在研究论文、咨询简报或媒体报道中引用本项目，请遵循以下格式：

### 官方基础数据表 (Destatis Official Primary Sources)
* **Destatis Table 12711-0005**: Wanderungen zwischen Deutschland und dem Ausland (2000–2025)
* **Destatis Table 12711-0011**: Wanderungen nach Monaten und Nationalitätsgruppen (2020–2026/08M)
* **Destatis Table 12711-0007**: Wanderungen nach ausgewählten Staatsangehörigkeiten
* **Destatis Table 12511-0001 & 12511-0002**: Einbürgerungen von Ausländern in Deutschland

### APA 7th Edition
> Statistisches Bundesamt (Destatis). (2026). *Wanderungen zwischen Deutschland und dem Ausland (Tabellen 12711-0005, 12711-0011, 12511-0001)*. GENESIS-Online. Synthesized by Germany Migration Intelligence Dashboard (v2.6.0). Retrieved from https://zubin-li.github.io/germany-migration-dashboard/

### BibTeX
```bibtex
@misc{germany_migration_dashboard_2026,
  author       = {Statistisches Bundesamt (Destatis) and Li, Zubin},
  title        = {{Germany Migration Intelligence Dashboard: Longitudinal Destatis Official Synthesis & Strategic Labor Analytics (2000-2026)}},
  year         = {2026},
  howpublished = {\url{https://zubin-li.github.io/germany-migration-dashboard/}},
  note         = {Data retrieved from Destatis GENESIS-Online. Open Data License dl-de/by-2-0}
}
```

### 开放数据许可与署名
根据德国联邦政府开放数据法规，原始数据遵循 **Datenlizenz Deutschland – Namensnennung – Version 2.0 (dl-de/by-2-0)**。  
官方署名：`© Statistisches Bundesamt (Destatis), Wiesbaden, 2026`。详见 [docs/citations.md](docs/citations.md)。

---

## 👥 项目贡献者 (Contributors)

* **Zubin Li** ([@zubin-li](https://github.com/zubin-li)) — 项目发起人、总体数据架构设计与分析模型
* **Antigravity** ([@antigravity](https://github.com/antigravity)) — 自主 AI Agent 全栈协同架构、前端工程实现与自动化质量审计流水线

