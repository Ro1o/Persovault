"""
PersoVault — Professional Test Summary Report
Run this after pytest to generate a formatted summary table.

Usage:
    pytest tests/ -v --tb=short -p no:warnings > test_results.txt 2>&1
    python tests/generate_report.py
"""

import subprocess
import sys
import os
from datetime import datetime

# ── Colour codes for terminal ──────────────────────────────────────────────────
GREEN  = "\033[92m"
RED    = "\033[91m"
YELLOW = "\033[93m"
CYAN   = "\033[96m"
BOLD   = "\033[1m"
RESET  = "\033[0m"

# ── Test suite definitions ─────────────────────────────────────────────────────
SUITES = {
    "test_1_unit":          "Unit Testing",
    "test_2_functional":    "Functional Testing",
    "test_3_blackbox":      "Black Box Testing",
    "test_4_api":           "API Endpoint Coverage",
    "test_5_performance":   "Performance Testing",
    "test_6_security_rbac": "Security & RBAC Testing",
}


def run_pytest():
    """Run pytest and capture output."""
    print(f"\n{CYAN}{BOLD}{'═' * 70}{RESET}")
    print(f"{CYAN}{BOLD}   PersoVault — Running Full Test Suite{RESET}")
    print(f"{CYAN}{BOLD}{'═' * 70}{RESET}\n")

    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

    result = subprocess.run(
        [sys.executable, "-m", "pytest", "tests/", "-v", "--tb=short", "-p", "no:warnings"],
        capture_output=True,
        text=True,
        cwd=backend_dir,
        env={**os.environ, "PYTHONPATH": backend_dir}
    )
    return result.stdout + result.stderr


def parse_results(output):
    """Parse pytest output into per-suite stats."""
    suite_stats = {key: {"passed": 0, "failed": 0, "tests": []} for key in SUITES}

    for line in output.splitlines():
        for key in SUITES:
            if key in line:
                if " PASSED" in line:
                    suite_stats[key]["passed"] += 1
                    # Extract test name
                    test_name = line.split("::")[-1].replace(" PASSED", "").strip()
                    suite_stats[key]["tests"].append(("PASSED", test_name))
                elif " FAILED" in line:
                    suite_stats[key]["failed"] += 1
                    test_name = line.split("::")[-1].replace(" FAILED", "").strip()
                    suite_stats[key]["tests"].append(("FAILED", test_name))

    return suite_stats


def print_report(output, suite_stats):
    """Print the full professional report."""

    now = datetime.now().strftime("%d %B %Y, %H:%M:%S")

    print(f"\n{CYAN}{BOLD}{'═' * 70}{RESET}")
    print(f"{CYAN}{BOLD}   PersoVault Digital Identity System — Test Evaluation Report{RESET}")
    print(f"{CYAN}   Generated: {now}{RESET}")
    print(f"{CYAN}{BOLD}{'═' * 70}{RESET}\n")

    # ── Per-suite table ────────────────────────────────────────────────────────
    total_passed = 0
    total_failed = 0
    total_tests  = 0

    col1 = 30
    col2 = 8
    col3 = 8
    col4 = 8
    col5 = 10

    header = (
        f"{'Test Suite':<{col1}}"
        f"{'Tests':>{col2}}"
        f"{'Passed':>{col3}}"
        f"{'Failed':>{col4}}"
        f"{'Success':>{col5}}"
    )
    divider = "─" * (col1 + col2 + col3 + col4 + col5 + 4)

    print(f"{BOLD}{header}{RESET}")
    print(divider)

    for key, label in SUITES.items():
        stats  = suite_stats[key]
        passed = stats["passed"]
        failed = stats["failed"]
        total  = passed + failed

        if total == 0:
            continue

        rate = (passed / total * 100) if total > 0 else 0
        rate_str = f"{rate:.0f}%"

        color = GREEN if rate == 100 else (YELLOW if rate >= 80 else RED)

        print(
            f"{label:<{col1}}"
            f"{total:>{col2}}"
            f"{BOLD}{GREEN}{passed:>{col3}}{RESET}"
            f"{(RED + str(failed) if failed > 0 else str(failed)):>{col4 + (len(RED)+len(RESET) if failed > 0 else 0)}}"
            f"{color}{BOLD}{rate_str:>{col5}}{RESET}"
        )

        total_passed += passed
        total_failed += failed
        total_tests  += total

    print(divider)
    overall_rate = (total_passed / total_tests * 100) if total_tests > 0 else 0
    overall_color = GREEN if overall_rate == 100 else (YELLOW if overall_rate >= 80 else RED)

    print(
        f"{BOLD}{'TOTAL':<{col1}}"
        f"{total_tests:>{col2}}"
        f"{GREEN}{total_passed:>{col3}}{RESET}"
        f"{BOLD}{(RED + str(total_failed) if total_failed > 0 else str(total_failed)):>{col4 + (len(RED)+len(RESET) if total_failed > 0 else 0)}}{RESET}"
        f"{overall_color}{BOLD}{overall_rate:.1f}%{' ':>{col5 - len(f'{overall_rate:.1f}%')}}{RESET}"
    )

    print(f"\n{BOLD}Overall Result: ", end="")
    if overall_rate == 100:
        print(f"{GREEN}ALL TESTS PASSED ✓{RESET}")
    elif overall_rate >= 80:
        print(f"{YELLOW}MOSTLY PASSING — review failures{RESET}")
    else:
        print(f"{RED}FAILURES DETECTED — action required{RESET}")

    # ── Per-suite detail ───────────────────────────────────────────────────────
    print(f"\n{BOLD}{'─' * 70}{RESET}")
    print(f"{BOLD}Detailed Results by Suite{RESET}")
    print(f"{'─' * 70}{RESET}")

    for key, label in SUITES.items():
        stats  = suite_stats[key]
        passed = stats["passed"]
        failed = stats["failed"]
        total  = passed + failed

        if total == 0:
            continue

        rate = (passed / total * 100) if total > 0 else 0
        color = GREEN if rate == 100 else (YELLOW if rate >= 80 else RED)

        print(f"\n  {BOLD}{label}{RESET} — {color}{passed}/{total} passed ({rate:.0f}%){RESET}")

        for status, name in stats["tests"]:
            icon  = f"{GREEN}✓{RESET}" if status == "PASSED" else f"{RED}✗{RESET}"
            tname = name.replace("test_", "").replace("_", " ").title()
            print(f"    {icon}  {tname}")

    # ── Summary for report ─────────────────────────────────────────────────────
    print(f"\n{CYAN}{BOLD}{'═' * 70}{RESET}")
    print(f"{CYAN}{BOLD}   Summary for Report{RESET}")
    print(f"{CYAN}{BOLD}{'═' * 70}{RESET}")
    print(f"\n  Total Tests Executed : {BOLD}{total_tests}{RESET}")
    print(f"  Tests Passed         : {GREEN}{BOLD}{total_passed}{RESET}")
    print(f"  Tests Failed         : {(RED + BOLD + str(total_failed) + RESET) if total_failed > 0 else str(total_failed)}")
    print(f"  Overall Success Rate : {overall_color}{BOLD}{overall_rate:.1f}%{RESET}")
    print(f"  Test Suites          : {BOLD}{len([k for k in SUITES if suite_stats[k]['passed'] + suite_stats[k]['failed'] > 0])}{RESET}")
    print(f"  Date of Execution    : {BOLD}{now}{RESET}")

    if total_failed > 0:
        print(f"\n  {RED}{BOLD}Failed Tests:{RESET}")
        for key in SUITES:
            for status, name in suite_stats[key]["tests"]:
                if status == "FAILED":
                    print(f"    {RED}✗{RESET}  {SUITES[key]} — {name}")

    print(f"\n{CYAN}{BOLD}{'═' * 70}{RESET}\n")


def main():
    output = run_pytest()
    # Print raw pytest output
    print(output)
    # Parse and print summary
    suite_stats = parse_results(output)
    print_report(output, suite_stats)


if __name__ == "__main__":
    main()