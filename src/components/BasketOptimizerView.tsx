import React, { useState, useEffect } from 'react';
import { WilayaData, BasketOptimizationResult, BasketItem, DEFAULT_WILAYAS } from '../types/index.ts';
import { Calculator, TrendingDown, Store, AlertCircle, Sparkles, Check, Trash2 } from 'lucide-react';

interface BasketOptimizerViewProps {
  wilayas: WilayaData[];
  selectedWilaya: string;
  setSelectedWilaya: (code: string) => void;
  customBasket: BasketItem[];
  onRemoveFromBasket: (productId: string) => void;
  onClearBasket: () => void;
}

export const BasketOptimizerView: React.FC<BasketOptimizerViewProps> = ({
  wilayas,
  selectedWilaya,
  setSelectedWilaya,
  customBasket,
  onRemoveFromBasket,
  onClearBasket,
}) => {
  const [budget, setBudget] = useState<number>(5000);
  const [familySize, setFamilySize] = useState<number>(4);
  const [durationDays, setDurationDays] = useState<number>(7);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<BasketOptimizationResult | null>(null);

  const activeWilayas = wilayas && wilayas.length > 0 ? wilayas : DEFAULT_WILAYAS;
  const currentWilaya = activeWilayas.find((w) => w.code === selectedWilaya) || activeWilayas[0];

  const handleOptimize = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai_service/basket-optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          budget,
          familySize,
          wilayaCode: selectedWilaya,
          durationDays,
        }),
      });

      if (!response.ok) {
        throw new Error('فشل حساب التوزيع الأمثل لسلة التموين');
      }

      const data: BasketOptimizationResult = await response.json();
      setResult(data);
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Run initial calculation
    handleOptimize();
  }, [selectedWilaya]);

  // Calculate manually added items total
  const manualTotalRetail = customBasket.reduce(
    (acc, it) => acc + it.product.averageRetailPrice * it.quantity,
    0
  );
  const manualTotalRahma = customBasket.reduce(
    (acc, it) => acc + it.product.rahmaMarketPrice * it.quantity,
    0
  );
  const manualSavings = manualTotalRetail - manualTotalRahma;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Title & Introduction */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-lg">
              <Calculator className="w-5 h-5 text-emerald-600" />
              <h2>حاسبة ومُحسّن سلة التموين الذكية (قفة العائلة)</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              أدخل ميزانيتك وعدد أفراد أسرتك لحساب أفضل توزيع غذائي بالدينار الجزائري، مع تحديد أماكن الشراء الأكثر توفيراً.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">الولاية:</span>
            <select
              value={selectedWilaya}
              onChange={(e) => setSelectedWilaya(e.target.value)}
              className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none"
            >
              {activeWilayas.map((w) => (
                <option key={w.code} value={w.code}>
                  {w.nameAr}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Manual Basket Drawer (if user added items from catalog) */}
      {customBasket.length > 0 && (
        <div className="bg-emerald-50/60 rounded-xl border border-emerald-200 p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-emerald-950">
                السلع المختارة يدوياً من الكتالوج ({customBasket.length} مواد)
              </span>
            </div>

            <button
              onClick={onClearBasket}
              className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 font-medium"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>إفراغ القفة</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            {customBasket.map((item) => (
              <div
                key={item.product.id}
                className="bg-white p-3 rounded-lg border border-emerald-100 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-800">{item.product.name}</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    الكمية: {item.quantity} · سعر الرحمة: {item.product.rahmaMarketPrice} د.ج
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono tabular-nums font-bold text-emerald-800">
                    {item.product.rahmaMarketPrice * item.quantity} د.ج
                  </span>
                  <button
                    onClick={() => onRemoveFromBasket(item.product.id)}
                    className="text-slate-400 hover:text-red-600"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between pt-3 border-t border-emerald-200 text-xs text-emerald-900">
            <div>
              الإجمالي في أسواق الرحمة: <span className="font-mono tabular-nums font-bold text-sm">{manualTotalRahma} د.ج</span>
            </div>
            <div>
              التوفير مقارنة بمحلات التجزئة: <span className="font-mono tabular-nums font-bold text-sm text-emerald-700">+{manualSavings} د.ج</span>
            </div>
          </div>
        </div>
      )}

      {/* Control Panel: Budget, Family Size, Duration */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Budget Input & Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              الميزانية التموينية المخصصة (د.ج):
            </label>
            <div className="relative mb-3">
              <input
                type="number"
                min="1000"
                step="500"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-base font-bold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                دينار جزائري
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {[3000, 5000, 8000, 12000, 20000].map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBudget(b)}
                  className={`px-2.5 py-1 text-xs font-mono rounded transition-colors ${
                    budget === b
                      ? 'bg-emerald-700 text-white font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {b.toLocaleString()} د.ج
                </button>
              ))}
            </div>
          </div>

          {/* Family Size */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              عدد أفراد الأسرة:
            </label>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {[2, 4, 6, 8].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFamilySize(s)}
                  className={`py-2 text-xs font-bold rounded-lg border transition-colors ${
                    familySize === s
                      ? 'bg-emerald-700 text-white border-emerald-700'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {s} أفراد
                </button>
              ))}
            </div>
            <div className="text-[11px] text-slate-500">
              يُحدد الحجم الكميات المطلوبة من الخضر (البطاطا والبصل) والحليب والبروتين.
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              مدة الاستهلاك المستهدفة:
            </label>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { days: 7, label: 'أسبوع (7 أيام)' },
                { days: 15, label: 'نصف شهر' },
                { days: 30, label: 'شهر كامل' },
              ].map((d) => (
                <button
                  key={d.days}
                  type="button"
                  onClick={() => setDurationDays(d.days)}
                  className={`py-2 px-1 text-center text-xs font-medium rounded-lg border transition-colors ${
                    durationDays === d.days
                      ? 'bg-emerald-700 text-white border-emerald-700 font-bold'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleOptimize}
              disabled={loading}
              className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'جاري الحساب...' : 'حساب التوزيع الأمثل الآن'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Optimization Results */}
      {result && (
        <div className="space-y-6">
          {/* Summary KPIs Banner */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-xs text-slate-500 block mb-1">الميزانية المحددة</span>
                <span className="text-lg font-bold font-mono tabular-nums text-slate-900">
                  {result.budget.toLocaleString()} د.ج
                </span>
              </div>

              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                <span className="text-xs text-emerald-800 block mb-1">التكلفة التقديرية للقفة</span>
                <span className="text-lg font-bold font-mono tabular-nums text-emerald-900">
                  {result.totalCost.toLocaleString()} د.ج
                </span>
              </div>

              <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100">
                <span className="text-xs text-emerald-800 block mb-1">التوفير المحقق بالبدائل</span>
                <span className="text-lg font-bold font-mono tabular-nums text-emerald-700 flex items-center justify-center gap-1">
                  <TrendingDown className="w-4 h-4 text-emerald-600" />
                  <span>+{result.totalSavedDzd.toLocaleString()} د.ج</span>
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-xs text-slate-500 block mb-1">المتبقي من الميزانية</span>
                <span className="text-lg font-bold font-mono tabular-nums text-slate-800">
                  {result.remainingBudget.toLocaleString()} د.ج
                </span>
              </div>
            </div>
          </div>

          {/* Itemized Table of Recommended Basket */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                محتويات القفة الذكية المقترحة لأسرة من {result.familySize} أفراد في ولاية {result.wilaya}
              </h3>
              <span className="text-xs text-slate-500">
                {result.items.length} مواد تموينية وغذائية
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100/75 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">المادة التموينية</th>
                    <th className="py-3 px-4">الكمية</th>
                    <th className="py-3 px-4">سعر الوحدة</th>
                    <th className="py-3 px-4">الإجمالي (د.ج)</th>
                    <th className="py-3 px-4">منفذ الشراء الموصى به</th>
                    <th className="py-3 px-4">التوفير المكتسب</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {result.items.map((it, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-800">
                        {it.productName}
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums text-slate-600">
                        {it.quantity} {it.unit}
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums text-slate-700">
                        {it.unitPrice} د.ج
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums font-bold text-slate-900">
                        {it.totalDzd} د.ج
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <span className="inline-flex items-center gap-1">
                          <Store className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{it.marketName}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums text-emerald-700 font-semibold">
                        {it.potentialSaving > 0 ? `+${it.potentialSaving} د.ج` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Expert Citizen Tips */}
          {result.expertTips.length > 0 && (
            <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>إرشادات عملية لتوفير ميزانية القفة في {result.wilaya}:</span>
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
                {result.expertTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
