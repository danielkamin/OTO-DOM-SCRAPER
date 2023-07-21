import { DATA_OUTPUT_DICTIONARY } from './constants.js';
import { ElementHandle } from 'puppeteer';

export type ObjectValues<T> = T[keyof T];

export type DataOutputUnion = keyof typeof DATA_OUTPUT_DICTIONARY;
export type City = {
  name: string;
  zones?: string[];
};
export type RegionWithCity = {
  name: string;
  city: City;
};

interface Location {
  name: string;
}
export interface ParentLocation extends Location {
  location?: Location[];
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
