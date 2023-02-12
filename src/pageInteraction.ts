import { ElementHandle, Page } from 'puppeteer';
import { ElementHandleWithStatus, RegionWithCities } from './types';

const OTO_DOM_BASE_URL = 'https://www.otodom.pl/';
// saved elements for improved performance
let searchBtnElement: ElementHandle<Element>;
const regionLabelsElements: ElementHandleWithStatus[] = [];

export const goFromMainToBaseSearchResults = async (page: Page): Promise<void> => {
  await page.goto(OTO_DOM_BASE_URL);
  await page.setViewport({ width: 1280, height: 1024 });

  const acceptCookiesBtn = await page.waitForSelector('#onetrust-accept-btn-handler');
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

export const getRegionsList = async (page: Page): Promise<Array<RegionWithCities>> => {
  const regions: Array<RegionWithCities> = [];

  //save reference for search button
  searchBtnElement = await page.waitForSelector('#search-form-submit');

  const regionsHTMLElementsList = await page.$$(
    'ul[data-testid="regions-list"] li[role="menuitem"]',
  );
  for (let i = 0; i < regionsHTMLElementsList.length; i++) {
    const labelElement = await regionsHTMLElementsList[i].$('label[data-cy*="location"]');
    if (!labelElement) continue;
    regionLabelsElements.push({ element: labelElement, isActive: false });
    const regionText = await labelElement.evaluate((e) => e.textContent);

    regions.push({ name: regionText });
  }

  return regions;
};

export const selectRegion = async (region: string): Promise<boolean> => {
  let searchedRegionLabelElement;
  for (let i = 0; i < regionLabelsElements.length; i++) {
    const nodeTextContent = await regionLabelsElements[i].element.evaluate((e) => e.textContent);
    if (nodeTextContent === region) {
      searchedRegionLabelElement = regionLabelsElements[i];
      break;
    }
  }

  if (!searchedRegionLabelElement) return false;
  const regionSelectCheckbox = await searchedRegionLabelElement.element.evaluateHandle(
    (l) => l.previousElementSibling,
  );

  await regionSelectCheckbox.click();
  await regionSelectCheckbox.dispose();
  searchedRegionLabelElement.isActive = true;
  return true;
};

export const searchAndWaitForNavigation = async (page: Page): Promise<void> => {
  await searchBtnElement.click();
  await page.waitForNavigation();
};

export const nextPage = async (page: Page): Promise<void> => {
  // go to the next page if possible and return true
  // else return false
};

export const autoScroll = async (page: Page): Promise<void> => {
  await page.evaluate(async () => {
    await new Promise<void>((resolve, reject) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
};
