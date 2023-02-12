import { ElementHandle, Page } from 'puppeteer';

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

export interface ElementHandleWithStatus {
  isActive: boolean;
  element: ElementHandle<HTMLLabelElement>;
}
