import React, { useState } from 'react';
import { WilayaData, DEFAULT_WILAYAS } from '../types/index.ts';
import { X, Send, ShieldAlert } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  wilayas: WilayaData[];
  onReportSubmitted: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  wilayas,
  onReportSubmitted,
}) => {
  const activeWilayas = wilayas && wilayas.length > 0 ? wilayas : DEFAULT_WILAYAS;
  const [productName, setProductName] = useState('');
  const [observedPrice, setObservedPrice] = useState('');
  const [marketType, setMarketType] = useState('محل تجزئة / سوبرات');
  const [wilaya, setWilaya] = useState(activeWilayas[0]?.nameAr || 'الجزائر العاصمة');
  const [storeLocation, setStoreLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim() || !observedPrice.trim()) {
      setError('يرجى كتابة اسم السلعة والسعر الملاحظ بدقة.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/ai_service/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productName,
          observedPrice: Number(observedPrice),
          marketType,
          wilaya,
          storeLocation,
          notes,
        }),
      });

      if (!response.ok) {
        throw new Error('فشل إرسال البلاغ');
      }

      setSuccess(true);
      setTimeout(() => {
        onReportSubmitted();
        onClose();
        setSuccess(false);
        setProductName('');
        setObservedPrice('');
        setStoreLocation('');
        setNotes('');
      }, 1500);
    } catch (err: unknown) {
      console.error(err);
      setError('حدث خطأ أثناء حفظ البلاغ، يرجى المحاولة لاحقاً.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200 shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-emerald-800 font-bold text-base mb-1">
          <ShieldAlert className="w-5 h-5 text-emerald-600" />
          <h3>رصد سعر أو إبلاغ عن تباين سعري محلي</h3>
        </div>
        <p className="text-xs text-slate-500 mb-5 leading-relaxed">
          مشاركتك تساعد آلاف المواطنين في منطقتك على معرفة الأسعار الحقيقية ومكافحة المضاربة.
        </p>

        {success ? (
          <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-center text-xs font-semibold">
            تم تسجيل السعر بنجاح! شكراً لمساهمتك في الشفافية والوعي الاستهلاكي.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {error && (
              <div className="p-2.5 bg-red-50 text-red-700 rounded-lg text-xs">
                {error}
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                اسم السلعة أو المادة التموينية: *
              </label>
              <input
                type="text"
                required
                placeholder="مثال: حليب مبستر أكياس 25 د.ج، زيت 5 لتر، بطاطا..."
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  السعر الملاحظ (د.ج): *
                </label>
                <input
                  type="number"
                  required
                  placeholder="35"
                  value={observedPrice}
                  onChange={(e) => setObservedPrice(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  الولاية: *
                </label>
                <select
                  value={wilaya}
                  onChange={(e) => setWilaya(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold focus:outline-none"
                >
                  {activeWilayas.map((w) => (
                    <option key={w.code} value={w.nameAr}>
                      {w.nameAr}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  نوع نقطة البيع:
                </label>
                <select
                  value={marketType}
                  onChange={(e) => setMarketType(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none"
                >
                  <option value="محل تجزئة / سوبرات بالحي">محل تجزئة / سوبرات بالحي</option>
                  <option value="سوق مغطى / سوق شعبي">سوق مغطى / سوق شعبي</option>
                  <option value="سوق الرحمة / التضامني">سوق الرحمة / التضامني</option>
                  <option value="نقطة بيع عمومية (أوناب / جيبلي / أغروديف)">نقطة بيع عمومية (أوناب / جيبلي / أغروديف)</option>
                  <option value="سوق الجملة">سوق الجملة</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  موقع المحل أو الحي:
                </label>
                <input
                  type="text"
                  placeholder="مثال: حي باب الوادي، قرب البلدية"
                  value={storeLocation}
                  onChange={(e) => setStoreLocation(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                ملاحظات إضافية (اختياري):
              </label>
              <textarea
                rows={2}
                placeholder="مثال: التاجر يفرض شراء لبن مع الحليب، أو توفر وفير ونوعية ممتازة بسعر الجملة..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
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
                <span>{submitting ? 'جاري التسجيل...' : 'إرسال الرصد'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
