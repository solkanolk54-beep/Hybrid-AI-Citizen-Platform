import React from 'react';
import { ActiveTab } from '../types/index.ts';
import { ShieldCheck } from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab }) => {
  return (
    <footer className="mt-16 bg-white border-t border-slate-200 py-8 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span className="font-semibold text-slate-700">
              منصة المواطن الهجينة الذكية — رصد الأسعار والاستهلاك المحلي
            </span>
          </div>

          <nav className="flex items-center gap-4 text-xs">
            <button
              onClick={() => setActiveTab('monitor')}
              className="hover:text-slate-900 transition-colors"
            >
              رصد السلع
            </button>
            <span>·</span>
            <button
              onClick={() => setActiveTab('advisor')}
              className="hover:text-slate-900 transition-colors"
            >
              المستشار الذكي
            </button>
            <span>·</span>
            <button
              onClick={() => setActiveTab('optimizer')}
              className="hover:text-slate-900 transition-colors"
            >
              حاسبة القفة
            </button>
            <span>·</span>
            <button
              onClick={() => setActiveTab('reports')}
              className="hover:text-slate-900 transition-colors"
            >
              بلاغات الأسعار
            </button>
          </nav>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
          <div>
            البيانات والأسعار المرجعية بالدينار الجزائري (DZD) محينة وفق قوانين حماية المستهلك وأسواق الرحمة والتعاونيات الوطنية.
          </div>
          <div>النواة الأولى MVP — جميع الحقوق محفوظة لخدمة المواطن</div>
        </div>
      </div>
    </footer>
  );
};
