import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('BROWSER_ERROR:', msg.text());
    }
  });
  
  page.on('pageerror', err => {
    console.log('PAGE_EXCEPTION:', err.toString());
  });

  try {
     console.log('Navigating to local vite server...');
     await page.goto('http://localhost:5173', { waitUntil: 'networkidle2', timeout: 8000 });
     
     console.log('Attempting to type into Role input...');
     await page.type('input[placeholder="e.g. Frontend Developer"]', 'test', {delay: 100});
     await new Promise(r => setTimeout(r, 1000));
     
     console.log('Interactions complete. Any errors above?');
  } catch(e) {
     console.log('Navigation Err:', e.message);
  }
  await browser.close();
})();
