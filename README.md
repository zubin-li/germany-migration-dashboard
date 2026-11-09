[中文](README.md) · [English](README_EN.md)

# 德国移民数据智能分析平台

[![在线访问](https://img.shields.io/badge/GitHub_Pages-在线访问-0969da?logo=github)](https://zubin-li.github.io/germany-migration-dashboard/)
[![数据来源](https://img.shields.io/badge/数据来源-Destatis-005ea8)](https://www-genesis.destatis.de/)
[![License: MIT](https://img.shields.io/badge/代码许可-MIT-yellow.svg)](LICENSE)

基于德国联邦统计局（Destatis）GENESIS-Online 数据快照构建的双语交互式仪表板，用于探索德国跨境迁移、德国公民外迁、联邦州分布和入籍趋势。

**在线仪表板：** <https://zubin-li.github.io/germany-migration-dashboard/>

**独立发现报告：** <https://zubin-li.github.io/germany-migration-dashboard/findings.html>

## 这个项目能回答什么

- 德国跨境迁入、迁出和净迁移如何随时间变化？
- 德国公民、其他欧盟公民和非欧盟公民的趋势有何不同？
- 选定国籍与联邦州的迁移数据呈现出什么结构？
- 跨境迁移（`Wanderung`）与入籍（`Einbürgerung`）为何不能混为一谈？
- 网络传播的具体数字，在当前公开数据快照下能否复核？

平台提供中英文界面、亮/暗主题、交互图表、筛选与数据表。`findings.html` 是独立的叙事型研究摘要，不是 PDF 文件。

## 数据状态

| 数据集 | 覆盖范围 | 当前状态 |
| --- | --- | --- |
| 年度跨境迁移 | 2000–2025 | 2024 年前为正式结果；2025 年为初步结果 |
| 月度跨境迁移 | 2020-01–2026-08 | 初步月度结果 |
| 按国籍迁移 | 2000–2025 | 2025 年为初步结果 |
| 联邦州迁移 | 2015–2025 | 2025 年为初步结果 |
| 入籍 | 2000–2025 | 2025 年为初步结果 |

仓库保存的是已注明时间点的本地快照，不等同于对 Destatis 的实时查询。完整表号、更新时间与口径见 [`data/metadata.json`](data/metadata.json)、[`docs/data_dictionary.md`](docs/data_dictionary.md) 和 [`docs/citations.md`](docs/citations.md)。

> [!IMPORTANT]
> `Wanderung` 统计跨境居住迁移，`Einbürgerung` 统计取得德国国籍。迁入德国不等于入籍。初步数据可能被 Destatis 修订，图表中的比较也不构成移民、法律或投资建议。

## 本地运行

需要 Python 3；数据和 ECharts 已随仓库提供。

```bash
git clone https://github.com/zubin-li/germany-migration-dashboard.git
cd germany-migration-dashboard
python3 server.py
```

打开 <http://127.0.0.1:8080>。也可以运行 `./run.sh`。建议通过本地 HTTP 服务访问，以获得与 GitHub Pages 一致的加载行为。

## 验证

```bash
npm test
```

该命令运行 DOM/链接与国际化静态检查、图表数据契约检查、CSS 布局规则检查，以及数据恒等式校验。静态检查不能替代真实浏览器中的视觉与交互验收；浏览器级回归检查应单独运行并记录视口、语言、主题和控制台错误。

## 目录导航

| 路径 | 用途 |
| --- | --- |
| `index.html`, `app.js`, `styles.css` | 主仪表板与交互逻辑 |
| `findings.html`, `findings.js` | 独立发现报告 |
| `data/`, `data.js` | 数据快照与前端数据包 |
| `etl/` | 获取、清洗和校验脚本 |
| `tests/` | 静态、数据和浏览器回归检查 |
| `docs/` | 数据字典、质量说明、引用与用户指南 |
| `vendor/` | 本地 ECharts 与地图资源 |

## 研究与复核边界

- 项目优先使用 Destatis 表 `12711-0005`、`12711-0007`、`12711-0011`、`12711-0008`、`12711-0023`、`12511-0001` 和 `12511-0002`。
- 每个结论应能追溯到仓库中的数据文件和来源说明；无法由公开表独立复核的细分数字应明确标注。
- 选定国籍、年份和地理层级不是德国迁移现实的完整表示。
- 发现报告中的解释属于分析层，不应被当作官方统计机构的结论。

如发现数据口径、引用或界面问题，请在 [GitHub Issues](https://github.com/zubin-li/germany-migration-dashboard/issues) 中附上页面、筛选条件和可复现步骤。

## 维护者与贡献

- [Zubin Li](https://github.com/zubin-li) — 项目负责人、数据架构与分析
- Antigravity — AI 开发助手，参与前端实现与质量检查

## 许可与引用

项目代码使用 [MIT License](LICENSE)。Destatis 原始数据受其各自许可与署名要求约束；详见 [`docs/citations.md`](docs/citations.md)。引用软件时可使用 [`CITATION.cff`](CITATION.cff)。
