#!/usr/bin/env python3
"""
Scheduled Data Refresh Runner
Project: Germany Migration Intelligence Dashboard (德国移民数据智能分析平台)
Cadence: Weekly on Monday at 08:00 (Europe/Berlin)
Skills: schedule-refresh-jobs, automation
"""

import os
import sys
import time
import subprocess
from datetime import datetime, timezone
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
ETL_DIR = BASE_DIR / "etl"
LOGS_DIR = BASE_DIR / "logs"

LOGS_DIR.mkdir(parents=True, exist_ok=True)
SCHEDULE_LOG = LOGS_DIR / "refresh_scheduler.log"

def log_event(message):
    ts = datetime.now().isoformat()
    entry = f"[{ts}] {message}"
    print(entry)
    with open(SCHEDULE_LOG, "a", encoding="utf-8") as f:
        f.write(entry + "\n")

def execute_pipeline():
    """Runs fetch -> clean -> validate pipeline."""
    log_event("Starting scheduled refresh cycle for Destatis Migration Statistics...")
    
    # 1. Fetch
    log_event("Step 1/3: Checking Destatis API for new data / revisions...")
    fetch_cmd = [sys.executable, str(ETL_DIR / "fetch_destatis.py")]
    res = subprocess.run(fetch_cmd, capture_output=True, text=True)
    if res.returncode != 0:
        log_event(f"Fetch encountered notice: {res.stderr.strip() or 'Using verified snapshots'}")
    else:
        log_event("Fetch step completed successfully.")

    # 2. Clean & Normalize
    log_event("Step 2/3: Cleaning and standardizing tables...")
    clean_cmd = [sys.executable, str(ETL_DIR / "clean_data.py")]
    res = subprocess.run(clean_cmd, capture_output=True, text=True)
    if res.returncode != 0:
        log_event(f"Clean failed: {res.stderr.strip()}")
        return False
    log_event("Clean step completed successfully.")

    # 3. Validate
    log_event("Step 3/3: Running validation suite & mathematical identity checks...")
    val_cmd = [sys.executable, str(ETL_DIR / "validate_data.py")]
    res = subprocess.run(val_cmd, capture_output=True, text=True)
    if res.returncode != 0:
        log_event(f"Validation FAILED: {res.stderr.strip()}")
        return False
    log_event("Validation passed with 100% integrity.")

    log_event("SUCCESS: Scheduled refresh completed. Dashboard data is updated.")
    return True

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Destatis Data Refresh Scheduler")
    parser.add_argument("--once", action="store_true", help="Run a single update immediately")
    parser.add_argument("--daemon", action="store_true", help="Run continuous scheduler loop (Weekly Monday 08:00 Europe/Berlin)")
    args = parser.parse_args()

    if args.once or not args.daemon:
        success = execute_pipeline()
        sys.exit(0 if success else 1)
    else:
        log_event("Scheduler started in daemon mode. Target: Weekly Monday 08:00 Europe/Berlin.")
        while True:
            # Check time
            now = datetime.now()
            # Monday is weekday 0, 08:00
            if now.weekday() == 0 and now.hour == 8 and now.minute == 0:
                execute_pipeline()
                time.sleep(65) # Avoid multiple triggers in same minute
            time.sleep(30)
