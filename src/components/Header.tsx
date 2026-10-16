import React from 'react';
import { ActiveTab } from '../types/index.ts';
import { ShoppingCart, Bell, Sprout, Camera, MapPin } from 'lucide-react';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  basketCount: number;
  alertCount: number;
  onOpenReportModal: () => void;
  onOpenAlertsDrawer: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  basketCount,
  alertCount,
  onOpenReportModal,
  onOpenAlertsDrawer,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 lg:gap-8 h-16">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('monitor')}
              className="text-right focus:outline-none"
            >
              <span className="text-lg lg:text-xl font-bold tracking-tight text-slate-900 block">
                منصة المواطن الهجينة
              </span>
            </button>
          </div>

          {/* Zone 2: Navigation Links (Clean single-line buttons) */}
          <nav className="hidden lg:flex items-center gap-5 text-sm font-medium">
            <button
              onClick={() => setActiveTab('monitor')}
              className={`whitespace-nowrap shrink-0 pb-1 border-b-2 transition-colors ${
                activeTab === 'monitor'
                  ? 'border-emerald-600 text-emerald-800 font-semibold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              رصد الأسعار
            </button>
            <button
              onClick={() => setActiveTab('geomap')}
              className={`whitespace-nowrap shrink-0 pb-1 border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'geomap'
                  ? 'border-red-600 text-red-800 font-bold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-red-600" />
              <span>الخريطة الميدانية (GIS)</span>
              <span className="px-1.5 py-0.2 bg-red-100 text-red-700 text-[10px] font-mono font-bold rounded-full">
                بث حي
              </span>
            </button>
            <button
              onClick={() => setActiveTab('producers')}
              className={`whitespace-nowrap shrink-0 pb-1 border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'producers'
                  ? 'border-emerald-600 text-emerald-800 font-semibold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sprout className="w-3.5 h-3.5 text-emerald-600" />
              <span>المنتج المحلي المباشر</span>
            </button>
            <button
              onClick={() => setActiveTab('receipt_scanner')}
              className={`whitespace-nowrap shrink-0 pb-1 border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'receipt_scanner'
                  ? 'border-emerald-600 text-emerald-800 font-semibold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Camera className="w-3.5 h-3.5 text-emerald-600" />
              <span>فحص الفواتير (AI)</span>
            </button>
            <button
              onClick={() => setActiveTab('advisor')}
              className={`whitespace-nowrap shrink-0 pb-1 border-b-2 transition-colors ${
                activeTab === 'advisor'
                  ? 'border-emerald-600 text-emerald-800 font-semibold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              المستشار الذكي
            </button>
            <button
              onClick={() => setActiveTab('optimizer')}
              className={`whitespace-nowrap shrink-0 pb-1 border-b-2 transition-colors ${
                activeTab === 'optimizer'
                  ? 'border-emerald-600 text-emerald-800 font-semibold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              حاسبة القفة
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`whitespace-nowrap shrink-0 pb-1 border-b-2 transition-colors ${
                activeTab === 'reports'
                  ? 'border-emerald-600 text-emerald-800 font-semibold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              رصد الميدان
            </button>
          </nav>

          {/* Zone 3: Actions, Alerts, and Basket */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Smart Market Alerts Bell */}
            <button
              onClick={onOpenAlertsDrawer}
              className="relative p-2 text-slate-600 hover:text-emerald-800 hover:bg-slate-100 rounded-lg transition-colors"
              title="تنبيهات الأسواق والوفرة"
            >
              <Bell className="w-5 h-5" />
              {alertCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-600 text-white font-mono text-[10px] font-bold rounded-full flex items-center justify-center">
                  {alertCount}
                </span>
              )}
            </button>

            {basketCount > 0 && (
              <button
                onClick={() => setActiveTab('optimizer')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-emerald-900 bg-emerald-50 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors whitespace-nowrap shrink-0"
              >
                <ShoppingCart className="w-4 h-4 text-emerald-700" />
                <span className="hidden sm:inline">السلة</span>
                <span className="font-mono tabular-nums px-1.5 py-0.2 bg-emerald-600 text-white rounded text-xs font-semibold">
                  {basketCount}
                </span>
              </button>
            )}

            <button
              onClick={onOpenReportModal}
              className="px-3.5 py-2 text-xs font-medium text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 transition-colors whitespace-nowrap shrink-0 shadow-sm"
            >
              إبلاغ عن سعر
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="flex lg:hidden border-t border-slate-100 bg-slate-50 px-2 py-1.5 overflow-x-auto gap-1.5 scrollbar-none">
        <button
          onClick={() => setActiveTab('monitor')}
          className={`px-2.5 py-1 text-xs rounded-md whitespace-nowrap ${
            activeTab === 'monitor' ? 'bg-white text-emerald-700 shadow-sm font-semibold' : 'text-slate-600'
          }`}
        >
          رصد الأسعار
        </button>
        <button
          onClick={() => setActiveTab('geomap')}
          className={`px-2.5 py-1 text-xs rounded-md whitespace-nowrap flex items-center gap-1 ${
            activeTab === 'geomap' ? 'bg-red-50 text-red-700 shadow-sm font-bold border border-red-200' : 'text-slate-600'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
          <span>الخريطة الميدانية</span>
        </button>
        <button
          onClick={() => setActiveTab('producers')}
          className={`px-2.5 py-1 text-xs rounded-md whitespace-nowrap ${
            activeTab === 'producers' ? 'bg-white text-emerald-700 shadow-sm font-semibold' : 'text-slate-600'
          }`}
        >
          المنتج المحلي
        </button>
        <button
          onClick={() => setActiveTab('receipt_scanner')}
          className={`px-2.5 py-1 text-xs rounded-md whitespace-nowrap ${
            activeTab === 'receipt_scanner' ? 'bg-white text-emerald-700 shadow-sm font-semibold' : 'text-slate-600'
          }`}
        >
          فحص الفاتورة
        </button>
        <button
          onClick={() => setActiveTab('advisor')}
          className={`px-2.5 py-1 text-xs rounded-md whitespace-nowrap ${
            activeTab === 'advisor' ? 'bg-white text-emerald-700 shadow-sm font-semibold' : 'text-slate-600'
          }`}
        >
          المستشار الذكي
        </button>
        <button
          onClick={() => setActiveTab('optimizer')}
          className={`px-2.5 py-1 text-xs rounded-md whitespace-nowrap ${
            activeTab === 'optimizer' ? 'bg-white text-emerald-700 shadow-sm font-semibold' : 'text-slate-600'
          }`}
        >
          حاسبة القفة
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-2.5 py-1 text-xs rounded-md whitespace-nowrap ${
            activeTab === 'reports' ? 'bg-white text-emerald-700 shadow-sm font-semibold' : 'text-slate-600'
          }`}
        >
          رصد الميدان
        </button>
      </div>
    </header>
  );
};
