import { Page } from 'puppeteer';

export const getAveragePriceFromListingItem = async (page: Page): Promise<number[]> => {
  const avgPricesForOnePage = new Array<number>();
  const listingItems = await page.$$('li[data-cy="listing-item"]');
  for (let i = 0; i < listingItems.length; i++) {
    const listingItemInfoDivs = await listingItems[i].$$('article div');
    if (!listingItemInfoDivs) continue;

    const avgPriceElement = (await listingItemInfoDivs[2].$$('span'))[1];
    const avgPrice = await avgPriceElement.evaluate((e) => e.innerText);
    if (!avgPrice) continue;
    avgPricesForOnePage.push(Number(avgPrice.replace(/[^0-9.-]+/g, '')));
  }
  return avgPricesForOnePage;
};
