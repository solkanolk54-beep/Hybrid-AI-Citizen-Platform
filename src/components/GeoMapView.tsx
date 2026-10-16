import React, { useState, useMemo } from 'react';
import {
  GeoReportPoint,
  HotspotCluster,
  GeoMapResponse,
  WilayaData,
  ViolationType,
  MarketAlert,
} from '../types/index.ts';
import {
  MapPin,
  ShieldAlert,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Filter,
  Plus,
  RefreshCw,
  Search,
  Eye,
  SlidersHorizontal,
  Navigation,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Crosshair,
  ExternalLink,
  ShieldCheck,
  Building2,
  Layers,
  Info,
} from 'lucide-react';

interface GeoMapViewProps {
  geoData: GeoMapResponse | null;
  wilayas: WilayaData[];
  selectedWilaya: string;
  setSelectedWilaya: (w: string) => void;
  onOpenReportModalWithCoords: (coords?: { lat: number; lng: number }) => void;
  onConfirmReport: (reportId: string) => Promise<void>;
  onRefreshData: () => Promise<void>;
}

// Algeria Geographic Bounds for GIS Projection (Focusing on northern populated consumer centers while projecting south)
const ALGERIA_BOUNDS = {
  minLat: 33.5, // Focusing northern half for crisp visibility of urban clusters
  maxLat: 37.6,
  minLng: -1.8,
  maxLng: 9.5,
};

export const GeoMapView: React.FC<GeoMapViewProps> = ({
  geoData,
  wilayas,
  selectedWilaya,
  setSelectedWilaya,
  onOpenReportModalWithCoords,
  onConfirmReport,
  onRefreshData,
}) => {
  const [selectedViolationType, setSelectedViolationType] = useState<string>('all');
  const [selectedCommodity, setSelectedCommodity] = useState<string>('all');
  const [onlyHotspots, setOnlyHotspots] = useState<boolean>(false);
  const [selectedPoint, setSelectedPoint] = useState<GeoReportPoint | null>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotCluster | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [mapZoom, setMapZoom] = useState<number>(1);
  const [isPinModeActive, setIsPinModeActive] = useState<boolean>(false);
  const [mapTheme, setMapTheme] = useState<'tactical_dark' | 'civic_light'>('tactical_dark');

  const reports = geoData?.reports || [];
  const hotspots = geoData?.hotspots || [];
  const summary = geoData?.summary || {
    totalReports: 0,
    blackSpotsCount: 0,
    dispatchedToEnforcementCount: 0,
    mostReportedCommodity: 'حليب أكياس 25 د.ج',
    mostCompliantWilaya: 'سطيف والبليدة',
  };

  // Filtered reports for map & list
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (selectedWilaya !== 'all' && r.wilayaCode !== selectedWilaya) return false;
      if (selectedViolationType !== 'all' && r.violationType !== selectedViolationType) return false;
      if (selectedCommodity !== 'all') {
        if (!r.productName.toLowerCase().includes(selectedCommodity.toLowerCase())) return false;
      }
      if (onlyHotspots) {
        const inHotspot = hotspots.some(
          (h) => h.wilayaCode === r.wilayaCode && h.commune === r.commune
        );
        if (!inHotspot) return false;
      }
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
  }, [reports, hotspots, selectedWilaya, selectedViolationType, selectedCommodity, onlyHotspots, searchQuery]);

  // Convert GPS Coordinates (lat/lng) to SVG canvas coordinates (0..800 x, 0..480 y)
  const projectCoords = (lat: number, lng: number) => {
    const svgWidth = 800;
    const svgHeight = 440;

    // Normalization with padding
    const clampedLat = Math.min(Math.max(lat, ALGERIA_BOUNDS.minLat), ALGERIA_BOUNDS.maxLat);
    const clampedLng = Math.min(Math.max(lng, ALGERIA_BOUNDS.minLng), ALGERIA_BOUNDS.maxLng);

    // Invert X because RTL / Longitude increases Eastward (Right in normal map, but right-to-left layout awareness)
    const x = ((clampedLng - ALGERIA_BOUNDS.minLng) / (ALGERIA_BOUNDS.maxLng - ALGERIA_BOUNDS.minLng)) * (svgWidth - 80) + 40;
    const y = ((ALGERIA_BOUNDS.maxLat - clampedLat) / (ALGERIA_BOUNDS.maxLat - ALGERIA_BOUNDS.minLat)) * (svgHeight - 80) + 40;

    return { x, y };
  };

  // Convert SVG click back to approximate Lat/Lng for pinpoint reporting
  const handleMapCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isPinModeActive) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const svgWidth = 800;
    const svgHeight = 440;

    const lng = ALGERIA_BOUNDS.minLng + ((clickX - 40) / (svgWidth - 80)) * (ALGERIA_BOUNDS.maxLng - ALGERIA_BOUNDS.minLng);
    const lat = ALGERIA_BOUNDS.maxLat - ((clickY - 40) / (svgHeight - 80)) * (ALGERIA_BOUNDS.maxLat - ALGERIA_BOUNDS.minLat);

    setIsPinModeActive(false);
    onOpenReportModalWithCoords({ lat: Number(lat.toFixed(4)), lng: Number(lng.toFixed(4)) });
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

  // Major Wilayas landmark coordinates on map for orientation
  const MAP_LANDMARKS = [
    { name: 'الجزائر العاصمة', code: '16', lat: 36.7538, lng: 3.0588 },
    { name: 'وهران', code: '31', lat: 35.6987, lng: -0.6349 },
    { name: 'قسنطينة', code: '25', lat: 36.365, lng: 6.6147 },
    { name: 'سطيف', code: '19', lat: 36.1911, lng: 5.4137 },
    { name: 'عنابة', code: '23', lat: 36.9, lng: 7.7667 },
    { name: 'البليدة', code: '09', lat: 36.4703, lng: 2.8277 },
    { name: 'تيزي وزو', code: '15', lat: 36.7118, lng: 4.0459 },
    { name: 'بسكرة', code: '07', lat: 34.85, lng: 5.7333 },
    { name: 'الشلف', code: '02', lat: 36.165, lng: 1.334 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Banner / Hero */}
      <div className="bg-gradient-to-l from-slate-900 via-slate-850 to-slate-900 text-white rounded-2xl p-5 lg:p-6 mb-6 shadow-md border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-[11px] font-bold font-mono tracking-wide flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                GIS LIVE MONITOR
              </span>
              <span className="text-slate-400 text-xs">نظام الرصد الجغرافي والرقابة الميدانية</span>
            </div>
            <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <span>خريطة التجاوزات وبوابة البلاغات الميدانية</span>
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              منظومة رصد مجتمعية فورية بالدينار الجزائري لتحديد بؤر المضاربة واحتكار المواد الأساسية (حليب 25 د.ج، زيت، سميد) وإحالتها تلقائياً لمصالح المراقبة وقمع الغش.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
              <span>تحديث البلاغات</span>
            </button>

            <button
              onClick={() => onOpenReportModalWithCoords()}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 hover:shadow-red-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>تسجيل بلاغ جغرافي ميداني</span>
            </button>
          </div>
        </div>

        {/* Analytical KPI Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-800/80">
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/60">
            <span className="text-[11px] text-slate-400 block mb-1">إجمالي البلاغات الميدانية</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold font-mono tabular-nums text-white">
                {summary.totalReports}
              </span>
              <span className="text-[10px] text-emerald-400 font-medium">رصد مجتمعي نشط</span>
            </div>
          </div>

          <div className="bg-red-950/30 rounded-xl p-3 border border-red-900/40">
            <span className="text-[11px] text-red-300 block mb-1 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-red-400" />
              <span>البؤر السوداء للمضاربة</span>
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold font-mono tabular-nums text-red-400">
                {summary.blackSpotsCount}
              </span>
              <span className="text-[10px] text-red-300">مناطق تحت التفتيش</span>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/60">
            <span className="text-[11px] text-slate-400 block mb-1">المحالة لمصالح قمع الغش</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold font-mono tabular-nums text-amber-400">
                {summary.dispatchedToEnforcementCount}
              </span>
              <span className="text-[10px] text-slate-400">تأكيدات رسمية</span>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/60">
            <span className="text-[11px] text-slate-400 block mb-1">المادة الأكثر تضرراً</span>
            <div className="flex items-baseline gap-2 truncate">
              <span className="text-sm font-bold text-emerald-300 truncate">
                {summary.mostReportedCommodity}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Control Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-5 shadow-2xs">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 text-xs">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالبلدية، السلعة، اسم المحل، أو الولاية..."
              className="w-full pl-3 pr-8 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white text-xs"
            />
          </div>

          {/* Wilaya Filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 whitespace-nowrap text-[11px]">الولاية:</span>
            <select
              value={selectedWilaya}
              onChange={(e) => setSelectedWilaya(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-800 font-medium text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
            >
              <option value="all">كل الولايات الجزائرية</option>
              {wilayas.map((w) => (
                <option key={w.code} value={w.code}>
                  {w.code} - {w.nameAr}
                </option>
              ))}
            </select>
          </div>

          {/* Violation Type Filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 whitespace-nowrap text-[11px]">المخالفة:</span>
            <select
              value={selectedViolationType}
              onChange={(e) => setSelectedViolationType(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-800 font-medium text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
            >
              <option value="all">كافة التصنيفات</option>
              <option value="price_gouging_ceiling">خرق السعر المسقف</option>
              <option value="conditional_selling">بيع مشروط</option>
              <option value="hoarding_speculation">احتكار وتخزين</option>
              <option value="no_price_display">عدم إشهار الأسعار</option>
              <option value="model_compliant_store">نقاط بيع نموذجية منضبطة</option>
            </select>
          </div>

          {/* Commodity quick filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 whitespace-nowrap text-[11px]">السلعة:</span>
            <select
              value={selectedCommodity}
              onChange={(e) => setSelectedCommodity(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-800 font-medium text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
            >
              <option value="all">كل السلع</option>
              <option value="حليب">حليب أكياس</option>
              <option value="زيت">زيت المائدة</option>
              <option value="سميد">سميد</option>
              <option value="سكر">سكر</option>
              <option value="بطاطا">بطاطا</option>
              <option value="دجاج">دجاج</option>
            </select>
          </div>

          {/* Hotspots Only Checkbox */}
          <label className="flex items-center gap-2 cursor-pointer bg-red-50 text-red-900 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap">
            <input
              type="checkbox"
              checked={onlyHotspots}
              onChange={(e) => setOnlyHotspots(e.target.checked)}
              className="w-3.5 h-3.5 text-red-600 rounded border-red-300 focus:ring-red-500"
            />
            <span>البؤر السوداء فقط</span>
          </label>
        </div>
      </div>

      {/* Main Grid: Interactive Map + Inspection Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Left Column: Interactive GIS Map Canvas (lg:col-span-8) */}
        <div className="lg:col-span-8 bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-lg flex flex-col">
          {/* Map Controls Top Bar */}
          <div className="bg-slate-950/80 px-4 py-3 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2.5">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-white">الخارطة الجغرافية التفاعلية للتراب الوطني</span>
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                ({filteredReports.length} نقطة رصد مطابقة)
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Map Theme Toggle */}
              <button
                onClick={() => setMapTheme(mapTheme === 'tactical_dark' ? 'civic_light' : 'tactical_dark')}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono"
              >
                {mapTheme === 'tactical_dark' ? 'عرض تكتيكي داكن' : 'عرض طبوغرافي نهاري'}
              </button>

              {/* Pinpoint Mode */}
              <button
                onClick={() => setIsPinModeActive(!isPinModeActive)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
                  isPinModeActive
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
                title="اضغط لتفعيل وضع النقر على الخريطة لتسجيل بلاغ بإحداثيات النقطة"
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span>{isPinModeActive ? 'انقر على الموقع بالخريطة' : 'تحديد موقع بالخريطة'}</span>
              </button>

              {/* Zoom Controls */}
              <div className="flex items-center bg-slate-800 rounded-lg p-0.5">
                <button
                  onClick={() => setMapZoom((z) => Math.min(z + 0.25, 2.0))}
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

          {/* Interactive SVG / Canvas Map Viewport */}
          <div
            className={`relative w-full aspect-[16/9] min-h-[380px] overflow-hidden select-none ${
              mapTheme === 'tactical_dark' ? 'bg-[#0b1320]' : 'bg-[#e2e8f0]'
            } ${isPinModeActive ? 'cursor-crosshair' : 'cursor-default'}`}
          >
            {/* Crosshair Banner when Pin Mode is Active */}
            {isPinModeActive && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-red-600 text-white px-3 py-1 rounded-full text-[11px] font-bold shadow-lg flex items-center gap-1.5 animate-bounce">
                <Crosshair className="w-3.5 h-3.5" />
                <span>انقر في أي مكان على الخريطة لتسجيل بلاغ بهذا الموقع الجغرافي</span>
              </div>
            )}

            <svg
              viewBox="0 0 800 440"
              className="w-full h-full transition-transform duration-300 origin-center"
              style={{ transform: `scale(${mapZoom})` }}
              onClick={handleMapCanvasClick}
            >
              <defs>
                {/* Tactical Grid Pattern */}
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke={mapTheme === 'tactical_dark' ? '#1e293b' : '#cbd5e1'}
                    strokeWidth="0.5"
                    strokeDasharray="2,2"
                  />
                </pattern>

                {/* Radar Pulse Animation Gradient for Black Spots */}
                <radialGradient id="hotspotPulse">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                  <stop offset="70%" stopColor="#ef4444" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Grid Background */}
              <rect width="800" height="440" fill="url(#grid)" />

              {/* Stylized Mediterranean Coastline (North Algeria) */}
              <path
                d="M 30,70 Q 150,50 280,65 T 520,60 T 770,75 L 770,440 L 30,440 Z"
                fill={mapTheme === 'tactical_dark' ? '#0f172a' : '#f1f5f9'}
                stroke={mapTheme === 'tactical_dark' ? '#334155' : '#94a3b8'}
                strokeWidth="1.5"
              />

              {/* Mediterranean Sea Indicator */}
              <text
                x="400"
                y="35"
                textAnchor="middle"
                fill={mapTheme === 'tactical_dark' ? '#38bdf8' : '#0284c7'}
                fontSize="11"
                letterSpacing="2"
                fontWeight="bold"
                opacity="0.6"
              >
                البحر الأبيض المتوسط · MER MÉDITERRANÉE
              </text>

              {/* Major Wilaya Boundaries & Landmark Dots */}
              {MAP_LANDMARKS.map((lm) => {
                const { x, y } = projectCoords(lm.lat, lm.lng);
                const isSelected = selectedWilaya === lm.code;

                return (
                  <g
                    key={lm.code}
                    className="cursor-pointer group"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedWilaya(lm.code);
                    }}
                  >
                    <circle
                      cx={x}
                      cy={y}
                      r={isSelected ? 6 : 3.5}
                      fill={isSelected ? '#10b981' : mapTheme === 'tactical_dark' ? '#64748b' : '#94a3b8'}
                      stroke={mapTheme === 'tactical_dark' ? '#0f172a' : '#ffffff'}
                      strokeWidth="1.5"
                    />
                    <text
                      x={x}
                      y={y - 8}
                      textAnchor="middle"
                      fill={isSelected ? '#34d399' : mapTheme === 'tactical_dark' ? '#94a3b8' : '#475569'}
                      fontSize="9"
                      fontWeight={isSelected ? 'bold' : 'normal'}
                      className="pointer-events-none select-none transition-all group-hover:fill-emerald-400 group-hover:font-bold"
                    >
                      {lm.name}
                    </text>
                  </g>
                );
              })}

              {/* Hotspot Radar Waves (Clusters with multiple violations) */}
              {hotspots.map((hs) => {
                const { x, y } = projectCoords(hs.lat, hs.lng);
                const isBlackSpot = hs.hotspotRiskLevel === 'high_black_spot';
                const isCurrentHotspot = selectedHotspot?.commune === hs.commune;

                return (
                  <g
                    key={`hs-${hs.wilayaCode}-${hs.commune}`}
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedHotspot(hs);
                    }}
                  >
                    {/* Animated Pulsating Wave */}
                    <circle cx={x} cy={y} r="26" fill="url(#hotspotPulse)" className="animate-ping opacity-60 origin-center" />
                    <circle
                      cx={x}
                      cy={y}
                      r="16"
                      fill={isBlackSpot ? '#ef4444' : '#f59e0b'}
                      fillOpacity="0.25"
                      stroke={isBlackSpot ? '#ef4444' : '#f59e0b'}
                      strokeWidth="1.5"
                      strokeDasharray={isBlackSpot ? 'none' : '3,2'}
                    />

                    {/* Hotspot Tag */}
                    <rect
                      x={x - 28}
                      y={y + 12}
                      width="56"
                      height="15"
                      rx="4"
                      fill="#991b1b"
                      stroke="#f87171"
                      strokeWidth="0.8"
                    />
                    <text
                      x={x}
                      y={y + 23}
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

              {/* Individual Violation & Compliant Point Pins */}
              {filteredReports.map((report) => {
                const { x, y } = projectCoords(report.lat, report.lng);
                const isSelected = selectedPoint?.id === report.id;

                // Color coding according to violation severity
                let pinColor = '#ef4444'; // Red = price ceiling
                if (report.violationType === 'conditional_selling') pinColor = '#f59e0b'; // Amber
                else if (report.violationType === 'hoarding_speculation') pinColor = '#a855f7'; // Purple
                else if (report.violationType === 'no_price_display') pinColor = '#ea580c'; // Orange
                else if (report.violationType === 'model_compliant_store') pinColor = '#10b981'; // Green

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
                      <circle
                        cx={x}
                        cy={y}
                        r="14"
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="2"
                        className="animate-pulse"
                      />
                    )}

                    {/* Pin Shape */}
                    <path
                      d={`M ${x} ${y} L ${x - 5} ${y - 12} A 5 5 0 1 1 ${x + 5} ${y - 12} Z`}
                      fill={pinColor}
                      stroke="#ffffff"
                      strokeWidth="1"
                    />

                    {/* Inner Pin Dot */}
                    <circle cx={x} cy={y - 12} r="2" fill="#ffffff" />
                  </g>
                );
              })}
            </svg>

            {/* Map Legend (Bottom Right Overlay) */}
            <div className="absolute bottom-3 right-3 bg-slate-950/85 backdrop-blur-xs p-2.5 rounded-xl border border-slate-800 text-[10px] text-slate-300 space-y-1 z-10 shadow-lg">
              <span className="font-bold text-white block text-[11px] mb-1">دليل الرموز الرقابية:</span>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                <span>خرق السعر المسقف (حليب 25 / زيت 650)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                <span>بيع مشروط غير قانوني (فرض سلع)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" />
                <span>احتكار وتخزين غير مصرح (مضاربة)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <span>نقطة بيع نموذجية منضبطة</span>
              </div>
              <div className="flex items-center gap-1.5 pt-1 border-t border-slate-800">
                <span className="w-3.5 h-3.5 rounded-full border border-red-500 bg-red-500/30 shrink-0" />
                <span className="text-red-400 font-semibold">بؤرة سوداء نشطة (تكرار المخالفات)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Active Inspection / Detail Sidebar (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Active Selection Detail Card */}
          {selectedPoint ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3.5 animate-in fade-in duration-200">
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">تفاصيل النقطة الميدانية</span>
                  <h3 className="font-bold text-slate-900 text-sm">{selectedPoint.productName}</h3>
                </div>
                <button
                  onClick={() => setSelectedPoint(null)}
                  className="text-slate-400 hover:text-slate-600 text-xs px-1.5 py-0.5 rounded bg-slate-100"
                >
                  إغلاق
                </button>
              </div>

              {/* Status and Severity Badges */}
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

                {selectedPoint.anonymous && (
                  <span className="px-2 py-0.5 rounded-md bg-slate-50 text-slate-500 text-[10px]">
                    مبلّغ مجهول
                  </span>
                )}
              </div>

              {/* Price comparison box */}
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

              {/* Location and Store Info */}
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
                {selectedPoint.addressDetails && (
                  <div className="text-slate-500 text-[11px] pr-5">
                    {selectedPoint.addressDetails}
                  </div>
                )}
              </div>

              {/* Evidence photo if present */}
              {selectedPoint.evidencePhotoUrl && (
                <div className="rounded-xl overflow-hidden border border-slate-200 h-28 bg-slate-100">
                  <img
                    src={selectedPoint.evidencePhotoUrl}
                    alt="صورة توثيق المخالفة"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Notes */}
              {selectedPoint.notes && (
                <p className="p-2.5 bg-slate-50 rounded-lg text-slate-600 text-[11px] leading-relaxed border border-slate-100">
                  "{selectedPoint.notes}"
                </p>
              )}

              {/* Citizen confirmation button */}
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
                  className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs transition-colors shadow-2xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>أنا أؤكد هذا البلاغ (+1)</span>
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
                  className="text-red-700 hover:text-red-900 text-xs px-1.5 py-0.5 rounded bg-red-100"
                >
                  إغلاق
                </button>
              </div>

              <div className="space-y-2 text-xs text-red-950">
                <p className="leading-relaxed">
                  تم رصد تكرار البلاغات وتضخيم الأسعار في هذه البلدية بواقع{' '}
                  <span className="font-bold font-mono">{selectedHotspot.totalViolations} مخالفات</span>،
                  منها {selectedHotspot.criticalCeilingViolations} خرق صريح للسعر المقنن.
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
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">مستوى الخطورة:</span>
                    <span className="font-bold text-red-700">بؤرة سوداء عالية الخطورة</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => onOpenReportModalWithCoords({ lat: selectedHotspot.lat, lng: selectedHotspot.lng })}
                    className="w-full py-2 bg-red-700 hover:bg-red-800 text-white font-semibold rounded-lg text-xs transition-colors shadow-2xs"
                  >
                    تسجيل بلاغ إضافي في هذه البؤرة
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Default Explanatory Panel */
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3.5">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>كيف يعمل نظام الرصد الميداني GIS؟</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                اضغط على أي نقطة أو بؤرة حمراء على الخريطة لعرض تفاصيل التجاوز، صورة المخالفة الميدانية، واسم المحل.
              </p>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <span className="font-bold text-slate-900 block">رصد وتوثيق المخالفة</span>
                    <span className="text-[11px] text-slate-500">
                      يسجل المواطن التجاوز بنقرة زر مع إحداثيات GPS ونوع السلعة وسعرها.
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <span className="font-bold text-slate-900 block">التأكيد المجتمعي</span>
                    <span className="text-[11px] text-slate-500">
                      يؤكد مواطنو الحي البلاغ لرفع موثوقيته وتجنب أي بلاغات كيدية.
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    <span className="font-bold text-slate-900 block">إحالة فورية للرقابة</span>
                    <span className="text-[11px] text-slate-500">
                      توجيه الإشعار لمفتشي التجارة وقمع الغش للنزول الميداني وتحرير المخالفات.
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onOpenReportModalWithCoords()}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إرسال رصد أو بلاغ جديد</span>
                </button>
              </div>
            </div>
          )}

          {/* Active Hotspots Mini-List */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-red-600" />
                <span>قائمة البؤر السوداء المرصودة ({hotspots.length})</span>
              </span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
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
                        {hs.wilayaName} · {hs.topViolatedCommodity}
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
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              سجل البلاغات الميدانية الحية وتحديثات الأسواق
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
