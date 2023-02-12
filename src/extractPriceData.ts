import { Page } from 'puppeteer';

export const getAveragePriceFromListingItem = async (page: Page): Promise<number> => {
  const listingItems = await page.$$('li[data-cy="listing-item"]');
  for (let i = 0; i < listingItems.length; i++) {
    const listingItemInfoDivs = await listingItems[i].$$('article div');
    if (!listingItemInfoDivs) continue;

    const avgPriceElement = (await listingItemInfoDivs[2].$$('span'))[1];
    const avgPrice = await avgPriceElement.evaluate((e) => e.innerText);
    if (!avgPrice) continue;
    console.log(Number(avgPrice.replace(/[^0-9.-]+/g, '')));
  }
  return 0;
};
