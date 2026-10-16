import React, { useState } from 'react';
import { ProductItem, WilayaData, DEFAULT_WILAYAS } from '../types/index.ts';
import { Search, ShieldAlert, CheckCircle, ArrowDownRight, Plus, MapPin, ChevronDown, ChevronUp } from 'lucide-react';

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
  const [expandedAlternatives, setExpandedAlternatives] = useState<Record<string, boolean>>({});

  const activeWilayas = wilayas && wilayas.length > 0 ? wilayas : DEFAULT_WILAYAS;
  const currentWilaya = activeWilayas.find((w) => w.code === selectedWilaya) || activeWilayas[0];

  const categories = [
    { id: 'all', label: 'جميع السلع' },
    { id: 'oils_sugar', label: 'الزيوت والسكريات' },
    { id: 'dairy', label: 'الحليب ومشتقاته' },
    { id: 'cereals', label: 'الحبوب والسميد' },
    { id: 'vegetables', label: 'الخضر والفواكه' },
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
              placeholder="ابحث عن سلعة، علامة، أو مادة تموينية (مثال: زيت، سميد، دجاج، بطاطا)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
          </div>

          {/* Wilaya Selector with Market Info */}
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
                      ولاية {w.nameAr} ({w.code}) · {w.activeRahmaMarkets} منافذ تضامنية
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
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">أسواق الرحمة والجملة الموصى بها في {currentWilaya.nameAr}:</span>
              <span>{currentWilaya.popularMarkets.join(' · ')}</span>
            </div>
            <div className="text-emerald-700 font-medium">
              مؤشر أسعار الولاية: <span className="font-mono tabular-nums">{currentWilaya.priceIndex}x</span> من المعدل الوطني
            </div>
          </div>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-6 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors shrink-0 ${
              selectedCategory === cat.id
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

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
