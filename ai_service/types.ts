export interface ProductAlternative {
  id: string;
  name: string;
  price: number;
  unit: string;
  savingDzd: number;
  savingPercent: number;
  reason: string;
  sourceType: 'cooperative' | 'local_brand' | 'oaic' | 'rahma_market';
}

export interface ProductItem {
  id: string;
  name: string;
  category: 'cereals' | 'dairy' | 'oils_sugar' | 'vegetables' | 'meats_poultry' | 'legumes' | 'cleaning';
  categoryAr: string;
  unit: string;
  priceCeiling: number | null; // السعر المسقف رسمياً
  averageRetailPrice: number;  // سعر التجزئة العادي
  rahmaMarketPrice: number;    // سعر سوق الرحمة / التضامني / التعاونية
  isSubsidized: boolean;       // مدعم أو مقنن
  origin: 'local_dz' | 'imported';
  brandName?: string;
  description: string;
  alternatives: ProductAlternative[];
  wilayaPrices: Record<string, number>;
  trend: 'stable' | 'decreasing' | 'increasing';
  availability: 'high' | 'medium' | 'scarce';
  nutritionOrUsageTag: string;
}

export interface WilayaData {
  code: string;
  nameAr: string;
  nameFr: string;
  priceIndex: number; // 1.0 is national average
  activeRahmaMarkets: number;
  popularMarkets: string[];
}

export interface BasketOptimizationItem {
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalDzd: number;
  marketType: 'rahma' | 'oaic' | 'retail' | 'cooperative';
  marketName: string;
  recommendedAlternative?: string;
  potentialSaving: number;
}

export interface BasketOptimizationResult {
  budget: number;
  familySize: number;
  wilaya: string;
  durationDays: number;
  totalCost: number;
  remainingBudget: number;
  totalSavedDzd: number;
  items: BasketOptimizationItem[];
  expertTips: string[];
}

export interface CitizenPriceReport {
  id: string;
  productName: string;
  observedPrice: number;
  marketType: string;
  wilaya: string;
  storeLocation: string;
  notes?: string;
  createdAt: string;
  verified: boolean;
}

export interface ProducerOffer {
  id: string;
  producerName: string;
  producerType: 'farmer' | 'cooperative' | 'oil_press' | 'beekeeper' | 'dates_grower';
  producerTypeAr: string;
  productName: string;
  category: 'vegetables' | 'fruits' | 'oil_dates' | 'legumes' | 'honey_dairy';
  categoryAr: string;
  priceDzd: number;
  unit: string;
  retailMarketPrice: number;
  savingPercent: number;
  minOrderQuantity?: number;
  availableQuantity: number;
  wilaya: string;
  wilayaCode: string;
  locationDetails: string;
  contactPhone: string;
  freshnessTag: string;
  description: string;
  createdAt: string;
  verified: boolean;
}

export interface MarketAlert {
  id: string;
  title: string;
  type: 'abundance' | 'price_drop' | 'supply_arrival' | 'price_warning' | 'official_intervention';
  commodityName: string;
  wilaya: string;
  wilayaCode: string;
  marketName: string;
  currentPriceDzd?: number;
  priceChangePercent?: number;
  severity: 'info' | 'positive' | 'warning';
  message: string;
  date: string;
  isLive: boolean;
}

export interface ReceiptLineItem {
  name: string;
  quantity: number;
  unitPriceDzd: number;
  totalPriceDzd: number;
  referencePriceDzd?: number;
  priceCeilingDzd?: number | null;
  status: 'fair' | 'overpriced' | 'illegal_ceiling_violation' | 'bargain';
  savingOrLossDzd: number;
  note?: string;
}

export interface ReceiptScanResult {
  storeName: string;
  scanDate: string;
  wilaya?: string;
  totalReceiptCostDzd: number;
  fairValueTotalDzd: number;
  netVarianceDzd: number;
  items: ReceiptLineItem[];
  verdict: 'compliant_fair' | 'moderate_markup' | 'critical_overcharge';
  verdictAr: string;
  analysisSummary: string;
  recommendations: string[];
}

// ----------------- بوابة البلاغات الجغرافية ونظام الخريطة GIS ----------------- //

export type ViolationType =
  | 'price_gouging_ceiling'
  | 'conditional_selling'
  | 'hoarding_speculation'
  | 'no_price_display'
  | 'model_compliant_store';

export interface GeoReportPoint {
  id: string;
  title: string;
  productName: string;
  violationType: ViolationType;
  violationTypeAr: string;
  observedPriceDzd: number;
  officialPriceDzd?: number | null;
  storeName: string;
  wilaya: string;
  wilayaCode: string;
  commune: string;
  addressDetails: string;
  lat: number;
  lng: number;
  evidencePhotoUrl?: string;
  notes?: string;
  reportedAt: string;
  anonymous: boolean;
  status: 'pending_review' | 'verified_by_citizens' | 'dispatched_to_enforcement';
  confirmationsCount: number;
  severity: 'critical' | 'high' | 'medium' | 'positive_model';
}

export interface HotspotCluster {
  wilayaCode: string;
  wilayaName: string;
  commune: string;
  totalViolations: number;
  criticalCeilingViolations: number;
  topViolatedCommodity: string;
  hotspotRiskLevel: 'high_black_spot' | 'medium_alert' | 'monitored_stable';
  lat: number;
  lng: number;
}

export interface GeoMapResponse {
  reports: GeoReportPoint[];
  hotspots: HotspotCluster[];
  summary: {
    totalReports: number;
    blackSpotsCount: number;
    dispatchedToEnforcementCount: number;
    mostReportedCommodity: string;
    mostCompliantWilaya: string;
  };
}
