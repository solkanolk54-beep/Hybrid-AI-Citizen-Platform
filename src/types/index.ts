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
  priceCeiling: number | null;
  averageRetailPrice: number;
  rahmaMarketPrice: number;
  isSubsidized: boolean;
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
  priceIndex: number;
  activeRahmaMarkets: number;
  popularMarkets: string[];
}

export interface PlatformStats {
  totalTrackedCommodities: number;
  subsidizedAndCeilingCount: number;
  averagePotentialSavingPercent: number;
  activeRahmaAndCoopMarkets: number;
  citizenReportsCount: number;
  coveredWilayasCount: number;
  directProducerOffersCount?: number;
  activeMarketAlertsCount?: number;
  geoReportsCount?: number;
  detectedHotspotsCount?: number;
  currency: string;
}

export interface BasketItem {
  product: ProductItem;
  quantity: number;
  useAlternative?: boolean;
}

export interface BasketOptimizationResult {
  budget: number;
  familySize: number;
  wilaya: string;
  durationDays: number;
  totalCost: number;
  remainingBudget: number;
  totalSavedDzd: number;
  items: Array<{
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
  }>;
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

export type ActiveTab = 'monitor' | 'geomap' | 'producers' | 'receipt_scanner' | 'advisor' | 'optimizer' | 'reports';

export const DEFAULT_WILAYAS: WilayaData[] = [
  {
    code: '16',
    nameAr: 'الجزائر العاصمة',
    nameFr: 'Alger',
    priceIndex: 1.08,
    activeRahmaMarkets: 14,
    popularMarkets: ['سوق علي ملاح (سيدي امحمد)', 'سوق باش جراح', 'سوق رويسو', 'سوق الكاليتوس للجملة'],
  },
  {
    code: '31',
    nameAr: 'وهران',
    nameFr: 'Oran',
    priceIndex: 1.04,
    activeRahmaMarkets: 9,
    popularMarkets: ['سوق الأوراس (المدينة الجديدة)', 'سوق الكرمة للجملة', 'سوق مرافال'],
  },
  {
    code: '25',
    nameAr: 'قسنطينة',
    nameFr: 'Constantine',
    priceIndex: 1.02,
    activeRahmaMarkets: 7,
    popularMarkets: ['سوق بومزو', 'سوق العصر', 'سوق حامة بوزيان للجملة'],
  },
  {
    code: '19',
    nameAr: 'سطيف',
    nameFr: 'Sétif',
    priceIndex: 0.98,
    activeRahmaMarkets: 8,
    popularMarkets: ['سوق 1014 مسكن', 'سوق عين أرنات للجملة', 'سوق بوعروة'],
  },
  {
    code: '23',
    nameAr: 'عنابة',
    nameFr: 'Annaba',
    priceIndex: 1.03,
    activeRahmaMarkets: 6,
    popularMarkets: ['سوق الحطاب', 'سوق البوني للجملة'],
  },
  {
    code: '09',
    nameAr: 'البليدة',
    nameFr: 'Blida',
    priceIndex: 0.96,
    activeRahmaMarkets: 11,
    popularMarkets: ['سوق باب السبت', 'سوق بوفاريك للجملة'],
  },
  {
    code: '07',
    nameAr: 'بسكرة',
    nameFr: 'Biskra',
    priceIndex: 0.92,
    activeRahmaMarkets: 6,
    popularMarkets: ['سوق سيدي عقبة للجملة', 'سوق العالية'],
  },
  {
    code: '15',
    nameAr: 'تيزي وزو',
    nameFr: 'Tizi Ouzou',
    priceIndex: 0.99,
    activeRahmaMarkets: 7,
    popularMarkets: ['سوق أزفون', 'سوق ذراع بن خدة'],
  },
];
