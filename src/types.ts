import { ElementHandle } from 'puppeteer';

interface Location {
  name: string;
}
interface LocationWithPrice extends Location {
  price: number;
}
export interface RegionWithCities extends Location {
  location?: Location[];
}
export interface PriceByRegionAndCities extends LocationWithPrice {
  location?: LocationWithPrice[];
}

export interface ElementHandleWithStatus<T extends Node> {
  isActive: boolean;
  element: ElementHandle<T>;
}

export interface DropDownElement extends Location {
  checkbox: ElementHandleWithStatus<HTMLLabelElement>;
  label: ElementHandleWithStatus<HTMLLabelElement>;
  button?: ElementHandleWithStatus<HTMLButtonElement>;
  children?: DropDownElement[];
}
export const ListingTypes = ['rynek-wtorny', 'rynek-pierwotny'] as const;
export type ListingType = (typeof ListingTypes)[number];
