import { Page } from 'puppeteer';
import { RegionWithCities } from './types';

const OTO_DOM_BASE_URL = 'https://www.otodom.pl/';

export const goFromMainToBaseSearchResults = async (
  page: Page,
): Promise<void> => {
  await page.goto(OTO_DOM_BASE_URL);
  await page.setViewport({ width: 1280, height: 1024 });

  const acceptCookiesBtn = await page.waitForSelector(
    '#onetrust-accept-btn-handler',
  );
  await acceptCookiesBtn.click();
  await acceptCookiesBtn.dispose();

  const searchBtn = await page.waitForSelector('#search-form-submit');
  await searchBtn.click();
  await searchBtn.dispose();
};

export const expandLocationPicker = async (page: Page): Promise<void> => {
  const locationPicker = await page.waitForSelector('#location');
  await locationPicker.click();
  await locationPicker.dispose();
};

export const getRegionsList = async (
  page: Page,
): Promise<Array<RegionWithCities>> => {
  const regions: Array<RegionWithCities> = [];

  const regionsHTMLElementsList = await page.$$(
    'ul[data-testid="regions-list"] li[role="menuitem"]',
  );
  for (let i = 0; i < regionsHTMLElementsList.length; i++) {
    const labelElement = await regionsHTMLElementsList[i].$(
      'label[data-cy*="location"]',
    );
    if (!labelElement) continue;
    const regionText = await labelElement.evaluate((e) => e.textContent);

    regions.push({ name: regionText, cities: [] });
  }

  return regions;
};

export const searchByCityOrRegion = async (page: Page): Promise<void> => {};
