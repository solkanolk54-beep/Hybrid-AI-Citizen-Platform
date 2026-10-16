import React, { useState } from 'react';
import { MarketAlert, WilayaData } from '../types/index.ts';
import { X, Bell, TrendingDown, ShieldAlert, Sparkles, MapPin, Check, Volume2 } from 'lucide-react';

interface SmartAlertsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: MarketAlert[];
  wilayas: WilayaData[];
  selectedWilaya: string;
  setSelectedWilaya: (code: string) => void;
}

export const SmartAlertsDrawer: React.FC<SmartAlertsDrawerProps> = ({
  isOpen,
  onClose,
  alerts,
  wilayas,
  selectedWilaya,
  setSelectedWilaya,
}) => {
  const [filterWilaya, setFilterWilaya] = useState<string>('all');
  const [notificationsSubscribed, setNotificationsSubscribed] = useState<boolean>(true);

  if (!isOpen) return null;

  const filteredAlerts = alerts.filter((a) => {
    if (filterWilaya === 'all') return true;
    return a.wilayaCode === filterWilaya || a.wilayaCode === 'all';
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-2xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col border-r border-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-700" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                مركز التنبيهات الذكية للأسواق والوفرة
              </h3>
              <span className="text-[11px] text-slate-500">
                متابعة حية لتغيرات أسعار السلع التموينية بالولايات
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Subscription toggle & Wilaya Filter */}
        <div className="p-4 bg-emerald-50/60 border-b border-emerald-100 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-emerald-950 flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-emerald-700" />
              <span>تنبيهات الأسعار الفورية:</span>
            </span>

            <button
              onClick={() => setNotificationsSubscribed(!notificationsSubscribed)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                notificationsSubscribed
                  ? 'bg-emerald-700 text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {notificationsSubscribed ? 'مفعلة' : 'معطلة'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <select
              value={filterWilaya}
              onChange={(e) => setFilterWilaya(e.target.value)}
              className="w-full py-1.5 px-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none"
            >
              <option value="all">جميع ولايات الوطن (كافة التنبيهات)</option>
              {wilayas.map((w) => (
                <option key={w.code} value={w.code}>
                  ولاية {w.nameAr}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Alerts List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredAlerts.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              لا توجد تنبيهات جديدة في هذه الولاية حالياً.
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const formattedTime = new Date(alert.date).toLocaleTimeString('ar-DZ', {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={alert.id}
                  className={`p-3.5 rounded-xl border text-xs leading-relaxed transition-all ${
                    alert.severity === 'warning'
                      ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                      : alert.severity === 'positive'
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                      : 'bg-blue-50/70 border-blue-200 text-blue-950'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5 font-bold">
                      {alert.severity === 'warning' ? (
                        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                      ) : alert.severity === 'positive' ? (
                        <TrendingDown className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                      )}
                      <span>{alert.title}</span>
                    </div>

                    <span className="font-mono text-[10px] text-slate-500 shrink-0">
                      {formattedTime}
                    </span>
                  </div>

                  <p className="text-slate-700 text-xs mb-2">
                    {alert.message}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-black/5">
                    <span>{alert.wilaya}</span>
                    {alert.currentPriceDzd && (
                      <span className="font-mono font-bold text-emerald-800">
                        السعر الحالي: {alert.currentPriceDzd} د.ج
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-400">
          يتم تحديث التنبيهات آلياً بناءً على مؤشرات غرف التبريد والأسواق
        </div>
      </div>
    </div>
  );
};
