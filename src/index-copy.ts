import puppeteer from 'puppeteer';
import * as dotenv from 'dotenv';
dotenv.config();

import { GoogleSpreadsheetConnector } from './googleSheetsConnectionSingleton.ts';
import {
  goFromMainToBaseSearchResults,
  getRegionsList,
  expandLocationPicker,
  nextPage,
  searchAndWaitForNavigation,
  autoScroll,
  expandCityPicker,
  getCitiesList,
  selectCity,
  scrollToPaginationBar,
  getListingsCount,
  showListingsByMarketTypeWithCurrentFilters,
} from './pageInteraction.ts';
import { getAveragePriceFromListingItem } from './extractPriceData.ts';
import { ListingType, ListingTypes } from './utils/types.ts';
import { sleep } from './utils/helpers.ts';

(async (): Promise<void> => {
  const googleSpreadsheetConnector = await GoogleSpreadsheetConnector.getInstance();
  if (!googleSpreadsheetConnector.doc) {
    console.log('Error occured while loading Google Spreadsheet.');
    return;
  }
  const scriptStart = new Date();
  const isHeadless = process.env.BRROWSER_LAUNCH;
  const browser = await puppeteer.launch({ headless: !!isHeadless });
  const page = await browser.newPage();

  await goFromMainToBaseSearchResults(page);
  await page.waitForNavigation();
  const baseSearchUrl = page.url();

  await expandLocationPicker(page);
  const regions = await getRegionsList(page);
  await page.reload();
  await sleep(1000);

  for (let i = 0; i < regions.length; i++) {
    const regionSheet = await googleSpreadsheetConnector.getSpreadSheetByTitle(regions[i].name);

    await expandLocationPicker(page);
    await expandCityPicker(page, regions[i].name);
    const cities = await getCitiesList(page, regions[i].name);
    await page.goto(baseSearchUrl);

    for (let j = 0; j < cities.length; j++) {
      let nextPageAvailable = true;
      let cityPrices = new Array<number>();

      for (let x = 0; x < ListingTypes.length; x++) {
        await expandLocationPicker(page);
        await expandCityPicker(page, regions[i].name);
        await selectCity(page, cities[j].name);
        await searchAndWaitForNavigation(page);
        await showListingsByMarketTypeWithCurrentFilters(page, ListingTypes[x]);
        await sleep(1000);

        const listingsCount = await getListingsCount(page);
        while (nextPageAvailable) {
          await autoScroll(page);
          cityPrices.push(...(await getAveragePriceFromListingItem(page)));
          await scrollToPaginationBar(page);
          nextPageAvailable = await nextPage(page);
        }
        const avgPrice =
          cityPrices.length > 0 ? cityPrices.reduce((a, b) => a + b, 0) / cityPrices.length : 0;
        const localeAvgPrice = Number(avgPrice.toFixed(2)).toLocaleString('pl-PL');
        regionSheet.addRow([
          cities[j].name,
          new Date().toLocaleDateString(),
          localeAvgPrice,
          ListingTypes[x],
          listingsCount,
        ]);

        nextPageAvailable = true;
        cityPrices = [];
        await page.goto(baseSearchUrl);
      }
    }
  }

  const scriptEnd = new Date();
  console.log('Web scraping took: ', (scriptEnd.getTime() - scriptStart.getTime()) / 1000, 's');
})();
