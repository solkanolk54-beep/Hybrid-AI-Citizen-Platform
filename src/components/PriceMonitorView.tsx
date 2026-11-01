import React, { useState } from 'react';
import { ProductItem, WilayaData, DEFAULT_WILAYAS } from '../types/index.ts';
import {
  Search,
  ShieldAlert,
  CheckCircle,
  ArrowDownRight,
  Plus,
  MapPin,
  ChevronDown,
  ChevronUp,
  Truck,
  Sparkles,
  Clock,
  Store,
  MessageSquareText,
} from 'lucide-react';

export const MAGRO_MERCURIALE_PRODUCE = [
  {
    id: 'magro-potato',
    name: 'بطاطا استهلاك حقلية (حمراء / بيضاء)',
    wholesalePrice: '45 - 50',
    wholesalePriceAvg: 48,
    retailPrice: 85,
    savingDzd: 37,
    savingPercent: 43,
    unit: 'كغ',
    crateDetails: 'كيس شبكي 10 كغ (480 د.ج)',
    origin: 'حقول واد سوف وميلة',
    type: 'vegetable' as const,
  },
  {
    id: 'magro-tomato',
    name: 'طماطم طازجة مستديرة صلبة',
    wholesalePrice: '55 - 65',
    wholesalePriceAvg: 60,
    retailPrice: 110,
    savingDzd: 50,
    savingPercent: 45,
    unit: 'كغ',
    crateDetails: 'صندوق 10 كغ (600 د.ج)',
    origin: 'بيوت بسكرة البلاستيكية',
    type: 'vegetable' as const,
  },
  {
    id: 'magro-onion',
    name: 'بصل جاف أحمر وأبيض',
    wholesalePrice: '35 - 38',
    wholesalePriceAvg: 36,
    retailPrice: 65,
    savingDzd: 29,
    savingPercent: 44,
    unit: 'كغ',
    crateDetails: 'كيس شبكي 5 كغ (180 د.ج)',
    origin: 'شلغوم العيد وميلة',
    type: 'vegetable' as const,
  },
  {
    id: 'magro-apple',
    name: 'تفاح ميلة والأوراس الذهبي والأحمر',
    wholesalePrice: '160 - 185',
    wholesalePriceAvg: 170,
    retailPrice: 280,
    savingDzd: 110,
    savingPercent: 39,
    unit: 'كغ',
    crateDetails: 'صندوق كرتوني 8 كغ (1360 د.ج)',
    origin: 'بساتين جبل زواغي وباتنة',
    type: 'fruit' as const,
  },
  {
    id: 'magro-orange',
    name: 'برتقال طومسون مائدة جزائري',
    wholesalePrice: '100 - 115',
    wholesalePriceAvg: 108,
    retailPrice: 170,
    savingDzd: 62,
    savingPercent: 36,
    unit: 'كغ',
    crateDetails: 'قفص بلاستيكي 8 كغ (860 د.ج)',
    origin: 'سهول ميلة والشلف',
    type: 'fruit' as const,
  },
  {
    id: 'magro-mandarin',
    name: 'مندرين كليمونتين بدون بذور',
    wholesalePrice: '120 - 135',
    wholesalePriceAvg: 125,
    retailPrice: 190,
    savingDzd: 65,
    savingPercent: 34,
    unit: 'كغ',
    crateDetails: 'صندوق 7 كغ (875 د.ج)',
    origin: 'مزارع متيجة وميلة',
    type: 'fruit' as const,
  },
  {
    id: 'magro-pepper',
    name: 'فلفل أخضر حلو وحار',
    wholesalePrice: '75 - 85',
    wholesalePriceAvg: 80,
    retailPrice: 140,
    savingDzd: 60,
    savingPercent: 42,
    unit: 'كغ',
    crateDetails: 'صندوق 6 كغ (480 د.ج)',
    origin: 'إنتاج حقلي ميلة وبسكرة',
    type: 'vegetable' as const,
  },
  {
    id: 'magro-carrot',
    name: 'جزر وادي النجاء مغسول ومنقى',
    wholesalePrice: '40 - 45',
    wholesalePriceAvg: 42,
    retailPrice: 80,
    savingDzd: 38,
    savingPercent: 47,
    unit: 'كغ',
    crateDetails: 'كيس 5 كغ (210 د.ج)',
    origin: 'سهل وادي النجاء بميلة',
    type: 'vegetable' as const,
  },
  {
    id: 'magro-zucchini',
    name: 'كوسة / قرعة خضراء طازجة',
    wholesalePrice: '60 - 70',
    wholesalePriceAvg: 65,
    retailPrice: 120,
    savingDzd: 55,
    savingPercent: 45,
    unit: 'كغ',
    crateDetails: 'صندوق 6 كغ (390 د.ج)',
    origin: 'مزارع القرارم قوقة وميلة',
    type: 'vegetable' as const,
  },
  {
    id: 'magro-dates',
    name: 'تمور دقلة نور معتمدة فاخرة',
    wholesalePrice: '370 - 400',
    wholesalePriceAvg: 385,
    retailPrice: 650,
    savingDzd: 265,
    savingPercent: 40,
    unit: 'كغ',
    crateDetails: 'كرتونة 5 كغ (1925 د.ج)',
    origin: 'واحات بسكرة وطولقة المسوقة بماغرو',
    type: 'fruit' as const,
  },
];

interface PriceMonitorViewProps {
  products: ProductItem[];
  wilayas: WilayaData[];
  selectedWilaya: string;
  setSelectedWilaya: (code: string) => void;
  onAddToBasket: (product: ProductItem) => void;
  onOpenAdvisorWithQuery?: (query: string) => void;
}

export const PriceMonitorView: React.FC<PriceMonitorViewProps> = ({
  products,
  wilayas,
  selectedWilaya,
  setSelectedWilaya,
  onAddToBasket,
  onOpenAdvisorWithQuery,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [ceilingOnly, setCeilingOnly] = useState<boolean>(false);
  const [showMagroProduce, setShowMagroProduce] = useState<boolean>(false);
  const [magroProduceFilter, setMagroProduceFilter] = useState<'all' | 'vegetable' | 'fruit'>('all');
  const [expandedAlternatives, setExpandedAlternatives] = useState<Record<string, boolean>>({});

  const activeWilayas = wilayas && wilayas.length > 0 ? wilayas : DEFAULT_WILAYAS;
  const currentWilaya = activeWilayas.find((w) => w.code === selectedWilaya) || activeWilayas[0];

  const categories = [
    { id: 'all', label: 'جميع السلع' },
    { id: 'vegetables', label: 'الخضر والفواكه' },
    { id: 'oils_sugar', label: 'الزيوت والسكريات' },
    { id: 'dairy', label: 'الحليب ومشتقاته' },
    { id: 'cereals', label: 'الحبوب والسميد' },
    { id: 'meats_poultry', label: 'اللحوم والدواجن' },
    { id: 'legumes', label: 'البقوليات الجافة' },
    { id: 'cleaning', label: 'مواد التنظيف' },
  ];

  const toggleAlternatives = (id: string) => {
    setExpandedAlternatives((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleAddMagroToBasket = (item: (typeof MAGRO_MERCURIALE_PRODUCE)[0]) => {
    const productItem: ProductItem = {
      id: item.id,
      name: `${item.name} (سوق ماڨرو وادي العثمانية)`,
      category: 'vegetables',
      categoryAr: item.type === 'fruit' ? 'فواكه موسمية' : 'خضروات حقلية',
      unit: item.unit,
      priceCeiling: null,
      averageRetailPrice: item.retailPrice,
      rahmaMarketPrice: item.wholesalePriceAvg,
      isSubsidized: false,
      origin: 'local_dz',
      brandName: 'سوق الجملة ماغرو ميلة',
      description: `شراء بالجملة ونصف الجملة من سوق ماغرو وادي العثمانية (${item.crateDetails}). المصدر: ${item.origin}.`,
      alternatives: [],
      wilayaPrices: { '43': item.wholesalePriceAvg },
      trend: 'decreasing',
      availability: 'high',
      nutritionOrUsageTag: 'خضر وفواكه طازجة بالجملة',
    };
    onAddToBasket(productItem);
  };

  const isMagroRelevant =
    showMagroProduce ||
    selectedWilaya === '43' ||
    selectedCategory === 'vegetables' ||
    searchQuery.includes('ماقرو') ||
    searchQuery.includes('ماغرو') ||
    searchQuery.includes('ماڨرو') ||
    searchQuery.includes('عثمانية') ||
    searchQuery.includes('ميلة') ||
    searchQuery.includes('خضر') ||
    searchQuery.includes('فواكه');

  const filteredMagroProduce = MAGRO_MERCURIALE_PRODUCE.filter((item) => {
    if (magroProduceFilter !== 'all' && item.type !== magroProduceFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.origin.toLowerCase().includes(q) ||
        item.crateDetails.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (ceilingOnly && p.priceCeiling === null) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchBrand = p.brandName && p.brandName.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      const matchCat = p.categoryAr.toLowerCase().includes(q);
      if (!matchName && !matchBrand && !matchDesc && !matchCat) return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Search and Filter Control Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 mb-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ابحث عن سلعة، خضر وفواكه، أو سوق ماڨرو (مثال: بطاطا، طماطم، تفاح، زيت)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
          </div>

          {/* Wilaya Selector with 69 Wilayas Info */}
          <div className="md:col-span-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="w-full">
                <select
                  value={selectedWilaya}
                  onChange={(e) => setSelectedWilaya(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {activeWilayas.map((w) => (
                    <option key={w.code} value={w.code}>
                      {w.code} - ولاية {w.nameAr} ({w.nameFr}) · {w.activeRahmaMarkets} منافذ
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Regulated Ceiling Toggle */}
          <div className="md:col-span-3 flex items-center justify-start md:justify-end">
            <label className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={ceilingOnly}
                onChange={(e) => setCeilingOnly(e.target.checked)}
                className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
              />
              <span className="flex items-center gap-1">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>السلع المسقفة قانوناً فقط</span>
              </span>
            </label>
          </div>
        </div>

        {/* Selected Wilaya Local Markets Strip */}
        {currentWilaya && (
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-700">أسواق الرحمة والجملة الموصى بها في {currentWilaya.nameAr}:</span>
              <span>{currentWilaya.popularMarkets.join(' · ')}</span>
            </div>
            <div className="text-emerald-700 font-medium">
              مؤشر أسعار الولاية: <span className="font-mono tabular-nums">{currentWilaya.priceIndex}x</span> من المعدل الوطني
            </div>
          </div>
        )}
      </div>

      {/* Category Tabs & Magro Quick Access Button */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setSelectedCategory(cat.id);
              if (cat.id !== 'vegetables') {
                setShowMagroProduce(false);
              }
            }}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors shrink-0 ${
              selectedCategory === cat.id
                ? 'bg-emerald-700 text-white shadow-sm font-semibold'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            {cat.label}
          </button>
        ))}

        {/* Dedicated Magro Oued Athmania 43 Produce Hub Button */}
        <button
          onClick={() => {
            setShowMagroProduce(!showMagroProduce);
            if (!showMagroProduce) {
              setSelectedCategory('vegetables');
            }
          }}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all shrink-0 flex items-center gap-1.5 cursor-pointer shadow-2xs ${
            showMagroProduce || selectedWilaya === '43'
              ? 'bg-amber-600 text-white ring-2 ring-amber-400/40'
              : 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100'
          }`}
          title="رصد حي لأسعار الخضر والفواكه بسوق الجملة ماڨرو وادي العثمانية (ولاية ميلة 43)"
        >
          <Truck className="w-3.5 h-3.5 text-amber-700" />
          <span>سوق ماڨرو وادي العثمانية (ميلة 43)</span>
          <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded font-mono font-bold">
            بورصة الخضر والفواكه
          </span>
        </button>
      </div>

      {/* Dedicated MAGRO Oued Athmania Produce Mercuriale Section */}
      {isMagroRelevant && (
        <div className="mb-8 bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-emerald-700/40 relative overflow-hidden animate-in fade-in duration-200">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5 pb-4 border-b border-emerald-700/30">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px] font-bold font-mono tracking-wide flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  MAGRO OUED ATHMANIA · WILAYA DE MILA (43)
                </span>
                <span className="text-slate-300 text-xs">سوق الجملة الجهوي للخضر والفواكه (الشركة الوطنية ماغرو)</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>رصد حي لأسعار الخضر والفواكه — سوق ماڨرو وادي العثمانية (ولاية ميلة 43)</span>
              </h2>
              <p className="text-xs text-emerald-100/80 max-w-2xl leading-relaxed">
                متابعة يومية ومباشرة لأسعار الجملة بمربعات الفلاحين والوكلاء مقابل أسعار التجزئة بالمحلات، مع إمكانية إضافة الصناديق والأقفاص للقفة واحتساب التوفير المباشر.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap shrink-0">
              {/* Filter Fruit vs Vegetable */}
              <div className="bg-slate-800/90 rounded-lg p-0.5 border border-slate-700 flex text-xs">
                <button
                  onClick={() => setMagroProduceFilter('all')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    magroProduceFilter === 'all' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  الكل (10)
                </button>
                <button
                  onClick={() => setMagroProduceFilter('vegetable')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    magroProduceFilter === 'vegetable' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  الخضر (6)
                </button>
                <button
                  onClick={() => setMagroProduceFilter('fruit')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    magroProduceFilter === 'fruit' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  الفواكه والتمور (4)
                </button>
              </div>

              {onOpenAdvisorWithQuery && (
                <button
                  onClick={() =>
                    onOpenAdvisorWithQuery(
                      'ما هي أسعار الخضر والفواكه اليوم بسوق ماڨرو وادي العثمانية ولاية ميلة وكيف أوفر بالشراء بنصف الجملة؟'
                    )
                  }
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <MessageSquareText className="w-3.5 h-3.5" />
                  <span>استشارة المستشار</span>
                </button>
              )}
            </div>
          </div>

          {/* Real-time Mercuriale Produce Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
            {filteredMagroProduce.map((item) => (
              <div
                key={item.id}
                className="bg-slate-800/80 hover:bg-slate-800 transition-colors rounded-xl p-3 border border-emerald-500/20 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-1 text-xs mb-1.5">
                    <span className="font-bold text-white text-xs leading-snug">{item.name}</span>
                    <span className="text-[10px] text-emerald-300 font-mono bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-700/40 shrink-0">
                      {item.origin}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between text-xs text-slate-300 mb-1">
                    <span>جملة ماغرو:</span>
                    <span className="font-mono font-black text-emerald-400 text-sm">
                      {item.wholesalePrice} د.ج <span className="text-[10px] text-slate-400">/{item.unit}</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                    <span>التجزئة العادية:</span>
                    <span className="font-mono text-slate-300 line-through">
                      {item.retailPrice} د.ج
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono bg-slate-900/60 p-1 rounded border border-slate-700/50 mb-2">
                    {item.crateDetails}
                  </div>
                </div>

                <div>
                  <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px] mb-2">
                    <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                      <ArrowDownRight className="w-3 h-3 text-emerald-400" />
                      توفير {item.savingDzd} د.ج ({item.savingPercent}%)
                    </span>
                  </div>

                  <button
                    onClick={() => handleAddMagroToBasket(item)}
                    className="w-full flex items-center justify-center gap-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة للقفة بالجملة</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Operational & Logistics Facts */}
          <div className="pt-3 border-t border-emerald-700/30 flex flex-wrap items-center justify-between gap-3 text-xs text-emerald-100/70">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                الموقع: بلدية وادي العثمانية (ولاية ميلة) — محول الطريق السيار شرق-غرب
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ذروة التفريغ والنشاط: 04:30 فجراً — 11:30 صباحاً
              </span>
            </div>
            <span className="text-amber-300 font-medium">
              💡 متاح الشراء بنصف الجملة (صناديق وأقفاص عائلية وتشاركية)
            </span>
          </div>
        </div>
      )}

      {/* Results Count & Quick Help */}
      <div className="flex items-center justify-between mb-4 text-xs text-slate-500">
        <div>
          تم العثور على <span className="font-mono tabular-nums font-semibold text-slate-800">{filteredProducts.length}</span> سلعة في {currentWilaya.nameAr}
        </div>
        <div className="text-slate-400 hidden sm:block">
          جميع الأسعار محينة ومسجلة بالدينار الجزائري (د.ج)
        </div>
      </div>

      {/* Product Cards Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-base font-semibold text-slate-800 mb-2">لا توجد سلع تطابق معايير البحث الحالية</p>
          <p className="text-xs text-slate-500 mb-4">جرب تغيير التصنيف أو مسح نص البحث للوصول لجميع المنتجات والأسعار.</p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
              setCeilingOnly(false);
            }}
            className="px-4 py-2 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-500 transition-colors"
          >
            إعادة تعيين المرشحات
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map((product) => {
            const hasCeiling = product.priceCeiling !== null;
            const diffDzd = product.averageRetailPrice - product.rahmaMarketPrice;
            const isExpanded = Boolean(expandedAlternatives[product.id]);

            return (
              <div
                key={product.id}
                className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between hover:border-slate-300 transition-all shadow-xs"
              >
                <div>
                  {/* Card Header & Badges */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="text-xs text-slate-500 mb-1 flex items-center gap-1.5">
                        <span>{product.categoryAr}</span>
                        <span>·</span>
                        <span>{product.unit}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 leading-snug">
                        {product.name}
                      </h3>
                    </div>

                    {hasCeiling ? (
                      <span className="shrink-0 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded">
                        سعر مسقف
                      </span>
                    ) : (
                      <span className="shrink-0 text-[11px] text-slate-500">
                        سعر حر
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                    {product.description}
                  </p>

                  {/* Brand & Tag Info */}
                  <div className="text-[11px] text-slate-500 mb-4 flex items-center justify-between">
                    <span>العلامة: {product.brandName || 'إنتاج وطني'}</span>
                    <span className="text-emerald-700 font-medium">{product.nutritionOrUsageTag}</span>
                  </div>

                  {/* Price Comparison Matrix */}
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 mb-4">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-500 block mb-0.5">التجزئة المعتادة</span>
                        <span className="text-base font-bold text-slate-800 font-mono tabular-nums">
                          {product.averageRetailPrice} د.ج
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-500 block mb-0.5">سوق الرحمة / التعاونية</span>
                        <span className="text-base font-bold text-emerald-700 font-mono tabular-nums">
                          {product.rahmaMarketPrice} د.ج
                        </span>
                      </div>
                    </div>

                    {diffDzd > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                        <span className="text-slate-600">التوفير المباشر في المنفذ:</span>
                        <span className="text-emerald-700 font-semibold font-mono tabular-nums flex items-center gap-0.5">
                          <ArrowDownRight className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{diffDzd} د.ج / {product.unit}</span>
                        </span>
                      </div>
                    )}

                    {hasCeiling && (
                      <div className="mt-1 text-[11px] text-amber-700 flex items-center gap-1 font-medium">
                        <CheckCircle className="w-3 h-3 text-amber-600 shrink-0" />
                        <span>السقف القانوني الأقصى: {product.priceCeiling} د.ج</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  {/* Expand Alternatives Button */}
                  {product.alternatives.length > 0 && (
                    <div className="mb-3">
                      <button
                        onClick={() => toggleAlternatives(product.id)}
                        className="w-full flex items-center justify-between py-1.5 px-2.5 text-xs font-semibold text-emerald-800 bg-emerald-50/70 hover:bg-emerald-100/70 rounded-md transition-colors"
                      >
                        <span>{product.alternatives.length} بدائل اقتصادية ومحلية متوفرة</span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-emerald-700" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-emerald-700" />
                        )}
                      </button>

                      {/* Alternatives List Drawer */}
                      {isExpanded && (
                        <div className="mt-2 space-y-2 border-t border-slate-100 pt-2">
                          {product.alternatives.map((alt) => (
                            <div
                              key={alt.id}
                              className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs hover:border-emerald-300 transition-colors"
                            >
                              <div className="flex items-center justify-between font-semibold text-slate-800 mb-1">
                                <span>{alt.name}</span>
                                <span className="font-mono tabular-nums text-emerald-700">
                                  {alt.price} د.ج
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 leading-relaxed mb-1">
                                {alt.reason}
                              </p>
                              {alt.savingDzd > 0 && (
                                <div className="text-[11px] font-medium text-emerald-700">
                                  توفير مقدر: <span className="font-mono tabular-nums">{alt.savingDzd} د.ج</span> ({alt.savingPercent}%)
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions Row */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => onAddToBasket(product)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة للقفة</span>
                    </button>

                    {onOpenAdvisorWithQuery && (
                      <button
                        onClick={() => onOpenAdvisorWithQuery(`ما هو رأيك في شراء ${product.name} في ولاية ${currentWilaya.nameAr}؟ وما هي أفضل بدائلها؟`)}
                        className="py-2 px-3 text-slate-700 bg-slate-100 hover:bg-slate-200 text-xs font-medium rounded-lg transition-colors whitespace-nowrap"
                        title="استشر الذكاء الاصطناعي حول هذه السلعة"
                      >
                        استشارة حولها
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
