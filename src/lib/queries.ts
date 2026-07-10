
'use server';

import connectToDatabase from '@/lib/db';
import StockEntryModel from '@/models/StockEntry';
import MeterReadingModel from '@/models/MeterReading';
import DailySaleModel from '@/models/DailySale';
import FuelPriceModel from '@/models/FuelPrice';
import AuditLogModel from '@/models/AuditLog';
import StaffModel from '@/models/StaffEntry'
import { tank_capacities, ALL_FUEL_TYPES } from '@/lib/data';
import type { FuelPrices, FuelType, InventoryData, MeterReading, DailySale, StockEntry, AuditLog, AuditLogMethod,Staff } from '@/lib/types';
import { eachDayOfInterval, format, startOfDay, startOfToday, parseISO, endOfDay, subDays, startOfYesterday, endOfYesterday, startOfMonth, endOfMonth } from 'date-fns';

// Helper to convert Mongoose lean docs to plain objects with an 'id'
function mongoDocToPlain<T>(doc: any): T {
    const plain = { ...doc };
    if (plain._id) {
        plain.id = plain._id.toString();
        delete plain._id;
    }
    delete plain.__v;
    // Don't delete createdAt/updatedAt for models that need them (like AuditLog)
    // The caller can decide what to do with them.
    return plain;
}

export async function getFuelPrices(): Promise<FuelPrices> {
  await connectToDatabase();
  const prices: FuelPrices = {
    'Lanka Auto Diesel': 0,
    'LP92': 0,
    'LP95': 0,
    'Kerosene': 0,
  };

  for (const fuelType of ALL_FUEL_TYPES) {
      // Find the latest manual price update action.
      const latestManualUpdate: any = await FuelPriceModel.findOne({ fuelType })
          .sort({ updatedAt: -1 })
          .lean();

      // Find the latest stock entry action with an invoice date that is effective today or in the past.
      const latestStock: any = await StockEntryModel.findOne({ 
          fuelType,
          invoiceDate: { $lte: new Date() }
      })
          .sort({ createdAt: -1 }) // Sort by when the entry was created
          .lean();

      const manualEvent = latestManualUpdate 
          ? { price: latestManualUpdate.price, time: new Date(latestManualUpdate.updatedAt).getTime() } 
          : null;
          
      const stockEvent = latestStock
          ? { price: latestStock.pricePerLiter, time: new Date(latestStock.createdAt).getTime() }
          : null;

      let winningPrice = 0;

      if (manualEvent && stockEvent) {
          // The event with the more recent action timestamp wins.
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
      
      prices[fuelType] = winningPrice;
  }

  return prices;
}

export async function getInventoryData(): Promise<InventoryData> {
    await connectToDatabase();
    const inventoryData: InventoryData = {};

    for (const fuelType of ALL_FUEL_TYPES) {
        const stockResult = await StockEntryModel.aggregate([
            { $match: { fuelType: fuelType } },
            { $group: { _id: null, total: { $sum: '$liters' } } }
        ]);

        const salesResult = await DailySaleModel.aggregate([
            { $match: { fuelType: fuelType } },
            { $group: { _id: null, total: { $sum: '$litersSold' } } }
        ]);

        const totalStock = stockResult[0]?.total || 0;
        const totalSales = salesResult[0]?.total || 0;

        inventoryData[fuelType] = {
            current: totalStock - totalSales,
            capacity: tank_capacities[fuelType] || 0,
        };
    }
    
    return inventoryData;
}

export async function getDashboardStats() {
    await connectToDatabase();
    const yesterdayStart = startOfYesterday();
    const yesterdayEnd = endOfYesterday();
    
    const salesResult = await DailySaleModel.aggregate([
      { $match: { date: { $gte: yesterdayStart, $lte: yesterdayEnd } } },
      { $group: { _id: null, totalLitersSold: { $sum: '$litersSold' } } }
    ]);
    const yesterdayTotalLiters = salesResult[0]?.totalLitersSold || 0;

    const inventoryData = await getInventoryData();
    const totalInventory = Object.values(inventoryData).reduce((sum, item) => sum + (item?.current || 0), 0);
    
    const lowStockAlerts = Object.entries(inventoryData)
      .filter(([_, item]) => item && item.capacity > 0 && (item.current / item.capacity) < 0.2)
      .map(([fuelType, _]) => fuelType as FuelType);

    return {
        yesterdayTotalLiters,
        totalInventory,
        lowStockAlerts
    };
}

export async function getDashboardChartData() {
    await connectToDatabase();
    const today = startOfToday();
    const sevenDaysAgo = subDays(today, 6); // Today and previous 6 days

    const sales = await DailySaleModel.aggregate([
        { $match: { date: { $gte: sevenDaysAgo, $lte: today } } },
        { 
            $group: { 
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }, 
                totalLiters: { $sum: '$litersSold' } 
            } 
        },
        { $sort: { _id: 1 } }
    ]);
    
    const salesMap = new Map(sales.map(s => [s._id, s.totalLiters]));
    const dateRange = eachDayOfInterval({ start: sevenDaysAgo, end: today });

    const chartData = dateRange.map(date => {
        const dateString = format(date, 'yyyy-MM-dd');
        const shortName = format(date, 'EEE'); // e.g., 'Mon'
        return {
            name: shortName,
            sales: salesMap.get(dateString) || 0,
        };
    });

    return chartData;
}


export async function getLatestMeterReadings(dateStr: string): Promise<Map<string, MeterReading>> {
    await connectToDatabase();
    const latest = new Map<string, MeterReading>();
    if (!dateStr) return latest;

    // dateStr is in 'yyyy-MM-dd' format. parseISO converts it to a UTC Date at midnight.
    // We want to find all readings strictly *before* this date.
    const targetDate = parseISO(dateStr);

    // Find the most recent reading for each pump strictly before the target date.
    // We sort by date descending, then by creation time descending to break any ties for same-day readings.
    const latestReadingsDocs = await MeterReadingModel.aggregate([
        { $match: { date: { $lt: targetDate } } },
        { $sort: { date: -1, createdAt: -1 } },
        { 
            $group: { 
                _id: "$pumpId", 
                latestReading: { $first: "$$ROOT" } 
            }
        }
    ]);

    for (const group of latestReadingsDocs) {
        latest.set(group._id, mongoDocToPlain<MeterReading>(group.latestReading));
    }

    return latest;
}


export async function getRecentMeterReadings(): Promise<MeterReading[]> {
    await connectToDatabase();
    const recentReadingsDocs = await MeterReadingModel.find()
        .sort({ date: -1, createdAt: -1 })
        .limit(10)
        .lean();
    return recentReadingsDocs.map(doc => mongoDocToPlain<MeterReading>(doc));
}

export async function getSalesData(filters: {
    from?: Date;
    to?: Date;
    fuelType?: FuelType | 'all';
    nozzleId?: string | 'all';
    tab: 'daily' | 'monthly' | 'period';
}): Promise<{ sales: any[], chartData: { name: string; total: number }[] }> {
    const { from, to, fuelType, nozzleId, tab } = filters;

    if (!from || !to) {
        return { sales: [], chartData: [] };
    }

    await connectToDatabase();

    const inclusiveTo = new Date(to);
    inclusiveTo.setUTCHours(23, 59, 59, 999);

    const matchFilter: any = {
      date: { $gte: from, $lte: inclusiveTo }
    };
    if (fuelType && fuelType !== 'all') matchFilter.fuelType = fuelType;
    if (nozzleId && nozzleId !== 'all') matchFilter.nozzleId = nozzleId;

    const salesDocs = await DailySaleModel.find(matchFilter).sort({ date: 1 }).lean();
    
    if (tab === 'period') {
        // Data for the summary table (aggregated by fuel type)
        const salesByFuelType: Record<string, number> = {};
        ALL_FUEL_TYPES.forEach(ft => salesByFuelType[ft] = 0);
        
        salesDocs.forEach(sale => {
            salesByFuelType[sale.fuelType] += sale.litersSold;
        });
        
        const periodSales = Object.entries(salesByFuelType)
            .filter(([_, liters]) => liters > 0)
            .map(([fuelType, litersSold]) => ({ fuelType, litersSold }));

        // Data for the cumulative line chart
        const dailyTotals: Record<string, number> = {};
        const allDates = eachDayOfInterval({ start: from, end: to });
        allDates.forEach(date => {
            dailyTotals[format(date, 'yyyy-MM-dd')] = 0;
        });

        salesDocs.forEach(sale => {
            const dateKey = format(sale.date, 'yyyy-MM-dd');
            if (dailyTotals[dateKey] !== undefined) {
                dailyTotals[dateKey] += sale.litersSold;
            }
        });

        let cumulativeTotal = 0;
        const cumulativeChartData = allDates.map(date => {
            const dateKey = format(date, 'yyyy-MM-dd');
            cumulativeTotal += dailyTotals[dateKey];
            return {
                name: format(date, 'MMM d'),
                total: cumulativeTotal,
            };
        });

        return { sales: periodSales, chartData: cumulativeChartData };
    }

    const salesData = salesDocs.map(doc => mongoDocToPlain<DailySale>(doc));
    
    const groupedSales: Record<string, number> = {};
    
    if (tab === 'daily') {
        const allDates = eachDayOfInterval({ start: from, end: to });
        allDates.forEach(date => {
            const dayKey = format(date, 'MMM d');
            groupedSales[dayKey] = 0;
        });

        salesData.forEach(sale => {
            const dayKey = format(sale.date, 'MMM d');
            groupedSales[dayKey] = (groupedSales[dayKey] || 0) + sale.litersSold;
        });
    } else { // Monthly
        const fuelTypesToDisplay = (fuelType === 'all' ? ALL_FUEL_TYPES : [fuelType as FuelType]);
        fuelTypesToDisplay.forEach(ft => {
            groupedSales[ft] = 0;
        });
        
        salesData.forEach(sale => {
            if (groupedSales[sale.fuelType] !== undefined) {
                groupedSales[sale.fuelType] += sale.litersSold;
            }
        });
    }

    const chartData = Object.entries(groupedSales).map(([name, total]) => ({
        name,
        total,
    }));
    
    return { sales: salesData, chartData };
}

export async function getStockEntries(filters: {
    from?: Date;
    to?: Date;
    fuelType?: FuelType | 'all';
}): Promise<StockEntry[]> {
    const { from, to, fuelType } = filters;
    await connectToDatabase();

    const matchFilter: any = {};
    if (fuelType && fuelType !== 'all') {
        matchFilter.fuelType = fuelType;
    }

    if (from) {
        // If `to` is not provided, filter for the single day of `from`.
        const inclusiveTo = to ? new Date(to) : new Date(from);
        inclusiveTo.setUTCHours(23, 59, 59, 999);
        matchFilter.invoiceDate = { $gte: from, $lte: inclusiveTo };
    }

    const entriesDocs = await StockEntryModel.find(matchFilter)
        .sort({ invoiceDate: -1, createdAt: -1 })
        .lean();
    
    return entriesDocs.map(doc => {
      const plain = mongoDocToPlain<StockEntry>(doc);
      delete (plain as any).createdAt;
      delete (plain as any).updatedAt;
      return plain;
    });
}

export async function getAuditLogs(filters: {
    month?: string; // 'yyyy-MM'
    date?: string; // 'yyyy-MM-dd'
    method?: AuditLogMethod | 'all';
}): Promise<AuditLog[]> {
    const { month, date, method } = filters;

    // Require at least a month or a date to be selected to prevent fetching all logs
    if (!month && !date) {
        return [];
    }

    await connectToDatabase();
    const matchFilter: any = {};
    
    if (date) {
        const targetDate = parseISO(date);
        matchFilter.createdAt = {
            $gte: startOfDay(targetDate),
            $lte: endOfDay(targetDate)
        };
    } else if (month) {
        const targetMonth = parseISO(month);
        matchFilter.createdAt = {
            $gte: startOfMonth(targetMonth),
            $lte: endOfMonth(targetMonth),
        };
    }

    if (method && method !== 'all') {
        matchFilter.method = method;
    }

    const logsDocs = await AuditLogModel.find(matchFilter).sort({ createdAt: -1 }).lean();
    
    // We can't use the generic mongoDocToPlain because we need the original `createdAt` field
    return logsDocs.map(doc => {
        const { _id, __v, updatedAt, ...rest } = doc as any;
        return {
            id: _id.toString(),
            ...rest
        } as AuditLog;
    });
}

export async function getStaffEntries( filters : {method?: AuditLogMethod | 'all'}): Promise<Staff[]> {

const { method } = filters;

await connectToDatabase();
    const matchFilter: any = {};
    if (method && method !== 'all') 
    {
        matchFilter.method = method;
    }
 const staffDocs = await StaffModel.find(matchFilter).sort({ createdAt: -1 }).lean();
    
    // We can't use the generic mongoDocToPlain because we need the original `createdAt` field
    return staffDocs.map(doc => {
        const { _id, __v, updatedAt, ...rest } = doc as any;
        return {
            id: _id.toString(),
            ...rest
        } as Staff;
    });


}
