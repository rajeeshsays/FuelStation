import type { Pump, FuelType, StockEntry } from './types';

export const ALL_FUEL_TYPES: FuelType[] = ['Lanka Auto Diesel', 'LP92', 'LP95', 'Kerosene'];

export const pumps: Pump[] = [
    { id: 'LAD 01', fuelType: 'Lanka Auto Diesel' },
    { id: 'LAD 02', fuelType: 'Lanka Auto Diesel' },
    { id: 'LAD 03', fuelType: 'Lanka Auto Diesel' },
    { id: 'LP 01', fuelType: 'LP92' },
    { id: 'LP 02', fuelType: 'LP92' },
    { id: 'LP95 01', fuelType: 'LP95' },
    { id: 'K 01', fuelType: 'Kerosene' },
];

export const tank_capacities: { [key in FuelType]: number } = {
  'Lanka Auto Diesel': 22730.45,
  'LP92': 13410.9655,
  'LP95': 10000,
  'Kerosene': 9092.18
};

export const stock_entries: StockEntry[] = [];
