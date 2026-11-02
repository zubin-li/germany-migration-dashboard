# 德国官方移民数据字典 (Official Data Dictionary)

**项目名称**: 德国移民数据智能分析平台 (Germany Migration Intelligence Dashboard)  
**遵循标准**: 德国联邦统计局 Destatis GENESIS-Online 命名规约  

---

## 1. 核心迁移指标 (Core Migration Metrics)

| 变量名 (Variable) | 德国官方德文术语 | 英文术语 | 数据类型 | 单位 | 官方计算公式 / 统计含义 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `zuzuege` | Zuzüge | Inflow / Immigration | Integer | 人 (Persons) | 统计期内自境外迁入德国并登记落户的法定迁移事件数。 |
| `fortzuege` | Fortzüge | Outflow / Emigration | Integer | 人 (Persons) | 统计期内自德国迁出前往国外并注销户籍的法定迁移事件数。 |
| `saldo` | Wanderungssaldo | Net Migration Balance | Integer | 人 (Persons) | `saldo = zuzuege - fortzuege`。正数代表净流入，负数代表净流出。 |
| `de_saldo` | Saldo (Deutsche) | German Citizens Net | Integer | 人 (Persons) | 持有德国国籍持有者的国际净迁移差额（长期呈现负值）。 |
| `ausl_saldo` | Saldo (Ausländer) | Foreign Nationals Net | Integer | 人 (Persons) | 非德国籍外国公民的国际净迁移差额（通常呈现显著正值）。 |
| `eu_saldo` | Saldo (EU-Ausländer) | Other EU Citizens Net | Integer | 人 (Persons) | 除德国外其他欧盟成员国公民在德净迁移差额（不含德国公民）。 |
| `noneu_saldo`| Saldo (Drittstaaten) | Non-EU Citizens Net | Integer | 人 (Persons) | 第三国（非欧盟非欧洲经济区）公民在德净迁移差额。 |

---

## 2. 入籍统计指标 (Naturalization Metrics)

| 变量名 | 德国官方德文术语 | 英文术语 | 数据类型 | 单位 | 官方统计含义 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `count` | Einbürgerungen insgesamt | Total Naturalizations | Integer | 人 (Persons) | 依《德国国籍法》（StAG）在统计年度内批准获得德国国籍的人数。 |
| `bisherige_staatsangehoerigkeit` | Bisherige Staatsangehörigkeit | Previous Citizenship | String | ISO / Destatis Code | 入籍申请人原持有的国籍国家名称及代码。 |
| `male` / `female` | Männlich / Weiblich | Male / Female | Integer | 人 (Persons) | 入籍申请者的法定性别构成。 |

---

## 3. 国籍与地理代码对照表 (Country & State Codes)

| 代码 (Code) | 中文标准名称 | 德文官方名称 | 英文名称 | 群体分类 (Cohort) |
| :--- | :--- | :--- | :--- | :--- |
| **CN** | 中国 | China | China | Non-EU (第三国) |
| **IN** | 印度 | Indien | India | Non-EU (第三国) |
| **VN** | 越南 | Vietnam | Vietnam | Non-EU (第三国) |
| **DE** | 德国 | Deutschland | Germany | German (德国公民) |
| **PL** | 波兰 | Polen | Poland | EU (2004年加入) |
| **RO** | 罗马尼亚 | Rumänien | Romania | EU (2007年加入) |
| **BG** | 保加利亚 | Bulgarien | Bulgaria | EU (2007年加入) |
| **TR** | 土耳其 | Türkei | Turkey | Non-EU (第三国) |
| **UA** | 乌克兰 | Ukraine | Ukraine | Non-EU (第三国) |
| **SY** | 叙利亚 | Syrien | Syria | Non-EU (第三国) |
| **AF** | 阿富汗 | Afghanistan | Afghanistan | Non-EU (第三国) |
| **IT** | 意大利 | Italien | Italy | EU (创始国) |
| **FR** | 法国 | Frankreich | France | EU (创始国) |
| **ES** | 西班牙 | Spanien | Spain | EU (1986年加入) |
| **US** | 美国 | Vereinigte Staaten | United States | Non-EU (第三国) |
| **RU** | 俄罗斯 | Russische Föderation | Russia | Non-EU (第三国) |
| **CH** | 瑞士 | Schweiz | Switzerland | Non-EU / EFTA |
| **AT** | 奥地利 | Österreich | Austria | EU (1995年加入) |
| **GB** | 英国 | Vereinigtes Königreich | United Kingdom | Non-EU (2020年脱欧，历史期属于EU) |

---

## 4. 德国16个联邦州代码 (Bundesländer Codes)

| 州代码 (State Code) | 联邦州中文名称 | 德文官方名称 | 首府 |
| :--- | :--- | :--- | :--- |
| **BW** | 巴登-符腾堡 | Baden-Württemberg | 斯图加特 (Stuttgart) |
| **BY** | 巴伐利亚 | Bayern | 慕尼黑 (München) |
| **BE** | 柏林 | Berlin | 柏林 (Berlin) |
| **BB** | 勃兰登堡 | Brandenburg | 波茨坦 (Potsdam) |
| **HB** | 不来梅 | Bremen | 不来梅 (Bremen) |
| **HH** | 汉堡 | Hamburg | 汉堡 (Hamburg) |
| **HE** | 黑森 | Hessen | 威斯巴登 (Wiesbaden) |
| **MV** | 梅克伦堡-前波美拉尼亚 | Mecklenburg-Vorpommern | 什未林 (Schwerin) |
| **NI** | 下萨克森 | Niedersachsen | 汉诺威 (Hannover) |
| **NW** | 北莱茵-威斯特法伦 | Nordrhein-Westfalen | 杜塞尔多夫 (Düsseldorf) |
| **RP** | 莱茵兰-普法尔茨 | Rheinland-Pfalz | 美因茨 (Mainz) |
| **SL** | 萨尔 | Saarland | 萨尔布吕肯 (Saarbrücken) |
| **SN** | 萨克森 | Sachsen | 德累斯顿 (Dresden) |
| **ST** | 萨克森-安哈尔特 | Sachsen-Anhalt | 马格德堡 (Magdeburg) |
| **SH** | 石勒苏益格-荷尔斯泰因 | Schleswig-Holstein | 基尔 (Kiel) |
| **TH** | 图林根 | Thüringen | 埃尔福特 (Erfurt) |
