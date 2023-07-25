#!/usr/bin/env node

import { sleep } from './utils/helpers.ts';
import { DataOutputUnion } from './utils/types.ts';
import {
  askForCitiesToScrape,
  askMethodOfDataOutput,
  displayStartBanner,
  goToMainPage,
  launchBrowser,
  loadAllRegions,
  loadZonesForSpecifiedCities,
} from './commandLineProcedures.ts';

let dataOutput: DataOutputUnion;

console.clear();
displayStartBanner();
await sleep(1000);
console.clear();
dataOutput = await askMethodOfDataOutput();
console.clear();
await launchBrowser();
await goToMainPage();
const regions = await loadAllRegions();
const cities = await askForCitiesToScrape(regions);
await loadZonesForSpecifiedCities(cities);
await sleep();
