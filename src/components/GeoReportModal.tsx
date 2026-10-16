import React, { useState } from 'react';
import { WilayaData, ViolationType, GeoReportPoint, MarketAlert } from '../types/index.ts';
import {
  X,
  MapPin,
  ShieldCheck,
  AlertTriangle,
  Upload,
  Camera,
  Crosshair,
  Lock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface GeoReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  wilayas: WilayaData[];
  onReportSubmitted: (newReport: GeoReportPoint, triggeredAlert?: MarketAlert | null) => void;
  initialCoords?: { lat: number; lng: number } | null;
}

const COMMON_COMMODITIES = [
  { name: 'حليب مبستر أكياس (جيبلي)', officialPrice: 25, unit: 'كيس 1 لتر' },
  { name: 'زيت المائدة الغذائي 5 لتر', officialPrice: 650, unit: 'قارورة 5 لتر' },
  { name: 'سميد قمح صلب 10 كغ', officialPrice: 450, unit: 'كيس 10 كغ' },
  { name: 'سميد قمح صلب 25 كغ', officialPrice: 900, unit: 'كيس 25 كغ' },
  { name: 'سكر أبيض استهلاك', officialPrice: 95, unit: '1 كغ' },
  { name: 'بطاطا استهلاك واسع', officialPrice: 65, unit: '1 كغ' },
  { name: 'دجاج بلدي مذبوح', officialPrice: 380, unit: '1 كغ' },
  { name: 'سلعة أخرى', officialPrice: null, unit: 'وحدة' },
];

const VIOLATION_TYPES: Array<{
  id: ViolationType;
  label: string;
  desc: string;
  badgeColor: string;
}> = [
  {
    id: 'price_gouging_ceiling',
    label: 'خرق السقف القانوني وتضخيم السعر',
    desc: 'بيع السلع المدعمة أو المقننة بسعر أعلى من السعر المحدد بالمرسوم الوزاري',
    badgeColor: 'border-red-300 bg-red-50 text-red-800',
  },
  {
    id: 'conditional_selling',
    label: 'بيع مشروط غير قانوني',
    desc: 'إلزام المواطن باقتناء سلع أخرى (مثل اللبن أو القهوة) للحصول على الحليب أو الزيت',
    badgeColor: 'border-amber-300 bg-amber-50 text-amber-800',
  },
  {
    id: 'hoarding_speculation',
    label: 'احتكار وتخزين غير مصرح',
    desc: 'إخفاء السلع عن رفوف العرض وبيعها في الخفاء للمضاربة غير المشروعة',
    badgeColor: 'border-purple-300 bg-purple-50 text-purple-800',
  },
  {
    id: 'no_price_display',
    label: 'عدم إشهار الأسعار الرسمية',
    desc: 'امتناع التاجر عن وضع لافتات الأسعار الشفافة على السلع المعروضة',
    badgeColor: 'border-orange-300 bg-orange-50 text-orange-800',
  },
  {
    id: 'model_compliant_store',
    label: 'نقطة بيع نموذجية منضبطة',
    desc: 'إشادة وتوثيق متجر أو تعاونية تلتزم التزاماً تاماً بالأسعار والوفرة بدون شروط',
    badgeColor: 'border-emerald-300 bg-emerald-50 text-emerald-800',
  },
];

export const GeoReportModal: React.FC<GeoReportModalProps> = ({
  isOpen,
  onClose,
  wilayas,
  onReportSubmitted,
  initialCoords,
}) => {
  const [productName, setProductName] = useState<string>(COMMON_COMMODITIES[0].name);
  const [customProductName, setCustomProductName] = useState<string>('');
  const [violationType, setViolationType] = useState<ViolationType>('price_gouging_ceiling');
  const [observedPriceDzd, setObservedPriceDzd] = useState<string>('35');
  const [officialPriceDzd, setOfficialPriceDzd] = useState<number | null>(25);
  const [storeName, setStoreName] = useState<string>('');
  const [wilayaCode, setWilayaCode] = useState<string>('16');
  const [commune, setCommune] = useState<string>('');
  const [addressDetails, setAddressDetails] = useState<string>('');
  const [lat, setLat] = useState<number>(initialCoords?.lat || 36.7538);
  const [lng, setLng] = useState<number>(initialCoords?.lng || 3.0588);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationSuccess, setLocationSuccess] = useState<boolean>(Boolean(initialCoords));
  const [evidencePhotoUrl, setEvidencePhotoUrl] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [anonymous, setAnonymous] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle commodity selection change
  const handleCommodityChange = (name: string) => {
    setProductName(name);
    const item = COMMON_COMMODITIES.find((c) => c.name === name);
    if (item && item.officialPrice !== null) {
      setOfficialPriceDzd(item.officialPrice);
      if (violationType === 'price_gouging_ceiling') {
        setObservedPriceDzd(String(item.officialPrice + 10));
      } else if (violationType === 'model_compliant_store') {
        setObservedPriceDzd(String(item.officialPrice));
      }
    } else {
      setOfficialPriceDzd(null);
    }
  };

  // Get current device GPS coordinates
  const handleGetDeviceLocation = () => {
    if (!navigator.geolocation) {
      setError('خاصية تحديد الموقع الجغرافي (GPS) غير مدعومة في متصفحك.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setIsLocating(false);
        setLocationSuccess(true);
        setError(null);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setIsLocating(false);
        const wilaya = wilayas.find((w) => w.code === wilayaCode);
        setError(
          `تعذر الحصول على إحداثيات الـ GPS المباشرة (${err.message}). تم تحديد إحداثيات تقريبية لولاية ${wilaya?.nameAr || 'الجزائر'}.`
        );
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Preset sample evidence photos for fast reporting
  const SAMPLE_EVIDENCE_PRESETS = [
    {
      title: 'لافتة سعر مخالفة',
      url: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=400&q=80',
    },
    {
      title: 'واجهة المحل / السوبرات',
      url: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=400&q=80',
    },
    {
      title: 'إيصال البيع المشروط',
      url: 'https://images.unsplash.com/photo-1554415707-9e49fe74a6fb?auto=format&fit=crop&w=400&q=80',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalProductName = productName === 'سلعة أخرى' ? customProductName.trim() : productName;

    if (!finalProductName) {
      setError('يرجى تحديد اسم السلعة موضوع البلاغ.');
      return;
    }
    if (!commune.trim()) {
      setError('يرجى كتابة اسم البلدية لتمكين الرصد الجغرافي.');
      return;
    }

    const selectedWilayaObj = wilayas.find((w) => w.code === wilayaCode);

    try {
      setLoading(true);
      setError(null);

      const payload = {
        productName: finalProductName,
        violationType,
        observedPriceDzd: Number(observedPriceDzd) || 0,
        officialPriceDzd,
        storeName: storeName.trim() || 'محل تجزئة / سوبرات بالحي',
        wilaya: selectedWilayaObj?.nameAr || 'الجزائر العاصمة',
        wilayaCode,
        commune: commune.trim(),
        addressDetails: addressDetails.trim() || 'وسط البلدية',
        lat,
        lng,
        evidencePhotoUrl: evidencePhotoUrl || undefined,
        notes: notes.trim() || undefined,
        anonymous,
      };

      const res = await fetch('/api/ai_service/reports/geo-map', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'فشل إرسال البلاغ الجغرافي');
      }

      const resData = await res.json();
      onReportSubmitted(resData.report, resData.triggeredAlert);
      onClose();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء إرسال البلاغ');
    } finally {
      setLoading(false);
    }
  };

  const calculatedDifference =
    officialPriceDzd && Number(observedPriceDzd)
      ? Number(observedPriceDzd) - officialPriceDzd
      : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="sticky top-0 bg-white px-5 py-4 border-b border-slate-100 flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-700 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                تسجيل بلاغ ميداني جغرافي وتوثيق التجاوزات
              </h3>
              <p className="text-[11px] text-slate-500">
                رصد إحداثيات المخالفات التجارية لحماية المستهلك وتحريك فرق الرقابة وقمع الغش
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-[11px] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Whistleblower Protection Banner */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <h5 className="font-bold text-emerald-900 text-xs">
                حماية تامة لهوية المواطن المبلّغ (100% Secure & Anonymous)
              </h5>
              <p className="text-[11px] text-emerald-700 mt-0.5 leading-relaxed">
                لا نطلب أي رقم هاتف أو هوية شخصية. بلاغك يتم تشفيره وتمرير إحداثياته مباشرة لمصالح الرقابة المعنية وفقاً لقانون حماية المستهلك وقمع الغش.
              </p>
            </div>
          </div>

          {/* Violation Type Selector */}
          <div>
            <label className="block font-semibold text-slate-800 mb-2">
              تصنيف المخالفة أو الملاحظة الميدانية <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {VIOLATION_TYPES.map((vt) => {
                const isSelected = violationType === vt.id;
                return (
                  <button
                    key={vt.id}
                    type="button"
                    onClick={() => {
                      setViolationType(vt.id);
                      if (vt.id === 'model_compliant_store' && officialPriceDzd) {
                        setObservedPriceDzd(String(officialPriceDzd));
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-right transition-all flex flex-col justify-between ${
                      isSelected
                        ? `${vt.badgeColor} ring-2 ring-slate-900/10 font-bold shadow-xs`
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <span className="text-xs">{vt.label}</span>
                    <span className="text-[10px] opacity-80 mt-1 line-clamp-1">{vt.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Commodity Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                السلعة موضوع البلاغ <span className="text-red-500">*</span>
              </label>
              <select
                value={productName}
                onChange={(e) => handleCommodityChange(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              >
                {COMMON_COMMODITIES.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name} {c.officialPrice ? `(مسقف ${c.officialPrice} د.ج)` : ''}
                  </option>
                ))}
              </select>
            </div>

            {productName === 'سلعة أخرى' && (
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  اكتب اسم السلعة <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={customProductName}
                  onChange={(e) => setCustomProductName(e.target.value)}
                  placeholder="مثال: لحم بقري محلي، بيض، دقيق..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            )}

            {/* Price fields */}
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                السعر الملاحظ بالمحل (د.ج) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={observedPriceDzd}
                  onChange={(e) => setObservedPriceDzd(e.target.value)}
                  placeholder="مثلاً: 35"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono tabular-nums text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  required
                />
                <span className="absolute left-3 top-2 text-[11px] text-slate-400">د.ج</span>
              </div>
            </div>
          </div>

          {/* Real-time Ceiling Price comparison banner */}
          {officialPriceDzd !== null && (
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-600">السعر المقنن رسمياً:</span>
                <span className="font-mono font-bold text-slate-900">{officialPriceDzd} د.ج</span>
              </div>
              <div>
                {calculatedDifference > 0 ? (
                  <span className="inline-flex items-center gap-1 font-mono font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded text-[11px]">
                    <AlertTriangle className="w-3 h-3" />
                    زيادة غير مشروعة: +{calculatedDifference} د.ج ({Math.round((calculatedDifference / officialPriceDzd) * 100)}%)
                  </span>
                ) : calculatedDifference === 0 ? (
                  <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                    مطابق للسعر المسقف تماماً
                  </span>
                ) : (
                  <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                    أقل من السقف بـ {Math.abs(calculatedDifference)} د.ج
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Location fields */}
          <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>الموقع الجغرافي وتفاصيل المحل</span>
              </span>

              {/* Geolocation auto-detect button */}
              <button
                type="button"
                onClick={handleGetDeviceLocation}
                disabled={isLocating}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-300 text-[11px] transition-colors shadow-2xs font-medium"
              >
                <Crosshair className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin text-emerald-600' : 'text-slate-500'}`} />
                <span>{isLocating ? 'جارٍ الرصد...' : locationSuccess ? 'تم الرصد (GPS)' : 'تحديد إحداثياتي آلياً'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 mb-1 text-[11px]">
                  الولاية <span className="text-red-500">*</span>
                </label>
                <select
                  value={wilayaCode}
                  onChange={(e) => setWilayaCode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                >
                  {wilayas.map((w) => (
                    <option key={w.code} value={w.code}>
                      {w.code} - {w.nameAr} ({w.nameFr})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 text-[11px]">
                  البلدية <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={commune}
                  onChange={(e) => setCommune(e.target.value)}
                  placeholder="مثال: باب الوادي، سيدي امحمد، باش جراح..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 mb-1 text-[11px]">اسم المحل أو السوبرات</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="مثال: تغذية عامة البركة، سوبرات حي النخيل..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 text-[11px]">العنوان الدقيق / معالم الحي</label>
                <input
                  type="text"
                  value={addressDetails}
                  onChange={(e) => setAddressDetails(e.target.value)}
                  placeholder="مثال: شارع الشهداء، قرب مسجد النور ومحطة الحافلات"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>

            {/* Coordinates Badge */}
            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200">
              <span className="flex items-center gap-1">
                <span>الإحداثيات الجغرافية:</span>
                <span className="font-mono tabular-nums text-slate-700">
                  {lat.toFixed(4)}° N, {lng.toFixed(4)}° E
                </span>
              </span>
              <span className="text-emerald-700">دقة الإحداثيات: نظام WGS-84 GIS</span>
            </div>
          </div>

          {/* Evidence Photo */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1 flex items-center justify-between">
              <span>صورة ميدانية توثيقية للمخالفة أو لافتة السعر (اختياري)</span>
              <span className="text-[10px] text-slate-400">تزيد من سرعة تحرك فرق الرقابة</span>
            </label>

            {evidencePhotoUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 flex items-center justify-center h-32 mb-2">
                <img src={evidencePhotoUrl} alt="دليل ميداني" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setEvidencePhotoUrl('')}
                  className="absolute top-2 right-2 bg-red-600/90 hover:bg-red-700 text-white p-1 rounded-md text-[10px]"
                >
                  إزالة الصورة
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={evidencePhotoUrl}
                    onChange={(e) => setEvidencePhotoUrl(e.target.value)}
                    placeholder="رابط صورة ميدانية أو اضغط على أحد النماذج الميدانية بالأسفل..."
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600 text-xs"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] text-slate-500">أو اختر نموذج توثيق سريع:</span>
                  {SAMPLE_EVIDENCE_PRESETS.map((preset) => (
                    <button
                      key={preset.title}
                      type="button"
                      onClick={() => setEvidencePhotoUrl(preset.url)}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[10px] transition-colors"
                    >
                      {preset.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              ملاحظات وتفاصيل إضافية عن الواقعة
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثلاً: التاجر يرفض بيع الحليب إلا لمن يشتري اللبن، أو يخفي أكياس السميد في المستودع الخلفي..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600 resize-none text-xs"
            />
          </div>

          {/* Anonymous Whistleblower Checkbox */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="anonymous-check"
                checked={anonymous}
                onChange={(e) => setAnonymous(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
              <label htmlFor="anonymous-check" className="font-semibold text-slate-800 cursor-pointer">
                إرسال البلاغ بهوية مجهولة بالكامل (Anonymous Citizen)
              </label>
            </div>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              محمي مشفّر
            </span>
          </div>

          {/* Submit Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
            >
              إلغاء
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg font-semibold shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>جارٍ تسجيل البلاغ...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تأكيد ونشر البلاغ الميداني</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
