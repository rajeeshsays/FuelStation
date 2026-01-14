
export type FuelType = 'Lanka Auto Diesel' | 'LP92' | 'LP95' | 'Kerosene';

export type FuelPrices = {
  [key in FuelType]: number;
};

export type InventoryData = {
    [key in FuelType]?: {
        current: number;
        capacity: number;
    }
}

export type Pump = {
  id: string;
  fuelType: FuelType;
};

export type MeterReading = {
  id: string;
  date: Date;
  pumpId: string;
  reading: number;
  sales: number;
};

export type StockEntry = {
  id: string;
  invoiceNumber: string;
  invoiceDate: Date;
  fuelType: FuelType;
  pricePerLiter: number;
  liters: number;
  discount: number;
  finalPrice: number;
  invoicePhotoUrl?: string;
};

export type InventoryLog = {
  date: Date;
  fuelType: FuelType;
  change: number;
  balance: number;
  type: 'sale' | 'stock';
};

export type DailySale = {
  id?: string;
  date: Date;
  fuelType: FuelType;
  pumpId: string;
  litersSold: number;
  totalAmount: number;
};

export type AuditLogMethod = 'INSERT' | 'UPDATE' | 'DELETE';

export type AuditLog = {
  id: string;
  method: AuditLogMethod;
  description: string;
  createdAt: Date;
};
