#!/usr/bin/env node

import { sleep } from './utils/helpers.ts';
import { DataOutputUnion } from './utils/types.ts';
import { askForCitiesToScrape, askMethodOfDataOutput, startBanner } from './commandLinePrompts.ts';

let dataOutput: DataOutputUnion;

console.clear();
startBanner();
await sleep(1000);
console.clear();
dataOutput = await askMethodOfDataOutput();
console.clear();
const cities = await askForCitiesToScrape();
console.log(cities);
//todo
//if zones available scrape every zone
//else scrape full city
//save to spreadsheet
await sleep();
