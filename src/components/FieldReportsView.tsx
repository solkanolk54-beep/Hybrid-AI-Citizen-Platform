import React from 'react';
import { CitizenPriceReport } from '../types/index.ts';
import { ShieldAlert, Plus, Store, Clock, MapPin, CheckCircle2 } from 'lucide-react';

interface FieldReportsViewProps {
  reports: CitizenPriceReport[];
  onOpenReportModal: () => void;
}

export const FieldReportsView: React.FC<FieldReportsViewProps> = ({
  reports,
  onOpenReportModal,
}) => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-lg">
              <ShieldAlert className="w-5 h-5 text-emerald-600" />
              <h2>سجل رصد الميدان وبلاغات المواطنين الحية</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              متابعة مجتمعية مباشرة للأسعار وتوفر السلع المسقفة في أحياء وبلديات الولايات الجزائرية.
            </p>
          </div>

          <button
            onClick={onOpenReportModal}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل سعر أو بلاغ جديد</span>
          </button>
        </div>
      </div>

      {/* Reports Feed */}
      {reports.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-sm font-semibold text-slate-800 mb-2">لا توجد بلاغات مسجلة حالياً</p>
          <p className="text-xs text-slate-500 mb-4">كن أول من يشارك أسعار المواد والسلع المتوفرة في حيك أو ولايتك.</p>
          <button
            onClick={onOpenReportModal}
            className="px-4 py-2 bg-emerald-700 text-white text-xs font-medium rounded-lg"
          >
            إضافة رصدك الآن
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map((rep) => {
            const formattedDate = new Date(rep.createdAt).toLocaleDateString('ar-DZ', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={rep.id}
                className="bg-white rounded-xl border border-slate-200 p-4.5 hover:border-slate-300 transition-colors shadow-2xs text-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mb-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="font-semibold text-slate-700">{rep.wilaya}</span>
                        {rep.storeLocation && <span>· {rep.storeLocation}</span>}
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{rep.productName}</h4>
                    </div>

                    <div className="text-left shrink-0">
                      <div className="text-base font-bold font-mono tabular-nums text-slate-900">
                        {rep.observedPrice} د.ج
                      </div>
                      <span className="text-[10px] text-slate-400 block">السعر الملاحظ</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 mb-3 space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Store className="w-3.5 h-3.5 text-slate-400" />
                      <span>نوع المنفذ: {rep.marketType}</span>
                    </div>
                    {rep.notes && (
                      <p className="text-slate-600 leading-relaxed pt-1 text-[11px] border-t border-slate-200/50">
                        "{rep.notes}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span className="font-mono tabular-nums">{formattedDate}</span>
                  </div>

                  {rep.verified && (
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>تم التحقق والمطابقة</span>
                    </span>
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
