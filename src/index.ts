import puppeteer from 'puppeteer';
import {
  goFromMainToBaseSearchResults,
  getRegionsList,
  expandLocationPicker,
} from './pageInteraction';

(async (): Promise<void> => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await goFromMainToBaseSearchResults(page);
  await page.waitForNavigation();
  const baseSearchUrl = page.url();
  console.log(baseSearchUrl);

  await expandLocationPicker(page);
  const regions = await getRegionsList(page);
  console.log(regions);
})();
