import { ElementHandle, Page } from 'puppeteer';
import {
  DropDownElement,
  ElementHandleWithStatus,
  ListingType,
  ParentLocation,
} from './utils/types.ts';

const OTO_DOM_BASE_URL = 'https://www.otodom.pl/';
const regionDropDownElements: DropDownElement[] = [];

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

export const expandCityPicker = async (page: Page, region: string): Promise<boolean> => {
  const regionListHTMLElement = await getRegionsListHTMLElement(page, region);
  if (!regionListHTMLElement) return false;

  await regionListHTMLElement.button.element.click();
  await regionListHTMLElement.button.element.dispose();
  return true;
};

export const getCitiesList = async (
  page: Page,
  parentRegion: string,
): Promise<Array<ParentLocation>> => {
  const cities: Array<ParentLocation> = [];
  await page.waitForSelector('ul[data-testid="regions-list"] ul li[role="menuitem"]');
  const citiesHTMLElementsList = await page.$$(
    'ul[data-testid="regions-list"] ul li[role="menuitem"]',
  );

  for (let i = 0; i < citiesHTMLElementsList.length; i++) {
    const labelElement = await citiesHTMLElementsList[i].$('label[data-cy*="location"]');
    const buttonElement = await citiesHTMLElementsList[i].$('button');
    const checkboxElement = await citiesHTMLElementsList[i].$('label[data-cy="checkboxButton"]');
    if (!labelElement) continue;

    const cityText = await labelElement.evaluate((e) => e.textContent);
    const cityElement: DropDownElement = {
      name: cityText,
      checkbox: { element: checkboxElement, isActive: false },
      label: { element: labelElement, isActive: false },
    };
    if (buttonElement) cityElement['button'] = { element: buttonElement, isActive: false };
    for (const region of regionDropDownElements) {
      if (region.name === parentRegion) {
        if (!region.children) region['children'] = [];
        region['children'].push(cityElement);
        break;
      }
    }

    cities.push({ name: cityText });
  }
  return cities;
};

export const getRegionsList = async (page: Page): Promise<Array<ParentLocation>> => {
  const regions: Array<ParentLocation> = [];
  const regionsHTMLElementsList = await page.$$(
    'ul[data-testid="regions-list"] li[role="menuitem"]',
  );

  for (let i = 0; i < regionsHTMLElementsList.length; i++) {
    const labelElement = await regionsHTMLElementsList[i].$('label[data-cy*="location"]');
    const buttonElement = await regionsHTMLElementsList[i].$('button');
    const checkboxElement = await regionsHTMLElementsList[i].$('label[data-cy="checkboxButton"]');
    if (!labelElement) continue;

    const regionText = await labelElement.evaluate((e) => e.textContent);
    const regionElement: DropDownElement = {
      name: regionText,
      checkbox: { element: checkboxElement, isActive: false },
      label: { element: labelElement, isActive: false },
    };
    if (buttonElement) regionElement['button'] = { element: buttonElement, isActive: false };
    regionDropDownElements.push(regionElement);

    regions.push({ name: regionText });
  }
  return regions;
};

export const getRegionsListHTMLElement = async (
  page: Page,
  regionName: string,
): Promise<DropDownElement> => {
  const regionsHTMLElementsList = await page.$$(
    'ul[data-testid="regions-list"] li[role="menuitem"]',
  );

  for (let i = 0; i < regionsHTMLElementsList.length; i++) {
    const labelElement = await regionsHTMLElementsList[i].$('label[data-cy*="location"]');
    const buttonElement = await regionsHTMLElementsList[i].$('button');
    const checkboxElement = await regionsHTMLElementsList[i].$('label[data-cy="checkboxButton"]');
    const regionText = await labelElement.evaluate((e) => e.textContent);
    if (regionText !== regionName) continue;
    const regionElement: DropDownElement = {
      name: regionText,
      checkbox: { element: checkboxElement, isActive: false },
      label: { element: labelElement, isActive: false },
      button: { element: buttonElement, isActive: false },
    };
    return regionElement;
  }
  return null;
};

export const selectRegion = async (region: string): Promise<boolean> => {
  for (let i = 0; i < regionDropDownElements.length; i++) {
    if (regionDropDownElements[i].name === region) {
      await regionDropDownElements[i].checkbox.element.click();
      await regionDropDownElements[i].checkbox.element.dispose();
      regionDropDownElements[i].checkbox.isActive = true;

      return true;
    }
  }

  return false;
};

export const selectCity = async (page: Page, city: string): Promise<boolean> => {
  await page.waitForSelector('ul[data-testid="regions-list"] ul li[role="menuitem"]');
  const citiesHTMLElementsList = await page.$$(
    'ul[data-testid="regions-list"] ul li[role="menuitem"]',
  );

  for (let i = 0; i < citiesHTMLElementsList.length; i++) {
    const labelElement = await citiesHTMLElementsList[i].$('label[data-cy*="location"]');
    const cityText = await labelElement.evaluate((e) => e.textContent);
    if (cityText === city) {
      const checkboxElement = await citiesHTMLElementsList[i].$('label[data-cy="checkboxButton"]');
      await checkboxElement.click();
      await checkboxElement.dispose();
      return true;
    }
  }
  return false;
};

export const expandAndGetCityZonesList = async (page: Page, city: string): Promise<boolean> => {
  const zones: string[] = [];
  await page.waitForSelector('ul[data-testid="regions-list"] ul li[role="menuitem"]');
  const citiesHTMLElementsList = await page.$$(
    'ul[data-testid="regions-list"] ul li[role="menuitem"]',
  );
  for (let i = 0; i < citiesHTMLElementsList.length; i++) {
    const labelElement = await citiesHTMLElementsList[i].$('label[data-cy*="location"]');
    if (!labelElement) continue;
    const cityText = await labelElement.evaluate((e) => e.textContent);
    if (cityText === city) {
      const expandZonesPickerBtn = await citiesHTMLElementsList[i].$('button');
      if (expandZonesPickerBtn) console.log(city);
    }
  }
  return false;
};

export const searchAndWaitForNavigation = async (page: Page): Promise<void> => {
  const searchBtn = await page.waitForSelector('#search-form-submit');
  await searchBtn.click();
  await page.waitForNavigation();
};

export const nextPage = async (page: Page): Promise<boolean> => {
  try {
    await page.waitForSelector('div[role="navigation"] nav[data-cy="pagination"]', {
      timeout: 1000,
    });
  } catch (err) {
    return false;
  }

  const nextPageButton = await page.waitForSelector('button[data-cy="pagination.next-page"]');
  const isDisabled = await nextPageButton.evaluate((b) => b.getAttribute('disabled') === '');

  if (isDisabled) return false;
  await nextPageButton.click();
  await nextPageButton.dispose();
  await page.waitForNavigation();
  return true;
};

export const autoScroll = async (page: Page): Promise<void> => {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
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
      }, 50);
    });
  });
};

export const scrollToPaginationBar = async (page: Page): Promise<void> => {
  await page.evaluate(() => {
    const paginationBar = document.querySelector('div[role="navigation"]');
    paginationBar.scrollIntoView({ behavior: 'auto', block: 'center', inline: 'center' });
  });
};

export const getListingsCount = async (page: Page): Promise<number> => {
  const listingsLabels = await page.$$(
    'strong[data-cy="search.listing-panel.label.ads-number"] span',
  );
  if (!listingsLabels[1]) return 0;
  const listingsCount = await listingsLabels[1].evaluate((s) => s.innerText);
  return Number(listingsCount);
};

export const showListingsByMarketTypeWithCurrentFilters = async (
  page: Page,
  marketType: ListingType,
): Promise<void> => {
  const currentUrl = new URL(page.url());

  if (currentUrl.pathname.includes(marketType)) {
    currentUrl.pathname = currentUrl.pathname.replace(`/${marketType}`, '');
  }

  currentUrl.pathname = `${currentUrl.pathname}/${marketType}`;
  await page.goto(currentUrl.href);
};

export const;
