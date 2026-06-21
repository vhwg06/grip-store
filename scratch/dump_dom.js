const { chromium } = require('playwright');
const fs = require('fs');

async function run() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    storageState: 'playwright/src/fixtures/.auth/admin.json'
  });
  const page = await context.newPage();
  await page.goto('http://localhost:3000/admin/users');
  await page.waitForLoadState('networkidle');

  // Find all divs containing the link
  const divs = await page.evaluate(() => {
    const results = [];
    const allDivs = Array.from(document.querySelectorAll('div'));
    for (const div of allDivs) {
      if (div.querySelector('a[href*="test_buyer"]')) {
        results.push({
          className: div.className,
          id: div.id,
          tagName: div.tagName,
          html: div.outerHTML.substring(0, 200)
        });
      }
    }
    return results;
  });

  console.log("Found", divs.length, "divs:");
  divs.forEach((d, i) => {
    console.log(`[${i}] <${d.tagName} id="${d.id}" class="${d.className}">`);
    console.log(`    HTML excerpt: ${d.html.replace(/\n/g, ' ')}...`);
  });

  await browser.close();
}

run().catch(console.error);
