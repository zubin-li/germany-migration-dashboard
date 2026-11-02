/**
 * Standalone Executive Consulting Deck Logic (findings.js)
 * Supports PDF-style scrolling, dual-language toggle (zh-CN / en),
 * dark/light themes, and high-definition ECharts visualizations.
 */

const DeckState = {
  lang: localStorage.getItem("germany_dashboard_lang") || "zh-CN",
  theme: localStorage.getItem("germany_dashboard_theme") || "dark"
};

const DeckCharts = {};

function t(key) {
  if (translations && translations[DeckState.lang] && translations[DeckState.lang][key]) {
    return translations[DeckState.lang][key];
  }
  return key;
}

function getThemeColors() {
  const isDark = DeckState.theme === "dark";
  return {
    textColor: isDark ? "#94a3b8" : "#475569",
    titleColor: isDark ? "#f8fafc" : "#0f172a",
    splitLine: isDark ? "#334155" : "#e2e8f0",
    tooltipBg: isDark ? "#1e293b" : "#ffffff",
    tooltipBorder: isDark ? "#475569" : "#cbd5e1"
  };
}

function applyTheme(theme) {
  DeckState.theme = theme;
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("germany_dashboard_theme", theme);

  const btn = document.getElementById("deck-theme-toggle");
  if (btn) btn.textContent = theme === "dark" ? "☀️ Light" : "🌙 Dark";

  renderAllCharts();
}

function applyLanguage(lang) {
  DeckState.lang = lang;
  document.documentElement.setAttribute("lang", lang);
  localStorage.setItem("germany_dashboard_lang", lang);

  // Update pills
  const optZh = document.getElementById("deck-lang-zh");
  const optEn = document.getElementById("deck-lang-en");
  if (optZh) optZh.classList.toggle("active", lang === "zh-CN");
  if (optEn) optEn.classList.toggle("active", lang === "en");

  // Update DOM data-i18n
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (translations[lang] && translations[lang][key]) {
      el.innerHTML = translations[lang][key];
    }
  });

  renderAllCharts();
}

// Safe database access
function getDestatisDatabase() {
  if (typeof window !== "undefined") {
    return window.DESTATIS_DATABASE || window.DESTATIS_DATA || {};
  }
  return {};
}

// -------------------------------------------------------------------------
// CHART BUILDERS
// -------------------------------------------------------------------------

// Slide 1: Macro Paradigm (Inflow, Outflow, Net, 3 Eras)
function renderChart1() {
  const dom = document.getElementById("pdf-chart-1");
  if (!dom) return;
  if (!DeckCharts.chart1) DeckCharts.chart1 = echarts.init(dom);
  const th = getThemeColors();
  const isZh = DeckState.lang === "zh-CN";

  const db = getDestatisDatabase();
  const data = db.annualTotals || db.annual_totals || [];
  const validData = data.filter(r => typeof r.year === "number" || r.year_num);
  const labels = validData.map(r => String(r.year_num || r.year));
  const inflows = validData.map(r => r.zuzuege);
  const outflows = validData.map(r => r.fortzuege);
  const saldos = validData.map(r => r.saldo);

  DeckCharts.chart1.setOption({
    title: {
      text: isZh ? "2000—2026年德国跨国迁入、迁出与净迁徙宏观全景" : "2000-2026 Cross-Border Inflow, Outflow & Net Migration",
      textStyle: { color: th.titleColor, fontSize: 13, fontWeight: 800 },
      left: "center",
      top: 5
    },
    tooltip: {
      trigger: "axis",
      backgroundColor: th.tooltipBg,
      borderColor: th.tooltipBorder,
      textStyle: { color: th.titleColor },
      axisPointer: { type: "cross" },
      formatter: function(params) {
        let title = params[0].axisValue;
        let res = `<strong>${title}</strong><br/>`;
        params.forEach(p => {
          let val = (p.value !== undefined) ? p.value.toLocaleString() + (isZh ? " 人" : " pers.") : "-";
          res += `${p.marker} ${p.seriesName}: <strong>${val}</strong><br/>`;
        });
        return res;
      }
    },
    legend: {
      top: 30,
      textStyle: { color: th.textColor, fontSize: 11 },
      data: [
        isZh ? "移入总量 (Zuzüge)" : "Total Inflow (Zuzüge)",
        isZh ? "迁出总量 (Fortzüge)" : "Total Outflow (Fortzüge)",
        isZh ? "净移民差额 (Saldo)" : "Net Migration (Saldo)"
      ]
    },
    grid: { left: 65, right: 35, top: 75, bottom: 45, containLabel: true },
    xAxis: {
      type: "category",
      data: labels,
      axisLabel: { color: th.textColor, fontSize: 10, interval: 1, rotate: 30 },
      axisLine: { lineStyle: { color: th.splitLine } }
    },
    yAxis: {
      type: "value",
      max: 3000000,
      splitLine: { lineStyle: { color: th.splitLine, type: "dashed" } },
      axisLabel: {
        color: th.textColor,
        formatter: (v) => `${(v / 1000).toFixed(0)}k`
      }
    },
    series: [
      {
        name: isZh ? "净移民差额 (Saldo)" : "Net Migration (Saldo)",
        type: "bar",
        data: saldos.map(v => ({
          value: v,
          itemStyle: { color: v >= 0 ? "#10b981" : "#ef4444", borderRadius: [3, 3, 0, 0] }
        })),
        barMaxWidth: 18,
        markArea: {
          itemStyle: { color: "rgba(56, 189, 248, 0.07)" },
          label: { color: th.textColor, fontSize: 10, position: "insideTopLeft", distance: 8 },
          data: [
            [
              { name: isZh ? "阶段1: 常态微增" : "Phase 1: Baseline", xAxis: "2000" },
              { xAxis: "2014" }
            ],
            [
              { name: isZh ? "阶段2: 避难双峰冲击" : "Phase 2: Refugee Peaks", xAxis: "2015" },
              { xAxis: "2022" }
            ],
            [
              { name: isZh ? "阶段3: 急剧收缩" : "Phase 3: Contraction", xAxis: "2023" },
              { xAxis: "2026" }
            ]
          ]
        }
      },
      {
        name: isZh ? "移入总量 (Zuzüge)" : "Total Inflow (Zuzüge)",
        type: "line",
        smooth: true,
        data: inflows,
        itemStyle: { color: "#0284c7" },
        lineStyle: { width: 2.5 },
        symbolSize: 6
      },
      {
        name: isZh ? "迁出总量 (Fortzüge)" : "Total Outflow (Fortzüge)",
        type: "line",
        smooth: true,
        data: outflows,
        itemStyle: { color: "#f59e0b" },
        lineStyle: { width: 2, type: "dashed" },
        symbolSize: 5
      }
    ]
  }, true);
}

// Slide 2: Structural Divergence (DE vs EU vs Non-EU)
function renderChart2() {
  const dom = document.getElementById("pdf-chart-2");
  if (!dom) return;
  if (!DeckCharts.chart2) DeckCharts.chart2 = echarts.init(dom);
  const th = getThemeColors();
  const isZh = DeckState.lang === "zh-CN";

  const db = getDestatisDatabase();
  const data = db.annualTotals || db.annual_totals || [];
  const filtered = data.filter(r => (r.year_num || r.year) >= 2016);
  const labels = filtered.map(r => String(r.year_num || r.year));
  const de = filtered.map(r => r.de_saldo);
  const eu = filtered.map(r => r.eu_saldo);
  const noneu = filtered.map(r => r.noneu_saldo);

  DeckCharts.chart2.setOption({
    title: {
      text: isZh ? "三大互斥群体净迁移走势剪刀差 (2016—2026)" : "Net Migration Divergence: German vs EU vs Non-EU (2016-2026)",
      textStyle: { color: th.titleColor, fontSize: 13, fontWeight: 800 },
      left: "center",
      top: 5
    },
    tooltip: {
      trigger: "axis",
      backgroundColor: th.tooltipBg,
      borderColor: th.tooltipBorder,
      textStyle: { color: th.titleColor },
      axisPointer: { type: "cross" },
      formatter: function(params) {
        let title = params[0].axisValue;
        let res = `<strong>${title}</strong><br/>`;
        params.forEach(p => {
          let val = (p.value !== undefined) ? p.value.toLocaleString() + (isZh ? " 人" : " pers.") : "-";
          res += `${p.marker} ${p.seriesName}: <strong>${val}</strong><br/>`;
        });
        return res;
      }
    },
    legend: {
      top: 30,
      textStyle: { color: th.textColor, fontSize: 11 },
      data: [
        isZh ? "非欧盟第三国 (Drittstaaten)" : "Non-EU Third Countries",
        isZh ? "其他欧盟公民 (EU-Ausländer)" : "Other EU Citizens",
        isZh ? "德国本土公民 (Deutsche)" : "German Citizens"
      ]
    },
    grid: { left: 65, right: 35, top: 75, bottom: 45, containLabel: true },
    xAxis: {
      type: "category",
      data: labels,
      axisLabel: { color: th.textColor, fontSize: 11 },
      axisLine: { lineStyle: { color: th.splitLine } }
    },
    yAxis: {
      type: "value",
      splitLine: { lineStyle: { color: th.splitLine, type: "dashed" } },
      axisLabel: {
        color: th.textColor,
        formatter: (v) => `${(v / 1000).toFixed(0)}k`
      }
    },
    series: [
      {
        name: isZh ? "非欧盟第三国 (Drittstaaten)" : "Non-EU Third Countries",
        type: "line",
        smooth: true,
        data: noneu,
        itemStyle: { color: "#10b981" },
        lineStyle: { width: 3.5 },
        markPoint: {
          data: [{ type: "max", name: "Max" }],
          label: { fontSize: 10 }
        }
      },
      {
        name: isZh ? "其他欧盟公民 (EU-Ausländer)" : "Other EU Citizens",
        type: "line",
        smooth: true,
        data: eu,
        itemStyle: { color: "#38bdf8" },
        lineStyle: { width: 3 }
      },
      {
        name: isZh ? "德国本土公民 (Deutsche)" : "German Citizens",
        type: "line",
        smooth: true,
        data: de,
        itemStyle: { color: "#ef4444" },
        lineStyle: { width: 3 },
        markLine: {
          lineStyle: { color: "#94a3b8", type: "dashed", width: 1.5 },
          data: [{ yAxis: 0, label: { formatter: "净平衡线 0", color: th.textColor } }]
        }
      }
    ]
  }, true);
}

// Slide 3: Micro Ecosystem (2022 vs 2025 Top Nationalities)
function renderChart3() {
  const dom = document.getElementById("pdf-chart-3");
  if (!dom) return;
  if (!DeckCharts.chart3) DeckCharts.chart3 = echarts.init(dom);
  const th = getThemeColors();
  const isZh = DeckState.lang === "zh-CN";

  const categories = isZh
    ? ["印度 (STEM/IT蓝卡)", "越南 (双元制/护理)", "中国 (学术/科研留学生)", "叙利亚 (避难常态化)", "乌克兰 (避难断崖退潮)"]
    : ["India (STEM/IT)", "Vietnam (Vocational/Care)", "China (Academic/R&D)", "Syria (Asylum Baseline)", "Ukraine (Refugee Ebb)"];

  const val2022 = [31700, 12700, 5200, 65000, 960000];
  const val2025 = [38904, 18814, 8160, 20316, 89460];

  DeckCharts.chart3.setOption({
    title: {
      text: isZh ? "重点国籍净移民：2022峰值 vs 2025常态化 (单位: 人)" : "Key Nationalities Net Migration: 2022 Peak vs 2025 (Persons)",
      textStyle: { color: th.titleColor, fontSize: 13, fontWeight: 800 },
      left: "center",
      top: 5
    },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      backgroundColor: th.tooltipBg,
      borderColor: th.tooltipBorder,
      textStyle: { color: th.titleColor },
      formatter: function(params) {
        let res = `<strong>${params[0].axisValue}</strong><br/>`;
        params.forEach(p => {
          res += `${p.marker} ${p.seriesName}: <strong>${p.value.toLocaleString()} 人</strong><br/>`;
        });
        return res;
      }
    },
    legend: {
      top: 30,
      textStyle: { color: th.textColor, fontSize: 11 },
      data: [isZh ? "2022年峰值净移民" : "2022 Peak Net", isZh ? "2025年常态净移民" : "2025 Baseline Net"]
    },
    grid: { left: 20, right: 65, top: 75, bottom: 35, containLabel: true },
    xAxis: {
      type: "value",
      max: 1050000,
      splitLine: { lineStyle: { color: th.splitLine, type: "dashed" } },
      axisLabel: {
        color: th.textColor,
        formatter: (v) => `${(v / 1000).toFixed(0)}k`
      }
    },
    yAxis: {
      type: "category",
      data: categories,
      axisLabel: { color: th.textColor, fontSize: 11 }
    },
    series: [
      {
        name: isZh ? "2022年峰值净移民" : "2022 Peak Net",
        type: "bar",
        data: val2022,
        itemStyle: { color: "rgba(56, 189, 248, 0.45)", borderRadius: [0, 4, 4, 0] },
        barMaxWidth: 16
      },
      {
        name: isZh ? "2025年常态净移民" : "2025 Baseline Net",
        type: "bar",
        data: val2025,
        itemStyle: { color: "#10b981", borderRadius: [0, 4, 4, 0] },
        barMaxWidth: 16,
        label: {
          show: true,
          position: "right",
          color: th.textColor,
          fontSize: 10,
          formatter: (p) => `${(p.value / 1000).toFixed(1)}k`
        }
      }
    ]
  }, true);
}

// Slide 4: Naturalization Explosion (2014-2025)
function renderChart4() {
  const dom = document.getElementById("pdf-chart-4");
  if (!dom) return;
  if (!DeckCharts.chart4) DeckCharts.chart4 = echarts.init(dom);
  const th = getThemeColors();
  const isZh = DeckState.lang === "zh-CN";

  const db = getDestatisDatabase();
  const data = (db.naturalizations && db.naturalizations.annual_totals) || [];
  const recent = data.filter(r => r.year >= 2014);
  const years = recent.map(r => String(r.year));
  const counts = recent.map(r => r.count);

  DeckCharts.chart4.setOption({
    title: {
      text: isZh ? "德国历年入籍规模与2024新国籍法激化效应 (2014—2025)" : "Annual Naturalizations & 2024 StAG Dual-Citizenship Surge",
      textStyle: { color: th.titleColor, fontSize: 13, fontWeight: 800 },
      left: "center",
      top: 5
    },
    tooltip: {
      trigger: "axis",
      backgroundColor: th.tooltipBg,
      borderColor: th.tooltipBorder,
      textStyle: { color: th.titleColor },
      formatter: (p) => `<strong>${p[0].axisValue}</strong><br/>入籍人数: <strong>${p[0].value.toLocaleString()} 人</strong>`
    },
    grid: { left: 65, right: 35, top: 65, bottom: 40, containLabel: true },
    xAxis: {
      type: "category",
      data: years,
      axisLabel: { color: th.textColor, fontSize: 11 },
      axisLine: { lineStyle: { color: th.splitLine } }
    },
    yAxis: {
      type: "value",
      max: 360000,
      splitLine: { lineStyle: { color: th.splitLine, type: "dashed" } },
      axisLabel: { color: th.textColor, formatter: (v) => `${(v / 1000).toFixed(0)}k` }
    },
    series: [{
      name: isZh ? "入籍人数" : "Naturalizations",
      type: "bar",
      barMaxWidth: 32,
      data: counts.map((v, i) => {
        const yr = parseInt(years[i]);
        return {
          value: v,
          itemStyle: {
            color: yr >= 2024 ? "#818cf8" : "rgba(129, 140, 248, 0.45)",
            borderRadius: [4, 4, 0, 0]
          }
        };
      }),
      label: {
        show: true,
        position: "top",
        color: th.textColor,
        fontSize: 10,
        formatter: (p) => p.name === "2024" ? "" : `${(p.value / 1000).toFixed(0)}k`
      },
      markPoint: {
        symbolOffset: [0, -10],
        data: [{
          name: "新法生效",
          coord: ["2024", 292000],
          value: isZh ? "2024新法放开双国籍" : "Dual-Citizenship Reform",
          itemStyle: { color: "#6366f1" },
          label: { fontSize: 10, color: "#fff" }
        }]
      }
    }]
  }, true);
}

// Slide 5: Macro Labor Deficit Balance Model
function renderChart5() {
  const dom = document.getElementById("pdf-chart-5");
  if (!dom) return;
  if (!DeckCharts.chart5) DeckCharts.chart5 = echarts.init(dom);
  const th = getThemeColors();
  const isZh = DeckState.lang === "zh-CN";

  const categories = isZh
    ? ["退休硬缺口 (Demand)", "非欧盟引才 (Supply)", "本土延迟退休/女性", "AI/自动化生产率替代", "动态净平衡线"]
    : ["Retirement Deficit", "Non-EU Skilled Labor", "Domestic Extension/Female", "AI & Automation", "Net Balance Line"];

  const values = [-400000, 150000, 90000, 160000, 0];
  const colors = ["#ef4444", "#10b981", "#38bdf8", "#f59e0b", "#a855f7"];

  DeckCharts.chart5.setOption({
    title: {
      text: isZh ? "德国年均40万劳动力硬缺口对冲推演模型 (2025—2035)" : "Germany Annual 400k Labor Deficit Mitigation Model",
      textStyle: { color: th.titleColor, fontSize: 13, fontWeight: 800 },
      left: "center",
      top: 5
    },
    tooltip: {
      trigger: "item",
      backgroundColor: th.tooltipBg,
      borderColor: th.tooltipBorder,
      textStyle: { color: th.titleColor },
      formatter: (p) => `<strong>${p.name}</strong>: ${p.value.toLocaleString()} 人/年`
    },
    grid: { left: 20, right: 60, top: 60, bottom: 40, containLabel: true },
    xAxis: {
      type: "value",
      min: -460000,
      max: 200000,
      splitLine: { lineStyle: { color: th.splitLine, type: "dashed" } },
      axisLabel: { color: th.textColor, formatter: (v) => `${(v / 1000).toFixed(0)}k` }
    },
    yAxis: {
      type: "category",
      data: categories,
      axisLabel: { color: th.textColor, fontSize: 11 }
    },
    series: [{
      type: "bar",
      barMaxWidth: 24,
      data: values.map((v, i) => ({
        value: v,
        itemStyle: { color: colors[i], borderRadius: v < 0 ? [4, 0, 0, 4] : [0, 4, 4, 0] }
      })),
      label: {
        show: true,
        position: (v) => v.value < 0 ? "left" : "right",
        color: th.textColor,
        fontSize: 10,
        formatter: (p) => `${p.value > 0 ? '+' : ''}${(p.value / 1000).toFixed(0)}k`
      }
    }]
  }, true);
}

function renderAllCharts() {
  renderChart1();
  renderChart2();
  renderChart3();
  renderChart4();
  renderChart5();
}

// -------------------------------------------------------------------------
// INITIALIZATION
// -------------------------------------------------------------------------
window.addEventListener("DOMContentLoaded", () => {
  applyTheme(DeckState.theme);
  applyLanguage(DeckState.lang);

  // Wire controls
  const btnZh = document.getElementById("deck-lang-zh");
  const btnEn = document.getElementById("deck-lang-en");
  if (btnZh) btnZh.addEventListener("click", () => applyLanguage("zh-CN"));
  if (btnEn) btnEn.addEventListener("click", () => applyLanguage("en"));

  const btnTheme = document.getElementById("deck-theme-toggle");
  if (btnTheme) btnTheme.addEventListener("click", () => {
    applyTheme(DeckState.theme === "dark" ? "light" : "dark");
  });

  // Window resize handler
  window.addEventListener("resize", () => {
    Object.values(DeckCharts).forEach(c => c && c.resize());
  });

  // Pre-print hook to resize cleanly
  window.addEventListener("beforeprint", () => {
    Object.values(DeckCharts).forEach(c => c && c.resize());
  });
});
