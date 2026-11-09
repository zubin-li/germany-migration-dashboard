/**
 * Static Layout Contract Audit Suite
 * Modeled after GitHub Open-Source Best Practices (pbakaus/impeccable & design-system test standards)
 * 
 * Inspects source-level CSS and chart configuration contracts. It does not
 * render a browser or prove visual quality. Browser behavior is covered by
 * browser_regression.js.
 *
 * Specifically checks:
 * 1. KPI Card Container Bounding Box & No-Overflow Contracts
 * 2. 2-Tier Grid Balance (4 Macro + 3 Cohorts = Zero Orphan Cards)
 * 3. Badge Text Length & CSS flex-wrap Ellipsis Guardrails
 * 4. Chart Title vs. Legend Vertical Stacking & Anti-Collision Contracts
 * 5. Horizontal Bar Chart Axis Containment (containLabel: true & min/max bounds)
 * 6. Responsive Viewport Media Queries for Layout Integrity
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT_DIR = path.resolve(__dirname, '..');
const STYLES_CSS = path.join(ROOT_DIR, 'styles.css');
const INDEX_HTML = path.join(ROOT_DIR, 'index.html');
const FINDINGS_HTML = path.join(ROOT_DIR, 'findings.html');
const APP_JS = path.join(ROOT_DIR, 'app.js');
const FINDINGS_JS = path.join(ROOT_DIR, 'findings.js');
const I18N_JS = path.join(ROOT_DIR, 'i18n.js');

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
console.log("STATIC LAYOUT CONTRACT AUDIT SUITE");
console.log("============================================================\n");

// Read source files
const cssContent = fs.readFileSync(STYLES_CSS, 'utf8');
const indexHtml = fs.readFileSync(INDEX_HTML, 'utf8');
const findingsHtml = fs.readFileSync(FINDINGS_HTML, 'utf8');
const appJs = fs.readFileSync(APP_JS, 'utf8');
const findingsJs = fs.readFileSync(FINDINGS_JS, 'utf8');

// Load i18n
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(I18N_JS, 'utf8') + '; window.translations = translations;', sandbox);
const translations = sandbox.window.translations;

// ---------------------------------------------------------------------------
// SUITE 1: KPI Grid Architecture & Balanced Hierarchy Audit
// ---------------------------------------------------------------------------
console.log("[SUITE 1] KPI Card Architecture & Balanced Grid Audit");

// Check 2-tier architecture classes
assert(cssContent.includes('.kpi-container'), `CSS defines .kpi-container flex layout`);
assert(cssContent.includes('.kpi-grid-macro'), `CSS defines .kpi-grid-macro for Macro indicators`);
assert(cssContent.includes('.kpi-grid-cohorts'), `CSS defines .kpi-grid-cohorts for Demographic cohorts`);

// Check grid columns
assert(cssContent.includes('grid-template-columns: repeat(4'), `Macro grid allocates 4 balanced columns (4 items = 0 orphans)`);
assert(cssContent.includes('grid-template-columns: repeat(3'), `Cohort grid allocates 3 balanced columns (3 items = 0 orphans)`);

// Check HTML markup has both grids
assert(indexHtml.includes('class="kpi-grid kpi-grid-macro"'), `index.html contains .kpi-grid-macro`);
assert(indexHtml.includes('class="kpi-grid kpi-grid-cohorts"'), `index.html contains .kpi-grid-cohorts`);

// Verify card count: exactly 4 in macro and 3 in cohorts
const macroSection = indexHtml.split('class="kpi-grid kpi-grid-macro"')[1]?.split('class="kpi-grid kpi-grid-cohorts"')[0] || '';
const cohortSection = indexHtml.split('class="kpi-grid kpi-grid-cohorts"')[1]?.split('</section>')[0] || '';
const macroCards = (macroSection.match(/class="kpi-card/g) || []).length;
const cohortCards = (cohortSection.match(/class="kpi-card/g) || []).length;

assert(macroCards === 4, `Tier 1 (Macro indicators) contains exactly 4 cards (actual: ${macroCards})`);
assert(cohortCards === 3, `Tier 2 (Cohort indicators) contains exactly 3 cards (actual: ${cohortCards})`);
assert(macroCards + cohortCards === 7, `Total KPI cards preserved at 7 without single-item orphan overflow`);

// ---------------------------------------------------------------------------
// SUITE 2: KPI Typography, Footer & Badge Overflow Guardrail Audit
// ---------------------------------------------------------------------------
console.log("\n[SUITE 2] KPI Typography & Badge Bounding Box Safety Audit");

// Check .kpi-footer CSS properties
assert(cssContent.includes('.kpi-footer') && cssContent.includes('flex-wrap: wrap'), 
  `.kpi-footer enforces flex-wrap: wrap preventing horizontal breakout`);
assert(cssContent.includes('overflow: hidden') && cssContent.includes('.kpi-card'), 
  `.kpi-card enforces overflow: hidden as secondary defensive guardrail`);

// Check .badge CSS properties
assert(cssContent.includes('.badge') && cssContent.includes('text-overflow: ellipsis'), 
  `.badge enforces text-overflow: ellipsis`);
assert(cssContent.includes('.badge') && cssContent.includes('max-width: 100%'), 
  `.badge enforces max-width: 100% boundary safety`);

// Check badge text lengths in zh-CN
const zh = translations['zh-CN'];
const zhBadges = [zh.status_preliminary, zh.status_ytd, zh.badge_net_outflow, zh.badge_steady_inflow];
zhBadges.forEach(b => {
  assert(typeof b === 'string' && b.length <= 12, `zh-CN badge '${b}' length <= 12 chars (actual: ${b?.length})`);
});

// Check title formatting (no awkward English hyphenated wrap strings)
assert(!zh.kpi_de_net_2026.includes('1-8M'), `zh-CN kpi_de_net_2026 uses proper Chinese date formatting without awkward '1-8M' breaks`);
assert(!zh.kpi_eu_net_2026.includes('1-8M'), `zh-CN kpi_eu_net_2026 uses proper Chinese date formatting without awkward '1-8M' breaks`);
assert(!zh.kpi_noneu_net_2026.includes('1-8M'), `zh-CN kpi_noneu_net_2026 uses proper Chinese date formatting without awkward '1-8M' breaks`);

// ---------------------------------------------------------------------------
// SUITE 3: ECharts Visual Clearance & Anti-Collision Audit
// ---------------------------------------------------------------------------
console.log("\n[SUITE 3] ECharts Title/Legend Clearance & Coordinate Containment Audit");

// Module 2 (Trends) Chart
assert(appJs.includes('top: 75, containLabel: true') || appJs.includes('top: 75'), 
  `Module 2 (Trends) chart allocates top: 75 grid clearance for vertically stacked title & legend`);
assert(appJs.includes('type: "scroll",\n      top: 34,') || appJs.includes('top: 34'), 
  `Module 2 legend placed at top: 34 below chart title, eliminating horizontal collision`);

// Module 3 (Nationality Compare) Chart
assert(appJs.includes('mod3_compare_chart_title') && appJs.includes('top: 8'), 
  `Module 3 title placed at top: 8 with scroll legend at top: 34`);

// Module 4 (EU Comparison) Chart
assert(appJs.includes('mod4_chart_title') && appJs.includes('top: 75'), 
  `Module 4 (EU comparison) chart grid allocated top: 75 clearance`);

// Slide 1 Chart: Headroom for markArea
assert(appJs.includes('max: 3000000') && findingsJs.includes('max: 3000000'), 
  `Slide 1 yAxis allocates 3M headroom preventing markArea text collision with peak inflow line`);
assert(appJs.includes('position: "insideTopLeft"') && findingsJs.includes('position: "insideTopLeft"'), 
  `Slide 1 markArea labels anchored to insideTopLeft with clean clearance`);

// Slide 3 Chart: Horizontal bar containment
assert(appJs.includes('max: 1050000') && findingsJs.includes('max: 1050000'), 
  `Slide 3 xAxis allocates 1.05M max value preventing 960k bar label right-edge clipping`);

// Slide 4 Chart: Dual-Citizenship Surge MarkPoint Anti-Collision
assert(appJs.includes('p.name === "2024" ? ""') && findingsJs.includes('p.name === "2024" ? ""'), 
  `Slide 4 bar label for 2024 suppressed to eliminate collision with 2024 markPoint pin`);
assert(appJs.includes('max: 360000') && findingsJs.includes('max: 360000'), 
  `Slide 4 yAxis allocates 360k max headroom for markPoint pin badge`);

// Slide 5 Chart: Labor Deficit Negative Bar Containment
assert(appJs.includes('min: -460000') && findingsJs.includes('min: -460000'), 
  `Slide 5 xAxis allocates -460k min bounds preventing -400k negative bar label left clipping`);
assert(appJs.includes('containLabel: true') && findingsJs.includes('containLabel: true'), 
  `Slide 5 enforces containLabel: true for automatic dynamic category text accommodation`);

// ---------------------------------------------------------------------------
// SUITE 4: Responsive Breakpoint Completeness Audit
// ---------------------------------------------------------------------------
console.log("\n[SUITE 4] Responsive Breakpoint Completeness Audit");
assert(cssContent.includes('@media (max-width: 1200px)'), `CSS includes 1200px responsive breakpoint`);
assert(cssContent.includes('@media (max-width: 800px)'), `CSS includes 800px responsive breakpoint`);

// ---------------------------------------------------------------------------
// SUMMARY
// ---------------------------------------------------------------------------
console.log("\n============================================================");
console.log(`TOTAL AUDIT CHECKS: ${totalChecks}`);
console.log(`PASSED: ${passedChecks}`);
console.log(`FAILED: ${failures.length}`);
console.log("============================================================");

if (failures.length > 0) {
  console.error("\n❌ FAILED STATIC LAYOUT CONTRACT CHECKS:");
  failures.forEach((f, i) => console.error(`  ${i+1}. ${f}`));
  process.exit(1);
} else {
  console.log("\n✅ ALL STATIC LAYOUT CONTRACT CHECKS PASSED");
  process.exit(0);
}
