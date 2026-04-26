#!/usr/bin/env python3
"""Simple script to capture screenshot of the UI for verification"""
import subprocess
import sys

def main():
    url = "https://8080-iq07g0inl6nzk3fwuzsv2-dfc00ec5.sandbox.novita.ai"

    # Use playwright to screenshot
    try:
        from playwright.sync_api import sync_playwright

        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page(viewport={'width': 1280, 'height': 800})
            page.goto(url, wait_until='networkidle', timeout=30000)

            # Wait a bit for any animations
            page.wait_for_timeout(2000)

            # Take screenshot
            page.screenshot(path='/home/user/webapp/ui_check.png', full_page=True)
            print("Screenshot saved to ui_check.png")

            browser.close()
    except Exception as e:
        print(f"Screenshot failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
