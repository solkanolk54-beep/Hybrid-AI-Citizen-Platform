import React, { useState } from 'react';
import { ReceiptScanResult } from '../types/index.ts';
import { Camera, Upload, Sparkles, CheckCircle2, AlertTriangle, ShieldAlert, ArrowDownRight, RefreshCw, FileText } from 'lucide-react';

interface ReceiptScannerViewProps {
  onOpenReportModalWithItem?: (productName: string, observedPrice: number) => void;
}

export const ReceiptScannerView: React.FC<ReceiptScannerViewProps> = ({
  onOpenReportModalWithItem,
}) => {
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<ReceiptScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImageBase64(reader.result as string);
      // Auto run scan
      runScan(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleTestSample = (sampleId: string) => {
    runScan(null, sampleId);
  };

  const runScan = async (base64Image: string | null, sampleId?: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai_service/receipt-scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: base64Image,
          sampleId: sampleId,
        }),
      });

      if (!response.ok) {
        throw new Error('فشل معالجة وقراءة الفاتورة');
      }

      const data: ReceiptScanResult = await response.json();
      setScanResult(data);
    } catch (err: unknown) {
      console.error(err);
      setError('حدث خطأ أثناء فحص صورة التذكرة. يرجى تجربة عينة أخرى أو التأكد من وضوح الصورة.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Intro Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-lg">
              <Camera className="w-5 h-5 text-emerald-600" />
              <h2>محرك فحص الفواتير وتذاكر الشراء بالذكاء الاصطناعي (AI OCR)</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              التقط صورة لتذكرة الشراء (Ticket de Caisse) أو ارفعها، وسيقوم الذكاء الاصطناعي باستخراج الأسعار ومقارنتها فوراً بالسقف القانوني وأسعار الأسواق العادلة لكشف أي تضخيم.
            </p>
          </div>
        </div>
      </div>

      {/* Upload Box & Fast Preset Samples */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* File Upload Zone */}
          <div className="md:col-span-7">
            <label className="block border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-emerald-50/20">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <div className="text-xs font-bold text-slate-800 mb-1">
                {imageFileName ? `الصورة المحددة: ${imageFileName}` : 'اضغط لرفع صورة الفاتورة أو التقطها بالكاميرا'}
              </div>
              <p className="text-[11px] text-slate-500">
                يدعم صور تذاكر السوبرماركت، محلات البقالة، الخضر، والجزارة (JPG، PNG، WebP)
              </p>
            </label>
          </div>

          {/* Quick 1-Click Samples for Instant Testing */}
          <div className="md:col-span-5 bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>تجربة سريعة بنقرة واحدة (عينات جاهزة):</span>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleTestSample('sample_supermarket_overcharged')}
                className="w-full text-right p-2.5 bg-white hover:bg-red-50/50 border border-slate-200 hover:border-red-300 rounded-lg text-xs transition-colors group"
              >
                <div className="font-bold text-slate-800 group-hover:text-red-800 flex items-center justify-between">
                  <span>تذكرة سوبرماركت (كشف تضخيم غير قانوني)</span>
                  <span className="text-[10px] text-red-600 font-semibold px-1.5 py-0.5 bg-red-50 rounded">
                    زيادة في الحليب والزيت
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  حليب 35 د.ج، زيت 740 د.ج، سميد 560 د.ج
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleTestSample('sample_farmers_market_fair')}
                className="w-full text-right p-2.5 bg-white hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-300 rounded-lg text-xs transition-colors group"
              >
                <div className="font-bold text-slate-800 group-hover:text-emerald-800 flex items-center justify-between">
                  <span>تذكرة سوق تضامني (تحقيق توفير كبير)</span>
                  <span className="text-[10px] text-emerald-700 font-semibold px-1.5 py-0.5 bg-emerald-50 rounded">
                    توفير +770 د.ج
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  دجاج 360 د.ج، بطاطا 55 د.ج، بيض 480 د.ج
                </div>
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-xs">
            {error}
          </div>
        )}
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center shadow-xs mb-6">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 animate-pulse">
            <RefreshCw className="w-5 h-5 text-emerald-600 animate-spin" />
            <span>جاري معالجة صورة التذكرة، قراءة النصوص بالذكاء الاصطناعي، ومقارنة الأسعار بالسقف الرسمي...</span>
          </div>
        </div>
      )}

      {/* Results Display */}
      {scanResult && !loading && (
        <div className="space-y-6">
          {/* Main Verdict Card */}
          <div
            className={`rounded-xl border p-5 text-xs ${
              scanResult.verdict === 'critical_overcharge'
                ? 'bg-red-50/70 border-red-200 text-red-950'
                : scanResult.verdict === 'moderate_markup'
                ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                {scanResult.verdict === 'critical_overcharge' ? (
                  <ShieldAlert className="w-6 h-6 text-red-600 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                )}
                <div>
                  <h3 className="text-base font-extrabold">{scanResult.verdictAr}</h3>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    المتجر: <strong className="text-slate-800">{scanResult.storeName}</strong> · تاريخ الفحص: <span className="font-mono">{scanResult.scanDate}</span>
                  </div>
                </div>
              </div>

              {/* Net Variance Badge */}
              <div className="text-left bg-white px-3 py-1.5 rounded-lg border border-black/5 shadow-2xs">
                <span className="text-[10px] text-slate-500 block">فارق التكلفة عن السعر العادل</span>
                <span
                  className={`text-base font-bold font-mono tabular-nums ${
                    scanResult.netVarianceDzd < 0 ? 'text-red-600' : 'text-emerald-700'
                  }`}
                >
                  {scanResult.netVarianceDzd < 0
                    ? `تضخيم: ${Math.abs(scanResult.netVarianceDzd)} د.ج`
                    : `توفير: +${scanResult.netVarianceDzd} د.ج`}
                </span>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-slate-700 font-medium pt-2 border-t border-black/5">
              {scanResult.analysisSummary}
            </p>
          </div>

          {/* Metric Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-xs">
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <span className="text-slate-500 block mb-1">المبلغ الإجمالي بالفاتورة</span>
              <span className="text-lg font-bold font-mono tabular-nums text-slate-900">
                {scanResult.totalReceiptCostDzd.toLocaleString()} د.ج
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <span className="text-slate-500 block mb-1">القيمة العادلة المقننة بالمنصة</span>
              <span className="text-lg font-bold font-mono tabular-nums text-emerald-700">
                {scanResult.fairValueTotalDzd.toLocaleString()} د.ج
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <span className="text-slate-500 block mb-1">عدد السلع المفحوصة</span>
              <span className="text-lg font-bold font-mono tabular-nums text-slate-800">
                {scanResult.items.length} مواد
              </span>
            </div>
          </div>

          {/* Itemized Comparison Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800">
                تفاصيل السلع المكتشفة ومقارنتها بالأسعار المسقفة
              </span>
              <span className="text-slate-500 font-mono">
                {scanResult.items.length} أسطر مفحوصة
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100/75 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">السلعة</th>
                    <th className="py-3 px-4">الكمية</th>
                    <th className="py-3 px-4">السعر بالفاتورة</th>
                    <th className="py-3 px-4">السعر المسقف / المرجعي</th>
                    <th className="py-3 px-4">الحالة والملاحظة</th>
                    <th className="py-3 px-4">الفارق</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {scanResult.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-800">
                        {item.name}
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums text-slate-600">
                        {item.quantity}
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums font-bold text-slate-900">
                        {item.unitPriceDzd} د.ج
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums text-slate-700">
                        {item.priceCeilingDzd ? (
                          <span className="text-amber-700 font-semibold">
                            {item.priceCeilingDzd} د.ج (مسقف)
                          </span>
                        ) : (
                          <span>{item.referencePriceDzd || '—'} د.ج</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          {item.status === 'illegal_ceiling_violation' && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-800 font-bold rounded text-[10px]">
                              مخالفة السقف
                            </span>
                          )}
                          {item.status === 'overpriced' && (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-semibold rounded text-[10px]">
                              سعر مرتفع
                            </span>
                          )}
                          {item.status === 'bargain' && (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-semibold rounded text-[10px]">
                              أوفر من السوق
                            </span>
                          )}
                          {item.status === 'fair' && (
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px]">
                              سعر مضبوط
                            </span>
                          )}
                          {item.note && (
                            <span className="text-slate-500 text-[11px] truncate max-w-xs">
                              {item.note}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums font-bold">
                        {item.savingOrLossDzd < 0 ? (
                          <span className="text-red-600">+{Math.abs(item.savingOrLossDzd)} د.ج</span>
                        ) : item.savingOrLossDzd > 0 ? (
                          <span className="text-emerald-700">-{item.savingOrLossDzd} د.ج</span>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recommendations Card */}
          {scanResult.recommendations.length > 0 && (
            <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 text-xs">
              <h4 className="font-bold text-emerald-400 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>إرشادات وتوجيهات الذكاء الاصطناعي للمواطن:</span>
              </h4>
              <ul className="space-y-1.5 text-slate-300">
                {scanResult.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{rec}</span>
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
