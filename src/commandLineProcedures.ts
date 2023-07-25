import chalk from 'chalk';
import inquirer from 'inquirer';
import figlet from 'figlet';
import { createSpinner } from 'nanospinner';
import { sleep } from './utils/helpers.ts';

import {
  City,
  DATA_OUTPUT_DICTIONARY,
  DataOutputUnion,
  ParentLocation,
  RegionWithCity,
} from './utils/index.ts';
import { GoogleSpreadsheetConnector } from './googleSheetsConnectionSingleton.ts';
import puppeteer, { Page } from 'puppeteer';
import {
  expandAndGetCityZonesList,
  expandCityPicker,
  expandLocationPicker,
  getCitiesList,
  getRegionsList,
  goFromMainToBaseSearchResults,
} from './pageInteraction.ts';

let page: Page;
let baseSearchUrl: string;

export const displayStartBanner = (): void => {
  console.log(chalk.green(figlet.textSync('OTO  DOM  SCRAPER')));
  console.log(
    chalk.blue(
      `This cli app allows you to scrape cities and districts inside them for average apartments prices from otodom.pl and save them to Google Spreadsheet or .xlsx file`,
    ),
  );
};
export const askMethodOfDataOutput = async (): Promise<DataOutputUnion> => {
  const answers = await inquirer.prompt({
    name: 'data_output',
    type: 'list',
    message: 'Where do you want to save your saved data?\n',
    choices: [DATA_OUTPUT_DICTIONARY.GOOGLE_SHEETS, DATA_OUTPUT_DICTIONARY.XLSX_FILE],
  });

  switch (answers.data_output) {
    case DATA_OUTPUT_DICTIONARY.XLSX_FILE:
    case DATA_OUTPUT_DICTIONARY.GOOGLE_SHEETS:
      await (await GoogleSpreadsheetConnector.getInstance()).checkAndSetConfigConfig();
      break;
    default:
      throw new Error('Unknown response!');
  }
  return answers.data_output;
};
export const launchBrowser = async (): Promise<boolean> => {
  const spinner = createSpinner('Launching browser').start();
  const browser = await puppeteer.launch({ headless: false });
  page = await browser.newPage();
  spinner.success();
  return true;
};
export const goToMainPage = async (): Promise<string> => {
  const spinner = createSpinner('Starting search').start();
  await goFromMainToBaseSearchResults(page);
  await page.waitForNavigation();
  baseSearchUrl = page.url();
  spinner.success();
  return baseSearchUrl;
};
export const loadAllRegions = async (): Promise<ParentLocation[]> => {
  const spinner = createSpinner('Scraping regions').start();
  await expandLocationPicker(page);
  const regions = await getRegionsList(page);
  await page.reload();
  await sleep(1000);
  spinner.success();
  return regions;
};
export const askForCitiesToScrape = async (
  regions: ParentLocation[],
): Promise<RegionWithCity[]> => {
  let selectedCities: RegionWithCity[] = [];

  for (let i = 0; i < 1; i++) {
    const spinner = createSpinner(`Scraping cities in ${regions[i].name}`).start();
    await expandLocationPicker(page);
    await expandCityPicker(page, regions[i].name);
    const cities = await getCitiesList(page, regions[i].name);
    await page.goto(baseSearchUrl);
    spinner.success();
    const answers = await inquirer.prompt({
      name: `cities-${regions[i].name}`,
      type: 'checkbox',
      message: `Select cities from ${regions[i].name} region`,
      choices: cities.map((c) => ({
        name: c.name,
        value: { name: regions[i].name, city: { name: c.name } },
      })),
    });
    selectedCities = [...selectedCities, ...answers[`cities-${regions[i].name}`]];
  }
  return selectedCities;
};

export const loadZonesForSpecifiedCities = async (regions: RegionWithCity[]): Promise<boolean> => {
  for (let i = 0; i < regions.length; i++) {
    let spinner = createSpinner(`Loading zones for ${regions[i].city.name}`).start();
    await expandLocationPicker(page);
    await expandCityPicker(page, regions[i].name);
    await expandAndGetCityZonesList(page, regions[i].city.name);
    spinner.success();
  }
  console.log(JSON.stringify(regions, null, 2));
  return true;
};
