import React from 'react';
import { PlatformStats, ActiveTab } from '../types/index.ts';
import { ArrowLeft, TrendingDown, ShieldCheck, Store, Sparkles } from 'lucide-react';

interface HeroBannerProps {
  stats: PlatformStats | null;
  setActiveTab: (tab: ActiveTab) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ stats, setActiveTab }) => {
  return (
    <section className="relative overflow-hidden bg-slate-900 text-white rounded-2xl mx-4 sm:mx-6 lg:mx-8 my-6 border border-slate-800 shadow-sm">
      {/* Background Image with Measured Scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/citizen_market_hero_1792145218066.jpg"
          alt="سوق شعبي جزائري للمواد الاستهلاكية والخضر"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center opacity-30"
          onError={(e) => {
            // Graceful fallback if image cannot load
            e.currentTarget.style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-slate-900/40" />
      </div>

      <div className="relative z-10 px-6 py-10 sm:px-10 sm:py-14 max-w-5xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-950/70 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs font-medium mb-4">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>المرصد الوطني لحماية القدرة الشرائية والمستهلك الجزائري</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight text-balance">
          نظام هجين ذكي لرصد الأسعار، حماية القفة، وتوفير بدائل استهلاك أوفر
        </h1>

        <p className="text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed mb-8">
          قارن أسعار السلع التموينية بين محلات التجزئة وأسواق الرحمة والتعاونيات الوطنية بالدينار الجزائري، واحصل على استشارات فورية ومخطط تسوق مخصص لميزانية أسرتك.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 mb-10">
          <button
            onClick={() => setActiveTab('monitor')}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
          >
            <span>استعراض جدول الأسعار والبدائل</span>
            <ArrowLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveTab('geomap')}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-600/90 hover:bg-red-600 text-white text-sm font-bold rounded-lg transition-colors shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span>خريطة التجاوزات والبؤر (GIS)</span>
          </button>

          <button
            onClick={() => setActiveTab('advisor')}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>استشارة المستشار الذكي</span>
          </button>

          <button
            onClick={() => setActiveTab('optimizer')}
            className="px-5 py-2.5 bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-sm font-medium rounded-lg border border-slate-700 transition-colors"
          >
            حساب سلة التموين العائلية
          </button>
        </div>

        {/* Essential Regulated Price Ticker */}
        <div className="p-4 bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-800">
          <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2.5 flex items-center justify-between">
            <span>الأسعار المسقفة قانونياً والمحمية بالدينار الجزائري (DZD)</span>
            <span className="text-slate-400 font-normal">مرسوم تنفيذي لحماية المستهلك</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50">
              <span className="text-slate-400 block mb-0.5">زيت المائدة 5 لتر</span>
              <span className="font-mono tabular-nums text-white font-bold text-sm">650 د.ج</span>
              <span className="text-emerald-400 text-[11px] block mt-0.5">سعر مسقف رسمي</span>
            </div>

            <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50">
              <span className="text-slate-400 block mb-0.5">حليب مبستر أكياس</span>
              <span className="font-mono tabular-nums text-white font-bold text-sm">25 د.ج</span>
              <span className="text-emerald-400 text-[11px] block mt-0.5">مدعم كلياً (جيبلي)</span>
            </div>

            <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50">
              <span className="text-slate-400 block mb-0.5">سكر أبيض 1 كغ</span>
              <span className="font-mono tabular-nums text-white font-bold text-sm">95 د.ج</span>
              <span className="text-emerald-400 text-[11px] block mt-0.5">سقف محدد</span>
            </div>

            <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50">
              <span className="text-slate-400 block mb-0.5">عدس الديوان OAIC</span>
              <span className="font-mono tabular-nums text-white font-bold text-sm">140 د.ج</span>
              <span className="text-emerald-400 text-[11px] block mt-0.5">تعاونيات الحبوب</span>
            </div>
          </div>
        </div>

        {/* Quantitative Proof Strip */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-slate-800/80">
            <div>
              <div className="text-2xl font-bold font-mono tabular-nums text-white">
                {stats.totalTrackedCommodities} سلع
              </div>
              <div className="text-xs text-slate-400 mt-1">متابعة يومية بالدينار</div>
            </div>

            <div>
              <div className="text-2xl font-bold font-mono tabular-nums text-emerald-400 flex items-center gap-1">
                <span>{stats.averagePotentialSavingPercent}%</span>
                <TrendingDown className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-xs text-slate-400 mt-1">متوسط نسبة التوفير بالبدائل</div>
            </div>

            <div>
              <div className="text-2xl font-bold font-mono tabular-nums text-white flex items-center gap-1">
                <Store className="w-5 h-5 text-slate-400" />
                <span>{stats.activeRahmaAndCoopMarkets} نقطة</span>
              </div>
              <div className="text-xs text-slate-400 mt-1">أسواق رحمة ومنافذ عمومية</div>
            </div>

            <div>
              <div className="text-2xl font-bold font-mono tabular-nums text-white">
                {stats.coveredWilayasCount} ولاية
              </div>
              <div className="text-xs text-slate-400 mt-1">تغطية شبكة الأسعار المحلية</div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
