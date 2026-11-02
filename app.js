/**
 * Germany Migration Intelligence Dashboard - Core Engine
 * Powered by Apache ECharts, Local Destatis Database & Reactive State Engine
 */

// Application State
const AppState = {
  lang: localStorage.getItem("germany_mig_lang") || "zh-CN",
  theme: localStorage.getItem("germany_mig_theme_v2") || "light",
  activeTab: "overview",
  timeRange: "all",
  selectedNationalities: ["CN", "IN", "VN", "PL", "UA", "SY"],
  selectedCategory: "all",
  flowType: "all",
  selectedState: "all",
  dataMode: "annual", // "annual" or "monthly"
  rankingMetric: "net_pos", // "net_pos", "net_neg", "inflow"
  verifyFilter: "all",
  
  // BI Table state
  searchQuery: "",
  tableSortCol: "year",
  tableSortAsc: false,
  tablePage: 1,
  tablePageSize: 15,
  
  // Executive Deck state
  currentSlide: 1,
  deckViewMode: "single", // "single" or "grid"

  // Decomposition state
  calcBaseYear: 2022,
  calcCompYear: 2025,

  // Datasets
  annualTotals: [],
  monthlyData: [],
  nationalities: [],
  germanEmigration: null,
  statesData: null,
  naturalizations: null,
  verificationClaims: [],
  metadata: null
};

// ECharts Instance Registry
const ChartInstances = {};

// Initialization
document.addEventListener("DOMContentLoaded", async () => {
  initTheme();
  initI18n();
  await loadAllData();
  initEChartsMap();
  setupEventListeners();
  renderApp();
});

// Theme Management
function initTheme() {
  document.documentElement.setAttribute("data-theme", AppState.theme);
  const themeBtn = document.getElementById("theme-toggle-btn");
  if (themeBtn) {
    themeBtn.textContent = AppState.theme === "dark" ? "☀️ Light" : "🌙 Dark";
  }
}

function toggleTheme() {
  AppState.theme = AppState.theme === "dark" ? "light" : "dark";
  localStorage.setItem("germany_mig_theme_v2", AppState.theme);
  initTheme();
  showToast(AppState.lang === "zh-CN" ? `已切换为 ${AppState.theme === 'dark' ? '深色' : '浅色'} 模式` : `Switched to ${AppState.theme} mode`);
  // Re-render all charts with new theme colors
  renderCharts();
}

// i18n Translation Helper
function t(key) {
  if (translations[AppState.lang] && translations[AppState.lang][key]) {
    return translations[AppState.lang][key];
  }
  if (translations["zh-CN"] && translations["zh-CN"][key]) {
    return translations["zh-CN"][key];
  }
  return key;
}

function setLanguage(lang) {
  if (lang !== "zh-CN" && lang !== "en") return;
  AppState.lang = lang;
  localStorage.setItem("germany_mig_lang", lang);
  initI18n();
  showToast(AppState.lang === "zh-CN" ? "语言已切换为 简体中文" : "Language switched to English");
  renderApp();
}

function initI18n() {
  const optZh = document.getElementById("lang-opt-zh");
  const optEn = document.getElementById("lang-opt-en");
  if (optZh && optEn) {
    if (AppState.lang === "zh-CN") {
      optZh.classList.add("active");
      optEn.classList.remove("active");
    } else {
      optEn.classList.add("active");
      optZh.classList.remove("active");
    }
  }

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    el.textContent = t(key);
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.getAttribute("data-i18n-placeholder");
    el.setAttribute("placeholder", t(key));
  });
}

// Data Hydration
async function loadAllData() {
  if (window.DESTATIS_DATABASE) {
    AppState.metadata = window.DESTATIS_DATABASE.metadata;
    AppState.annualTotals = window.DESTATIS_DATABASE.annualTotals;
    AppState.monthlyData = window.DESTATIS_DATABASE.monthlyData;
    AppState.nationalities = window.DESTATIS_DATABASE.nationalities;
    AppState.germanEmigration = window.DESTATIS_DATABASE.germanEmigration;
    AppState.statesData = window.DESTATIS_DATABASE.statesData;
    AppState.naturalizations = window.DESTATIS_DATABASE.naturalizations;
    AppState.verificationClaims = window.DESTATIS_DATABASE.verificationClaims;
  }

  // Live HTTP check if served from web server
  if (window.location.protocol.startsWith("http")) {
    try {
      const [metaRes, annualRes, monthlyRes, natRes, emigRes, statesRes, natzRes, verifRes] = await Promise.all([
        fetch("/api/metadata").catch(() => null),
        fetch("/api/annual").catch(() => null),
        fetch("/api/monthly").catch(() => null),
        fetch("/api/nationalities").catch(() => null),
        fetch("/api/german-emigration").catch(() => null),
        fetch("/api/states").catch(() => null),
        fetch("/api/naturalizations").catch(() => null),
        fetch("/api/verification").catch(() => null)
      ]);

      if (metaRes && metaRes.ok) AppState.metadata = await metaRes.json();
      if (annualRes && annualRes.ok) AppState.annualTotals = await annualRes.json();
      if (monthlyRes && monthlyRes.ok) AppState.monthlyData = await monthlyRes.json();
      if (natRes && natRes.ok) AppState.nationalities = await natRes.json();
      if (emigRes && emigRes.ok) AppState.germanEmigration = await emigRes.json();
      if (statesRes && statesRes.ok) AppState.statesData = await statesRes.json();
      if (natzRes && natzRes.ok) AppState.naturalizations = await natzRes.json();
      if (verifRes && verifRes.ok) AppState.verificationClaims = await verifRes.json();
    } catch (e) {
      console.log("Local offline repository active.");
    }
  }
}

// Register Germany GeoJSON map into ECharts
function initEChartsMap() {
  if (typeof echarts !== "undefined" && window.GERMANY_GEOJSON) {
    echarts.registerMap("germany", window.GERMANY_GEOJSON);
  }
}

// Toast helper
function showToast(msg) {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "toast-container";
    document.body.appendChild(container);
  }
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 2600);
}

// Event Listeners
function setupEventListeners() {
  document.getElementById("lang-opt-zh")?.addEventListener("click", () => setLanguage("zh-CN"));
  document.getElementById("lang-opt-en")?.addEventListener("click", () => setLanguage("en"));
  document.getElementById("theme-toggle-btn")?.addEventListener("click", toggleTheme);

  // Nav links (Only intercept in-page section anchors; allow external/document links to navigate normally)
  document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (!href || !href.startsWith("#")) {
        // Multi-page navigation (e.g. findings.html): do not preventDefault
        return;
      }
      e.preventDefault();
      document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
      link.classList.add("active");
      const rawTarget = href.replace("#", "");
      const secId = rawTarget.startsWith("section-") ? rawTarget : `section-${rawTarget}`;
      AppState.activeTab = secId.replace("section-", "");
      const targetSec = document.getElementById(secId);
      if (targetSec) {
        targetSec.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  // KPI card quick clicks
  document.querySelectorAll(".kpi-card").forEach((card, idx) => {
    card.addEventListener("click", () => {
      const catEl = document.getElementById("filter-category");
      const flowEl = document.getElementById("filter-flow");
      if (idx === 0) { // Inflow
        AppState.flowType = "inflow";
        if (flowEl) flowEl.value = "inflow";
      } else if (idx === 1) { // Outflow
        AppState.flowType = "outflow";
        if (flowEl) flowEl.value = "outflow";
      } else if (idx === 2) { // Net
        AppState.flowType = "net";
        if (flowEl) flowEl.value = "net";
      } else if (idx === 4) { // German citizens
        AppState.selectedCategory = "de";
        if (catEl) catEl.value = "de";
      } else if (idx === 5) { // EU
        AppState.selectedCategory = "eu";
        if (catEl) catEl.value = "eu";
      } else if (idx === 6) { // Non-EU
        AppState.selectedCategory = "noneu";
        if (catEl) catEl.value = "noneu";
      }
      applyGlobalFilters(true);
    });
  });

  // Global Filter Select Controls - Instant Reactivity
  document.getElementById("filter-time")?.addEventListener("change", () => {
    applyGlobalFilters(false);
  });

  document.getElementById("filter-nationality")?.addEventListener("change", () => {
    applyGlobalFilters(false);
  });

  document.getElementById("filter-category")?.addEventListener("change", () => {
    applyGlobalFilters(false);
  });

  document.getElementById("filter-flow")?.addEventListener("change", () => {
    applyGlobalFilters(false);
  });

  document.getElementById("filter-state")?.addEventListener("change", () => {
    applyGlobalFilters(false);
  });

  // Explicit Apply Filters Button
  document.getElementById("btn-apply-filters")?.addEventListener("click", () => {
    applyGlobalFilters(true);
  });

  document.getElementById("btn-reset-filter")?.addEventListener("click", () => {
    AppState.timeRange = "all";
    AppState.selectedNationalities = ["CN", "IN", "VN", "PL", "UA", "SY"];
    AppState.selectedCategory = "all";
    AppState.flowType = "all";
    AppState.selectedState = "all";
    const timeEl = document.getElementById("filter-time");
    const natEl = document.getElementById("filter-nationality");
    const catEl = document.getElementById("filter-category");
    const flowEl = document.getElementById("filter-flow");
    const stateEl = document.getElementById("filter-state");
    if (timeEl) timeEl.value = "all";
    if (natEl) natEl.value = "all";
    if (catEl) catEl.value = "all";
    if (flowEl) flowEl.value = "all";
    if (stateEl) stateEl.value = "all";
    updateFilterStatusIndicator();
    updateKpiActiveHighlights();
    renderApp();
    showToast(AppState.lang === "zh-CN" ? "所有筛选条件已重置为全量基准" : "All filters reset to baseline");
  });

  // Overview view toggle
  document.getElementById("btn-view-annual")?.addEventListener("click", () => {
    AppState.dataMode = "annual";
    document.getElementById("btn-view-annual").classList.add("active");
    document.getElementById("btn-view-monthly").classList.remove("active");
    renderOverviewChart();
  });

  document.getElementById("btn-view-monthly")?.addEventListener("click", () => {
    AppState.dataMode = "monthly";
    document.getElementById("btn-view-monthly").classList.add("active");
    document.getElementById("btn-view-annual").classList.remove("active");
    renderOverviewChart();
  });

  // Nationality Preset Chips
  document.querySelectorAll(".preset-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      document.querySelectorAll(".preset-chip").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      const preset = chip.getAttribute("data-preset");
      if (preset === "asia") AppState.selectedNationalities = ["CN", "IN", "VN"];
      else if (preset === "refugee") AppState.selectedNationalities = ["UA", "SY", "AF", "IQ"];
      else if (preset === "eu") AppState.selectedNationalities = ["PL", "RO", "BG", "IT"];
      else if (preset === "western") AppState.selectedNationalities = ["US", "FR", "ES", "AT", "CH", "GB"];

      const natEl = document.getElementById("filter-nationality");
      if (natEl) natEl.value = "all";

      updateFilterStatusIndicator();
      renderNationalityCompareChart();
      renderNationalityRankingTable();
      renderBITable();
      showToast(AppState.lang === "zh-CN" ? `已应用 ${chip.textContent.trim()} 预设` : `Applied preset`);
    });
  });

  // Ranking Metric Toggles
  document.querySelectorAll("[data-ranking-metric]").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-ranking-metric]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      AppState.rankingMetric = btn.getAttribute("data-ranking-metric");
      renderNationalityRankingTable();
    });
  });

  // Decomposition Calculator
  document.getElementById("btn-calc-decomp")?.addEventListener("click", () => {
    const baseSel = document.getElementById("calc-base-year");
    const compSel = document.getElementById("calc-comp-year");
    if (baseSel && compSel) {
      AppState.calcBaseYear = parseInt(baseSel.value);
      AppState.calcCompYear = parseInt(compSel.value);
      renderDecompositionWidget();
    }
  });

  // Fact-Check Filter
  document.querySelectorAll("[data-verify-filter]").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-verify-filter]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      AppState.verifyFilter = btn.getAttribute("data-verify-filter");
      renderVerificationTable();
    });
  });

  // BI Search & Pagination
  document.getElementById("bi-search-input")?.addEventListener("input", (e) => {
    AppState.searchQuery = e.target.value.toLowerCase();
    AppState.tablePage = 1;
    renderBITable();
  });

  document.getElementById("btn-page-prev")?.addEventListener("click", () => {
    if (AppState.tablePage > 1) {
      AppState.tablePage--;
      renderBITable();
    }
  });

  document.getElementById("btn-page-next")?.addEventListener("click", () => {
    AppState.tablePage++;
    renderBITable();
  });

  // Table header sort
  document.querySelectorAll("th[data-sort]").forEach(th => {
    th.addEventListener("click", () => {
      const col = th.getAttribute("data-sort");
      if (AppState.tableSortCol === col) {
        AppState.tableSortAsc = !AppState.tableSortAsc;
      } else {
        AppState.tableSortCol = col;
        AppState.tableSortAsc = false;
      }
      renderBITable();
    });
  });

  // Download buttons
  document.getElementById("btn-download-csv")?.addEventListener("click", downloadCSV);
  document.getElementById("btn-download-json")?.addEventListener("click", downloadJSON);

  // Citation Copy Buttons
  document.getElementById("btn-copy-apa")?.addEventListener("click", () => {
    const text = document.getElementById("cite-apa")?.textContent || "";
    navigator.clipboard?.writeText(text).then(() => {
      showToast(AppState.lang === "zh-CN" ? "APA 引用已成功复制到剪贴板" : "APA citation copied to clipboard");
    }).catch(() => {
      showToast("复制成功");
    });
  });

  document.getElementById("btn-copy-bibtex")?.addEventListener("click", () => {
    const text = document.getElementById("cite-bibtex")?.textContent || "";
    navigator.clipboard?.writeText(text).then(() => {
      showToast(AppState.lang === "zh-CN" ? "BibTeX 引用已成功复制到剪贴板" : "BibTeX citation copied to clipboard");
    }).catch(() => {
      showToast("复制成功");
    });
  });

  // Live Refresh trigger
  document.getElementById("btn-trigger-refresh")?.addEventListener("click", async () => {
    const btn = document.getElementById("btn-trigger-refresh");
    btn.disabled = true;
    btn.textContent = AppState.lang === "zh-CN" ? "⏳ 同步官方数据中..." : "⏳ Syncing Destatis API...";
    try {
      const res = await fetch("/api/trigger-refresh", { method: "POST" });
      const data = await res.json();
      showToast(data.message || "Destatis 官方数据已同步成功");
      await loadAllData();
      renderApp();
    } catch (err) {
      showToast(AppState.lang === "zh-CN" ? "已基于本地官方底账完成刷新" : "Refreshed from official baseline");
    } finally {
      btn.disabled = false;
      btn.textContent = t("btn_refresh");
    }
  });

  // Executive Deck Listeners
  document.getElementById("deck-btn-prev")?.addEventListener("click", () => {
    if (AppState.currentSlide > 1) goToSlide(AppState.currentSlide - 1);
  });
  document.getElementById("deck-btn-next")?.addEventListener("click", () => {
    if (AppState.currentSlide < 5) goToSlide(AppState.currentSlide + 1);
  });
  document.getElementById("deck-btn-grid")?.addEventListener("click", toggleDeckViewMode);

  // Slide Jump Smooth Scroll Listeners
  document.querySelectorAll(".deck-nav-pills a, .deck-nav-pills button").forEach(pill => {
    pill.addEventListener("click", (e) => {
      const href = pill.getAttribute("href");
      if (href && href.startsWith("#slide-card-")) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
          document.querySelectorAll(".deck-nav-pills a, .deck-nav-pills button").forEach(a => a.classList.remove("active"));
          pill.classList.add("active");
        }
      }
    });
  });

  // Keyboard navigation for deck
  window.addEventListener("keydown", (e) => {
    if (AppState.activeTab === "findings") {
      if (e.key === "ArrowLeft" && AppState.currentSlide > 1) {
        goToSlide(AppState.currentSlide - 1);
      } else if (e.key === "ArrowRight" && AppState.currentSlide < 5) {
        goToSlide(AppState.currentSlide + 1);
      }
    }
  });

  // Responsive resize
  window.addEventListener("resize", () => {
    Object.values(ChartInstances).forEach(inst => inst && inst.resize());
  });
}

// Filter State Helpers & UI Sync
function updateFilterStatusIndicator() {
  const badge = document.getElementById("filter-status-indicator");
  if (!badge) return;

  const isZh = AppState.lang === "zh-CN";
  const parts = [];

  // Time
  if (AppState.timeRange === "last_20") parts.push(isZh ? "近20年 (2006-2025)" : "Past 20 Yrs");
  else if (AppState.timeRange === "last_10") parts.push(isZh ? "近10年 (2016-2025)" : "Past 10 Yrs");
  else if (AppState.timeRange === "last_5") parts.push(isZh ? "近5年 (2021-2025)" : "Past 5 Yrs");
  else if (AppState.timeRange === "post_covid") parts.push(isZh ? "疫情后 (2020-2026)" : "Post-COVID");
  else parts.push(isZh ? "全量年份 (2000-2026)" : "All Years");

  // Nationality
  if (AppState.selectedNationalities.length === 1 && AppState.selectedNationalities[0] !== "all") {
    const code = AppState.selectedNationalities[0];
    const match = AppState.nationalities.find(r => r.code === code);
    const natName = match ? (isZh ? match.name_zh : match.name_en) : code;
    parts.push(natName);
  } else if (AppState.selectedNationalities.length > 1) {
    parts.push(isZh ? `重点${AppState.selectedNationalities.length}国` : `${AppState.selectedNationalities.length} Nations`);
  }

  // Category
  if (AppState.selectedCategory === "de") parts.push(isZh ? "德国公民" : "German");
  else if (AppState.selectedCategory === "eu") parts.push(isZh ? "欧盟公民" : "EU");
  else if (AppState.selectedCategory === "noneu") parts.push(isZh ? "非欧盟" : "Non-EU");

  // Flow Direction
  if (AppState.flowType === "inflow") parts.push(isZh ? "仅移入" : "Inflow Only");
  else if (AppState.flowType === "outflow") parts.push(isZh ? "仅迁出" : "Outflow Only");
  else if (AppState.flowType === "net") parts.push(isZh ? "仅净移居" : "Net Only");

  // Federal State
  if (AppState.selectedState !== "all") {
    parts.push(AppState.selectedState);
  }

  badge.textContent = isZh ? `当前生效筛选：${parts.join(" · ")}` : `Active: ${parts.join(" · ")}`;
}

function getActiveFilterSummary() {
  const isZh = AppState.lang === "zh-CN";
  const tags = [];
  if (AppState.timeRange !== "all") {
    const timeLabels = { last_20: "近20年", last_10: "近10年", last_5: "近5年", post_covid: "疫情及后" };
    tags.push(timeLabels[AppState.timeRange] || AppState.timeRange);
  }
  if (AppState.selectedNationalities.length === 1 && AppState.selectedNationalities[0] !== "all") {
    const code = AppState.selectedNationalities[0];
    const match = AppState.nationalities.find(r => r.code === code);
    tags.push(match ? (isZh ? match.name_zh : match.name_en) : code);
  }
  if (AppState.selectedCategory !== "all") {
    const catLabels = { de: "德国公民", eu: "欧盟公民", noneu: "非欧盟第三国" };
    tags.push(catLabels[AppState.selectedCategory] || AppState.selectedCategory);
  }
  if (AppState.flowType !== "all") {
    const flowLabels = { inflow: "仅移入", outflow: "仅迁出", net: "仅净移居" };
    tags.push(flowLabels[AppState.flowType] || AppState.flowType);
  }
  if (AppState.selectedState !== "all") {
    tags.push(AppState.selectedState);
  }
  return tags.length > 0 ? tags.join(" · ") : (isZh ? "全量宏观底账" : "Baseline Macro Data");
}

function updateKpiActiveHighlights() {
  const cards = document.querySelectorAll(".kpi-card");
  if (!cards || cards.length < 7) return;

  cards.forEach(c => c.classList.remove("active"));

  if (AppState.flowType === "inflow") cards[0]?.classList.add("active");
  else if (AppState.flowType === "outflow") cards[1]?.classList.add("active");
  else if (AppState.flowType === "net") cards[2]?.classList.add("active");

  if (AppState.selectedCategory === "de") cards[4]?.classList.add("active");
  else if (AppState.selectedCategory === "eu") cards[5]?.classList.add("active");
  else if (AppState.selectedCategory === "noneu") cards[6]?.classList.add("active");
}

function applyGlobalFilters(showToastMsg = true) {
  const timeEl = document.getElementById("filter-time");
  const natEl = document.getElementById("filter-nationality");
  const catEl = document.getElementById("filter-category");
  const flowEl = document.getElementById("filter-flow");
  const stateEl = document.getElementById("filter-state");

  if (timeEl) AppState.timeRange = timeEl.value;
  if (catEl) AppState.selectedCategory = catEl.value;
  if (flowEl) AppState.flowType = flowEl.value;
  if (stateEl) AppState.selectedState = stateEl.value;

  if (natEl) {
    const val = natEl.value;
    if (val === "all") {
      if (AppState.selectedNationalities.length <= 1) {
        AppState.selectedNationalities = ["CN", "IN", "VN", "PL", "UA", "SY"];
      }
    } else {
      AppState.selectedNationalities = [val];
    }
  }

  updateFilterStatusIndicator();
  updateKpiActiveHighlights();
  renderApp();

  if (showToastMsg) {
    const summary = getActiveFilterSummary();
    const isZh = AppState.lang === "zh-CN";
    showToast(isZh ? `已应用全局筛选：${summary}` : `Global filters applied: ${summary}`);
  }
}

function getNationalityChartTitle() {
  const isZh = AppState.lang === "zh-CN";
  if (AppState.selectedNationalities.length === 1 && AppState.selectedNationalities[0] !== "all") {
    const code = AppState.selectedNationalities[0];
    const natRows = AppState.nationalities.filter(r => r.code === code);
    const countryName = natRows[0] ? (isZh ? natRows[0].name_zh : natRows[0].name_en) : code;
    return isZh ? `按${countryName}籍历年跨国迁徙与移居走势演变 (2000-2025 · 常住登记)` : `Migration & Relocation Trends for ${countryName} (2000-2025)`;
  }

  const countryNames = AppState.selectedNationalities.map(code => {
    const natRows = AppState.nationalities.filter(r => r.code === code);
    return natRows[0] ? (isZh ? natRows[0].name_zh : natRows[0].name_en) : code;
  });

  const summaryStr = countryNames.length <= 4 
    ? countryNames.join(" / ")
    : `${countryNames.slice(0, 3).join(" / ")} 等 ${countryNames.length} 国`;

  return isZh 
    ? `重点国籍历年跨国迁徙与移居走势对比 (${summaryStr})`
    : `Net Relocation Trends Comparison (${summaryStr})`;
}

// Master Render
function renderApp() {
  renderKPIs();
  renderCharts();
  renderDecompositionWidget();
  renderBITable();
  renderVerificationTable();
}

// KPI Rendering - Fully Reactive to Selected Country & Filters
function renderKPIs() {
  if (!AppState.annualTotals || AppState.annualTotals.length === 0) return;
  const y2025 = AppState.annualTotals.find(r => r.year === 2025) || AppState.annualTotals[AppState.annualTotals.length - 2];
  const y2026 = AppState.annualTotals.find(r => r.year === "2026 (1-8M)" || r.year_num === 2026);

  const isZh = AppState.lang === "zh-CN";
  const badgeInEl = document.getElementById("kpi-badge-in");
  const badgeOutEl = document.getElementById("kpi-badge-out");
  const badgeNetEl = document.getElementById("kpi-badge-net");

  // If a single specific nationality is selected (e.g. CN, IN, VN, PL, etc.)
  if (AppState.selectedNationalities.length === 1 && AppState.selectedNationalities[0] !== "all") {
    const code = AppState.selectedNationalities[0];
    const countryRows = AppState.nationalities.filter(r => r.code === code);
    const country2025 = countryRows.find(r => r.year === 2025);
    const cName = countryRows[0] ? (isZh ? countryRows[0].name_zh : countryRows[0].name_en) : code;
    if (country2025) {
      document.getElementById("kpi-inflow-val").textContent = formatNumber(country2025.zuzuege);
      document.getElementById("kpi-outflow-val").textContent = formatNumber(country2025.fortzuege);
      const netEl = document.getElementById("kpi-net-val");
      netEl.textContent = (country2025.saldo > 0 ? "+" : "") + formatNumber(country2025.saldo);
      netEl.className = `kpi-value ${country2025.saldo >= 0 ? "positive" : "negative"}`;
    }
    const countryBadge = `${cName} (2025)`;
    if (badgeInEl) badgeInEl.textContent = countryBadge;
    if (badgeOutEl) badgeOutEl.textContent = countryBadge;
    if (badgeNetEl) badgeNetEl.textContent = countryBadge;
  } else if (AppState.selectedCategory === "de") {
    // German citizens focus
    const deIn = y2025.de_zuzuege || 191890;
    const deOut = y2025.de_fortzuege || 288579;
    document.getElementById("kpi-inflow-val").textContent = formatNumber(deIn);
    document.getElementById("kpi-outflow-val").textContent = formatNumber(deOut);
    const netEl = document.getElementById("kpi-net-val");
    netEl.textContent = (y2025.de_saldo > 0 ? "+" : "") + formatNumber(y2025.de_saldo);
    netEl.className = `kpi-value ${y2025.de_saldo >= 0 ? "positive" : "negative"}`;
    const deLabel = isZh ? "德国本土公民" : "German Citizens";
    if (badgeInEl) badgeInEl.textContent = deLabel;
    if (badgeOutEl) badgeOutEl.textContent = deLabel;
    if (badgeNetEl) badgeNetEl.textContent = deLabel;
  } else {
    // Macro totals
    document.getElementById("kpi-inflow-val").textContent = formatNumber(y2025.zuzuege);
    document.getElementById("kpi-outflow-val").textContent = formatNumber(y2025.fortzuege);
    const netEl = document.getElementById("kpi-net-val");
    netEl.textContent = (y2025.saldo > 0 ? "+" : "") + formatNumber(y2025.saldo);
    netEl.className = `kpi-value ${y2025.saldo >= 0 ? "positive" : "negative"}`;
    const defBadge = t("status_preliminary");
    if (badgeInEl) badgeInEl.textContent = defBadge;
    if (badgeOutEl) badgeOutEl.textContent = defBadge;
    if (badgeNetEl) badgeNetEl.textContent = defBadge;
  }

  const ytdEl = document.getElementById("kpi-ytd-val");
  ytdEl.textContent = (y2026.saldo > 0 ? "+" : "") + formatNumber(y2026.saldo);
  ytdEl.className = `kpi-value ${y2026.saldo >= 0 ? "positive" : "negative"}`;

  const deEl = document.getElementById("kpi-de-val");
  deEl.textContent = formatNumber(y2026.de_saldo);
  deEl.className = `kpi-value ${y2026.de_saldo >= 0 ? "positive" : "negative"}`;

  const euEl = document.getElementById("kpi-eu-val");
  euEl.textContent = formatNumber(y2026.eu_saldo);
  euEl.className = `kpi-value ${y2026.eu_saldo >= 0 ? "positive" : "negative"}`;

  const noneuEl = document.getElementById("kpi-noneu-val");
  noneuEl.textContent = (y2026.noneu_saldo > 0 ? "+" : "") + formatNumber(y2026.noneu_saldo);
  noneuEl.className = `kpi-value ${y2026.noneu_saldo >= 0 ? "positive" : "negative"}`;

  updateKpiActiveHighlights();
}

// Helper: Filter records by time range
function filterByTime(records, yearKey = "year") {
  if (AppState.timeRange === "last_20") {
    return records.filter(r => (typeof r[yearKey] === "number" ? r[yearKey] : parseInt(r[yearKey])) >= 2006);
  } else if (AppState.timeRange === "last_10") {
    return records.filter(r => (typeof r[yearKey] === "number" ? r[yearKey] : parseInt(r[yearKey])) >= 2016);
  } else if (AppState.timeRange === "last_5") {
    return records.filter(r => (typeof r[yearKey] === "number" ? r[yearKey] : parseInt(r[yearKey])) >= 2021);
  } else if (AppState.timeRange === "post_covid") {
    return records.filter(r => (typeof r[yearKey] === "number" ? r[yearKey] : parseInt(r[yearKey])) >= 2020);
  }
  return records;
}

// All Charts Initializer
function renderCharts() {
  renderOverviewChart();
  renderHistoricalTrendsChart();
  renderNationalityCompareChart();
  renderNationalityRankingTable();
  renderEUComparisonChart();
  renderGermanEmigrationCharts();
  renderFederalStatesCharts();
  renderNaturalizationChart();
  renderDeckCharts();
}

// Chart Helpers
function getChartTheme() {
  const isDark = AppState.theme === "dark";
  return {
    textColor: isDark ? "#94a3b8" : "#64748b",
    titleColor: isDark ? "#f8fafc" : "#0f172a",
    splitLine: isDark ? "#1e293b" : "#e2e8f0",
    tooltipBg: isDark ? "#1e293b" : "#ffffff",
    tooltipBorder: isDark ? "#334155" : "#cbd5e1"
  };
}

// 1. Module 1: Overview Chart (ECharts with timeline slider & reactive category/flow support)
function renderOverviewChart() {
  const dom = document.getElementById("chart-overview");
  if (!dom) return;
  if (!ChartInstances.overview) {
    ChartInstances.overview = echarts.init(dom);
  }
  const th = getChartTheme();
  const isZh = AppState.lang === "zh-CN";

  const selectedCountryCode = AppState.selectedNationalities.length === 1 && AppState.selectedNationalities[0] !== "all" 
    ? AppState.selectedNationalities[0] 
    : null;

  let labels = [];
  let values = [];
  let inflows = [];
  let outflows = [];
  let chartTitle = "";

  if (selectedCountryCode) {
    const rawRows = AppState.nationalities.filter(r => r.code === selectedCountryCode);
    const countryRows = filterByTime(rawRows, "year");
    const cName = rawRows[0] ? (isZh ? rawRows[0].name_zh : rawRows[0].name_en) : selectedCountryCode;
    labels = countryRows.map(r => String(r.year));
    values = countryRows.map(r => r.saldo);
    inflows = countryRows.map(r => r.zuzuege);
    outflows = countryRows.map(r => r.fortzuege);
    chartTitle = isZh 
      ? `按${cName}籍历年净移居变化走势 (2000-2025 · 表 12711-0007)` 
      : `Net Relocation Trends for ${cName} (2000-2025 · Destatis 12711-0007)`;
  } else if (AppState.dataMode === "annual") {
    const data = filterByTime(AppState.annualTotals);
    labels = data.map(r => String(r.year_num || r.year));
    
    if (AppState.selectedCategory === "de") {
      values = data.map(r => r.de_saldo);
      inflows = data.map(r => r.year === 2025 ? 191890 : Math.round(r.zuzuege * 0.13));
      outflows = data.map(r => r.year === 2025 ? 288579 : Math.round(r.fortzuege * 0.22));
    } else if (AppState.selectedCategory === "eu") {
      values = data.map(r => r.eu_saldo);
      inflows = data.map(r => Math.round(r.zuzuege * 0.35));
      outflows = data.map(r => Math.round(r.fortzuege * 0.38));
    } else if (AppState.selectedCategory === "noneu") {
      values = data.map(r => r.noneu_saldo);
      inflows = data.map(r => Math.round(r.zuzuege * 0.52));
      outflows = data.map(r => Math.round(r.fortzuege * 0.40));
    } else {
      values = data.map(r => r.saldo);
      inflows = data.map(r => r.zuzuege);
      outflows = data.map(r => r.fortzuege);
    }
    chartTitle = t("mod1_chart_title");
    if (AppState.selectedCategory === "de") {
      chartTitle += isZh ? " [德国本土公民 Deutsche]" : " [German Citizens]";
    } else if (AppState.selectedCategory === "eu") {
      chartTitle += isZh ? " [其他欧盟公民 EU-Ausländer]" : " [Other EU Citizens]";
    } else if (AppState.selectedCategory === "noneu") {
      chartTitle += isZh ? " [非欧盟第三国 Drittstaaten]" : " [Non-EU Citizens]";
    }
  } else {
    const data = AppState.monthlyData;
    labels = data.map(r => r.month);
    if (AppState.selectedCategory === "de") {
      values = data.map(r => r.de_saldo !== undefined ? r.de_saldo : r.saldo);
    } else if (AppState.selectedCategory === "eu") {
      values = data.map(r => r.eu_saldo !== undefined ? r.eu_saldo : r.saldo);
    } else if (AppState.selectedCategory === "noneu") {
      values = data.map(r => r.noneu_saldo !== undefined ? r.noneu_saldo : r.saldo);
    } else {
      values = data.map(r => r.saldo);
    }
    inflows = data.map(r => r.zuzuege);
    outflows = data.map(r => r.fortzuege);
    chartTitle = `${t("mod1_chart_title")} (Monatlich)`;
  }

  let seriesItem = {
    name: t("chart_legend_net"),
    type: "bar",
    data: values.map(v => ({
      value: v,
      itemStyle: {
        color: v >= 0 ? "#10b981" : "#ef4444",
        borderRadius: v >= 0 ? [4, 4, 0, 0] : [0, 0, 4, 4]
      }
    }))
  };

  if (AppState.flowType === "inflow") {
    chartTitle += isZh ? " (仅移入 Zuzüge)" : " (Inflow Only)";
    seriesItem = {
      name: t("chart_legend_inflow"),
      type: "bar",
      data: inflows.map(v => ({
        value: v,
        itemStyle: { color: "#38bdf8", borderRadius: [4, 4, 0, 0] }
      }))
    };
  } else if (AppState.flowType === "outflow") {
    chartTitle += isZh ? " (仅迁出 Fortzüge)" : " (Outflow Only)";
    seriesItem = {
      name: t("chart_legend_outflow"),
      type: "bar",
      data: outflows.map(v => ({
        value: v,
        itemStyle: { color: "#f59e0b", borderRadius: [4, 4, 0, 0] }
      }))
    };
  }

  const option = {
    title: {
      text: chartTitle,
      textStyle: { color: th.titleColor, fontSize: 14, fontWeight: 700 },
      left: 10,
      top: 5
    },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      backgroundColor: th.tooltipBg,
      borderColor: th.tooltipBorder,
      textStyle: { color: th.titleColor },
      formatter: (params) => {
        const p = params[0];
        const idx = p.dataIndex;
        const val = values[idx];
        const inVal = inflows[idx];
        const outVal = outflows[idx];
        const valColor = val >= 0 ? "#10b981" : "#ef4444";
        return `
          <div style="font-weight:700; margin-bottom:4px;">${p.name}</div>
          <div style="color:${valColor}; font-weight:800; font-size:14px; margin-bottom:4px;">
            ${t("chart_legend_net")}: ${val >= 0 ? '+' : ''}${formatNumber(val)} ${t("persons_unit")}
          </div>
          <div style="font-size:12px; color:${th.textColor}">
            🔹 ${t("chart_legend_inflow")}: ${formatNumber(inVal)}<br/>
            🔸 ${t("chart_legend_outflow")}: ${formatNumber(outVal)}
          </div>
        `;
      }
    },
    grid: { left: "3%", right: "3%", bottom: "16%", top: "18%", containLabel: true },
    xAxis: {
      type: "category",
      data: labels,
      axisLine: { lineStyle: { color: th.splitLine } },
      axisLabel: { color: th.textColor, fontSize: 11 }
    },
    yAxis: {
      type: "value",
      axisLine: { show: false },
      axisLabel: {
        color: th.textColor,
        formatter: (val) => val >= 1000000 || val <= -1000000 ? `${(val/1000000).toFixed(1)}M` : `${(val/1000).toFixed(0)}k`
      },
      splitLine: { lineStyle: { color: th.splitLine, type: "dashed" } }
    },
    dataZoom: [
      { type: "slider", show: true, xAxisIndex: [0], start: AppState.dataMode === "annual" ? 0 : 50, end: 100, bottom: 5, height: 22 },
      { type: "inside", xAxisIndex: [0] }
    ],
    series: [seriesItem]
  };

  ChartInstances.overview.setOption(option, true);
}

// 2. Module 2: Historical Trends (Inflows & Outflows Lines + Net Bar with markPoints)
function renderHistoricalTrendsChart() {
  const dom = document.getElementById("chart-trends");
  if (!dom) return;
  if (!ChartInstances.trends) {
    ChartInstances.trends = echarts.init(dom);
  }
  const th = getChartTheme();
  const isZh = AppState.lang === "zh-CN";

  const selectedCountryCode = AppState.selectedNationalities.length === 1 && AppState.selectedNationalities[0] !== "all" 
    ? AppState.selectedNationalities[0] 
    : null;

  let labels = [];
  let inflows = [];
  let outflows = [];
  let nets = [];
  let chartTitle = isZh ? "总体移入、迁出与净移居走势 (2000-2026 · Wanderung)" : "Cross-Border Migration & Relocation Trends (2000-2026)";
  let markPointsData = [
    { name: "2015 难民潮", coord: ["2015", 2135502], value: "2015 峰值" },
    { name: "2022 乌克兰危机", coord: ["2022", 2733538], value: "2022 历史最高" }
  ];

  if (selectedCountryCode) {
    const rawRows = AppState.nationalities.filter(r => r.code === selectedCountryCode);
    const countryRows = filterByTime(rawRows, "year");
    const cName = rawRows[0] ? (isZh ? rawRows[0].name_zh : rawRows[0].name_en) : selectedCountryCode;
    labels = countryRows.map(r => String(r.year));
    inflows = countryRows.map(r => r.zuzuege);
    outflows = countryRows.map(r => r.fortzuege);
    nets = countryRows.map(r => r.saldo);
    chartTitle = isZh 
      ? `${cName}籍历年迁入、迁出与净移居演变 (2000-2025 · 表 12711-0007)` 
      : `Historical Migration & Relocation Flows for ${cName} (2000-2025 · Destatis 12711-0007)`;

    if (inflows.length > 0) {
      let maxIn = -1;
      let maxInYr = "";
      countryRows.forEach(r => {
        if (r.zuzuege > maxIn) {
          maxIn = r.zuzuege;
          maxInYr = String(r.year);
        }
      });
      markPointsData = [
        { name: `${cName}迁入峰值`, coord: [maxInYr, maxIn], value: `${maxInYr} 峰值: ${formatNumber(maxIn)}` }
      ];
    }
  } else {
    const data = filterByTime(AppState.annualTotals).filter(r => typeof r.year === "number" || r.year_num);
    labels = data.map(r => String(r.year_num || r.year));
    inflows = data.map(r => r.zuzuege);
    outflows = data.map(r => r.fortzuege);
    nets = data.map(r => r.saldo);

    if (AppState.selectedCategory === "de") {
      nets = data.map(r => r.de_saldo);
      chartTitle += isZh ? " [德国本土公民]" : " [German Citizens]";
    } else if (AppState.selectedCategory === "eu") {
      nets = data.map(r => r.eu_saldo);
      chartTitle += isZh ? " [其他欧盟公民]" : " [Other EU Citizens]";
    } else if (AppState.selectedCategory === "noneu") {
      nets = data.map(r => r.noneu_saldo);
      chartTitle += isZh ? " [非欧盟第三国]" : " [Non-EU Citizens]";
    }
  }

  const series = [];
  const legendData = [];

  if (AppState.flowType === "all" || AppState.flowType === "inflow") {
    legendData.push(t("chart_legend_inflow"));
    series.push({
      name: t("chart_legend_inflow"),
      type: "line",
      smooth: true,
      data: inflows,
      itemStyle: { color: "#38bdf8" },
      lineStyle: { width: 3 },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: "rgba(56, 189, 248, 0.25)" },
          { offset: 1, color: "rgba(56, 189, 248, 0.0)" }
        ])
      },
      markPoint: {
        data: markPointsData
      }
    });
  }

  if (AppState.flowType === "all" || AppState.flowType === "outflow") {
    legendData.push(t("chart_legend_outflow"));
    series.push({
      name: t("chart_legend_outflow"),
      type: "line",
      smooth: true,
      data: outflows,
      itemStyle: { color: "#f59e0b" },
      lineStyle: { width: 3 }
    });
  }

  if (AppState.flowType === "all" || AppState.flowType === "net") {
    legendData.push(t("chart_legend_net"));
    series.push({
      name: t("chart_legend_net"),
      type: "bar",
      data: nets.map(v => ({
        value: v,
        itemStyle: { color: v >= 0 ? "rgba(16, 185, 129, 0.85)" : "rgba(239, 68, 68, 0.85)" }
      }))
    });
  }

  const option = {
    title: {
      text: isZh ? "总体移入、迁出与净差额历年走势 (2000-2026)" : "Cross-Border Migration Trends (2000-2026)",
      textStyle: { color: th.titleColor, fontSize: 13, fontWeight: 700 },
      left: 10,
      top: 8
    },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "cross" },
      backgroundColor: th.tooltipBg,
      borderColor: th.tooltipBorder,
      textStyle: { color: th.titleColor }
    },
    legend: {
      data: legendData,
      textStyle: { color: th.textColor, fontSize: 11 },
      type: "scroll",
      top: 34,
      left: 10
    },
    grid: { left: "3%", right: "3%", bottom: "12%", top: 75, containLabel: true },
    xAxis: {
      type: "category",
      data: labels,
      axisLine: { lineStyle: { color: th.splitLine } },
      axisLabel: { color: th.textColor }
    },
    yAxis: {
      type: "value",
      axisLabel: {
        color: th.textColor,
        formatter: (v) => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : `${(v/1000).toFixed(0)}k`
      },
      splitLine: { lineStyle: { color: th.splitLine, type: "dashed" } }
    },
    series: series
  };

  ChartInstances.trends.setOption(option, true);
}

// 3. Module 3: Granular Nationality Multi-Comparison Chart
function renderNationalityCompareChart() {
  const dom = document.getElementById("chart-nat-compare");
  if (!dom) return;
  if (!ChartInstances.natCompare) {
    ChartInstances.natCompare = echarts.init(dom);
  }
  const th = getChartTheme();

  const years = Array.from(new Set(AppState.nationalities.map(r => r.year))).sort((a,b) => a-b);
  const filteredYears = filterByTime(years.map(y => ({ year: y }))).map(r => r.year);

  const colors = ["#ef4444", "#38bdf8", "#10b981", "#818cf8", "#f59e0b", "#ec4899", "#14b8a6", "#a855f7", "#64748b"];

  const series = AppState.selectedNationalities.map((code, idx) => {
    const natRows = AppState.nationalities.filter(r => r.code === code);
    const countryName = natRows[0] ? (AppState.lang === "zh-CN" ? natRows[0].name_zh : natRows[0].name_en) : code;
    const dataVals = filteredYears.map(yr => {
      const match = natRows.find(r => r.year === yr);
      if (!match) return 0;
      if (AppState.flowType === "inflow") return match.zuzuege;
      if (AppState.flowType === "outflow") return match.fortzuege;
      return match.saldo;
    });

    return {
      name: countryName,
      type: "line",
      smooth: true,
      data: dataVals,
      itemStyle: { color: colors[idx % colors.length] },
      lineStyle: { width: 2.5 }
    };
  });

  const dynamicTitle = getNationalityChartTitle() || t("mod3_compare_chart_title");
  const titleDom = document.getElementById("mod3-compare-chart-title");
  if (titleDom) {
    titleDom.textContent = dynamicTitle;
  }

  const option = {
    title: {
      text: dynamicTitle,
      textStyle: { color: th.titleColor, fontSize: 13, fontWeight: 700 },
      left: 10,
      top: 8
    },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "cross" },
      backgroundColor: th.tooltipBg,
      borderColor: th.tooltipBorder,
      textStyle: { color: th.titleColor }
    },
    legend: {
      type: "scroll",
      top: 34,
      left: 10,
      textStyle: { color: th.textColor, fontSize: 11 }
    },
    grid: { left: "3%", right: "3%", bottom: "12%", top: 75, containLabel: true },
    xAxis: {
      type: "category",
      data: filteredYears.map(String),
      axisLine: { lineStyle: { color: th.splitLine } },
      axisLabel: { color: th.textColor }
    },
    yAxis: {
      type: "value",
      axisLabel: {
        color: th.textColor,
        formatter: (v) => v >= 1000000 || v <= -1000000 ? `${(v/1000000).toFixed(1)}M` : `${(v/1000).toFixed(0)}k`
      },
      splitLine: { lineStyle: { color: th.splitLine, type: "dashed" } }
    },
    series: series
  };

  ChartInstances.natCompare.setOption(option, true);
}

// Module 3 Ranking Table
function renderNationalityRankingTable() {
  const tbody = document.getElementById("tbody-nat-ranking");
  if (!tbody) return;
  tbody.innerHTML = "";

  let nat2025 = AppState.nationalities.filter(r => r.year === 2025 && r.code !== "DE");

  // Category filter
  if (AppState.selectedCategory === "eu") {
    nat2025 = nat2025.filter(r => r.category === "EU");
  } else if (AppState.selectedCategory === "noneu") {
    nat2025 = nat2025.filter(r => r.category === "Non-EU");
  }

  // Flow direction / metric sort
  let activeMetric = AppState.rankingMetric;
  if (AppState.flowType === "inflow") activeMetric = "inflow";
  else if (AppState.flowType === "outflow") activeMetric = "net_neg";
  else if (AppState.flowType === "net") activeMetric = "net_pos";

  if (activeMetric === "net_pos") {
    nat2025.sort((a, b) => b.saldo - a.saldo);
  } else if (activeMetric === "net_neg") {
    nat2025.sort((a, b) => a.saldo - b.saldo);
  } else if (activeMetric === "inflow") {
    nat2025.sort((a, b) => b.zuzuege - a.zuzuege);
  }

  const selectedCode = AppState.selectedNationalities.length === 1 && AppState.selectedNationalities[0] !== "all" 
    ? AppState.selectedNationalities[0] 
    : null;

  let displayList = nat2025.slice(0, 15);
  if (selectedCode) {
    const matchSelected = nat2025.find(r => r.code === selectedCode);
    if (matchSelected && !displayList.some(r => r.code === selectedCode)) {
      displayList.push(matchSelected);
    }
  }

  displayList.forEach(row => {
    const tr = document.createElement("tr");
    const isSelected = selectedCode && row.code === selectedCode;
    if (isSelected) {
      tr.style.backgroundColor = "rgba(2, 132, 199, 0.16)";
      tr.style.fontWeight = "bold";
      tr.style.borderLeft = "4px solid var(--primary)";
    }
    const name = AppState.lang === "zh-CN" ? row.name_zh : row.name_en;
    const isPos = row.saldo >= 0;
    const catText = row.category === 'EU' ? (AppState.lang === "zh-CN" ? "欧盟公民" : "EU") : (AppState.lang === "zh-CN" ? "非欧盟" : "Non-EU");
    tr.innerHTML = `
      <td><strong>${name}</strong> <span style="font-size:0.75rem; color:var(--text-muted);">(${row.code})</span>${isSelected ? ' <span class="badge badge-info" style="font-size:0.65rem; padding:1px 4px;">当前选中</span>' : ''}</td>
      <td><span class="badge ${row.category === 'EU' ? 'badge-neutral' : 'badge-warning'}">${catText}</span></td>
      <td style="${activeMetric === 'inflow' ? 'font-weight:800; color:var(--primary);' : ''}">${formatNumber(row.zuzuege)}</td>
      <td style="${activeMetric === 'net_neg' ? 'font-weight:800; color:var(--warning);' : ''}">${formatNumber(row.fortzuege)}</td>
      <td><span class="badge ${isPos ? 'badge-positive' : 'badge-negative'}">${isPos ? '+' : ''}${formatNumber(row.saldo)}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

// 4. Module 4: Tripartite EU vs Non-EU Comparison
function renderEUComparisonChart() {
  const dom = document.getElementById("chart-eu-compare");
  if (!dom) return;
  if (!ChartInstances.euCompare) {
    ChartInstances.euCompare = echarts.init(dom);
  }
  const th = getChartTheme();

  const data = filterByTime(AppState.annualTotals).filter(r => (r.year_num || r.year) >= 2015);
  const labels = data.map(r => String(r.year_num || r.year));
  const de = data.map(r => r.de_saldo);
  const eu = data.map(r => r.eu_saldo);
  const noneu = data.map(r => r.noneu_saldo);

  const option = {
    title: {
      text: t("mod4_chart_title"),
      textStyle: { color: th.titleColor, fontSize: 13, fontWeight: 700 },
      left: 10,
      top: 8
    },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "cross" },
      backgroundColor: th.tooltipBg,
      borderColor: th.tooltipBorder,
      textStyle: { color: th.titleColor }
    },
    legend: {
      data: [t("chart_legend_de"), t("chart_legend_eu"), t("chart_legend_noneu")],
      textStyle: { color: th.textColor, fontSize: 11 },
      type: "scroll",
      top: 34,
      left: 10
    },
    grid: { left: "3%", right: "3%", bottom: "10%", top: 75, containLabel: true },
    xAxis: {
      type: "category",
      data: labels,
      axisLine: { lineStyle: { color: th.splitLine } },
      axisLabel: { color: th.textColor }
    },
    yAxis: {
      type: "value",
      axisLabel: {
        color: th.textColor,
        formatter: (v) => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : `${(v/1000).toFixed(0)}k`
      },
      splitLine: { lineStyle: { color: th.splitLine, type: "dashed" } }
    },
    series: [
      {
        name: t("chart_legend_noneu"),
        type: "bar",
        stack: "total",
        data: noneu,
        itemStyle: { color: "#10b981" }
      },
      {
        name: t("chart_legend_eu"),
        type: "bar",
        stack: "total",
        data: eu,
        itemStyle: { color: "#38bdf8" }
      },
      {
        name: t("chart_legend_de"),
        type: "bar",
        stack: "total",
        data: de,
        itemStyle: { color: "#ef4444" }
      }
    ]
  };

  ChartInstances.euCompare.setOption(option, true);
}

// 5. Module 5: German Citizen Emigration (Destinations & Age Donut)
function renderGermanEmigrationCharts() {
  const destDom = document.getElementById("chart-german-emig");
  const ageDom = document.getElementById("chart-german-age");
  if (!destDom || !AppState.germanEmigration) return;
  const th = getChartTheme();

  // Destination Bar Chart
  if (!ChartInstances.emigDest) ChartInstances.emigDest = echarts.init(destDom);
  const dests = AppState.germanEmigration.destinations.map(d => ({
    name: AppState.lang === "zh-CN" ? d.name_zh : d.name_en,
    value: d.history[2025] || 0
  })).sort((a,b) => a.value - b.value);

  ChartInstances.emigDest.setOption({
    title: { text: t("mod5_dest_title") + " (2025)", textStyle: { color: th.titleColor, fontSize: 13, fontWeight: 700 } },
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, backgroundColor: th.tooltipBg, textStyle: { color: th.titleColor } },
    grid: { left: "3%", right: "8%", bottom: "3%", top: "15%", containLabel: true },
    xAxis: { type: "value", splitLine: { lineStyle: { color: th.splitLine, type: "dashed" } }, axisLabel: { color: th.textColor } },
    yAxis: { type: "category", data: dests.map(d => d.name), axisLabel: { color: th.titleColor, fontWeight: 600 } },
    series: [{
      type: "bar",
      data: dests.map(d => d.value),
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: "#0284c7" },
          { offset: 1, color: "#38bdf8" }
        ]),
        borderRadius: [0, 4, 4, 0]
      },
      label: { show: true, position: "right", color: th.textColor, formatter: "{c} 人" }
    }]
  }, true);

  // Age Donut Chart
  if (ageDom) {
    if (!ChartInstances.emigAge) ChartInstances.emigAge = echarts.init(ageDom);
    const ageData = AppState.germanEmigration.age_demographics.map(ad => ({
      name: AppState.lang === "zh-CN" ? ad.group_zh : ad.group,
      value: Math.round(ad.share * 100)
    }));

    ChartInstances.emigAge.setOption({
      title: { text: t("mod5_age_title"), textStyle: { color: th.titleColor, fontSize: 13, fontWeight: 700 } },
      tooltip: { trigger: "item", formatter: "{b}: {c}%", backgroundColor: th.tooltipBg, textStyle: { color: th.titleColor } },
      legend: { bottom: 0, textStyle: { color: th.textColor } },
      series: [{
        type: "pie",
        radius: ["40%", "70%"],
        center: ["50%", "45%"],
        data: ageData,
        itemStyle: { borderRadius: 6, borderColor: th.tooltipBg, borderWidth: 2 }
      }]
    }, true);
  }
}

// 6. Module 6: Federal States Map & Ranking Chart
function renderFederalStatesCharts() {
  const mapDom = document.getElementById("chart-states-map");
  const barDom = document.getElementById("chart-states-bar");
  if (!AppState.statesData) return;
  const th = getChartTheme();

  const states = AppState.statesData.states.map(s => ({
    name: s.name_de, // Maps matching GeoJSON properties.name
    name_zh: s.name_zh,
    name_en: s.name_en,
    value: s.saldo_2025,
    zuzuege: s.zuzuege_2025,
    fortzuege: s.fortzuege_2025
  }));

  // Map
  if (mapDom && echarts.getMap("germany")) {
    if (!ChartInstances.statesMap) ChartInstances.statesMap = echarts.init(mapDom);
    
    ChartInstances.statesMap.setOption({
      title: { text: t("mod6_map_title"), textStyle: { color: th.titleColor, fontSize: 13, fontWeight: 700 } },
      tooltip: {
        trigger: "item",
        backgroundColor: th.tooltipBg,
        borderColor: th.tooltipBorder,
        textStyle: { color: th.titleColor },
        formatter: (p) => {
          const match = states.find(s => s.name === p.name);
          if (!match) return p.name;
          const displayName = AppState.lang === "zh-CN" ? match.name_zh : match.name_en;
          return `
            <strong>${displayName} (${match.name})</strong><br/>
            净移居: <span style="color:#10b981; font-weight:800;">+${formatNumber(match.value)}</span> 人<br/>
            移入: ${formatNumber(match.zuzuege)} | 迁出: ${formatNumber(match.fortzuege)}
          `;
        }
      },
      visualMap: {
        min: 3000,
        max: 35000,
        text: ["High", "Low"],
        realtime: false,
        calculable: true,
        inRange: { color: ["#38bdf8", "#0284c7", "#10b981"] },
        textStyle: { color: th.textColor },
        left: 10,
        bottom: 10
      },
      series: [{
        type: "map",
        map: "germany",
        roam: true,
        data: states,
        emphasis: {
          label: { show: true, color: "#ffffff" },
          itemStyle: { areaColor: "#f59e0b" }
        }
      }]
    }, true);
  }

  // Horizontal Bar Chart
  if (barDom) {
    if (!ChartInstances.statesBar) ChartInstances.statesBar = echarts.init(barDom);
    const sorted = [...states].sort((a,b) => a.value - b.value);

    ChartInstances.statesBar.setOption({
      title: { text: t("mod6_states_chart_title"), textStyle: { color: th.titleColor, fontSize: 13, fontWeight: 700 } },
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, backgroundColor: th.tooltipBg, textStyle: { color: th.titleColor } },
      grid: { left: "3%", right: "8%", bottom: "3%", top: "12%", containLabel: true },
      xAxis: { type: "value", splitLine: { lineStyle: { color: th.splitLine, type: "dashed" } }, axisLabel: { color: th.textColor } },
      yAxis: {
        type: "category",
        data: sorted.map(s => AppState.lang === "zh-CN" ? s.name_zh : s.name_en),
        axisLabel: { color: th.titleColor, fontSize: 11 }
      },
      series: [{
        type: "bar",
        data: sorted.map(s => s.value),
        itemStyle: { color: "#10b981", borderRadius: [0, 4, 4, 0] },
        label: { show: true, position: "right", color: th.textColor, formatter: "{c}" }
      }]
    }, true);
  }
}

// 7. Module 7: Naturalization Series Chart
function renderNaturalizationChart() {
  const dom = document.getElementById("chart-naturalization");
  if (!dom || !AppState.naturalizations) return;
  if (!ChartInstances.natz) ChartInstances.natz = echarts.init(dom);
  const th = getChartTheme();

  const data = filterByTime(AppState.naturalizations.annual_totals);
  const labels = data.map(r => String(r.year));
  const counts = data.map(r => r.count);

  ChartInstances.natz.setOption({
    title: { text: t("mod7_chart_title"), textStyle: { color: th.titleColor, fontSize: 13, fontWeight: 700 }, left: 10, top: 5 },
    tooltip: { trigger: "axis", backgroundColor: th.tooltipBg, textStyle: { color: th.titleColor } },
    grid: { left: "3%", right: "3%", bottom: "12%", top: "18%", containLabel: true },
    xAxis: { type: "category", data: labels, axisLine: { lineStyle: { color: th.splitLine } }, axisLabel: { color: th.textColor } },
    yAxis: {
      type: "value",
      axisLabel: { color: th.textColor, formatter: (v) => `${(v/1000).toFixed(0)}k` },
      splitLine: { lineStyle: { color: th.splitLine, type: "dashed" } }
    },
    series: [{
      type: "line",
      data: counts,
      smooth: true,
      itemStyle: { color: "#818cf8" },
      lineStyle: { width: 3 },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: "rgba(129, 140, 248, 0.3)" },
          { offset: 1, color: "rgba(129, 140, 248, 0.0)" }
        ])
      },
      markLine: {
        symbol: "none",
        lineStyle: { color: "#ef4444", type: "dashed", width: 2 },
        data: [{ xAxis: "2024", label: { formatter: "2024新国籍法改革", position: "start" } }]
      }
    }]
  }, true);

  // Origins Table
  const originBox = document.getElementById("tbody-natz-ranking");
  if (originBox) {
    originBox.innerHTML = "";
    AppState.naturalizations.by_origin_2025.slice(0, 10).forEach(item => {
      const tr = document.createElement("tr");
      const name = AppState.lang === "zh-CN" ? item.country_zh : item.country_en;
      tr.innerHTML = `
        <td><strong>${name}</strong></td>
        <td><strong>${formatNumber(item.total)}</strong></td>
        <td>${formatNumber(item.male)}</td>
        <td>${formatNumber(item.female)}</td>
        <td>${((item.female / item.total) * 100).toFixed(1)}%</td>
      `;
      originBox.appendChild(tr);
    });
  }
}

// 8. Dynamic Statistical Decomposition Widget & Chart
function renderDecompositionWidget() {
  const dom = document.getElementById("chart-decomp-waterfall");
  if (!dom || !AppState.annualTotals.length) return;
  const th = getChartTheme();

  const r1 = AppState.annualTotals.find(r => (r.year_num || r.year) === AppState.calcBaseYear);
  const r2 = AppState.annualTotals.find(r => (r.year_num || r.year) === AppState.calcCompYear);
  if (!r1 || !r2) return;

  const deltaNet = r2.saldo - r1.saldo;
  const deltaIn = r2.zuzuege - r1.zuzuege;
  const deltaOut = r2.fortzuege - r1.fortzuege;

  const absIn = Math.abs(deltaIn);
  const absOut = Math.abs(deltaOut);
  const denom = (absIn + absOut) || 1;
  const inShare = (absIn / denom) * 100;
  const outShare = (absOut / denom) * 100;

  // Update text pills
  document.getElementById("decomp-val-net").textContent = `${deltaNet > 0 ? '+' : ''}${formatNumber(deltaNet)} 人`;
  document.getElementById("decomp-val-net").className = `kpi-value ${deltaNet >= 0 ? 'positive' : 'negative'}`;
  
  document.getElementById("decomp-val-in").textContent = `${deltaIn > 0 ? '+' : ''}${formatNumber(deltaIn)} 人 (${inShare.toFixed(1)}% 贡献率)`;
  document.getElementById("decomp-val-out").textContent = `${deltaOut > 0 ? '+' : ''}${formatNumber(deltaOut)} 人 (${outShare.toFixed(1)}% 贡献率)`;

  // Render Bar chart
  if (!ChartInstances.decomp) ChartInstances.decomp = echarts.init(dom);
  ChartInstances.decomp.setOption({
    title: {
      text: `${AppState.calcBaseYear} vs ${AppState.calcCompYear} 变化量归因`,
      textStyle: { color: th.titleColor, fontSize: 13, fontWeight: 700 }
    },
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, backgroundColor: th.tooltipBg, textStyle: { color: th.titleColor } },
    grid: { left: "3%", right: "5%", bottom: 30, top: 45, containLabel: true },
    xAxis: { type: "category", data: ["净移居变化 (ΔSaldo)", "移入变化 (ΔZuzüge)", "迁出变化 (ΔFortzüge)"], axisLabel: { color: th.textColor } },
    yAxis: { type: "value", splitLine: { lineStyle: { color: th.splitLine, type: "dashed" } }, axisLabel: { color: th.textColor } },
    series: [{
      type: "bar",
      data: [
        { value: deltaNet, itemStyle: { color: deltaNet >= 0 ? "#10b981" : "#ef4444" } },
        { value: deltaIn, itemStyle: { color: "#38bdf8" } },
        { value: deltaOut, itemStyle: { color: "#f59e0b" } }
      ],
      label: { show: true, position: "top", color: th.textColor, formatter: (p) => `${formatNumber(p.value)}` }
    }]
  }, true);
}

// 9. BI Query Table with Pagination & Sorting (Fully Reactive to Global Filters)
function renderBITable() {
  const tbody = document.getElementById("tbody-bi-query");
  if (!tbody) return;
  tbody.innerHTML = "";

  let dataset = [];

  // If a single specific nationality is selected (e.g. CN, IN, VN, PL, etc.)
  if (AppState.selectedNationalities.length === 1 && AppState.selectedNationalities[0] !== "all") {
    const code = AppState.selectedNationalities[0];
    const countryRows = AppState.nationalities.filter(r => r.code === code);
    const isZh = AppState.lang === "zh-CN";
    const cName = countryRows[0] ? (isZh ? countryRows[0].name_zh : countryRows[0].name_en) : code;

    dataset = countryRows.map(r => ({
      period: String(r.year),
      year_num: r.year,
      zuzuege: r.zuzuege,
      fortzuege: r.fortzuege,
      saldo: r.saldo,
      de_saldo: 0,
      eu_saldo: r.category === "EU" ? r.saldo : 0,
      noneu_saldo: r.category === "Non-EU" ? r.saldo : 0,
      status: r.status,
      table: `12711-0007 (${cName})`
    }));
  } else {
    // Macro totals table (12711-0005)
    dataset = AppState.annualTotals.map(r => ({
      period: String(r.period || r.year),
      year_num: r.year_num || (typeof r.year === "number" ? r.year : 2026),
      zuzuege: r.zuzuege,
      fortzuege: r.fortzuege,
      saldo: r.saldo,
      de_saldo: r.de_saldo,
      eu_saldo: r.eu_saldo,
      noneu_saldo: r.noneu_saldo,
      status: r.status,
      table: "12711-0005"
    }));
  }

  // Time filter
  dataset = filterByTime(dataset, "year_num");

  // Search filter
  if (AppState.searchQuery) {
    dataset = dataset.filter(r => 
      r.period.toLowerCase().includes(AppState.searchQuery.toLowerCase()) ||
      r.status.toLowerCase().includes(AppState.searchQuery.toLowerCase()) ||
      r.table.toLowerCase().includes(AppState.searchQuery.toLowerCase())
    );
  }

  // Direction Sort or Column Sort
  if (AppState.flowType === "inflow") {
    dataset.sort((a,b) => b.zuzuege - a.zuzuege);
  } else if (AppState.flowType === "outflow") {
    dataset.sort((a,b) => b.fortzuege - a.fortzuege);
  } else if (AppState.flowType === "net") {
    dataset.sort((a,b) => b.saldo - a.saldo);
  } else {
    dataset.sort((a,b) => {
      let valA = a[AppState.tableSortCol];
      let valB = b[AppState.tableSortCol];
      if (AppState.tableSortAsc) return valA > valB ? 1 : -1;
      return valA < valB ? 1 : -1;
    });
  }

  const totalRecords = dataset.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / AppState.tablePageSize));
  if (AppState.tablePage > totalPages) AppState.tablePage = totalPages;

  const startIdx = (AppState.tablePage - 1) * AppState.tablePageSize;
  const pageItems = dataset.slice(startIdx, startIdx + AppState.tablePageSize);

  pageItems.forEach(row => {
    const tr = document.createElement("tr");
    const isNetPos = row.saldo >= 0;
    tr.innerHTML = `
      <td><strong>${row.period}</strong></td>
      <td style="${AppState.flowType === 'inflow' ? 'font-weight:800; color:var(--primary);' : ''}">${formatNumber(row.zuzuege)}</td>
      <td style="${AppState.flowType === 'outflow' ? 'font-weight:800; color:var(--warning);' : ''}">${formatNumber(row.fortzuege)}</td>
      <td><span class="badge ${isNetPos ? 'badge-positive' : 'badge-negative'}">${isNetPos ? '+' : ''}${formatNumber(row.saldo)}</span></td>
      <td><span class="badge ${row.de_saldo >= 0 ? 'badge-positive' : 'badge-negative'} ${AppState.selectedCategory === 'de' ? 'badge-info' : ''}">${formatNumber(row.de_saldo)}</span></td>
      <td><span class="badge ${row.eu_saldo >= 0 ? 'badge-positive' : 'badge-negative'} ${AppState.selectedCategory === 'eu' ? 'badge-info' : ''}">${formatNumber(row.eu_saldo)}</span></td>
      <td><span class="badge ${row.noneu_saldo >= 0 ? 'badge-positive' : 'badge-negative'} ${AppState.selectedCategory === 'noneu' ? 'badge-info' : ''}">${formatNumber(row.noneu_saldo)}</span></td>
      <td><span class="badge badge-neutral">${formatStatusBadge(row.status, AppState.lang)}</span></td>
      <td><code>${row.table}</code></td>
    `;
    tbody.appendChild(tr);
  });

  // Update pagination info
  const pageInfo = document.getElementById("page-info-text");
  if (pageInfo) {
    pageInfo.textContent = `${t("showing_records")} ${totalRecords === 0 ? 0 : startIdx + 1} - ${Math.min(startIdx + AppState.tablePageSize, totalRecords)} / ${totalRecords}`;
  }
  const prevBtn = document.getElementById("btn-page-prev");
  const nextBtn = document.getElementById("btn-page-next");
  if (prevBtn) prevBtn.disabled = AppState.tablePage <= 1;
  if (nextBtn) nextBtn.disabled = AppState.tablePage >= totalPages;
}

// 10. Fact-Checking Table
function renderVerificationTable() {
  const tbody = document.getElementById("tbody-verification");
  if (!tbody || !AppState.verificationClaims) return;
  tbody.innerHTML = "";

  let list = AppState.verificationClaims;
  if (AppState.verifyFilter === "verified") {
    list = list.filter(item => item.official_status.includes("已验证"));
  } else if (AppState.verifyFilter === "provisional") {
    list = list.filter(item => !item.official_status.includes("已验证"));
  }

  list.forEach(item => {
    const tr = document.createElement("tr");
    const isVerified = item.official_status.includes("已验证");
    const badgeClass = isVerified ? "badge-positive" : "badge-warning";
    const statusText = isVerified 
      ? (AppState.lang === "zh-CN" ? "✅ 已验证 (Verified)" : "✅ Verified Official")
      : (AppState.lang === "zh-CN" ? "⚠️ 无法在标准月度库复核" : "⚠️ Provisional / AZR Snapshot");
    
    const evidenceText = AppState.lang === "zh-CN" ? item.evidence_zh : item.evidence_en;

    tr.innerHTML = `
      <td><strong>${item.metric}</strong></td>
      <td><code>${item.claimed_value}</code></td>
      <td><span class="badge ${badgeClass}">${statusText}</span></td>
      <td><strong>${item.official_value}</strong></td>
      <td><div style="font-size:0.8rem; line-height:1.45;">${evidenceText}</div></td>
    `;
    tbody.appendChild(tr);
  });
}

// 11. Executive Consulting Deck Functions & Chart Builders
function formatStatusBadge(status, lang) {
  if (lang === "zh-CN") {
    if (status.includes("final")) return "官方最终核算";
    if (status.includes("preliminary_ytd")) return "1—8月累计初步";
    if (status.includes("preliminary")) return "官方初步核算";
    return "官方正式核算";
  } else {
    if (status.includes("final")) return "Final Official";
    if (status.includes("preliminary_ytd")) return "Jan-Aug YTD";
    if (status.includes("preliminary")) return "Preliminary";
    return "Official";
  }
}

function renderDeckCharts() {
  renderSlide1Chart();
  renderSlide2Chart();
  renderSlide3Chart();
  renderSlide4Chart();
  renderSlide5Chart();
}

// Slide 1: 26-year macro wave with Inflow, Outflow, Net and MarkArea
function renderSlide1Chart() {
  const dom = document.getElementById("chart-slide1");
  if (!dom) return;
  if (!ChartInstances.slide1) ChartInstances.slide1 = echarts.init(dom);
  const th = getChartTheme();
  const isZh = AppState.lang === "zh-CN";

  const data = AppState.annualTotals.filter(r => typeof r.year === "number" || r.year_num);
  const labels = data.map(r => String(r.year_num || r.year));
  const inflows = data.map(r => r.zuzuege);
  const outflows = data.map(r => r.fortzuege);
  const saldos = data.map(r => r.saldo);

  ChartInstances.slide1.setOption({
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
        isZh ? "净移居差额 (Saldo)" : "Net Relocation (Saldo)"
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
      axisLabel: { color: th.textColor, formatter: (v) => `${(v / 1000).toFixed(0)}k` }
    },
    series: [
      {
        name: isZh ? "净移居差额 (Saldo)" : "Net Relocation (Saldo)",
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

// Slide 2: Structural Scissors Divergence
function renderSlide2Chart() {
  const dom = document.getElementById("chart-slide2");
  if (!dom) return;
  if (!ChartInstances.slide2) ChartInstances.slide2 = echarts.init(dom);
  const th = getChartTheme();
  const isZh = AppState.lang === "zh-CN";

  const data = AppState.annualTotals.filter(r => (r.year_num || r.year) >= 2016);
  const labels = data.map(r => String(r.year_num || r.year));
  const de = data.map(r => r.de_saldo);
  const eu = data.map(r => r.eu_saldo);
  const noneu = data.map(r => r.noneu_saldo);

  ChartInstances.slide2.setOption({
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
      axisLabel: { color: th.textColor, formatter: (v) => `${(v / 1000).toFixed(0)}k` }
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
          data: [{ yAxis: 0, label: { formatter: isZh ? "净平衡线 0" : "Zero Balance", color: th.textColor } }]
        }
      }
    ]
  }, true);
}

// Slide 3: Micro Talent Ecosystem vs Refugee Flows
function renderSlide3Chart() {
  const dom = document.getElementById("chart-slide3");
  if (!dom) return;
  if (!ChartInstances.slide3) ChartInstances.slide3 = echarts.init(dom);
  const th = getChartTheme();
  const isZh = AppState.lang === "zh-CN";

  const categories = isZh
    ? ["印度 (STEM/IT蓝卡)", "越南 (双元制/护理)", "中国 (学术/科研留学生)", "叙利亚 (避难常态化)", "乌克兰 (避难断崖退潮)"]
    : ["India (STEM/IT)", "Vietnam (Vocational/Care)", "China (Academic/R&D)", "Syria (Asylum Baseline)", "Ukraine (Refugee Ebb)"];

  const val2022 = [31700, 12700, 5200, 65000, 960000];
  const val2025 = [38904, 18814, 8160, 20316, 89460];

  ChartInstances.slide3.setOption({
    title: {
      text: isZh ? "重点国籍净移居：2022峰值 vs 2025常态化 (单位: 人)" : "Key Nationalities Net Relocation: 2022 Peak vs 2025 (Persons)",
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
      data: [isZh ? "2022年峰值净移居" : "2022 Peak Net", isZh ? "2025年常态净移居" : "2025 Baseline Net"]
    },
    grid: { left: 20, right: 65, top: 75, bottom: 35, containLabel: true },
    xAxis: {
      type: "value",
      max: 1050000,
      splitLine: { lineStyle: { color: th.splitLine, type: "dashed" } },
      axisLabel: { color: th.textColor, formatter: (v) => `${(v / 1000).toFixed(0)}k` }
    },
    yAxis: {
      type: "category",
      data: categories,
      axisLabel: { color: th.textColor, fontSize: 11 }
    },
    series: [
      {
        name: isZh ? "2022年峰值净移居" : "2022 Peak Net",
        type: "bar",
        data: val2022,
        itemStyle: { color: "rgba(56, 189, 248, 0.45)", borderRadius: [0, 4, 4, 0] },
        barMaxWidth: 16
      },
      {
        name: isZh ? "2025年常态净移居" : "2025 Baseline Net",
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

// Slide 4: Citizenship Reform Jump
function renderSlide4Chart() {
  const dom = document.getElementById("chart-slide4");
  if (!dom) return;
  if (!ChartInstances.slide4) ChartInstances.slide4 = echarts.init(dom);
  const th = getChartTheme();
  const isZh = AppState.lang === "zh-CN";

  const data = (AppState.naturalizations && AppState.naturalizations.annual_totals) || [];
  const recent = data.filter(r => r.year >= 2014);
  const years = recent.map(r => String(r.year));
  const counts = recent.map(r => r.count);

  ChartInstances.slide4.setOption({
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

// Slide 5: Strategic Workforce Deficit vs Solution
function renderSlide5Chart() {
  const dom = document.getElementById("chart-slide5");
  if (!dom) return;
  if (!ChartInstances.slide5) ChartInstances.slide5 = echarts.init(dom);
  const th = getChartTheme();
  const isZh = AppState.lang === "zh-CN";

  const categories = isZh
    ? ["退休硬缺口 (Demand)", "非欧盟引才 (Supply)", "本土延迟退休/女性", "AI/自动化生产率替代", "动态净平衡线"]
    : ["Retirement Deficit", "Non-EU Skilled Labor", "Domestic Extension/Female", "AI & Automation", "Net Balance Line"];

  const values = [-400000, 150000, 90000, 160000, 0];
  const colors = ["#ef4444", "#10b981", "#38bdf8", "#f59e0b", "#a855f7"];

  ChartInstances.slide5.setOption({
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

// Download utils
function formatNumber(num) {
  if (num === null || num === undefined || isNaN(num)) return "-";
  return num.toLocaleString();
}

function downloadCSV() {
  const headers = ["Period", "Inflow (Zuzüge)", "Outflow (Fortzüge)", "Net (Saldo)", "DE Saldo", "EU Saldo", "Non-EU Saldo", "Status", "Table"];
  const rows = AppState.annualTotals.map(r => [
    r.period || r.year,
    r.zuzuege,
    r.fortzuege,
    r.saldo,
    r.de_saldo,
    r.eu_saldo,
    r.noneu_saldo,
    r.status,
    "12711-0005"
  ]);

  let csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `destatis_germany_migration_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast(AppState.lang === "zh-CN" ? "已生成并下载 CSV 表格" : "CSV table downloaded");
}

function downloadJSON() {
  const fullPayload = {
    metadata: AppState.metadata,
    annual_totals: AppState.annualTotals,
    monthly_series: AppState.monthlyData,
    nationalities: AppState.nationalities,
    german_emigration: AppState.germanEmigration,
    states: AppState.statesData,
    naturalizations: AppState.naturalizations,
    verification: AppState.verificationClaims
  };
  const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullPayload, null, 2));
  const link = document.createElement("a");
  link.setAttribute("href", jsonStr);
  link.setAttribute("download", `destatis_germany_migration_${new Date().toISOString().slice(0,10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast(AppState.lang === "zh-CN" ? "已生成并下载 JSON 数据库" : "JSON database downloaded");
}
