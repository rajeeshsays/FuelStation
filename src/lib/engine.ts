
'use server';

import connectToDatabase from '@/lib/db';
import MeterReadingModel from '@/models/MeterReading';
import DailySaleModel from '@/models/DailySale';
import StockEntryModel from '@/models/StockEntry';
import FuelPriceModel from '@/models/FuelPrice';
import { pumps } from './data';
import type { MeterReading } from './types';
import { startOfDay, endOfDay } from 'date-fns';

/**
 * Recalculates all derived data from the base data in MongoDB.
 * This function is the single source of truth for calculating sales.
 * It's designed to be called after any change to meter readings, stock, or prices.
 * It uses historically accurate prices for sales calculations.
 */
export async function rebuildDerivedData() {
  await connectToDatabase();

  // 1. Fetch all data sources, sorted by their action time.
  const allStockEntries: any[] = await StockEntryModel.find().sort({ createdAt: 1 }).lean();
  const allManualPrices: any[] = await FuelPriceModel.find().sort({ updatedAt: 1 }).lean();

  // Helper function to get the correct price for a given fuel type on a specific date
  const getPriceOnDate = (date: Date, fuelType: string): number => {
    const queryDate = endOfDay(new Date(date));

    // Find the last stock entry action that happened on or before the queryDate
    // and whose invoice is also effective on or before that date.
    const relevantStock = allStockEntries
      .filter(entry => 
          new Date(entry.createdAt) <= queryDate && 
          new Date(entry.invoiceDate) <= queryDate &&
          entry.fuelType === fuelType
      )
      .pop(); // .pop() works because the initial array is sorted by createdAt

    // Find the last manual price update action that happened on or before the queryDate.
    const relevantManualPrice = allManualPrices
      .filter(p => 
          new Date(p.updatedAt) <= queryDate && 
          p.fuelType === fuelType
      )
      .pop(); // .pop() works because the initial array is sorted by updatedAt

    const stockEvent = relevantStock
        ? { price: relevantStock.pricePerLiter, time: new Date(relevantStock.createdAt).getTime() }
        : null;

    const manualEvent = relevantManualPrice
        ? { price: relevantManualPrice.price, time: new Date(relevantManualPrice.updatedAt).getTime() }
        : null;

    let winningPrice = 0;

    if (manualEvent && stockEvent) {
        if (manualEvent.time > stockEvent.time) {
            winningPrice = manualEvent.price;
        } else {
            winningPrice = stockEvent.price;
        }
    } else if (manualEvent) {
        winningPrice = manualEvent.price;
    } else if (stockEvent) {
        winningPrice = stockEvent.price;
    }
    
    return winningPrice;
  };


  // 2. Recalculate all daily sales from meter readings
  const allReadings = await MeterReadingModel.find().sort({ date: 1, createdAt: 1 }).lean();
  
  const latestReadingPerPump = new Map<string, MeterReading & { _id: any }>();
  const newSalesPayload: any[] = [];
  const readingsToUpdate: any[] = [];

  for (const reading of allReadings) {
    const pump = pumps.find(p => p.id === reading.pumpId);
    if (!pump) continue;

    const previousReading = latestReadingPerPump.get(reading.pumpId);
    let litersSold = 0;

    if (previousReading) {
        if (reading.reading >= previousReading.reading) {
            litersSold = reading.reading - previousReading.reading;
        }

        if (litersSold > 0) {
            // Use the new helper to get historically accurate price for the date the sale occurred
            const pricePerLiter = getPriceOnDate(previousReading.date, pump.fuelType);
            const totalAmount = litersSold * pricePerLiter;
            
            newSalesPayload.push({
                date: previousReading.date,
                pumpId: reading.pumpId,
                fuelType: pump.fuelType,
                litersSold,
                totalAmount,
            });
        }
    }
    
    // Only update if sales value changed
    if (reading.sales !== litersSold) {
         readingsToUpdate.push({
            updateOne: {
                filter: { _id: reading._id },
                update: { $set: { sales: litersSold } },
            },
        });
    }
    
    latestReadingPerPump.set(reading.pumpId, { ...reading, id: reading._id.toString() });
  }

  // 3. Atomically update the database
  await DailySaleModel.deleteMany({});
  if (newSalesPayload.length > 0) {
    await DailySaleModel.insertMany(newSalesPayload);
  }

  if (readingsToUpdate.length > 0) {
    await MeterReadingModel.bulkWrite(readingsToUpdate);
  }
}
