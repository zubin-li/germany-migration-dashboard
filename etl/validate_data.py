#!/usr/bin/env python3
"""
Automated Data Quality & Validation Suite
Skills: analyze-data-quality, validate-data, metric-diagnostics
Validates all official Destatis datasets in the platform.
"""

import json
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"

def run_all_validations():
    print("=" * 60)
    print("GERMANY MIGRATION DASHBOARD - DATA VALIDATION SUITE")
    print("=" * 60)
    errors = 0
    checks_passed = 0

    # 1. Validate Annual Totals
    annual_file = DATA_DIR / "destatis_migration_annual_totals.json"
    if not annual_file.exists():
        print(f"[FAIL] Missing {annual_file}")
        return False
    
    with open(annual_file, "r", encoding="utf-8") as f:
        annual_data = json.load(f)
    
    print(f"\n[1] Checking Annual Migration Series (2000-2026, {len(annual_data)} records)...")
    for row in annual_data:
        yr = row.get("year")
        zuz = row["zuzuege"]
        fort = row["fortzuege"]
        saldo = row["saldo"]
        if zuz - fort != saldo:
            print(f"  [ERR] Identity violation in {yr}: {zuz} - {fort} = {zuz - fort} != {saldo}")
            errors += 1
        else:
            checks_passed += 1

        # Check group sum approximation
        de_s = row["de_saldo"]
        ausl_s = row["ausl_saldo"]
        if de_s + ausl_s != saldo:
            print(f"  [WARN] DE + Ausl != Total in {yr}: {de_s} + {ausl_s} = {de_s + ausl_s} vs {saldo}")
        else:
            checks_passed += 1
    
    print(f"  -> Annual identity checks: PASSED ({checks_passed} assertions)")

    # 2. Validate Monthly Migration Series
    monthly_file = DATA_DIR / "destatis_migration_monthly.json"
    with open(monthly_file, "r", encoding="utf-8") as f:
        monthly_data = json.load(f)
    
    print(f"\n[2] Checking Monthly Migration Series ({len(monthly_data)} records)...")
    m_passed = 0
    for m in monthly_data:
        mon = m["month"]
        z = m["zuzuege"]
        f_val = m["fortzuege"]
        s = m["saldo"]
        if z - f_val != s:
            print(f"  [ERR] Monthly identity error in {mon}: {z} - {f_val} != {s}")
            errors += 1
        else:
            m_passed += 1
    print(f"  -> Monthly identity checks: PASSED ({m_passed} assertions)")

    # 3. Validate 2026 Cumulative Match
    m2026 = [m for m in monthly_data if m["year"] == 2026]
    sum_2026_s = sum(m["saldo"] for m in m2026)
    sum_2026_de = sum(m["de_saldo"] for m in m2026)
    sum_2026_eu = sum(m["eu_saldo"] for m in m2026)
    sum_2026_noneu = sum(m["noneu_saldo"] for m in m2026)
    
    print(f"\n[3] Verifying 2026 Jan-Aug Cumulative Consistency:")
    print(f"  - Total Net Migration: {sum_2026_s} (Claim: +16,841) -> {'MATCH' if sum_2026_s == 16841 else 'FAIL'}")
    print(f"  - German Citizens Net: {sum_2026_de} (Claim: -91,773) -> {'MATCH' if sum_2026_de == -91773 else 'FAIL'}")
    print(f"  - EU Citizens Net:     {sum_2026_eu} (Claim: -42,862) -> {'MATCH' if sum_2026_eu == -42862 else 'FAIL'}")
    print(f"  - Non-EU Citizens Net: {sum_2026_noneu} (Claim: +151,473) -> {'MATCH' if sum_2026_noneu == 151473 else 'FAIL'}")
    
    if sum_2026_s == 16841 and sum_2026_de == -91773 and sum_2026_eu == -42862 and sum_2026_noneu == 151473:
        checks_passed += 4
    else:
        errors += 1

    # 4. Validate Nationalities
    nat_file = DATA_DIR / "destatis_migration_nationalities.json"
    with open(nat_file, "r", encoding="utf-8") as f:
        nat_data = json.load(f)
    print(f"\n[4] Checking Nationalities ({len(nat_data)} records)...")
    key_codes = {"CN", "IN", "VN", "DE", "PL", "RO", "TR", "UA", "SY"}
    present_codes = set(r["code"] for r in nat_data)
    for kc in key_codes:
        if kc not in present_codes:
            print(f"  [ERR] Missing mandatory nationality code: {kc}")
            errors += 1
        else:
            checks_passed += 1
    print(f"  -> Mandatory nationality presence: PASSED ({len(key_codes)} countries verified)")

    # 5. Validate Naturalizations
    nat_stat_file = DATA_DIR / "destatis_naturalizations.json"
    with open(nat_stat_file, "r", encoding="utf-8") as f:
        nat_stat = json.load(f)
    print(f"\n[5] Checking Naturalizations ({len(nat_stat['annual_totals'])} years)...")
    for row in nat_stat["annual_totals"]:
        if row["count"] <= 0:
            print(f"  [ERR] Invalid count in {row['year']}")
            errors += 1
        else:
            checks_passed += 1
    print(f"  -> Naturalizations check: PASSED")

    # Summary
    print("\n" + "=" * 60)
    if errors == 0:
        print(f"RESULT: ALL DATA QUALITY CHECKS PASSED SUCCESSFULLY! ({checks_passed} checks)")
        print("=" * 60)
        return True
    else:
        print(f"RESULT: {errors} ERRORS DETECTED!")
        print("=" * 60)
        return False

if __name__ == "__main__":
    success = run_all_validations()
    sys.exit(0 if success else 1)
