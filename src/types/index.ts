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
  { code: '01', nameAr: 'أدرار', nameFr: 'Adrar', priceIndex: 1.10, activeRahmaMarkets: 5, popularMarkets: ['سوق أدرار الأسبوعي', 'سوق تيمقطن'] },
  { code: '02', nameAr: 'الشلف', nameFr: 'Chlef', priceIndex: 0.95, activeRahmaMarkets: 7, popularMarkets: ['سوق واد الفضة', 'سوق بوقادير', 'سوق حي السلام'] },
  { code: '03', nameAr: 'الأغواط', nameFr: 'Laghouat', priceIndex: 1.02, activeRahmaMarkets: 6, popularMarkets: ['سوق المقام', 'سوق قصر الحيران'] },
  { code: '04', nameAr: 'أم البواقي', nameFr: 'Oum El Bouaghi', priceIndex: 0.96, activeRahmaMarkets: 5, popularMarkets: ['سوق عين البيضاء', 'سوق عين مليلة للجملة'] },
  { code: '05', nameAr: 'باتنة', nameFr: 'Batna', priceIndex: 0.97, activeRahmaMarkets: 8, popularMarkets: ['سوق كشيدة', 'سوق الرحبة', 'سوق عين التوتة'] },
  { code: '06', nameAr: 'بجاية', nameFr: 'Béjaïa', priceIndex: 1.01, activeRahmaMarkets: 7, popularMarkets: ['سوق إحدادن', 'سوق أقبو للجملة', 'سوق القصر'] },
  { code: '07', nameAr: 'بسكرة', nameFr: 'Biskra', priceIndex: 0.92, activeRahmaMarkets: 8, popularMarkets: ['سوق سيدي عقبة للجملة', 'سوق العالية', 'سوق طولقة للتمور'] },
  { code: '08', nameAr: 'بشار', nameFr: 'Béchar', priceIndex: 1.09, activeRahmaMarkets: 5, popularMarkets: ['سوق بشار المركزي', 'سوق القنادسة'] },
  { code: '09', nameAr: 'البليدة', nameFr: 'Blida', priceIndex: 0.96, activeRahmaMarkets: 11, popularMarkets: ['سوق باب السبت', 'سوق بوفاريك للجملة', 'سوق أولاد يعيش'] },
  { code: '10', nameAr: 'البويرة', nameFr: 'Bouira', priceIndex: 0.98, activeRahmaMarkets: 6, popularMarkets: ['سوق البويرة المغطى', 'سوق سور الغزلان', 'سوق الأخضرية'] },
  { code: '11', nameAr: 'تمنراست', nameFr: 'Tamanrasset', priceIndex: 1.15, activeRahmaMarkets: 4, popularMarkets: ['سوق تمنراست المركزي', 'سوق سرسوف'] },
  { code: '12', nameAr: 'تبسة', nameFr: 'Tébessa', priceIndex: 0.98, activeRahmaMarkets: 6, popularMarkets: ['سوق طريق عنابة', 'سوق الونزة'] },
  { code: '13', nameAr: 'تلمسان', nameFr: 'Tlemcen', priceIndex: 0.99, activeRahmaMarkets: 7, popularMarkets: ['سوق باب سيدي بوجمعة', 'سوق الرمشي', 'سوق الكيفان'] },
  { code: '14', nameAr: 'تيارت', nameFr: 'Tiaret', priceIndex: 0.95, activeRahmaMarkets: 7, popularMarkets: ['سوق تيارت الأسبوعي', 'سوق السور', 'سوق فرندة'] },
  { code: '15', nameAr: 'تيزي وزو', nameFr: 'Tizi Ouzou', priceIndex: 0.99, activeRahmaMarkets: 7, popularMarkets: ['سوق أزفون', 'سوق ذراع بن خدة', 'سوق واد عيسي'] },
  { code: '16', nameAr: 'الجزائر العاصمة', nameFr: 'Alger', priceIndex: 1.08, activeRahmaMarkets: 14, popularMarkets: ['سوق علي ملاح (سيدي امحمد)', 'سوق باش جراح', 'سوق رويسو', 'سوق الكاليتوس للجملة'] },
  { code: '17', nameAr: 'الجلفة', nameFr: 'Djelfa', priceIndex: 0.94, activeRahmaMarkets: 8, popularMarkets: ['سوق حاسي بحبح للماشية', 'سوق أولاد نايل', 'سوق عين وسارة'] },
  { code: '18', nameAr: 'جيجل', nameFr: 'Jijel', priceIndex: 0.98, activeRahmaMarkets: 6, popularMarkets: ['سوق الجمعة بني حبيبي', 'سوق الطاهير', 'سوق الكيلومتر الثالث'] },
  { code: '19', nameAr: 'سطيف', nameFr: 'Sétif', priceIndex: 0.98, activeRahmaMarkets: 9, popularMarkets: ['سوق 1014 مسكن', 'سوق عين أرنات للجملة', 'سوق بوعروة', 'سوق العلمة'] },
  { code: '20', nameAr: 'سعيدة', nameFr: 'Saïda', priceIndex: 0.96, activeRahmaMarkets: 5, popularMarkets: ['سوق سعيدة المغطى', 'سوق عين الحجر'] },
  { code: '21', nameAr: 'سكيكدة', nameFr: 'Skikda', priceIndex: 1.00, activeRahmaMarkets: 7, popularMarkets: ['سوق صالح بوالشعور للجملة', 'سوق ميسوم', 'سوق الحروش'] },
  { code: '22', nameAr: 'سيدي بلعباس', nameFr: 'Sidi Bel Abbès', priceIndex: 0.97, activeRahmaMarkets: 7, popularMarkets: ['سوق سيدي ياسين', 'سوق ابن باديس'] },
  { code: '23', nameAr: 'عنابة', nameFr: 'Annaba', priceIndex: 1.03, activeRahmaMarkets: 7, popularMarkets: ['سوق الحطاب', 'سوق البوني للجملة', 'سوق الصفصاف'] },
  { code: '24', nameAr: 'قالمة', nameFr: 'Guelma', priceIndex: 0.96, activeRahmaMarkets: 5, popularMarkets: ['سوق وادي الزناتي', 'سوق بوشقوف'] },
  { code: '25', nameAr: 'قسنطينة', nameFr: 'Constantine', priceIndex: 1.02, activeRahmaMarkets: 8, popularMarkets: ['سوق بومزو', 'سوق العصر', 'سوق حامة بوزيان للجملة', 'سوق الخروب'] },
  { code: '26', nameAr: 'المدية', nameFr: 'Médéa', priceIndex: 0.96, activeRahmaMarkets: 7, popularMarkets: ['سوق البرواقية', 'سوق المدية الجملة', 'سوق وزرة'] },
  { code: '27', nameAr: 'مستغانم', nameFr: 'Mostaganem', priceIndex: 0.94, activeRahmaMarkets: 8, popularMarkets: ['سوق عين تادلس للجملة', 'سوق تجد Dit'] },
  { code: '28', nameAr: 'المسيلة', nameFr: 'M\'Sila', priceIndex: 0.96, activeRahmaMarkets: 7, popularMarkets: ['سوق المسيلة المركزي', 'سوق مقرة', 'سوق سيدي عيسى'] },
  { code: '29', nameAr: 'معسكر', nameFr: 'Mascara', priceIndex: 0.95, activeRahmaMarkets: 7, popularMarkets: ['سوق سيق للجملة', 'سوق تيغنيف'] },
  { code: '30', nameAr: 'ورقلة', nameFr: 'Ouargla', priceIndex: 1.12, activeRahmaMarkets: 5, popularMarkets: ['سوق القصر العتيق', 'سوق الرويسات', 'سوق سيدي خويلد'] },
  { code: '31', nameAr: 'وهران', nameFr: 'Oran', priceIndex: 1.04, activeRahmaMarkets: 10, popularMarkets: ['سوق الأوراس (المدينة الجديدة)', 'سوق الكرمة للجملة', 'سوق مرافال', 'سوق حي النور'] },
  { code: '32', nameAr: 'البيض', nameFr: 'El Bayadh', priceIndex: 1.01, activeRahmaMarkets: 4, popularMarkets: ['سوق البيض الأسبوعي', 'سوق بريزينة'] },
  { code: '33', nameAr: 'إليزي', nameFr: 'Illizi', priceIndex: 1.18, activeRahmaMarkets: 3, popularMarkets: ['سوق إليزي المركزي', 'سوق إن أمناس'] },
  { code: '34', nameAr: 'برج بوعريريج', nameFr: 'Bordj Bou Arréridj', priceIndex: 0.97, activeRahmaMarkets: 7, popularMarkets: ['سوق البرج للخضر', 'سوق رأس الوادي'] },
  { code: '35', nameAr: 'بومرداس', nameFr: 'Boumerdès', priceIndex: 1.02, activeRahmaMarkets: 8, popularMarkets: ['سوق الكرمة بومرداس', 'سوق يسر للجملة', 'سوق برج منايل'] },
  { code: '36', nameAr: 'الطارف', nameFr: 'El Tarf', priceIndex: 0.98, activeRahmaMarkets: 5, popularMarkets: ['سوق القالة', 'سوق بن مهيدي'] },
  { code: '37', nameAr: 'تندوف', nameFr: 'Tindouf', priceIndex: 1.18, activeRahmaMarkets: 3, popularMarkets: ['سوق تندوف للتضامن والتموين'] },
  { code: '38', nameAr: 'تيسمسيلت', nameFr: 'Tissemsilt', priceIndex: 0.95, activeRahmaMarkets: 5, popularMarkets: ['سوق تيسمسيلت الأسبوعي', 'سوق ثنية الحد'] },
  { code: '39', nameAr: 'الوادي', nameFr: 'El Oued', priceIndex: 0.93, activeRahmaMarkets: 8, popularMarkets: ['سوق 440 مسكن للبطاطا', 'سوق قمار للجملة', 'سوق الدبيلة'] },
  { code: '40', nameAr: 'خنشلة', nameFr: 'Khenchela', priceIndex: 0.96, activeRahmaMarkets: 5, popularMarkets: ['سوق خنشلة المغطى', 'سوق قايس'] },
  { code: '41', nameAr: 'سوق أهراس', nameFr: 'Souk Ahras', priceIndex: 0.97, activeRahmaMarkets: 5, popularMarkets: ['سوق تاورة', 'سوق سيدي عمار'] },
  { code: '42', nameAr: 'تيبازة', nameFr: 'Tipaza', priceIndex: 1.01, activeRahmaMarkets: 7, popularMarkets: ['سوق القليعة', 'سوق حطاطبة للجملة', 'سوق بواسماعيل'] },
  { code: '43', nameAr: 'ميلة', nameFr: 'Mila', priceIndex: 0.93, activeRahmaMarkets: 9, popularMarkets: ['سوق الجملة الجهوي ماغرو (وادي العثمانية)', 'سوق شلغوم العيد الأسبوعي', 'سوق ميلة المغطى للخضر والفواكه', 'سوق تاجنانت التجاري', 'سوق فرجيوة'] },
  { code: '44', nameAr: 'عين الدفلى', nameFr: 'Aïn Defla', priceIndex: 0.94, activeRahmaMarkets: 8, popularMarkets: ['سوق خميس مليانة', 'سوق العطاف للجملة', 'سوق عين الدفلى'] },
  { code: '45', nameAr: 'النعامة', nameFr: 'Naâma', priceIndex: 1.02, activeRahmaMarkets: 4, popularMarkets: ['سوق المشرية', 'سوق عين الصفراء'] },
  { code: '46', nameAr: 'عين تموشنت', nameFr: 'Aïn Témouchent', priceIndex: 0.97, activeRahmaMarkets: 6, popularMarkets: ['سوق بني صاف', 'سوق حمام بوحجر'] },
  { code: '47', nameAr: 'غرداية', nameFr: 'Ghardaïa', priceIndex: 1.05, activeRahmaMarkets: 6, popularMarkets: ['سوق بني يزقن', 'سوق القرارة', 'سوق غرداية العتيق'] },
  { code: '48', nameAr: 'غليزان', nameFr: 'Relizane', priceIndex: 0.95, activeRahmaMarkets: 7, popularMarkets: ['سوق واد ارهيو للجملة', 'سوق غليزان المركزي'] },
  { code: '49', nameAr: 'تيميمون', nameFr: 'Timimoun', priceIndex: 1.12, activeRahmaMarkets: 4, popularMarkets: ['سوق الواحة الحمراء', 'سوق قورارة التمويني'] },
  { code: '50', nameAr: 'برج باجي مختار', nameFr: 'Bordj Badji Mokhtar', priceIndex: 1.22, activeRahmaMarkets: 3, popularMarkets: ['نقطة التموين الحدودي التضامنية'] },
  { code: '51', nameAr: 'أولاد جلال', nameFr: 'Ouled Djellal', priceIndex: 0.94, activeRahmaMarkets: 5, popularMarkets: ['سوق سيدي خالد', 'سوق أولاد جلال للماشية والتمور'] },
  { code: '52', nameAr: 'بني عباس', nameFr: 'Béni Abbès', priceIndex: 1.11, activeRahmaMarkets: 3, popularMarkets: ['سوق الساورة التمويني', 'سوق بني عباس'] },
  { code: '53', nameAr: 'عين صالح', nameFr: 'In Salah', priceIndex: 1.14, activeRahmaMarkets: 3, popularMarkets: ['سوق تديكلت المركزي', 'سوق عين صالح'] },
  { code: '54', nameAr: 'عين قزام', nameFr: 'In Guezzam', priceIndex: 1.24, activeRahmaMarkets: 2, popularMarkets: ['نقطة المقايضة والتموين الحدودية'] },
  { code: '55', nameAr: 'تقرت', nameFr: 'Touggourt', priceIndex: 1.04, activeRahmaMarkets: 6, popularMarkets: ['سوق وادي ريغ', 'سوق النزلة', 'سوق تقرت'] },
  { code: '56', nameAr: 'جانت', nameFr: 'Djanet', priceIndex: 1.20, activeRahmaMarkets: 3, popularMarkets: ['سوق تاسيلي التمويني', 'سوق جانت'] },
  { code: '57', nameAr: 'المغير', nameFr: 'El M\'Ghair', priceIndex: 0.95, activeRahmaMarkets: 5, popularMarkets: ['سوق جامعة', 'سوق المغير للخضر والتمور'] },
  { code: '58', nameAr: 'المنيعة', nameFr: 'El Menia', priceIndex: 1.06, activeRahmaMarkets: 4, popularMarkets: ['سوق القليعة المنيعة', 'سوق حاسي القارة'] },
  // الولايات المنتدبة والجديدة المرتقبة 59 إلى 69
  { code: '59', nameAr: 'بوسعادة', nameFr: 'Bou Saâda', priceIndex: 0.97, activeRahmaMarkets: 5, popularMarkets: ['سوق بوسعادة العتيق', 'سوق حي النصر'] },
  { code: '60', nameAr: 'العلمة', nameFr: 'El Eulma', priceIndex: 0.98, activeRahmaMarkets: 7, popularMarkets: ['سوق دبي التجاري', 'سوق الجملة للخضر والفواكه بالعلمة'] },
  { code: '61', nameAr: 'عين وسارة', nameFr: 'Aïn Oussera', priceIndex: 0.95, activeRahmaMarkets: 6, popularMarkets: ['سوق عين وسارة الأسبوعي', 'سوق الخضر المركزي'] },
  { code: '62', nameAr: 'أفلو', nameFr: 'Aflou', priceIndex: 0.99, activeRahmaMarkets: 4, popularMarkets: ['سوق أفلو للحبوب والماشية', 'سوق جبل عمور'] },
  { code: '63', nameAr: 'بريكة', nameFr: 'Barika', priceIndex: 0.96, activeRahmaMarkets: 5, popularMarkets: ['سوق بريكة للخضر بالجملة', 'سوق طريق باتنة'] },
  { code: '64', nameAr: 'قصر الشلالة', nameFr: 'Ksar Chellala', priceIndex: 0.95, activeRahmaMarkets: 4, popularMarkets: ['سوق قصر الشلالة الأسبوعي', 'سوق الصوف والخضر'] },
  { code: '65', nameAr: 'شلغوم العيد', nameFr: 'Chelghoum Laïd', priceIndex: 0.93, activeRahmaMarkets: 6, popularMarkets: ['سوق شلغوم العيد الأسبوعي الأكبر شرقاً', 'سوق الحبوب والبقوليات'] },
  { code: '66', nameAr: 'مسعد', nameFr: 'Messaad', priceIndex: 0.96, activeRahmaMarkets: 4, popularMarkets: ['سوق مسعد للمشمش والماشية', 'سوق دميد'] },
  { code: '67', nameAr: 'فرندة', nameFr: 'Frenda', priceIndex: 0.96, activeRahmaMarkets: 4, popularMarkets: ['سوق فرندة الأسبوعي', 'سوق ابن خلدون'] },
  { code: '68', nameAr: 'الأربعاء', nameFr: 'Larbaâ', priceIndex: 0.99, activeRahmaMarkets: 6, popularMarkets: ['سوق الأربعاء للخضر والفواكه', 'سوق سيدي موسى المجاور'] },
  { code: '69', nameAr: 'بئر العاتر', nameFr: 'Bir El Ater', priceIndex: 1.02, activeRahmaMarkets: 4, popularMarkets: ['سوق بئر العاتر التجاري التمويني', 'سوق الفوسفات'] },
];

export interface CitizenPointsHistory {
  id: string;
  action: string;
  points: number;
  description: string;
  timestamp: string;
  type: 'report_price' | 'report_violation' | 'confirm_report' | 'scan_receipt' | 'producer_offer' | 'market_update';
}

export interface CitizenRewardItem {
  id: string;
  title: string;
  partner: string;
  discountValue: string;
  pointsCost: number;
  category: 'discount' | 'badge' | 'sms_alerts' | 'recognition';
  description: string;
  redeemed: boolean;
  couponCode?: string;
}

export interface CitizenProfile {
  id: string;
  displayName: string;
  wilayaCode: string;
  wilayaName: string;
  phoneOrAlias: string;
  totalPoints: number;
  tier: 'مواطن راصد' | 'مواطن يقظ' | 'مراقب مجتمعي متميز' | 'حارس القدرة الشرائية';
  tierBadgeColor: string;
  nextTierPoints: number;
  pointsHistory: CitizenPointsHistory[];
  stats: {
    reportsSubmitted: number;
    violationsReported: number;
    verificationsConfirmed: number;
    receiptsScanned: number;
  };
  availableRewards: CitizenRewardItem[];
}

