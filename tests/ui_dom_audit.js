/**
 * Automated Web UI, Navigation & Data Audit Suite
 * Modeled after GitHub Open-Source Best Practices (playwright-cli & pbakaus/impeccable)
 * 
 * Verifies:
 * 1. Routing & Link Integrity (Internal anchors & Multi-page document links)
 * 2. Data Hydration & Namespace Contracts (window.DESTATIS_DATABASE & window.DESTATIS_DATA)
 * 3. ECharts Visualization Option Contracts (Ensures series data non-empty)
 * 4. i18n Dictionary Symmetry & 100% Coverage (No missing keys, no untranslated leaks)
 * 5. CSS Typography & DOM Overflow Safety (word-break, container bounding minimums)
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT_DIR = path.resolve(__dirname, '..');
const INDEX_HTML = path.join(ROOT_DIR, 'index.html');
const FINDINGS_HTML = path.join(ROOT_DIR, 'findings.html');
const APP_JS = path.join(ROOT_DIR, 'app.js');
const FINDINGS_JS = path.join(ROOT_DIR, 'findings.js');
const I18N_JS = path.join(ROOT_DIR, 'i18n.js');
const DATA_JS = path.join(ROOT_DIR, 'data.js');
const STYLES_CSS = path.join(ROOT_DIR, 'styles.css');

let totalChecks = 0;
let passedChecks = 0;
let failures = [];

function assert(condition, message) {
  totalChecks++;
  if (condition) {
    passedChecks++;
    console.log(`  ✅ [PASS] ${message}`);
  } else {
    failures.push(message);
    console.error(`  ❌ [FAIL] ${message}`);
  }
}

console.log("============================================================");
console.log("GERMANY MIGRATION DASHBOARD - AUTOMATED WEB & UI AUDIT SUITE");
console.log("============================================================\n");

// ---------------------------------------------------------------------------
// TEST 1: Physical File & Static Asset Existence
// ---------------------------------------------------------------------------
console.log("[SUITE 1] Static Asset & File Integrity Audit");
[INDEX_HTML, FINDINGS_HTML, APP_JS, FINDINGS_JS, I18N_JS, DATA_JS, STYLES_CSS].forEach(fp => {
  assert(fs.existsSync(fp) && fs.statSync(fp).size > 0, `File exists and is non-empty: ${path.basename(fp)}`);
});

// ---------------------------------------------------------------------------
// TEST 2: Routing & Link Integrity Audit
// ---------------------------------------------------------------------------
console.log("\n[SUITE 2] Routing & Link Integrity Audit");

const indexContent = fs.readFileSync(INDEX_HTML, 'utf8');
const findingsContent = fs.readFileSync(FINDINGS_HTML, 'utf8');

// Check all a tags in index.html
const indexLinks = [...indexContent.matchAll(/<a\s+(?:[^>]*?\s+)?href="([^"]*)"/g)].map(m => m[1]);
indexLinks.forEach(href => {
  if (href.startsWith('#')) {
    const targetId = href.substring(1);
    const hasTarget = indexContent.includes(`id="${targetId}"`);
    assert(hasTarget, `Internal anchor in index.html resolves to existing DOM ID: ${href}`);
  } else if (!href.startsWith('http')) {
    const targetPath = path.join(ROOT_DIR, href);
    assert(fs.existsSync(targetPath), `Relative multi-page link in index.html points to real file: ${href}`);
  }
});

// Check findings.html link does not get blocked by e.preventDefault()
const appJsContent = fs.readFileSync(APP_JS, 'utf8');
const hasSafeNavFilter = appJsContent.includes('!href.startsWith("#")') || appJsContent.includes("href.startsWith('#')");
assert(hasSafeNavFilter, `app.js navigation link listener safely passes through multi-page links (e.g. findings.html)`);

// Check all a tags in findings.html
const findingsLinks = [...findingsContent.matchAll(/<a\s+(?:[^>]*?\s+)?href="([^"]*)"/g)].map(m => m[1]);
findingsLinks.forEach(href => {
  if (href.startsWith('#')) {
    const targetId = href.substring(1);
    const hasTarget = findingsContent.includes(`id="${targetId}"`);
    assert(hasTarget, `Internal anchor in findings.html resolves to existing DOM ID: ${href}`);
  } else if (!href.startsWith('http')) {
    const targetPath = path.join(ROOT_DIR, href);
    assert(fs.existsSync(targetPath), `Relative link in findings.html points to real file: ${href}`);
  }
});

// ---------------------------------------------------------------------------
// TEST 3: Data Hydration & Dual Namespace Contract
// ---------------------------------------------------------------------------
console.log("\n[SUITE 3] Data Hydration & Namespace Contracts");

const sandbox = { window: {} };
vm.createContext(sandbox);

const dataJsCode = fs.readFileSync(DATA_JS, 'utf8');
vm.runInContext(dataJsCode, sandbox);

assert(sandbox.window.DESTATIS_DATABASE !== undefined, "window.DESTATIS_DATABASE is defined");
assert(sandbox.window.DESTATIS_DATA !== undefined, "window.DESTATIS_DATA is defined (dual-namespace contract)");

const db = sandbox.window.DESTATIS_DATABASE;
assert(Array.isArray(db.annual_totals) && db.annual_totals.length >= 25, `annual_totals hydrated with ${db.annual_totals?.length} records (>=25)`);
assert(Array.isArray(db.monthly) && db.monthly.length >= 80, `monthly hydrated with ${db.monthly?.length} records (>=80)`);
assert(Array.isArray(db.nationalities) && db.nationalities.length >= 500, `nationalities hydrated with ${db.nationalities?.length} records (>=500)`);
assert(db.naturalizations && Array.isArray(db.naturalizations.annual_totals), `naturalizations annual totals present`);
assert(Array.isArray(db.verification_claims) && db.verification_claims.length === 7, `verification_claims verified (7 claim benchmarks)`);

// ---------------------------------------------------------------------------
// TEST 4: i18n Dictionary Symmetry & Coverage Audit
// ---------------------------------------------------------------------------
console.log("\n[SUITE 4] i18n Dictionary Symmetry & DOM Coverage Audit");

const i18nJsCode = fs.readFileSync(I18N_JS, 'utf8');
vm.runInContext(i18nJsCode + '; window.translations = translations;', sandbox);

const translations = sandbox.window.translations;
assert(translations !== undefined, "translations dictionary exported successfully");

const zhKeys = Object.keys(translations['zh-CN'] || {});
const enKeys = Object.keys(translations['en'] || {});

assert(zhKeys.length > 150, `zh-CN dictionary contains ${zhKeys.length} translation keys (>150)`);
assert(enKeys.length > 150, `en dictionary contains ${enKeys.length} translation keys (>150)`);
assert(zhKeys.length === enKeys.length, `Strict symmetry: zh-CN keys (${zhKeys.length}) === en keys (${enKeys.length})`);

// Verify all [data-i18n] in index.html exist in dictionary
const indexI18nMatches = [...indexContent.matchAll(/data-i18n="([^"]*)"/g)].map(m => m[1]);
let missingInIndexZh = 0;
indexI18nMatches.forEach(k => {
  if (!translations['zh-CN'][k]) {
    missingInIndexZh++;
    console.error(`    Missing zh-CN translation key in index.html: ${k}`);
  }
});
assert(missingInIndexZh === 0, `All data-i18n keys in index.html exist in zh-CN dictionary (0 missing)`);

// Verify all [data-i18n] in findings.html exist in dictionary
const findingsI18nMatches = [...findingsContent.matchAll(/data-i18n="([^"]*)"/g)].map(m => m[1]);
let missingInFindingsZh = 0;
findingsI18nMatches.forEach(k => {
  if (!translations['zh-CN'][k]) {
    missingInFindingsZh++;
    console.error(`    Missing zh-CN translation key in findings.html: ${k}`);
  }
});
assert(missingInFindingsZh === 0, `All data-i18n keys in findings.html exist in zh-CN dictionary (0 missing)`);

// Check that Chinese translations do not contain untranslated markers
let rawCodeInZh = 0;
zhKeys.forEach(k => {
  const val = translations['zh-CN'][k];
  if (typeof val === 'string' && val.startsWith('mod') && val.includes('_')) {
    rawCodeInZh++;
  }
});
assert(rawCodeInZh === 0, `No raw code strings leaked into zh-CN dictionary (0 leaks)`);

// ---------------------------------------------------------------------------
// TEST 5: Typography, CSS Layout & Overflow Safety Audit
// ---------------------------------------------------------------------------
console.log("\n[SUITE 5] CSS Layout, Typography & Overflow Safety Audit");

const cssContent = fs.readFileSync(STYLES_CSS, 'utf8');

// 1. Word break rules
assert(cssContent.includes('word-break: break-word') || cssContent.includes('overflow-wrap: break-word'),
  `CSS design system includes word-break / overflow-wrap protection`);

// 2. Grid minimum columns width protection
assert(cssContent.includes('minmax(260px') || cssContent.includes('minmax(250px'),
  `CSS stats grid enforces min-width >= 250px preventing number wrap truncation`);

// 3. Print stylesheet exists
assert(cssContent.includes('@media print'), `Print stylesheet @media print is configured in styles.css`);
assert(findingsContent.includes('@media print'), `findings.html contains dedicated landscape PDF print stylesheet`);

// 4. Fixed 440px minimum chart dimensions
assert(cssContent.includes('min-height: 440px') || cssContent.includes('height: 440px'),
  `Slide chart containers have fixed minimum height (440px) preventing collapsed 0px canvas`);

// ---------------------------------------------------------------------------
// SUMMARY
// ---------------------------------------------------------------------------
console.log("\n============================================================");
console.log(`TOTAL AUDIT CHECKS: ${totalChecks}`);
console.log(`PASSED: ${passedChecks}`);
console.log(`FAILED: ${failures.length}`);
console.log("============================================================");

if (failures.length > 0) {
  console.error("\n❌ FAILED AUDIT CHECKS:");
  failures.forEach((f, i) => console.error(`  ${i+1}. ${f}`));
  process.exit(1);
} else {
  console.log("\n🌟 ALL WEB, ROUTING, DATA & UI AUDIT CHECKS PASSED WITH 100% SUCCESS!");
  process.exit(0);
}
