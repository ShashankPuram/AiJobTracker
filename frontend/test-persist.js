import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER_CONSOLE:', msg.text()));

  try {
     console.log('Navigating to local vite server /login...');
     await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
     
     console.log('Testing login logic...');
     await page.type('input[type="email"]', 'test@gmail.com');
     await page.type('input[type="password"]', 'test@123');
     await page.click('button[type="submit"]');
     
     await page.waitForNavigation({ waitUntil: 'networkidle2' });
     console.log('URL after login:', page.url());
     
     const ls1 = await page.evaluate(() => localStorage.getItem('auth-storage'));
     console.log('localStorage auth-storage:', ls1);
     
     console.log('Reloading page...');
     await page.reload({ waitUntil: 'networkidle2' });
     
     console.log('URL after reload:', page.url());
     
     const ls2 = await page.evaluate(() => localStorage.getItem('auth-storage'));
     console.log('localStorage auth-storage after reload:', ls2);

  } catch(e) {
     console.log('Navigation Err:', e.message);
  }
  await browser.close();
})();
