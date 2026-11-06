import React, { useState, useMemo } from 'react';
import {
  GeoReportPoint,
  HotspotCluster,
  GeoMapResponse,
  WilayaData,
  ViolationType,
  ProductItem,
} from '../types/index.ts';
import {
  MapPin,
  ShieldAlert,
  Flame,
  CheckCircle2,
  Filter,
  Plus,
  RefreshCw,
  Search,
  ZoomIn,
  ZoomOut,
  Crosshair,
  Building2,
  Layers,
  Sparkles,
  Radio,
  PackageCheck,
  TrendingDown,
  TrendingUp,
  Activity,
  Store,
  Compass,
  AlertTriangle,
  Info,
} from 'lucide-react';

interface GeoMapViewProps {
  geoData: GeoMapResponse | null;
  wilayas: WilayaData[];
  products?: ProductItem[];
  selectedWilaya: string;
  setSelectedWilaya: (w: string) => void;
  onOpenReportModalWithCoords: (coords?: { lat: number; lng: number }) => void;
  onConfirmReport: (reportId: string) => Promise<void>;
  onRefreshData: () => Promise<void>;
}

// -------------------------------------------------------------
// Accurate Geographic Coordinates for ALL 69 Algerian Wilayas
// -------------------------------------------------------------
export interface WilayaGeoCoord {
  code: string;
  lat: number;
  lng: number;
  isMagroHub?: boolean;
  hubType?: 'magro_wholesale' | 'port' | 'production_hub' | 'logistics_hub';
}

export const WILAYA_COORDINATES_69: Record<string, WilayaGeoCoord> = {
  '01': { code: '01', lat: 27.87, lng: -0.29 }, // أدرار
  '02': { code: '02', lat: 36.16, lng: 1.33, hubType: 'production_hub' }, // الشلف
  '03': { code: '03', lat: 33.80, lng: 2.87 }, // الأغواط
  '04': { code: '04', lat: 35.87, lng: 7.11 }, // أم البواقي
  '05': { code: '05', lat: 35.56, lng: 6.17, hubType: 'logistics_hub' }, // باتنة
  '06': { code: '06', lat: 36.75, lng: 5.08, hubType: 'port' }, // بجاية
  '07': { code: '07', lat: 34.85, lng: 5.73, hubType: 'production_hub' }, // بسكرة (قطب الخضر والتمور)
  '08': { code: '08', lat: 31.62, lng: -2.22 }, // بشار
  '09': { code: '09', lat: 36.47, lng: 2.83, hubType: 'production_hub' }, // البليدة
  '10': { code: '10', lat: 36.37, lng: 3.90 }, // البويرة
  '11': { code: '11', lat: 22.79, lng: 5.52 }, // تمنراست
  '12': { code: '12', lat: 35.40, lng: 8.12 }, // تبسة
  '13': { code: '13', lat: 34.88, lng: -1.32 }, // تلمسان
  '14': { code: '14', lat: 35.37, lng: 1.32, hubType: 'production_hub' }, // تيارت
  '15': { code: '15', lat: 36.71, lng: 4.05 }, // تيزي وزو
  '16': { code: '16', lat: 36.75, lng: 3.06, hubType: 'logistics_hub' }, // الجزائر العاصمة
  '17': { code: '17', lat: 34.67, lng: 3.25, hubType: 'production_hub' }, // الجلفة
  '18': { code: '18', lat: 36.82, lng: 5.77, hubType: 'port' }, // جيجل
  '19': { code: '19', lat: 36.19, lng: 5.41, hubType: 'logistics_hub' }, // سطيف
  '20': { code: '20', lat: 34.83, lng: 0.15 }, // سعيدة
  '21': { code: '21', lat: 36.87, lng: 6.91, hubType: 'port' }, // سكيكدة
  '22': { code: '22', lat: 35.19, lng: -0.63 }, // سيدي بلعباس
  '23': { code: '23', lat: 36.90, lng: 7.77, hubType: 'port' }, // عنابة
  '24': { code: '24', lat: 36.46, lng: 7.43 }, // قالمة
  '25': { code: '25', lat: 36.36, lng: 6.61, hubType: 'logistics_hub' }, // قسنطينة
  '26': { code: '26', lat: 36.26, lng: 2.75 }, // المدية
  '27': { code: '27', lat: 35.93, lng: 0.09, hubType: 'production_hub' }, // مستغانم
  '28': { code: '28', lat: 35.71, lng: 4.54 }, // المسيلة
  '29': { code: '29', lat: 35.40, lng: 0.14, hubType: 'production_hub' }, // معسكر
  '30': { code: '30', lat: 31.95, lng: 5.33 }, // ورقلة
  '31': { code: '31', lat: 35.70, lng: -0.63, hubType: 'logistics_hub' }, // وهران
  '32': { code: '32', lat: 33.68, lng: 1.02 }, // البيض
  '33': { code: '33', lat: 26.48, lng: 8.48 }, // إليزي
  '34': { code: '34', lat: 36.07, lng: 4.76 }, // برج بوعريريج
  '35': { code: '35', lat: 36.76, lng: 3.48 }, // بومرداس
  '36': { code: '36', lat: 36.77, lng: 8.31 }, // الطارف
  '37': { code: '37', lat: 27.68, lng: -8.15 }, // تندوف
  '38': { code: '38', lat: 35.61, lng: 1.81 }, // تيسمسيلت
  '39': { code: '39', lat: 33.37, lng: 6.87, hubType: 'production_hub' }, // الوادي (قطب البطاطا والخضر)
  '40': { code: '40', lat: 35.43, lng: 7.14 }, // خنشلة
  '41': { code: '41', lat: 36.29, lng: 7.95 }, // سوق أهراس
  '42': { code: '42', lat: 36.59, lng: 2.44, hubType: 'production_hub' }, // تيبازة
  '43': { code: '43', lat: 36.35, lng: 6.27, isMagroHub: true, hubType: 'magro_wholesale' }, // ميلة (قطب ماڨرو وادي العثمانية)
  '44': { code: '44', lat: 36.26, lng: 1.97, hubType: 'production_hub' }, // عين الدفلى
  '45': { code: '45', lat: 33.27, lng: -0.31 }, // النعامة
  '46': { code: '46', lat: 35.30, lng: -1.14 }, // عين تموشنت
  '47': { code: '47', lat: 32.49, lng: 3.67 }, // غرداية
  '48': { code: '48', lat: 35.74, lng: 0.56 }, // غليزان
  '49': { code: '49', lat: 29.26, lng: 0.23 }, // تيميمون
  '50': { code: '50', lat: 21.33, lng: 0.95 }, // برج باجي مختار
  '51': { code: '51', lat: 34.42, lng: 5.06 }, // أولاد جلال
  '52': { code: '52', lat: 30.13, lng: -2.17 }, // بني عباس
  '53': { code: '53', lat: 27.20, lng: 2.47 }, // عين صالح
  '54': { code: '54', lat: 19.57, lng: 5.77 }, // عين قزام
  '55': { code: '55', lat: 33.10, lng: 6.06 }, // تقرت
  '56': { code: '56', lat: 24.55, lng: 9.48 }, // جانت
  '57': { code: '57', lat: 33.95, lng: 5.92 }, // المغير
  '58': { code: '58', lat: 30.58, lng: 2.88 }, // المنيعة
  '59': { code: '59', lat: 35.21, lng: 4.18 }, // بوسعادة
  '60': { code: '60', lat: 36.15, lng: 5.69, hubType: 'logistics_hub' }, // العلمة
  '61': { code: '61', lat: 35.45, lng: 2.91 }, // عين وسارة
  '62': { code: '62', lat: 34.11, lng: 2.10 }, // أفلو
  '63': { code: '63', lat: 35.39, lng: 5.37 }, // بريكة
  '64': { code: '64', lat: 35.22, lng: 2.32 }, // قصر الشلالة
  '65': { code: '65', lat: 36.16, lng: 6.17, hubType: 'logistics_hub' }, // شلغوم العيد (ميلة)
  '66': { code: '66', lat: 34.16, lng: 3.50 }, // مسعد
  '67': { code: '67', lat: 35.06, lng: 1.05 }, // فرندة
  '68': { code: '68', lat: 36.56, lng: 3.15 }, // الأربعاء
  '69': { code: '69', lat: 34.75, lng: 8.06 }, // بئر العاتر
};

// Map Projection Bounds Options
const PROJECTION_BOUNDS = {
  national_69: {
    minLat: 18.2,
    maxLat: 37.8,
    minLng: -8.9,
    maxLng: 12.3,
  },
  north_urban: {
    minLat: 33.2,
    maxLat: 37.8,
    minLng: -2.2,
    maxLng: 9.0,
  },
};

export type HeatmapLayerMode = 'speculation' | 'availability' | 'reports' | 'combined';

export interface CommodityStatusSnapshot {
  id: string;
  name: string;
  icon: string;
  officialPrice: number | null;
  status: 'optimal' | 'stable' | 'pressure' | 'scarce';
  statusAr: string;
  avgObservedPrice: number;
}

export const GeoMapView: React.FC<GeoMapViewProps> = ({
  geoData,
  wilayas,
  selectedWilaya,
  setSelectedWilaya,
  onOpenReportModalWithCoords,
  onConfirmReport,
  onRefreshData,
}) => {
  // Layer & View States
  const [activeLayer, setActiveLayer] = useState<HeatmapLayerMode>('speculation');
  const [territoryExtent, setTerritoryExtent] = useState<'national_69' | 'north_urban'>('national_69');
  const [selectedCommodityHeat, setSelectedCommodityHeat] = useState<string>('all');
  const [hoveredWilayaCode, setHoveredWilayaCode] = useState<string | null>(null);

  // Filters & Interactivity
  const [selectedViolationType, setSelectedViolationType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyHotspots, setOnlyHotspots] = useState<boolean>(false);
  const [selectedPoint, setSelectedPoint] = useState<GeoReportPoint | null>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotCluster | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [mapZoom, setMapZoom] = useState<number>(1);
  const [isPinModeActive, setIsPinModeActive] = useState<boolean>(false);
  const [mapTheme, setMapTheme] = useState<'tactical_dark' | 'civic_light'>('tactical_dark');

  const reports = geoData?.reports || [];
  const hotspots = geoData?.hotspots || [];
  const summary = geoData?.summary || {
    totalReports: reports.length,
    blackSpotsCount: hotspots.filter((h) => h.hotspotRiskLevel === 'high_black_spot').length,
    dispatchedToEnforcementCount: reports.filter((r) => r.status === 'dispatched_to_enforcement').length,
    mostReportedCommodity: 'حليب أكياس 25 د.ج',
    mostCompliantWilaya: 'ميلة وسطيف والبليدة',
  };

  // -------------------------------------------------------------
  // Real-time Speculation & Commodity Availability Engine (69 Wilayas)
  // -------------------------------------------------------------
  const wilayaIntelligence = useMemo(() => {
    const map = new Map<
      string,
      {
        wilaya: WilayaData;
        geo: WilayaGeoCoord;
        speculationScore: number; // 0..100
        speculationLevel: 'critical' | 'high' | 'medium' | 'stable';
        speculationLabelAr: string;
        speculationColor: string;
        availabilityScore: number; // 0..100
        availabilityLevel: 'optimal' | 'stable' | 'pressure' | 'scarce';
        availabilityLabelAr: string;
        availabilityColor: string;
        reportsCount: number;
        hotspotsCount: number;
        criticalViolationsCount: number;
        commodities: CommodityStatusSnapshot[];
      }
    >();

    wilayas.forEach((w) => {
      const geo = WILAYA_COORDINATES_69[w.code] || {
        code: w.code,
        lat: 35.5,
        lng: 3.0,
      };

      const wReports = reports.filter((r) => r.wilayaCode === w.code);
      const wHotspots = hotspots.filter((h) => h.wilayaCode === w.code);
      const critCount = wReports.filter(
        (r) =>
          r.violationType === 'price_gouging_ceiling' ||
          r.violationType === 'hoarding_speculation' ||
          r.violationType === 'conditional_selling'
      ).length;

      // Base calculation on wilaya price index (baseline 1.0)
      let specScore = Math.round(
        Math.max(10, Math.min(96, (w.priceIndex - 0.9) * 160 + critCount * 14 + (wHotspots.length > 0 ? 25 : 0)))
      );

      // Hub discounts (Mila 43 Magro hub has strong transparency & wholesale flow)
      if (w.code === '43') {
        specScore = Math.max(12, specScore - 28);
      }

      let specLevel: 'critical' | 'high' | 'medium' | 'stable' = 'stable';
      let specLabelAr = 'سوق منضبط ومستقر';
      let specColor = '#10b981';

      if (specScore >= 75) {
        specLevel = 'critical';
        specLabelAr = 'بؤرة مضاربة حرجة (خرق أسعار)';
        specColor = '#ef4444';
      } else if (specScore >= 52) {
        specLevel = 'high';
        specLabelAr = 'ضغط أسعار ونشاط مضاربة';
        specColor = '#f97316';
      } else if (specScore >= 32) {
        specLevel = 'medium';
        specLabelAr = 'رصد متوسط وتفاوت طفيف';
        specColor = '#eab308';
      }

      // Commodity Availability Score (0..100)
      // High score means excellent abundance, low score means pressure or scarcity
      let availScore = Math.round(
        Math.max(15, Math.min(98, 100 - specScore * 0.7 + (w.activeRahmaMarkets * 2.2)))
      );

      // Major agriculture or hub boosts
      if (w.code === '43' || w.code === '07' || w.code === '39' || w.code === '29' || w.code === '19') {
        availScore = Math.min(98, availScore + 18);
      }

      let availLevel: 'optimal' | 'stable' | 'pressure' | 'scarce' = 'optimal';
      let availLabelAr = 'وفرة عالية ومستمرة';
      let availColor = '#10b981';

      if (availScore < 40) {
        availLevel = 'scarce';
        availLabelAr = 'شح وتذبذب في التموين';
        availColor = '#dc2626';
      } else if (availScore < 62) {
        availLevel = 'pressure';
        availLabelAr = 'ضغط في تدفق السلع';
        availColor = '#f59e0b';
      } else if (availScore < 80) {
        availLevel = 'stable';
        availLabelAr = 'وفرة طبيعية مستقرة';
        availColor = '#06b6d4';
      }

      // Commodity specific status matrix
      const commodities: CommodityStatusSnapshot[] = [
        {
          id: 'milk',
          name: 'حليب أكياس 25 د.ج',
          icon: '🥛',
          officialPrice: 25,
          status: critCount > 2 ? 'pressure' : 'optimal',
          statusAr: critCount > 2 ? 'تذبذب في بعض الأحياء' : 'متوفر بالسعر المسقف',
          avgObservedPrice: critCount > 2 ? 30 : 25,
        },
        {
          id: 'oil',
          name: 'زيت المائدة 5 لتر 650 د.ج',
          icon: '🛢️',
          officialPrice: 650,
          status: critCount > 1 ? 'pressure' : 'optimal',
          statusAr: critCount > 1 ? 'رصد بيع مشروط محدود' : 'متوفر بانتظام 650 د.ج',
          avgObservedPrice: critCount > 1 ? 675 : 650,
        },
        {
          id: 'semolina',
          name: 'سميد 10 كغ ممتاز',
          icon: '🌾',
          officialPrice: 500,
          status: 'optimal',
          statusAr: 'تدفق كافٍ من دواوين الحبوب',
          avgObservedPrice: 500,
        },
        {
          id: 'sugar',
          name: 'سكر أبيض 1 كغ',
          icon: '🧂',
          officialPrice: 95,
          status: 'optimal',
          statusAr: 'وفرة تامة بمنافذ التجزئة',
          avgObservedPrice: 95,
        },
        {
          id: 'potatoes',
          name: 'بطاطا الاستهلاك',
          icon: '🥔',
          officialPrice: null,
          status: w.code === '43' || w.code === '39' ? 'optimal' : 'stable',
          statusAr: w.code === '43' ? 'وفرة كبرى بسوق ماڨرو (45-60 د.ج)' : 'متوفرة بأسعار معتدلة',
          avgObservedPrice: w.code === '43' ? 52 : 75,
        },
        {
          id: 'poultry',
          name: 'دجاج أوناب (ONAB)',
          icon: '🍗',
          officialPrice: 320,
          status: 'optimal',
          statusAr: 'سعر ترويجي 320-350 د.ج',
          avgObservedPrice: 335,
        },
      ];

      map.set(w.code, {
        wilaya: w,
        geo,
        speculationScore: specScore,
        speculationLevel: specLevel,
        speculationLabelAr: specLabelAr,
        speculationColor: specColor,
        availabilityScore: availScore,
        availabilityLevel: availLevel,
        availabilityLabelAr: availLabelAr,
        availabilityColor: availColor,
        reportsCount: wReports.length,
        hotspotsCount: wHotspots.length,
        criticalViolationsCount: critCount,
        commodities,
      });
    });

    return map;
  }, [wilayas, reports, hotspots]);

  // Active Bounds based on user toggle
  const bounds = PROJECTION_BOUNDS[territoryExtent];

  // Convert GPS Coordinates (lat/lng) to SVG canvas coordinates (viewBox 0 0 900 520)
  const projectCoords = (lat: number, lng: number) => {
    const svgWidth = 900;
    const svgHeight = 520;
    const paddingX = 45;
    const paddingY = 40;

    const clampedLat = Math.min(Math.max(lat, bounds.minLat), bounds.maxLat);
    const clampedLng = Math.min(Math.max(lng, bounds.minLng), bounds.maxLng);

    const x =
      ((clampedLng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) *
        (svgWidth - paddingX * 2) +
      paddingX;

    const y =
      ((bounds.maxLat - clampedLat) / (bounds.maxLat - bounds.minLat)) *
        (svgHeight - paddingY * 2) +
      paddingY;

    return { x, y };
  };

  // Convert SVG click back to Lat/Lng for pinpoint reporting
  const handleMapCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isPinModeActive) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const svgWidth = 900;
    const svgHeight = 520;
    const paddingX = 45;
    const paddingY = 40;

    const lng =
      bounds.minLng +
      ((clickX - paddingX) / (svgWidth - paddingX * 2)) * (bounds.maxLng - bounds.minLng);
    const lat =
      bounds.maxLat -
      ((clickY - paddingY) / (svgHeight - paddingY * 2)) * (bounds.maxLat - bounds.minLat);

    setIsPinModeActive(false);
    onOpenReportModalWithCoords({
      lat: Number(lat.toFixed(4)),
      lng: Number(lng.toFixed(4)),
    });
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await onRefreshData();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleConfirm = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setConfirmingId(id);
      await onConfirmReport(id);
      if (selectedPoint && selectedPoint.id === id) {
        setSelectedPoint({
          ...selectedPoint,
          confirmationsCount: selectedPoint.confirmationsCount + 1,
        });
      }
    } finally {
      setConfirmingId(null);
    }
  };

  // Filtered reports for map & list
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (selectedWilaya !== 'all' && r.wilayaCode !== selectedWilaya) return false;
      if (selectedViolationType !== 'all' && r.violationType !== selectedViolationType) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          r.productName.toLowerCase().includes(q) ||
          r.commune.toLowerCase().includes(q) ||
          r.storeName.toLowerCase().includes(q) ||
          r.wilaya.toLowerCase().includes(q) ||
          r.violationTypeAr.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [reports, selectedWilaya, selectedViolationType, searchQuery]);

  // Selected Wilaya Intelligence Snapshot
  const activeWilayaData = useMemo(() => {
    if (selectedWilaya === 'all') return null;
    return wilayaIntelligence.get(selectedWilaya) || null;
  }, [selectedWilaya, wilayaIntelligence]);

  // Dispatches Ticker
  const PATROL_DISPATCHES = [
    {
      icon: '⭐',
      type: 'سوق ماڨرو وادي العثمانية (ميلة 43)',
      text: 'تدفق قياسي لشاحنات الخضر والفواكه من ميلة وبسكرة والوادي بأسعار جملة تفاضلية حقيقية',
      time: 'منذ دقيقتين',
    },
    {
      icon: '🚨',
      type: 'دورية تفتيش وقمع الغش',
      text: 'جولة تفتيشية جارية في محلات التجزئة لضبط سقف الحليب المدعم 25 د.ج والزيت 650 د.ج',
      time: 'منذ 5 دقائق',
    },
    {
      icon: '⚖️',
      type: 'محضر ضبط رسمي',
      text: 'تحرير مخالفة بيع مشروط وحجز سلع موجهة للمضاربة في مستودع غير مصرح بوسط البلاد',
      time: 'منذ 11 دقيقة',
    },
    {
      icon: '🟢',
      type: 'ديوان الحبوب والبقول الجافة (OAIC)',
      text: 'تفريغ شحنات سميد ممتاز معبأة 10 كغ بـ 500 د.ج بمنافذ البيع المباشرة لتأمين التموين',
      time: 'منذ 16 دقيقة',
    },
  ];

  const [patrolIndex, setPatrolIndex] = useState<number>(0);
  React.useEffect(() => {
    const timer = setInterval(() => {
      setPatrolIndex((prev) => (prev + 1) % PATROL_DISPATCHES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [PATROL_DISPATCHES.length]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Banner / Hero Header */}
      <div className="bg-gradient-to-l from-slate-950 via-slate-900 to-slate-950 text-white rounded-2xl p-5 lg:p-6 mb-6 shadow-xl border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold font-mono tracking-wide flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                GIS INTELLIGENCE 69 WILAYAS
              </span>
              <span className="text-slate-400 text-xs">نظام الرصد الجغرافي والخرائط الحرارية اللحظية</span>
              <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                ⭐ قطب ماڨرو ميلة 43 نشط
              </span>
            </div>
            <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <span>خريطة التجاوزات والحرارة اللحظية للولايات الـ 69</span>
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              منظومة رصد وتحليل خرائطي حراري تغطي كافة ولايات ومناطق الجزائر (01 إلى 69) لكشف بؤر المضاربة والاحتكار ومتابعة وفرة السلع الأساسية المقننة لحظياً.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
              <span>تحديث البيانات اللحظية</span>
            </button>

            <button
              onClick={() => onOpenReportModalWithCoords()}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 hover:shadow-red-600/30"
            >
              <Plus className="w-4 h-4" />
              <span>تسجيل بلاغ ميداني جغرافي</span>
            </button>
          </div>
        </div>

        {/* Analytical KPI Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-800/80">
          <div className="bg-slate-850/60 rounded-xl p-3 border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-1">الولايات المربوطة بالخريطة</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold font-mono tabular-nums text-white">69</span>
              <span className="text-[10px] text-emerald-400 font-medium">تغطية وطنية شاملة</span>
            </div>
          </div>

          <div className="bg-red-950/30 rounded-xl p-3 border border-red-900/40">
            <span className="text-[11px] text-red-300 block mb-1 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-red-400" />
              <span>بؤر المضاربة المرصودة (Heatmap)</span>
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold font-mono tabular-nums text-red-400">
                {Array.from(wilayaIntelligence.values()).filter((w) => w.speculationLevel === 'critical').length}
              </span>
              <span className="text-[10px] text-red-300">ولايات تحت الرقابة المشددة</span>
            </div>
          </div>

          <div className="bg-emerald-950/30 rounded-xl p-3 border border-emerald-900/40">
            <span className="text-[11px] text-emerald-300 block mb-1 flex items-center gap-1">
              <PackageCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>ولايات ذات وفرة عالية (&gt;80%)</span>
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold font-mono tabular-nums text-emerald-400">
                {Array.from(wilayaIntelligence.values()).filter((w) => w.availabilityLevel === 'optimal').length}
              </span>
              <span className="text-[10px] text-emerald-300">تموين مستقر بأسعار الدولة</span>
            </div>
          </div>

          <div className="bg-amber-950/30 rounded-xl p-3 border border-amber-900/40">
            <span className="text-[11px] text-amber-300 block mb-1 flex items-center gap-1">
              <Store className="w-3.5 h-3.5 text-amber-400" />
              <span>قطب ماڨرو وادي العثمانية (ميلة 43)</span>
            </span>
            <div className="flex items-baseline gap-2 truncate">
              <span className="text-sm font-bold text-amber-300 truncate">
                4500 طن/يومياً خضر وفواكه
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Control & Layer Navigation Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-5 shadow-xs space-y-3.5">
        {/* Layer Mode Selector Pills */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-700 ml-2 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span>الطبقة المرئية:</span>
            </span>

            <button
              onClick={() => setActiveLayer('speculation')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeLayer === 'speculation'
                  ? 'bg-red-600 text-white shadow-sm ring-2 ring-red-500/20'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>🔥 بؤر المضاربة (Heatmap)</span>
            </button>

            <button
              onClick={() => setActiveLayer('availability')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeLayer === 'availability'
                  ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/20'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <PackageCheck className="w-3.5 h-3.5" />
              <span>🟢 وفرة السلع الأساسية (Heatmap)</span>
            </button>

            <button
              onClick={() => setActiveLayer('reports')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeLayer === 'reports'
                  ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-500/20'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>📍 البلاغات الميدانية الحية</span>
            </button>

            <button
              onClick={() => setActiveLayer('combined')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeLayer === 'combined'
                  ? 'bg-slate-900 text-white shadow-sm ring-2 ring-slate-800/20'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-amber-400" />
              <span>🌐 العرض الشامل المدمج</span>
            </button>
          </div>

          {/* Territory Extent Toggle */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl shrink-0 self-start md:self-auto">
            <button
              onClick={() => setTerritoryExtent('national_69')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                territoryExtent === 'national_69'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-emerald-600" />
              <span>كامل التراب (69 ولاية)</span>
            </button>

            <button
              onClick={() => setTerritoryExtent('north_urban')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                territoryExtent === 'north_urban'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>الشمال والوسط التجاري</span>
            </button>
          </div>
        </div>

        {/* Second Row: Specific Commodity Selection (when in Availability mode) & Wilaya Quick Filter */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 text-xs">
          {/* Commodity Pill Selector for Availability Heatmap */}
          {activeLayer === 'availability' && (
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              <span className="text-slate-500 font-semibold whitespace-nowrap text-[11px]">سلعة الوفرة:</span>
              {[
                { id: 'all', label: 'المؤشر العام' },
                { id: 'milk', label: 'حليب 25 د.ج' },
                { id: 'oil', label: 'زيت 650 د.ج' },
                { id: 'semolina', label: 'سميد 10 كغ' },
                { id: 'potatoes', label: 'بطاطا ماڨرو' },
                { id: 'poultry', label: 'دجاج أوناب' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCommodityHeat(c.id)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all border ${
                    selectedCommodityHeat === c.id
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          )}

          {/* Wilaya Filter (All 69 Wilayas) */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-500 whitespace-nowrap text-[11px] font-semibold">تحديد ولاية:</span>
            <select
              value={selectedWilaya}
              onChange={(e) => setSelectedWilaya(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-xl bg-white text-slate-800 font-semibold text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600 max-w-[210px] truncate"
            >
              <option value="all">كل الولايات (69 ولاية ومنطقة)</option>
              {wilayas.map((w) => (
                <option key={w.code} value={w.code}>
                  {w.code} - ولاية {w.nameAr} ({w.nameFr})
                </option>
              ))}
            </select>

            <button
              onClick={() => setSelectedWilaya(selectedWilaya === '43' ? 'all' : '43')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 border ${
                selectedWilaya === '43'
                  ? 'bg-amber-600 text-white border-amber-500 shadow-xs'
                  : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
              }`}
              title="تحديد قطب سوق ماڨرو وادي العثمانية (ميلة 43)"
            >
              <span>⭐ ماڨرو ميلة 43</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالولاية، البلدية، اسم المحل، أو السلعة..."
              className="w-full pl-3 pr-8 py-1.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white text-xs"
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Map + Inspection Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Left Column: Interactive GIS Map Canvas (lg:col-span-8) */}
        <div className="lg:col-span-8 bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-lg flex flex-col">
          {/* Map Controls Top Bar */}
          <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold text-white">
                خريطة الجمهورية الجزائرية الديمقراطية الشعبية ({wilayas.length} ولاية مربوطة)
              </span>
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                {territoryExtent === 'national_69' ? 'النطاق الكامل' : 'الشمال التجاري'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <button
                onClick={() => setMapTheme(mapTheme === 'tactical_dark' ? 'civic_light' : 'tactical_dark')}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono"
              >
                {mapTheme === 'tactical_dark' ? 'تكتيكي داكن' : 'نهاري طبوغرافي'}
              </button>

              {/* Pinpoint Mode */}
              <button
                onClick={() => setIsPinModeActive(!isPinModeActive)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
                  isPinModeActive
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
                title="انقر على الخريطة لتسجيل بلاغ بإحداثيات النقطة"
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span>{isPinModeActive ? 'انقر بالموقع' : 'تحديد بالخريطة'}</span>
              </button>

              {/* Zoom Controls */}
              <div className="flex items-center bg-slate-800 rounded-lg p-0.5">
                <button
                  onClick={() => setMapZoom((z) => Math.min(z + 0.25, 2.5))}
                  className="p-1 hover:bg-slate-700 rounded text-slate-300"
                  title="تكبير"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <span className="px-1.5 font-mono text-[10px] text-slate-400">{Math.round(mapZoom * 100)}%</span>
                <button
                  onClick={() => setMapZoom((z) => Math.max(z - 0.25, 1.0))}
                  className="p-1 hover:bg-slate-700 rounded text-slate-300"
                  title="تصغير"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                {mapZoom > 1 && (
                  <button
                    onClick={() => setMapZoom(1)}
                    className="p-1 hover:bg-slate-700 rounded text-slate-400 text-[10px]"
                    title="إعادة ضبط"
                  >
                    1x
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Interactive SVG Map Viewport */}
          <div
            className={`relative w-full aspect-[16/10] min-h-[440px] overflow-hidden select-none ${
              mapTheme === 'tactical_dark' ? 'bg-[#090f1d]' : 'bg-[#e2e8f0]'
            } ${isPinModeActive ? 'cursor-crosshair' : 'cursor-default'}`}
          >
            {isPinModeActive && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-red-600 text-white px-3 py-1 rounded-full text-[11px] font-bold shadow-lg flex items-center gap-1.5 animate-bounce">
                <Crosshair className="w-3.5 h-3.5" />
                <span>انقر في أي ولاية لتسجيل بلاغ ميداني جغرافي مباشر</span>
              </div>
            )}

            <svg
              viewBox="0 0 900 520"
              className="w-full h-full transition-transform duration-300 origin-center"
              style={{ transform: `scale(${mapZoom})` }}
              onClick={handleMapCanvasClick}
            >
              <defs>
                {/* Tactical Coordinate Grid Pattern */}
                <pattern id="tacticalGrid" width="45" height="45" patternUnits="userSpaceOnUse">
                  <path
                    d="M 45 0 L 0 0 0 45"
                    fill="none"
                    stroke={mapTheme === 'tactical_dark' ? '#182438' : '#cbd5e1'}
                    strokeWidth="0.5"
                    strokeDasharray="2,2"
                  />
                </pattern>

                {/* Heatmap Gaussian Blur Filter */}
                <filter id="heatBlur" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="14" result="blur" />
                </filter>
                <filter id="heatSoftBlur" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="8" result="blur" />
                </filter>

                {/* Speculation Heatmap Radial Gradients */}
                <radialGradient id="heatCriticalRed">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.85" />
                  <stop offset="45%" stopColor="#dc2626" stopOpacity="0.55" />
                  <stop offset="75%" stopColor="#b91c1c" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#991b1b" stopOpacity="0" />
                </radialGradient>

                <radialGradient id="heatAlertAmber">
                  <stop offset="0%" stopColor="#f97316" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#ea580c" stopOpacity="0.45" />
                  <stop offset="80%" stopColor="#c2410c" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#9a3412" stopOpacity="0" />
                </radialGradient>

                <radialGradient id="heatModerateYellow">
                  <stop offset="0%" stopColor="#eab308" stopOpacity="0.75" />
                  <stop offset="55%" stopColor="#ca8a04" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#a16207" stopOpacity="0" />
                </radialGradient>

                {/* Availability Heatmap Radial Gradients */}
                <radialGradient id="heatAbundantGreen">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.85" />
                  <stop offset="45%" stopColor="#059669" stopOpacity="0.5" />
                  <stop offset="80%" stopColor="#047857" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#065f46" stopOpacity="0" />
                </radialGradient>

                <radialGradient id="heatStableCyan">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.75" />
                  <stop offset="55%" stopColor="#0891b2" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#0e7490" stopOpacity="0" />
                </radialGradient>

                <radialGradient id="heatScarcityAlert">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.8" />
                  <stop offset="55%" stopColor="#e11d48" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#be123c" stopOpacity="0" />
                </radialGradient>

                {/* Magro Hub Radiant Gradient */}
                <radialGradient id="magroHubGlow">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.95" />
                  <stop offset="40%" stopColor="#d97706" stopOpacity="0.5" />
                  <stop offset="80%" stopColor="#b45309" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#78350f" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Grid Background */}
              <rect width="900" height="520" fill="url(#tacticalGrid)" />

              {/* Stylized Algeria Boundary Territory Polygon */}
              {territoryExtent === 'national_69' ? (
                /* Full National Algeria Contour */
                <g>
                  <path
                    d="
                      M 280,68 
                      Q 350,56 460,60 
                      T 640,62 
                      T 780,68 
                      L 805,145 
                      L 820,245 
                      L 845,340 
                      L 745,450 
                      L 615,488 
                      L 480,470 
                      L 380,420 
                      L 220,380 
                      L 85,275 
                      L 175,175 
                      Z
                    "
                    fill={mapTheme === 'tactical_dark' ? '#0f172a' : '#f8fafc'}
                    stroke={mapTheme === 'tactical_dark' ? '#1e293b' : '#cbd5e1'}
                    strokeWidth="1.8"
                  />
                  {/* Coastal Water Indicator */}
                  <text
                    x="530"
                    y="38"
                    textAnchor="middle"
                    fill={mapTheme === 'tactical_dark' ? '#38bdf8' : '#0284c7'}
                    fontSize="11"
                    letterSpacing="3"
                    fontWeight="bold"
                    opacity="0.65"
                  >
                    البحر الأبيض المتوسط · MER MÉDITERRANÉE
                  </text>
                </g>
              ) : (
                /* Northern Urban Belt Contour */
                <g>
                  <path
                    d="
                      M 30,70 
                      Q 200,45 420,55 
                      T 740,55 
                      T 880,70 
                      L 880,480 
                      L 30,480 
                      Z
                    "
                    fill={mapTheme === 'tactical_dark' ? '#0f172a' : '#f8fafc'}
                    stroke={mapTheme === 'tactical_dark' ? '#334155' : '#94a3b8'}
                    strokeWidth="1.5"
                  />
                  <text
                    x="450"
                    y="32"
                    textAnchor="middle"
                    fill={mapTheme === 'tactical_dark' ? '#38bdf8' : '#0284c7'}
                    fontSize="11"
                    letterSpacing="3"
                    fontWeight="bold"
                    opacity="0.65"
                  >
                    الشريط الساحلي والمراكز التجارية الشمالية
                  </text>
                </g>
              )}

              {/* Major Highway & Supply Corridors (الطريق السيار شرق-غرب ومحور الوحدة الإفريقية) */}
              <g opacity="0.35" strokeDasharray="3,3">
                {/* East-West Highway connecting Tlemcen, Oran, Algiers, Setif, Mila, Constantine, Annaba */}
                <path
                  d={`
                    M ${projectCoords(34.88, -1.32).x},${projectCoords(34.88, -1.32).y}
                    L ${projectCoords(35.70, -0.63).x},${projectCoords(35.70, -0.63).y}
                    L ${projectCoords(36.16, 1.33).x},${projectCoords(36.16, 1.33).y}
                    L ${projectCoords(36.75, 3.06).x},${projectCoords(36.75, 3.06).y}
                    L ${projectCoords(36.19, 5.41).x},${projectCoords(36.19, 5.41).y}
                    L ${projectCoords(36.25, 6.28).x},${projectCoords(36.25, 6.28).y}
                    L ${projectCoords(36.36, 6.61).x},${projectCoords(36.36, 6.61).y}
                    L ${projectCoords(36.90, 7.77).x},${projectCoords(36.90, 7.77).y}
                  `}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="1.4"
                />

                {/* Trans-Sahara Highway connecting Algiers -> Djelfa -> Ghardaia -> In Salah -> Tamanrasset */}
                <path
                  d={`
                    M ${projectCoords(36.75, 3.06).x},${projectCoords(36.75, 3.06).y}
                    L ${projectCoords(34.67, 3.25).x},${projectCoords(34.67, 3.25).y}
                    L ${projectCoords(32.49, 3.67).x},${projectCoords(32.49, 3.67).y}
                    L ${projectCoords(27.20, 2.47).x},${projectCoords(27.20, 2.47).y}
                    L ${projectCoords(22.79, 5.52).x},${projectCoords(22.79, 5.52).y}
                  `}
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="1.2"
                />
              </g>

              {/* ----------------------------------------------------------------- */}
              {/* LAYER 1: Visual HEATMAP Halos for all 69 Wilayas */}
              {/* ----------------------------------------------------------------- */}
              {(activeLayer === 'speculation' || activeLayer === 'combined') && (
                <g id="speculation-heatmap-layer">
                  {Array.from(wilayaIntelligence.values()).map((item) => {
                    const { x, y } = projectCoords(item.geo.lat, item.geo.lng);
                    const isCritical = item.speculationLevel === 'critical';
                    const isHigh = item.speculationLevel === 'high';
                    const isModerate = item.speculationLevel === 'medium';

                    // Radius scales with speculation index
                    const baseRadius = isCritical ? 46 : isHigh ? 36 : isModerate ? 26 : 18;
                    const gradientId = isCritical
                      ? 'url(#heatCriticalRed)'
                      : isHigh
                      ? 'url(#heatAlertAmber)'
                      : isModerate
                      ? 'url(#heatModerateYellow)'
                      : 'url(#heatAbundantGreen)';

                    return (
                      <g key={`heat-spec-${item.wilaya.code}`}>
                        {/* Blur Halo */}
                        <circle
                          cx={x}
                          cy={y}
                          r={baseRadius}
                          fill={gradientId}
                          filter="url(#heatBlur)"
                          opacity={isCritical ? 0.9 : 0.65}
                          className={isCritical ? 'animate-pulse' : ''}
                        />
                        {/* Inner Heat Core */}
                        <circle
                          cx={x}
                          cy={y}
                          r={baseRadius * 0.55}
                          fill={item.speculationColor}
                          opacity={isCritical ? 0.35 : 0.15}
                        />
                      </g>
                    );
                  })}
                </g>
              )}

              {/* ----------------------------------------------------------------- */}
              {/* LAYER 2: Visual Commodity Availability Heatmap */}
              {/* ----------------------------------------------------------------- */}
              {(activeLayer === 'availability' || activeLayer === 'combined') && (
                <g id="availability-heatmap-layer">
                  {Array.from(wilayaIntelligence.values()).map((item) => {
                    const { x, y } = projectCoords(item.geo.lat, item.geo.lng);
                    const isOptimal = item.availabilityLevel === 'optimal';
                    const isStable = item.availabilityLevel === 'stable';
                    const isPressure = item.availabilityLevel === 'pressure';

                    const baseRadius = isOptimal ? 42 : isStable ? 32 : isPressure ? 38 : 46;
                    const gradientId = isOptimal
                      ? 'url(#heatAbundantGreen)'
                      : isStable
                      ? 'url(#heatStableCyan)'
                      : isPressure
                      ? 'url(#heatAlertAmber)'
                      : 'url(#heatScarcityAlert)';

                    return (
                      <g key={`heat-avail-${item.wilaya.code}`}>
                        <circle
                          cx={x}
                          cy={y}
                          r={baseRadius}
                          fill={gradientId}
                          filter="url(#heatSoftBlur)"
                          opacity={0.7}
                        />
                      </g>
                    );
                  })}
                </g>
              )}

              {/* ----------------------------------------------------------------- */}
              {/* LAYER 3: 69 Wilayas Interactive Node Points & Badges */}
              {/* ----------------------------------------------------------------- */}
              <g id="wilaya-nodes-layer">
                {Array.from(wilayaIntelligence.values()).map((item) => {
                  const { x, y } = projectCoords(item.geo.lat, item.geo.lng);
                  const isSelected = selectedWilaya === item.wilaya.code;
                  const isHovered = hoveredWilayaCode === item.wilaya.code;
                  const isMagroHub = item.geo.isMagroHub;

                  if (isMagroHub) {
                    return (
                      <g
                        key={`node-${item.wilaya.code}`}
                        className="cursor-pointer group"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedWilaya(item.wilaya.code);
                        }}
                        onMouseEnter={() => setHoveredWilayaCode(item.wilaya.code)}
                        onMouseLeave={() => setHoveredWilayaCode(null)}
                      >
                        {/* Radiant Halo for Magro Mila */}
                        <circle cx={x} cy={y} r="28" fill="url(#magroHubGlow)" className="animate-ping origin-center opacity-60" />
                        <circle cx={x} cy={y} r="14" fill="#065f46" stroke="#f59e0b" strokeWidth="2.5" />
                        <text x={x} y={y + 4} textAnchor="middle" fontSize="11" className="pointer-events-none select-none">
                          ⭐
                        </text>
                        {/* Floating Tooltip Label */}
                        <rect
                          x={x - 62}
                          y={y - 28}
                          width="124"
                          height="18"
                          rx="4"
                          fill="#064e3b"
                          stroke="#34d399"
                          strokeWidth="1.2"
                        />
                        <text
                          x={x}
                          y={y - 15}
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize="9"
                          fontWeight="bold"
                          className="pointer-events-none select-none"
                        >
                          ⭐ سوق ماڨرو العثمانية (ميلة 43)
                        </text>
                      </g>
                    );
                  }

                  // Standard Wilaya Node (01..69)
                  let nodeFill = '#64748b';
                  if (activeLayer === 'speculation') {
                    nodeFill = item.speculationColor;
                  } else if (activeLayer === 'availability') {
                    nodeFill = item.availabilityColor;
                  }

                  return (
                    <g
                      key={`node-${item.wilaya.code}`}
                      className="cursor-pointer group"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedWilaya(item.wilaya.code);
                      }}
                      onMouseEnter={() => setHoveredWilayaCode(item.wilaya.code)}
                      onMouseLeave={() => setHoveredWilayaCode(null)}
                    >
                      {/* Active / Hover Selection Ring */}
                      {(isSelected || isHovered) && (
                        <circle
                          cx={x}
                          cy={y}
                          r="12"
                          fill="none"
                          stroke="#ffffff"
                          strokeWidth="2"
                          strokeDasharray={isSelected ? 'none' : '2,2'}
                          className="animate-pulse"
                        />
                      )}

                      <circle
                        cx={x}
                        cy={y}
                        r={isSelected ? 6 : isHovered ? 5 : 3.5}
                        fill={isSelected ? '#ffffff' : nodeFill}
                        stroke={isSelected ? item.speculationColor : '#0f172a'}
                        strokeWidth={isSelected ? 2.5 : 1}
                      />

                      {/* Display Wilaya Code or Name on Hover / Selected or Important Centers */}
                      {(isSelected || isHovered || isSelected || mapZoom > 1.25) && (
                        <g className="pointer-events-none select-none">
                          <rect
                            x={x - 22}
                            y={y - 19}
                            width="44"
                            height="13"
                            rx="3"
                            fill={isSelected ? '#059669' : '#0f172a'}
                            stroke={isSelected ? '#34d399' : '#334155'}
                            strokeWidth="0.8"
                            opacity="0.95"
                          />
                          <text
                            x={x}
                            y={y - 9}
                            textAnchor="middle"
                            fill="#ffffff"
                            fontSize="8"
                            fontWeight="bold"
                          >
                            {item.wilaya.code} {item.wilaya.nameAr}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </g>

              {/* ----------------------------------------------------------------- */}
              {/* LAYER 4: Hotspots Clusters (Radar Waves) */}
              {/* ----------------------------------------------------------------- */}
              {(activeLayer === 'speculation' || activeLayer === 'reports' || activeLayer === 'combined') && (
                <g id="hotspots-layer">
                  {hotspots.map((hs) => {
                    const { x, y } = projectCoords(hs.lat, hs.lng);
                    const isBlackSpot = hs.hotspotRiskLevel === 'high_black_spot';

                    return (
                      <g
                        key={`hs-${hs.wilayaCode}-${hs.commune}`}
                        className="cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedHotspot(hs);
                        }}
                      >
                        <circle
                          cx={x}
                          cy={y}
                          r="22"
                          fill={isBlackSpot ? '#ef4444' : '#f59e0b'}
                          fillOpacity="0.25"
                          stroke={isBlackSpot ? '#ef4444' : '#f59e0b'}
                          strokeWidth="1.5"
                          className="animate-ping origin-center"
                        />
                        <rect
                          x={x - 30}
                          y={y + 10}
                          width="60"
                          height="15"
                          rx="4"
                          fill="#7f1d1d"
                          stroke="#ef4444"
                          strokeWidth="0.8"
                        />
                        <text
                          x={x}
                          y={y + 21}
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize="8"
                          fontWeight="bold"
                        >
                          بؤرة {hs.commune}
                        </text>
                      </g>
                    );
                  })}
                </g>
              )}

              {/* ----------------------------------------------------------------- */}
              {/* LAYER 5: Live Field Pinpoints (Citizen Reports) */}
              {/* ----------------------------------------------------------------- */}
              {(activeLayer === 'reports' || activeLayer === 'combined') && (
                <g id="reports-pins-layer">
                  {filteredReports.map((report) => {
                    const { x, y } = projectCoords(report.lat, report.lng);
                    const isSelected = selectedPoint?.id === report.id;

                    let pinColor = '#ef4444';
                    if (report.violationType === 'conditional_selling') pinColor = '#f59e0b';
                    else if (report.violationType === 'hoarding_speculation') pinColor = '#a855f7';
                    else if (report.violationType === 'model_compliant_store') pinColor = '#10b981';

                    return (
                      <g
                        key={report.id}
                        className="cursor-pointer transition-transform duration-150 hover:scale-125"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPoint(report);
                          setSelectedHotspot(null);
                        }}
                      >
                        {isSelected && (
                          <circle cx={x} cy={y} r="14" fill="none" stroke="#ffffff" strokeWidth="2" className="animate-pulse" />
                        )}
                        <path
                          d={`M ${x} ${y} L ${x - 5} ${y - 12} A 5 5 0 1 1 ${x + 5} ${y - 12} Z`}
                          fill={pinColor}
                          stroke="#ffffff"
                          strokeWidth="1"
                        />
                        <circle cx={x} cy={y - 12} r="2" fill="#ffffff" />
                      </g>
                    );
                  })}
                </g>
              )}
            </svg>

            {/* Tactical Map Dynamic Legend Overlay (Bottom Right) */}
            <div className="absolute bottom-3 right-3 bg-slate-950/90 backdrop-blur-md p-3 rounded-xl border border-slate-800 text-[10px] text-slate-300 space-y-1.5 z-10 shadow-xl max-w-[240px]">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                <span className="font-bold text-white text-[11px] flex items-center gap-1">
                  <Activity className="w-3 h-3 text-emerald-400" />
                  <span>دليل الخريطة اللحظي:</span>
                </span>
                <span className="font-mono text-emerald-400 text-[9px]">69 WILAYAS</span>
              </div>

              {activeLayer === 'speculation' ? (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-500 shrink-0 shadow-sm shadow-red-500/50" />
                    <span>بؤرة مضاربة حرجة (خرق سقف الأسعار)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
                    <span>ضغط أسعار ونشاط مضاربة متوسط</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
                    <span>سوق منضبط وأسعار نظامية مستقرة</span>
                  </div>
                </>
              ) : activeLayer === 'availability' ? (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
                    <span>وفرة عالية (&gt;80%) وتدفق سلع مستمر</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-cyan-500 shrink-0" />
                    <span>وفرة طبيعية مستقرة (60-80%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
                    <span>ضغط في وتيرة التوزيع (40-60%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-600 shrink-0" />
                    <span>شح وتذبذب في التموين (&lt;40%)</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                    <span>خرق السعر المسقف (حليب 25 / زيت 650)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                    <span>بيع مشروط غير قانوني</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                    <span>نقطة بيع نموذجية منضبطة</span>
                  </div>
                </>
              )}

              <div className="flex items-center gap-1.5 pt-1 border-t border-slate-800 font-semibold text-amber-300">
                <span>⭐</span>
                <span>قطب ماڨرو وادي العثمانية (ميلة 43)</span>
              </div>
            </div>
          </div>

          {/* Tactical Inspection Patrols & Logistics Ticker */}
          <div className="bg-slate-950 border-t border-slate-800 px-4 py-2.5 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950/90 text-emerald-400 border border-emerald-800 text-[10px] font-bold shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                رادار التموين ومكافحة المضاربة
              </span>
              <span className="text-[11px] text-slate-200 truncate flex items-center gap-1.5">
                <span className="font-bold text-amber-400">
                  {PATROL_DISPATCHES[patrolIndex].icon} {PATROL_DISPATCHES[patrolIndex].type}:
                </span>
                <span>{PATROL_DISPATCHES[patrolIndex].text}</span>
                <span className="text-slate-400 font-mono text-[10px]">({PATROL_DISPATCHES[patrolIndex].time})</span>
              </span>
            </div>
            <div className="text-[10px] text-emerald-400 font-mono font-bold hidden sm:flex items-center gap-1 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>نظام الـ 69 ولاية متصل 100%</span>
            </div>
          </div>
        </div>

        {/* Right Column: Active Inspection / Detail Sidebar (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Active Point Card (if clicked on individual violation) */}
          {selectedPoint ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3.5 animate-in fade-in duration-200">
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">تفاصيل النقطة الميدانية</span>
                  <h3 className="font-bold text-slate-900 text-sm">{selectedPoint.productName}</h3>
                </div>
                <button
                  onClick={() => setSelectedPoint(null)}
                  className="text-slate-400 hover:text-slate-600 text-xs px-2 py-0.5 rounded bg-slate-100"
                >
                  إغلاق
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    selectedPoint.violationType === 'model_compliant_store'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {selectedPoint.violationTypeAr}
                </span>

                {selectedPoint.status === 'dispatched_to_enforcement' ? (
                  <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-bold flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3 text-amber-700" />
                    <span>محال لفرق قمع الغش</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px]">
                    قيد التدقيق المجتمعي
                  </span>
                )}
              </div>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block">السعر الملاحظ:</span>
                  <span className="font-mono text-base font-bold text-slate-900">
                    {selectedPoint.observedPriceDzd} د.ج
                  </span>
                </div>
                {selectedPoint.officialPriceDzd && (
                  <div className="text-left">
                    <span className="text-[10px] text-slate-500 block">السعر المقنن:</span>
                    <span className="font-mono text-xs font-semibold text-emerald-700">
                      {selectedPoint.officialPriceDzd} د.ج
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-1.5 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-semibold">{selectedPoint.storeName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    {selectedPoint.commune} · ولاية {selectedPoint.wilaya}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div className="text-[11px] text-slate-500">
                  <span>التأكيدات الميدانية: </span>
                  <span className="font-bold text-slate-900 font-mono">
                    {selectedPoint.confirmationsCount}
                  </span>
                </div>

                <button
                  onClick={(e) => handleConfirm(selectedPoint.id, e)}
                  disabled={confirmingId === selectedPoint.id}
                  className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs transition-colors shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>تأكيد البلاغ (+1)</span>
                </button>
              </div>
            </div>
          ) : selectedHotspot ? (
            /* Selected Hotspot Card */
            <div className="bg-red-50 rounded-2xl border border-red-200 p-5 shadow-sm space-y-3 animate-in fade-in duration-200">
              <div className="flex items-start justify-between gap-2 border-b border-red-200/60 pb-3">
                <div className="flex items-center gap-2 text-red-900 font-bold text-sm">
                  <Flame className="w-4 h-4 text-red-600" />
                  <span>بؤرة مضاربة مرصودة: {selectedHotspot.commune}</span>
                </div>
                <button
                  onClick={() => setSelectedHotspot(null)}
                  className="text-red-700 hover:text-red-900 text-xs px-2 py-0.5 rounded bg-red-100"
                >
                  إغلاق
                </button>
              </div>

              <div className="space-y-2 text-xs text-red-950">
                <p className="leading-relaxed">
                  تم رصد تكرار البلاغات وتضخيم الأسعار في هذه البلدية بواقع{' '}
                  <span className="font-bold font-mono">{selectedHotspot.totalViolations} مخالفات</span>.
                </p>

                <div className="bg-white/80 p-3 rounded-xl border border-red-200 space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">السلعة الأكثر تضرراً:</span>
                    <span className="font-bold text-slate-900">{selectedHotspot.topViolatedCommodity}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">الولاية:</span>
                    <span className="font-semibold text-slate-900">{selectedHotspot.wilayaName}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => onOpenReportModalWithCoords({ lat: selectedHotspot.lat, lng: selectedHotspot.lng })}
                    className="w-full py-2 bg-red-700 hover:bg-red-800 text-white font-semibold rounded-xl text-xs transition-colors shadow-xs"
                  >
                    تسجيل بلاغ إضافي في هذه البؤرة
                  </button>
                </div>
              </div>
            </div>
          ) : activeWilayaData ? (
            /* Selected Wilaya Intelligence Snapshot (One of the 69 Wilayas) */
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 animate-in fade-in duration-200">
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center font-bold font-mono text-xs">
                    {activeWilayaData.wilaya.code}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      رادار ولاية {activeWilayaData.wilaya.nameAr}
                    </h3>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Wilaya de {activeWilayaData.wilaya.nameFr}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedWilaya('all')}
                  className="text-slate-400 hover:text-slate-600 text-xs px-2 py-1 rounded-lg bg-slate-100"
                >
                  عرض الكل
                </button>
              </div>

              {/* Special Magro Mila 43 Spotlight Card */}
              {activeWilayaData.wilaya.code === '43' && (
                <div className="p-3.5 bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-950 text-white rounded-xl text-xs space-y-2 border border-emerald-700/60 shadow-xs">
                  <div className="flex items-center gap-1.5 font-bold text-amber-300">
                    <span className="text-base">⭐</span>
                    <span>قطب سوق الجملة الجهوي ماڨرو (وادي العثمانية - ميلة 43)</span>
                  </div>
                  <p className="text-[11px] text-emerald-100 leading-relaxed">
                    أكبر منصة لوجستية وبورصة خضر وفواكه بالشرق الجزائري بمحاذاة الطريق السيار شرق-غرب. تسليم مباشر لآلاف الأطنان من البطاطا، البصل، الفواكه بأسعار الجملة المرجعية التي تخفض التضخم وتكسر سلاسل الوساطة الطفيلية.
                  </p>
                  <div className="flex items-center justify-between text-[10px] font-mono pt-1 text-emerald-300 border-t border-emerald-800/80">
                    <span>البطاطا بالجملة: 45 - 55 د.ج</span>
                    <span>التدفق اليومي: +4500 طن</span>
                  </div>
                </div>
              )}

              {/* Speculation Risk Gauge */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-red-500" />
                    <span>مؤشر خطر المضاربة (Heat Risk):</span>
                  </span>
                  <span
                    className="font-bold text-xs px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `${activeWilayaData.speculationColor}20`,
                      color: activeWilayaData.speculationColor,
                    }}
                  >
                    {activeWilayaData.speculationScore}% ({activeWilayaData.speculationLabelAr})
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${activeWilayaData.speculationScore}%`,
                      backgroundColor: activeWilayaData.speculationColor,
                    }}
                  />
                </div>
              </div>

              {/* Commodity Availability Status Grid */}
              <div className="space-y-1.5">
                <span className="font-bold text-slate-800 text-xs block">
                  مصفوفة وفرة السلع الأساسية المقننة:
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {activeWilayaData.commodities.map((item) => (
                    <div
                      key={item.id}
                      className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-bold text-slate-800 flex items-center gap-1">
                          <span>{item.icon}</span>
                          <span className="truncate">{item.name}</span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-500">السعر:</span>
                        <span className="font-mono font-bold text-slate-900">
                          {item.avgObservedPrice} د.ج
                        </span>
                      </div>
                      <span
                        className={`text-[9px] font-bold mt-1 px-1.5 py-0.5 rounded text-center truncate ${
                          item.status === 'optimal'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'stable'
                            ? 'bg-cyan-100 text-cyan-800'
                            : item.status === 'pressure'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {item.statusAr}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Wilaya Stats Metrics */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-500 block">مؤشر الأسعار الإقليمي:</span>
                  <span className="font-mono text-sm font-bold text-slate-900">
                    {activeWilayaData.wilaya.priceIndex}x
                  </span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-500 block">أسواق الرحمة النشطة:</span>
                  <span className="font-mono text-sm font-bold text-emerald-700">
                    {activeWilayaData.wilaya.activeRahmaMarkets} منافذ
                  </span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-500 block">البلاغات الميدانية:</span>
                  <span className="font-mono text-sm font-bold text-slate-900">
                    {activeWilayaData.reportsCount} بلاغ
                  </span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-500 block">البؤر تحت التفتيش:</span>
                  <span className="font-mono text-sm font-bold text-red-600">
                    {activeWilayaData.hotspotsCount} بؤرة
                  </span>
                </div>
              </div>

              {/* Popular Markets in Wilaya */}
              {activeWilayaData.wilaya.popularMarkets && (
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px]">
                  <span className="font-bold text-slate-700 block mb-1">الأسواق الشعبية وأسواق الجملة:</span>
                  <span className="text-slate-600 leading-relaxed">
                    {activeWilayaData.wilaya.popularMarkets.join(' · ')}
                  </span>
                </div>
              )}

              <button
                onClick={() => onOpenReportModalWithCoords({ lat: activeWilayaData.geo.lat, lng: activeWilayaData.geo.lng })}
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>تسجيل بلاغ فوري في ولاية {activeWilayaData.wilaya.nameAr}</span>
              </button>
            </div>
          ) : (
            /* Default Welcome & Instructions */
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3.5">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>تغطية نظام الـ 69 ولاية بالخريطة التفاعلية</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                انقر على أي ولاية من الولايات الـ 69 على الخريطة لعرض مؤشرات المضاربة، وفرة السلع المقننة (حليب، زيت، سميد، بطاطا ماڨرو)، وسجل الأسواق الشعبية.
              </p>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    🔥
                  </span>
                  <div>
                    <span className="font-bold text-slate-900 block">طبقة بؤر المضاربة</span>
                    <span className="text-[11px] text-slate-500">
                      توهج حراري أحمر وأصفر يحدد مناطق خرق سقف الأسعار والاحتكار.
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    🟢
                  </span>
                  <div>
                    <span className="font-bold text-slate-900 block">طبقة وفرة السلع الأساسية</span>
                    <span className="text-[11px] text-slate-500">
                      توهج أخضر وسماوي يبرز تدفق ووفرة المواد الاستهلاكية وأقطاب الجملة.
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    ⭐
                  </span>
                  <div>
                    <span className="font-bold text-slate-900 block">قطب ماڨرو وادي العثمانية (ميلة 43)</span>
                    <span className="text-[11px] text-slate-500">
                      المرجع اللوجستي الإقليمي لضبط أسعار الخضر والفواكه.
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setSelectedWilaya('43')}
                  className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <span>⭐ معاينة بيانات قطب ماڨرو ميلة 43</span>
                </button>
              </div>
            </div>
          )}

          {/* Active Hotspots Mini-List */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-red-600" />
                <span>قائمة البؤر المرصودة ({hotspots.length})</span>
              </span>
            </div>

            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {hotspots.length === 0 ? (
                <p className="text-[11px] text-slate-500 text-center py-4">
                  لا توجد بؤر مضاربة متكررة حالياً.
                </p>
              ) : (
                hotspots.map((hs) => (
                  <button
                    key={`side-hs-${hs.wilayaCode}-${hs.commune}`}
                    onClick={() => {
                      setSelectedHotspot(hs);
                      setSelectedPoint(null);
                    }}
                    className="w-full text-right p-2.5 rounded-xl border border-slate-100 hover:border-red-200 hover:bg-red-50/50 transition-all text-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">{hs.commune}</div>
                      <div className="text-[10px] text-slate-500">
                        ولاية {hs.wilayaName} · {hs.topViolatedCommodity}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-mono text-[10px] font-bold">
                      {hs.totalViolations} بلاغات
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Citizen Live Reports Table & Feed */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              سجل البلاغات الميدانية الحية وتحديثات الأسواق عبر 69 ولاية
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              قائمة البلاغات المسجلة من المواطنين مع التوثيق الميداني وحالة التحقيق الرقابي
            </p>
          </div>

          <div className="text-xs text-slate-500 font-mono">
            عرض {filteredReports.length} من أصل {reports.length} بلاغ
          </div>
        </div>

        {filteredReports.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            لا توجد بلاغات تطابق الفلاتر المحددة حالياً.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredReports.map((r) => {
              const formattedDate = new Date(r.reportedAt).toLocaleDateString('ar-DZ', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedPoint(r)}
                  className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                    selectedPoint?.id === r.id ? 'bg-slate-50 ring-1 ring-emerald-500' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        r.violationType === 'model_compliant_store'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      <MapPin className="w-4 h-4" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{r.productName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">· {formattedDate}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            r.violationType === 'model_compliant_store'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {r.violationTypeAr}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-600 flex items-center gap-2">
                        <span className="font-semibold text-slate-800">{r.storeName}</span>
                        <span>·</span>
                        <span>
                          {r.commune} ({r.wilaya})
                        </span>
                        {r.addressDetails && <span>· {r.addressDetails}</span>}
                      </div>

                      {r.notes && (
                        <p className="text-[11px] text-slate-500 line-clamp-1 italic">
                          "{r.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions & Price */}
                  <div className="flex items-center gap-4 shrink-0 sm:text-left self-end sm:self-center">
                    <div>
                      <div className="font-mono text-base font-bold text-slate-900">
                        {r.observedPriceDzd} د.ج
                      </div>
                      {r.officialPriceDzd && (
                        <span className="text-[10px] text-slate-400 block font-mono">
                          السقف: {r.officialPriceDzd} د.ج
                        </span>
                      )}
                    </div>

                    <button
                      onClick={(e) => handleConfirm(r.id, e)}
                      disabled={confirmingId === r.id}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-emerald-600 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-[11px] font-medium transition-colors flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>تأكيد ({r.confirmationsCount})</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
