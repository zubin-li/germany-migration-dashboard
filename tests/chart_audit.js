/**
 * Automated ECharts Option & Data Generation Audit
 * Verifies that all charts generate complete, non-empty, renderable options.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_JS = path.join(ROOT_DIR, 'data.js');
const I18N_JS = path.join(ROOT_DIR, 'i18n.js');
const FINDINGS_JS = path.join(ROOT_DIR, 'findings.js');

const capturedOptions = {};

// Mock browser environment
const domElements = {
  'pdf-chart-1': {},
  'pdf-chart-2': {},
  'pdf-chart-3': {},
  'pdf-chart-4': {},
  'pdf-chart-5': {}
};

const sandbox = {
  window: {
    addEventListener: () => {}
  },
  document: {
    documentElement: { setAttribute: () => {} },
    getElementById: (id) => domElements[id] || null,
    querySelectorAll: () => []
  },
  localStorage: {
    getItem: (k) => 'zh-CN',
    setItem: () => {}
  },
  echarts: {
    init: (dom) => ({
      setOption: (opt) => {
        // Find which chart id
        for (const [id, el] of Object.entries(domElements)) {
          if (el === dom) capturedOptions[id] = opt;
        }
      },
      resize: () => {}
    })
  },
  console: console
};

vm.createContext(sandbox);

// 1. Run data.js
vm.runInContext(fs.readFileSync(DATA_JS, 'utf8'), sandbox);

// 2. Run i18n.js
vm.runInContext(fs.readFileSync(I18N_JS, 'utf8') + '; window.translations = translations;', sandbox);

// 3. Run findings.js
vm.runInContext(fs.readFileSync(FINDINGS_JS, 'utf8'), sandbox);

// Trigger renderAllCharts
vm.runInContext('renderAllCharts()', sandbox);

console.log("============================================================");
console.log("CHART DATA HYDRATION AUDIT");
console.log("============================================================\n");

let failures = 0;

function checkChart(id, name, validator) {
  const opt = capturedOptions[id];
  if (!opt) {
    console.error(`❌ [FAIL] ${name} (${id}) was not rendered!`);
    failures++;
    return;
  }
  try {
    validator(opt);
    console.log(`✅ [PASS] ${name} (${id}) passed data & option assertion.`);
  } catch (err) {
    console.error(`❌ [FAIL] ${name} (${id}): ${err.message}`);
    failures++;
  }
}

// Chart 1
checkChart('pdf-chart-1', 'Slide 1: Macro Wave (Inflow/Outflow/Net)', (opt) => {
  if (!opt.series || opt.series.length !== 3) throw new Error(`Expected 3 series, got ${opt.series?.length}`);
  if (opt.series[0].data.length < 25) throw new Error(`Net series data length ${opt.series[0].data.length} < 25`);
  if (opt.series[1].data.length < 25) throw new Error(`Inflow series data length ${opt.series[1].data.length} < 25`);
});

// Chart 2
checkChart('pdf-chart-2', 'Slide 2: Tripartite Scissors Divergence', (opt) => {
  if (!opt.series || opt.series.length !== 3) throw new Error(`Expected 3 series, got ${opt.series?.length}`);
  opt.series.forEach(s => {
    if (s.data.length < 8) throw new Error(`Series ${s.name} data length < 8`);
  });
});

// Chart 3
checkChart('pdf-chart-3', 'Slide 3: Micro Ecosystem (2022 vs 2025)', (opt) => {
  if (!opt.series || opt.series.length !== 2) throw new Error(`Expected 2 series, got ${opt.series?.length}`);
  if (opt.series[0].data.length !== 5) throw new Error(`Expected 5 nationalities, got ${opt.series[0].data.length}`);
});

// Chart 4
checkChart('pdf-chart-4', 'Slide 4: Naturalization Surge', (opt) => {
  if (!opt.series || opt.series.length !== 1) throw new Error(`Expected 1 series, got ${opt.series?.length}`);
  if (opt.series[0].data.length < 10) throw new Error(`Naturalization years < 10`);
});

// Chart 5
checkChart('pdf-chart-5', 'Slide 5: Labor Gap Mitigation Model', (opt) => {
  if (!opt.series || opt.series.length !== 1) throw new Error(`Expected 1 series, got ${opt.series?.length}`);
  if (opt.series[0].data.length !== 5) throw new Error(`Expected 5 balance buckets, got ${opt.series[0].data.length}`);
});

console.log("\n============================================================");
if (failures === 0) {
  console.log("✅ ALL 5 EXECUTIVE SLIDE CHART DATA/OPTION CONTRACTS PASSED");
  process.exit(0);
} else {
  console.error(`❌ ${failures} CHARTS FAILED VALIDATION!`);
  process.exit(1);
}
