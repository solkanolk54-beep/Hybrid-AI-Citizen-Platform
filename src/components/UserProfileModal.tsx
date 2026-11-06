import React, { useState } from 'react';
import { CitizenProfile, WilayaData, DEFAULT_WILAYAS, CitizenRewardItem } from '../types/index.ts';
import {
  X,
  Award,
  Star,
  ShieldCheck,
  TrendingUp,
  MapPin,
  CheckCircle,
  Clock,
  Gift,
  Coins,
  Receipt,
  User,
  Edit2,
  Check,
  Sparkles,
  QrCode,
  Tag,
  ArrowUpRight,
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: CitizenProfile;
  wilayas: WilayaData[];
  onUpdateProfile: (updated: Partial<CitizenProfile>) => void;
  onRedeemReward: (rewardId: string) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  wilayas,
  onUpdateProfile,
  onRedeemReward,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'rewards' | 'history'>('overview');
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [nameInput, setNameInput] = useState<string>(profile.displayName);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const activeWilayas = wilayas && wilayas.length > 0 ? wilayas : DEFAULT_WILAYAS;
  const currentWilaya = activeWilayas.find((w) => w.code === profile.wilayaCode) || activeWilayas[0];

  const handleSaveName = () => {
    if (nameInput.trim()) {
      onUpdateProfile({ displayName: nameInput.trim() });
      setIsEditingName(false);
    }
  };

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const progressPercent = Math.min(
    100,
    Math.round((profile.totalPoints / (profile.nextTierPoints || 300)) * 100)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header Card */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-5 sm:p-6 shrink-0 relative">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pr-1">
            <div className="flex items-center gap-3.5">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-white/15 border-2 border-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
                  <User className="w-7 h-7 text-emerald-200" />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-900 p-1 rounded-full shadow-xs">
                  <Award className="w-3.5 h-3.5" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  {isEditingName ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        className="bg-white text-slate-900 px-2 py-1 rounded text-sm font-bold focus:outline-none w-36"
                        autoFocus
                      />
                      <button
                        onClick={handleSaveName}
                        className="p-1 bg-emerald-500 hover:bg-emerald-400 text-slate-900 rounded"
                        title="حفظ"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-black tracking-tight text-white">
                        {profile.displayName}
                      </h2>
                      <button
                        onClick={() => setIsEditingName(true)}
                        className="text-white/70 hover:text-white p-1"
                        title="تعديل الاسم المستعار"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${profile.tierBadgeColor} bg-white/10`}>
                    {profile.tier}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-emerald-100/90 mt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-300" />
                    <span>ولاية {profile.wilayaName}</span>
                  </span>
                  <span>•</span>
                  <span>مواطن رقابي نشط</span>
                </div>
              </div>
            </div>

            {/* Points Balance Pill */}
            <div className="bg-white/15 border border-white/20 backdrop-blur-md rounded-xl p-3 flex sm:flex-col items-center justify-between sm:items-end gap-1 shrink-0">
              <span className="text-[11px] text-emerald-200 font-medium">رصيد النقاط التراكمي:</span>
              <div className="flex items-center gap-1.5">
                <Star className="w-5 h-5 text-amber-300 fill-amber-300 animate-pulse" />
                <span className="text-2xl font-black font-mono tracking-tight text-white">
                  {profile.totalPoints}
                </span>
                <span className="text-xs text-emerald-200 font-bold">نقطة</span>
              </div>
            </div>
          </div>

          {/* Tier Progress Bar */}
          <div className="mt-4 pt-3 border-t border-white/15">
            <div className="flex items-center justify-between text-xs text-emerald-100 mb-1.5">
              <span>التقدم نحو الرتبة الأعلى: {profile.nextTierPoints} نقطة</span>
              <span className="font-mono font-bold">{progressPercent}%</span>
            </div>
            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-amber-300 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 sm:px-6 shrink-0 text-xs sm:text-sm font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 sm:px-4 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'border-emerald-700 text-emerald-800 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>نظرة عامة والإسهامات</span>
          </button>

          <button
            onClick={() => setActiveTab('rewards')}
            className={`py-3 px-3 sm:px-4 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'rewards'
                ? 'border-emerald-700 text-emerald-800 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Gift className="w-4 h-4 text-amber-500" />
            <span>متجر المكافآت ({profile.availableRewards.filter((r) => !r.redeemed).length})</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 px-3 sm:px-4 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'history'
                ? 'border-emerald-700 text-emerald-800 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4 text-slate-500" />
            <span>سجل النقاط ({profile.pointsHistory.length})</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* Contributions Statistics Grid */}
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  إحصائيات إسهاماتك الميدانية في حماية المستهلك
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-center">
                    <span className="block text-2xl font-black font-mono text-emerald-700 mb-1">
                      {profile.stats.reportsSubmitted}
                    </span>
                    <span className="text-xs font-semibold text-slate-600">بلاغات أسعار مرسلة</span>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 text-center">
                    <span className="block text-2xl font-black font-mono text-red-700 mb-1">
                      {profile.stats.violationsReported}
                    </span>
                    <span className="text-xs font-semibold text-red-900">مخالفات وأسعار مضخمة</span>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-center">
                    <span className="block text-2xl font-black font-mono text-amber-700 mb-1">
                      {profile.stats.verificationsConfirmed}
                    </span>
                    <span className="text-xs font-semibold text-amber-900">تأكيدات ميدانية للحي</span>
                  </div>

                  <div className="bg-teal-50 border border-teal-200 rounded-xl p-3.5 text-center">
                    <span className="block text-2xl font-black font-mono text-teal-700 mb-1">
                      {profile.stats.receiptsScanned}
                    </span>
                    <span className="text-xs font-semibold text-teal-900">تذاكر شراء مفحوصة (AI)</span>
                  </div>
                </div>
              </div>

              {/* How to Earn Points Section */}
              <div className="bg-gradient-to-br from-slate-50 to-emerald-50/40 rounded-xl border border-emerald-200/80 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  <h4 className="text-sm font-bold text-slate-800">
                    دليل جمع النقاط والمكافآت على المنصة
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-700 font-medium">التبليغ عن مخالفة وسعر غير قانوني بالخريطة:</span>
                    <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      +50 نقطة
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-700 font-medium">إبلاغ ورصد سعر سلعة في السوق:</span>
                    <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      +25 نقطة
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-700 font-medium">فحص وتحليل تذكرة شراء بالذكاء الاصطناعي:</span>
                    <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      +20 نقطة
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-700 font-medium">تأكيد صحة بلاغ ميداني من جيران الحي:</span>
                    <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      +15 نقطة
                    </span>
                  </div>
                </div>
              </div>

              {/* Wilaya Preferences */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-slate-800 block">ولايتك المفضلة للمتابعة والرصد:</span>
                  <span className="text-slate-500">يتم توجيه البلاغات والتنبيهات الميدانية حسب هذه الولاية.</span>
                </div>
                <select
                  value={profile.wilayaCode}
                  onChange={(e) => {
                    const w = activeWilayas.find((item) => item.code === e.target.value);
                    if (w) {
                      onUpdateProfile({ wilayaCode: w.code, wilayaName: w.nameAr });
                    }
                  }}
                  className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {activeWilayas.map((w) => (
                    <option key={w.code} value={w.code}>
                      ولاية {w.nameAr}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {activeTab === 'rewards' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    مكافآت وقسائم الشراء التضامنية
                  </h3>
                  <p className="text-xs text-slate-500">
                    استبدل نقاطك الرقابية بقسائم تخفيض حقيقية ومزايا تضامنية لدى شركاء المنصة.
                  </p>
                </div>
                <div className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  رصيدك: {profile.totalPoints} نقطة
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {profile.availableRewards.map((reward) => {
                  const canRedeem = profile.totalPoints >= reward.pointsCost && !reward.redeemed;

                  return (
                    <div
                      key={reward.id}
                      className={`p-4 rounded-xl border transition-all ${
                        reward.redeemed
                          ? 'bg-slate-50 border-slate-200 opacity-90'
                          : canRedeem
                          ? 'bg-white border-emerald-300 shadow-xs hover:border-emerald-500'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div
                            className={`p-2.5 rounded-xl shrink-0 ${
                              reward.redeemed
                                ? 'bg-slate-200 text-slate-600'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            <Gift className="w-5 h-5" />
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-slate-900">
                                {reward.title}
                              </h4>
                              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                {reward.discountValue}
                              </span>
                            </div>

                            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                              {reward.description}
                            </p>

                            <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500">
                              <span className="font-medium text-slate-700">الشريك: {reward.partner}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0">
                          <div className="font-mono text-xs font-bold text-emerald-700">
                            {reward.pointsCost} نقطة
                          </div>

                          {reward.redeemed ? (
                            <div className="flex flex-col items-end gap-1">
                              <span className="text-[11px] font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded">
                                تم الاستبدال ✓
                              </span>
                              {reward.couponCode && (
                                <button
                                  onClick={() => handleCopyCoupon(reward.couponCode!)}
                                  className="text-[11px] font-mono font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded"
                                  title="نسخ رمز القسيمة"
                                >
                                  <span>{reward.couponCode}</span>
                                  {copiedCode === reward.couponCode ? (
                                    <Check className="w-3 h-3 text-emerald-600" />
                                  ) : (
                                    <Tag className="w-3 h-3" />
                                  )}
                                </button>
                              )}
                            </div>
                          ) : (
                            <button
                              onClick={() => onRedeemReward(reward.id)}
                              disabled={!canRedeem}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                                canRedeem
                                  ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                              }`}
                            >
                              {canRedeem ? 'استبدال المكافأة' : `تحتاج ${reward.pointsCost - profile.totalPoints} نقطة`}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-slate-900">
                  سجل الحركات والنقاط المكتسبة
                </h3>
                <span className="text-xs text-slate-500">
                  إجمالي الحركات: {profile.pointsHistory.length}
                </span>
              </div>

              {profile.pointsHistory.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  لا توجد حركات مسجلة بعد. ابدأ بالإبلاغ أو فحص الفواتير لجمع نقاطك الأولى!
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                  {profile.pointsHistory.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 shrink-0">
                          {item.points > 0 ? (
                            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Gift className="w-4 h-4 text-amber-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{item.action}</div>
                          <div className="text-slate-500 text-[11px] mt-0.5">
                            {item.description}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1 font-mono">
                            {new Date(item.timestamp).toLocaleDateString('ar-DZ', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      </div>

                      <div
                        className={`font-mono font-bold text-sm shrink-0 ${
                          item.points > 0 ? 'text-emerald-700' : 'text-amber-700'
                        }`}
                      >
                        {item.points > 0 ? `+${item.points}` : item.points} نقطة
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            نظام النقاط والمكافآت التشاركي — منصة المواطن الهجينة 🇩🇿
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-lg transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
