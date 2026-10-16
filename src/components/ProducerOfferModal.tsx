import React, { useState } from 'react';
import { WilayaData } from '../types/index.ts';
import { X, Send, Sprout, MapPin, Phone, Package, Tag } from 'lucide-react';

interface ProducerOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  wilayas: WilayaData[];
  onOfferSubmitted: () => void;
}

export const ProducerOfferModal: React.FC<ProducerOfferModalProps> = ({
  isOpen,
  onClose,
  wilayas,
  onOfferSubmitted,
}) => {
  const [producerName, setProducerName] = useState('');
  const [producerType, setProducerType] = useState<'farmer' | 'cooperative' | 'oil_press' | 'beekeeper' | 'dates_grower'>('farmer');
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState<'vegetables' | 'fruits' | 'oil_dates' | 'legumes' | 'honey_dairy'>('vegetables');
  const [priceDzd, setPriceDzd] = useState('');
  const [retailMarketPrice, setRetailMarketPrice] = useState('');
  const [unit, setUnit] = useState('1 كغ');
  const [availableQuantity, setAvailableQuantity] = useState('100');
  const [minOrderQuantity, setMinOrderQuantity] = useState('5');
  const [wilaya, setWilaya] = useState(wilayas[0]?.nameAr || 'الجزائر العاصمة');
  const [locationDetails, setLocationDetails] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [freshnessTag, setFreshnessTag] = useState('جني هذا الصباح');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!producerName.trim() || !productName.trim() || !priceDzd.trim() || !contactPhone.trim()) {
      setError('يرجى ملء جميع الحقول الإلزامية بدقة.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const selectedWilayaObj = wilayas.find((w) => w.nameAr === wilaya) || wilayas[0];

      const response = await fetch('/api/ai_service/producer-offers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          producerName,
          producerType,
          productName,
          category,
          priceDzd: Number(priceDzd),
          retailMarketPrice: retailMarketPrice ? Number(retailMarketPrice) : Math.round(Number(priceDzd) * 1.4),
          unit,
          availableQuantity: Number(availableQuantity),
          minOrderQuantity: Number(minOrderQuantity),
          wilaya,
          wilayaCode: selectedWilayaObj.code,
          locationDetails,
          contactPhone,
          freshnessTag,
          description,
        }),
      });

      if (!response.ok) {
        throw new Error('فشل تسجيل عرض المنتج المحلي');
      }

      setSuccess(true);
      setTimeout(() => {
        onOfferSubmitted();
        onClose();
        setSuccess(false);
        setProducerName('');
        setProductName('');
        setPriceDzd('');
        setContactPhone('');
        setLocationDetails('');
        setDescription('');
      }, 1500);
    } catch (err: unknown) {
      console.error(err);
      setError('حدث خطأ أثناء حفظ العرض المباشر.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 border border-slate-200 shadow-xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-emerald-800 font-bold text-base mb-1">
          <Sprout className="w-5 h-5 text-emerald-600" />
          <h3>تسجيل عرض فلاحي / منتج محلي مباشر (من المنتج للمستهلك)</h3>
        </div>
        <p className="text-xs text-slate-500 mb-5">
          انضم لشبكة المنتجين المباشرين لبيع محاصيلك ومنتجاتك للعائلات والمستهلكين مباشرة بسعر عادل ومربح للطرفين.
        </p>

        {success ? (
          <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-center text-xs font-semibold">
            تم تسجيل عرضك المباشر بنجاح! سيظهر للمواطنين في ولايتك فوراً.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {error && (
              <div className="p-2.5 bg-red-50 text-red-700 rounded-lg text-xs">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  اسم الفلاح / التعاونية / المزرعة: *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: مزرعة بن عيسى، تعاونية متيجة..."
                  value={producerName}
                  onChange={(e) => setProducerName(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  صفة المنتج:
                </label>
                <select
                  value={producerType}
                  onChange={(e) => setProducerType(e.target.value as any)}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none"
                >
                  <option value="farmer">فلاح مباشر من الحقل</option>
                  <option value="cooperative">تعاونية فلاحية محلية</option>
                  <option value="oil_press">معصرة زيتون حرفية</option>
                  <option value="dates_grower">منتج تمور مباشر</option>
                  <option value="beekeeper">مربي نحل معتمد</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  اسم المنتوج الفلاحي / المحلي: *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: طماطم حقلية، زيت زيتون بكر، تمور دقلة..."
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  التصنيف:
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none"
                >
                  <option value="vegetables">خضروات طازجة</option>
                  <option value="fruits">فواكه موسمية</option>
                  <option value="oil_dates">زيوت وتمور</option>
                  <option value="legumes">بقوليات جافة</option>
                  <option value="honey_dairy">عسل وألبان</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  سعرك المباشر (د.ج): *
                </label>
                <input
                  type="number"
                  required
                  placeholder="60"
                  value={priceDzd}
                  onChange={(e) => setPriceDzd(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  سعر التجزئة المقارن:
                </label>
                <input
                  type="number"
                  placeholder="100"
                  value={retailMarketPrice}
                  onChange={(e) => setRetailMarketPrice(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  الوحدة:
                </label>
                <input
                  type="text"
                  placeholder="1 كغ أو لتر"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  الولاية: *
                </label>
                <select
                  value={wilaya}
                  onChange={(e) => setWilaya(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold focus:outline-none"
                >
                  {wilayas.map((w) => (
                    <option key={w.code} value={w.nameAr}>
                      {w.nameAr}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  رقم هاتف الاتصال / واتساب: *
                </label>
                <input
                  type="text"
                  required
                  placeholder="0661 XX XX XX"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  مكان المزرعة أو نقطة الاستلام:
                </label>
                <input
                  type="text"
                  placeholder="مثال: الطريق الوطني رقم 4، بلدية واد الفضة"
                  value={locationDetails}
                  onChange={(e) => setLocationDetails(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  حالة الجني والوفرة:
                </label>
                <input
                  type="text"
                  placeholder="مثال: جني هذا الصباح، عصرة باردة 2026"
                  value={freshnessTag}
                  onChange={(e) => setFreshnessTag(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                وصف العرض وشروط البيع:
              </label>
              <textarea
                rows={2}
                placeholder="مثال: البيع بالصندوق 10 كغ أو بالكمية، متوفر للمواطنين والجمعيات بسعر المزرعة..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white font-semibold rounded-lg transition-colors"
              >
                <Send className="w-3.5 h-3.5 rotate-180" />
                <span>{submitting ? 'جاري الحفظ...' : 'نشر العرض المباشر'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
