import puppeteer from 'puppeteer';
import {
  goFromMainToBaseSearchResults,
  getRegionsList,
  expandLocationPicker,
  selectRegion,
  nextPage,
  searchAndWaitForNavigation,
  autoScroll,
} from './pageInteraction';

import { getAveragePriceFromListingItem } from './extractPriceData';

(async (): Promise<void> => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await goFromMainToBaseSearchResults(page);
  await page.waitForNavigation();

  await expandLocationPicker(page);
  const regions = await getRegionsList(page);
  await selectRegion(regions[0].name);
  await searchAndWaitForNavigation(page);
  await autoScroll(page);

  await getAveragePriceFromListingItem(page);
})();
