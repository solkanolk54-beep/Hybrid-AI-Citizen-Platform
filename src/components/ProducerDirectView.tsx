import React, { useState } from 'react';
import { ProducerOffer, WilayaData } from '../types/index.ts';
import { Sprout, Search, MapPin, Phone, ArrowDownRight, CheckCircle2, Plus, Store, Sparkles } from 'lucide-react';

interface ProducerDirectViewProps {
  offers: ProducerOffer[];
  wilayas: WilayaData[];
  selectedWilaya: string;
  setSelectedWilaya: (code: string) => void;
  onOpenOfferModal: () => void;
}

export const ProducerDirectView: React.FC<ProducerDirectViewProps> = ({
  offers,
  wilayas,
  selectedWilaya,
  setSelectedWilaya,
  onOpenOfferModal,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [revealedPhone, setRevealedPhone] = useState<Record<string, boolean>>({});

  const activeWilayas = wilayas && wilayas.length > 0 ? wilayas : [];
  const currentWilaya = activeWilayas.find((w) => w.code === selectedWilaya) || activeWilayas[0];

  const categories = [
    { id: 'all', label: 'جميع العروض الفلاحية' },
    { id: 'vegetables', label: 'خضروات طازجة' },
    { id: 'fruits', label: 'فواكه وبساتين' },
    { id: 'oil_dates', label: 'زيوت وتمور أصلية' },
    { id: 'honey_dairy', label: 'عسل وألبان ريفية' },
  ];

  const togglePhone = (id: string) => {
    setRevealedPhone((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredOffers = offers.filter((o) => {
    if (selectedCategory !== 'all' && o.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = o.productName.toLowerCase().includes(q);
      const matchProd = o.producerName.toLowerCase().includes(q);
      const matchWilaya = o.wilaya.toLowerCase().includes(q);
      const matchLoc = o.locationDetails.toLowerCase().includes(q);
      if (!matchName && !matchProd && !matchWilaya && !matchLoc) return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Editorial Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white mb-6 shadow-sm border border-emerald-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-800/80 rounded-lg text-emerald-200 text-xs font-semibold mb-3">
              <Sprout className="w-4 h-4 text-emerald-300" />
              <span>مبادرة من الحقل للمستهلك (Farm-to-Consumer)</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
              سوق المنتجين المحليين المباشر — بدون وسطاء وبسعر المزرعة
            </h2>

            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              تواصل مباشرة مع الفلاحين، أصحاب المعاصر، ومربي النحل في الجزائر واشترِ المنتجات الطازجة بأسعار الجملة، مع توفير يتراوح بين 25% و 45% مقارنة بمحلات التجزئة العادية.
            </p>
          </div>

          <div className="shrink-0 flex flex-col gap-2">
            <button
              onClick={onOpenOfferModal}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>تسجيل عرض فلاحي / منتج جديد</span>
            </button>
            <div className="text-[11px] text-emerald-200/80 text-center">
              مفتوح للفلاحين والتعاونيات الوطنية
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 mb-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-7 relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ابحث عن منتوج محلي، اسم فلاح، أو ولاية (مثال: طماطم، زيت زيتون، دقلة نور)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          <div className="md:col-span-5 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
            <select
              value={selectedWilaya}
              onChange={(e) => setSelectedWilaya(e.target.value)}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">جميع ولايات الوطن (كل العروض)</option>
              {activeWilayas.map((w) => (
                <option key={w.code} value={w.code}>
                  ولاية {w.nameAr}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-4 mt-4 border-t border-slate-100 scrollbar-none">
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
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-4 text-xs text-slate-500">
        <div>
          متوفر حالياً <span className="font-mono tabular-nums font-semibold text-slate-800">{filteredOffers.length}</span> عرض مباشر من الفلاحين والتعاونيات
        </div>
        <div className="text-emerald-700 font-medium flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>الشراء المباشر يدعم الإنتاج الوطني ويوفر حتى 45%</span>
        </div>
      </div>

      {/* Producer Cards Grid */}
      {filteredOffers.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-base font-semibold text-slate-800 mb-2">لا توجد عروض تطابق هذا التصنيف أو البحث</p>
          <p className="text-xs text-slate-500 mb-4">جرب اختيار ولاية أخرى أو عرض جميع العروض المباشرة.</p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
              setSelectedWilaya('all');
            }}
            className="px-4 py-2 bg-emerald-700 text-white text-xs font-medium rounded-lg"
          >
            عرض كافة العروض الفلاحية
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredOffers.map((offer) => {
            const isRevealed = Boolean(revealedPhone[offer.id]);
            const diffDzd = offer.retailMarketPrice - offer.priceDzd;

            return (
              <div
                key={offer.id}
                className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between hover:border-slate-300 transition-all shadow-xs"
              >
                <div>
                  {/* Card Header & Badges */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="text-xs text-slate-500 mb-1 flex items-center gap-1.5">
                        <span className="font-medium text-emerald-800">{offer.producerTypeAr}</span>
                        <span>·</span>
                        <span className="text-slate-600">{offer.wilaya}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 leading-snug">
                        {offer.productName}
                      </h3>
                    </div>

                    <span className="shrink-0 px-2 py-0.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded">
                      توفير {offer.savingPercent}%
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                    {offer.description}
                  </p>

                  {/* Producer & Freshness Strip */}
                  <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100 text-xs mb-4 space-y-1.5">
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="font-semibold">{offer.producerName}</span>
                      <span className="text-emerald-700 font-medium text-[11px]">{offer.freshnessTag}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{offer.locationDetails}</span>
                    </div>
                  </div>

                  {/* Price Comparison */}
                  <div className="bg-emerald-50/50 rounded-lg p-3 border border-emerald-100 mb-4">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-500 block mb-0.5">سعر المزرعة المباشر</span>
                        <span className="text-lg font-bold font-mono tabular-nums text-emerald-800">
                          {offer.priceDzd} د.ج
                        </span>
                        <span className="text-[10px] text-slate-500 block">/ {offer.unit}</span>
                      </div>

                      <div>
                        <span className="text-slate-500 block mb-0.5">سعر التجزئة العادي</span>
                        <span className="text-base font-bold font-mono tabular-nums text-slate-500 line-through">
                          {offer.retailMarketPrice} د.ج
                        </span>
                        <span className="text-emerald-700 text-[11px] font-semibold block mt-0.5">
                          وفر {diffDzd} د.ج
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-emerald-200/60 flex items-center justify-between text-[11px] text-slate-600">
                      <span>الكمية المتوفرة: <strong className="font-mono text-slate-800">{offer.availableQuantity}</strong> {offer.unit}</span>
                      {offer.minOrderQuantity && (
                        <span>أقل طلب: <strong className="font-mono">{offer.minOrderQuantity}</strong> {offer.unit}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Direct Contact Button */}
                <div className="pt-2 border-t border-slate-100">
                  {isRevealed ? (
                    <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-center animate-in fade-in duration-150">
                      <div className="text-xs text-slate-600 mb-1">رقم الاتصال المباشر بالفلاح:</div>
                      <a
                        href={`tel:${offer.contactPhone}`}
                        className="text-base font-bold font-mono tabular-nums text-emerald-800 hover:underline flex items-center justify-center gap-1.5"
                      >
                        <Phone className="w-4 h-4 text-emerald-600" />
                        <span>{offer.contactPhone}</span>
                      </a>
                    </div>
                  ) : (
                    <button
                      onClick={() => togglePhone(offer.id)}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-2xs"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>إظهار هاتف المنتج والتواصل المباشر</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
