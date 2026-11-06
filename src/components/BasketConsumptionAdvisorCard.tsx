import React, { useState } from 'react';
import { BasketItem, ProductItem } from '../types/index.ts';
import {
  ShoppingBag,
  TrendingDown,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  ArrowDownRight,
  ChevronDown,
  ChevronUp,
  Trash2,
  Plus,
  RefreshCw,
  Store,
  Coins,
  Check,
} from 'lucide-react';

interface BasketConsumptionAdvisorCardProps {
  customBasket: BasketItem[];
  selectedWilayaName: string;
  popularMarket?: string;
  familySize: number;
  budget: string;
  onAskAdvisorAboutBasket: (customQuery: string) => void;
  onRemoveFromBasket?: (productId: string) => void;
  onClearBasket?: () => void;
  onLoadSampleBasket?: () => void;
  onAddToBasket?: (product: ProductItem) => void;
}

// Generate item-level smart consumption advice tailored to Algerian consumer habits
function getItemConsumptionAdvice(item: BasketItem, familySize: number, wilayaName: string) {
  const p = item.product;
  const name = p.name.toLowerCase();
  const qty = item.quantity;

  if (name.includes('زيت')) {
    return {
      title: 'ترشيد استهلاك الزيت النباتي',
      advice: `قارورة 5 لتر تكفي أسرة من ${familySize} أفراد لنحو 25 إلى 30 يوماً عند اعتماد بخاخ الزيت والطهي في الفرن وتفادي القلي المتكرر (يوفر 20% شهرياً).`,
      actionTitle: 'نقطة الشراء المعتمدة',
      actionText: `سعر الزيت مسقف قانوناً بـ ${p.priceCeiling || 650} د.ج. تجنب الدكاكين التي تفرض بيعاً مشروطاً.`,
      marketRecommendation: `المساحات التجارية الكبرى ومنافذ التوزيع المباشرة في ${wilayaName}.`,
    };
  }

  if (name.includes('دجاج') || name.includes('لحم') || name.includes('بقر')) {
    return {
      title: 'تدبير البروتين الحيواني والبدائل',
      advice: `شراء دجاجة كاملة من نقاط أوناب وتقطيعها منزلياً يخفض الفاتورة بنسبة 35% مقارنة بشراء الصدور المنفصلة. كما يُنصح باستبدال وجبتين بالبقوليات أو سمك السردين لتوفير 1500+ د.ج أسبوعياً.`,
      actionTitle: 'بديل مباشر أوفر',
      actionText: `دجاج الديوان الوطني لتغذية الأنعام (ONAB) بسعر 360-380 د.ج/كغ بدلاً من لحوم الجزارة (2300 د.ج).`,
      marketRecommendation: `نقاط بيع مجمع أوناب (ONAB) المعتمدة في ولاية ${wilayaName}.`,
    };
  }

  if (name.includes('سميد') || name.includes('فرينة') || name.includes('طحين')) {
    return {
      title: 'حفظ وتدبير السميد والمخبوزات',
      advice: `اقتناء كيس 10 كغ أو 25 كغ من نقاط مجمع أغروديف أو التعاونيات يوفر 60 د.ج للكيس مقارنة بالتجزئة، وصناعة الخبز والكسرة منزلياً يوفر 45% من مصروف المخبزة.`,
      actionTitle: 'سعر مسقف ومدعم',
      actionText: `السميد الممتاز مدعم بسعر 450 د.ج/10 كغ. احفظه في مكان جاف ومحكم لمنع الرطوبة والتلف.`,
      marketRecommendation: `نقاط مجمع الصناعات الغذائية (Agrodive) في ${wilayaName}.`,
    };
  }

  if (name.includes('بطاطا') || name.includes('بصل') || name.includes('طماطم')) {
    return {
      title: 'حفظ الخضار الأساسية وتفادي التلف',
      advice: `شراء أكياس 5 إلى 10 كغ من سوق الجملة أو الرحمة يوفر 35 د.ج لكل كيلوغرام. احرص على فصل البطاطا عن البصل في مكان مظلم ومهوى لمنع التبرعم والعفن.`,
      actionTitle: 'الشراء من المصدر',
      actionText: `اقتناء الخضار في الصباح الباكر يضمن طزاجة عالية وأسعاراً تقارب سعر الحقل مباشرة.`,
      marketRecommendation: `أسواق الرحمة وسوق الفلاح الشعبي في ${wilayaName}.`,
    };
  }

  if (name.includes('حليب')) {
    return {
      title: 'إدارة استهلاك الحليب ومشتقاته',
      advice: `كيس الحليب المبستر مدعم بـ 25 د.ج. غليه وتبريده فوراً يحفظه لـ 3 أيام إضافية. في حال ندرته، مسحوق الحليب المحلي (بودرة) أوفر بكثير من عبوات الـ UHT المكلفة.`,
      actionTitle: 'الالتزام بالسعر المقنن',
      actionText: `السعر الرسمي لكيس 1 لتر هو 25 د.ج فقط ولا يحق للتاجر فرض شراء سلع أخرى معه.`,
      marketRecommendation: `موزعو ملبنة جيبلي (Giplait) والمحلات الملتزمة في ${wilayaName}.`,
    };
  }

  if (name.includes('عدس') || name.includes('لوبيا') || name.includes('حمص')) {
    return {
      title: 'البقوليات الجافة والبروتين النباتي',
      advice: `البقوليات مصدر بروتيني عالي الجودة قليل التكلفة. نقع الحبوب الجافة ليلة كاملة يقلل زمن الطهي واستهلاك الغاز بنسبة 40%.`,
      actionTitle: 'نقاط ديوان الحبوب',
      actionText: `بقوليات الديوان الوطني للحبوب (OAIC) معبأة ومسقفة بنصف تكلفة الماركات الأجنبية في محلات التجزئة.`,
      marketRecommendation: `تعاونية الحبوب والبقول الجافة (CCLS / OAIC) في ${wilayaName}.`,
    };
  }

  return {
    title: `ترشيد استهلاك ${p.name}`,
    advice: `اقتناء هذه المادة بحجم استهلاك عائلي مدروس (${qty} ${p.unit}) وتفضيل المنتجات الوطنية المحلية يمنحك نفس القيمة الاستهلاكية بتوفير 20% إلى 35%.`,
    actionTitle: 'مقارنة الأسعار',
    actionText: `متوسط سعر التجزئة ${p.averageRetailPrice} د.ج مقارنة بـ ${p.rahmaMarketPrice} د.ج في أسواق الرحمة.`,
    marketRecommendation: `أسواق الرحمة والتعاونيات في ${wilayaName}.`,
  };
}

export const BasketConsumptionAdvisorCard: React.FC<BasketConsumptionAdvisorCardProps> = ({
  customBasket,
  selectedWilayaName,
  popularMarket = 'سوق الرحمة المركزي',
  familySize,
  budget,
  onAskAdvisorAboutBasket,
  onRemoveFromBasket,
  onClearBasket,
  onLoadSampleBasket,
  onAddToBasket,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [showItemDetails, setShowItemDetails] = useState<boolean>(true);
  const [addedAltId, setAddedAltId] = useState<string | null>(null);

  // Financial calculations
  const totalRetail = customBasket.reduce(
    (sum, item) => sum + item.product.averageRetailPrice * item.quantity,
    0
  );
  const totalRahma = customBasket.reduce(
    (sum, item) => sum + item.product.rahmaMarketPrice * item.quantity,
    0
  );
  const totalSavings = Math.max(0, totalRetail - totalRahma);
  const savingsPercent = totalRetail > 0 ? Math.round((totalSavings / totalRetail) * 100) : 0;
  const itemCount = customBasket.reduce((sum, item) => sum + item.quantity, 0);

  // Handle asking the AI advisor specifically about this basket
  const handleConsultAI = () => {
    if (customBasket.length === 0) return;
    const basketNames = customBasket
      .map((item) => `${item.product.name} (عدد ${item.quantity} ${item.product.unit})`)
      .join('، ');

    const promptText = `حلل لي قفة التموين الخاصة بي في ولاية ${selectedWilayaName} المكونة من: [${basketNames}].
الميزانية المقدرة: ${budget || '5000'} د.ج لعائلة من ${familySize} أفراد.
قدم لي خطة ترشيد استهلاك عملية لتقليل الفاتورة وتوفير النفقات، وحدد لي البدائل الوطنية الأوفر ومواقع الشراء في ولايتي.`;

    onAskAdvisorAboutBasket(promptText);
  };

  const handleAddAlternative = (item: BasketItem) => {
    if (!item.product.alternatives || item.product.alternatives.length === 0 || !onAddToBasket) return;
    const alt = item.product.alternatives[0];

    const altProduct: ProductItem = {
      ...item.product,
      id: `alt-${alt.id}-${Date.now()}`,
      name: alt.name,
      averageRetailPrice: alt.price,
      rahmaMarketPrice: alt.price,
      description: `بديل وطني أوفر لـ ${item.product.name} - ${alt.reason}`,
      alternatives: [],
    };

    onAddToBasket(altProduct);
    setAddedAltId(item.product.id);
    setTimeout(() => {
      setAddedAltId(null);
    }, 2500);
  };

  return (
    <div className="bg-white rounded-xl border border-emerald-200 shadow-sm overflow-hidden mb-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-xs border border-white/15 text-emerald-300">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg text-white">
                  مستشار قفة التموين الشخصية (customBasket)
                </h3>
                <span className="bg-emerald-500/30 text-emerald-200 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-emerald-400/30">
                  {customBasket.length > 0 ? `${customBasket.length} سلع (${itemCount} قطع)` : 'القفة فارغة'}
                </span>
              </div>
              <p className="text-xs text-emerald-100/80 mt-1">
                تحليل النفقات الاستهلاكية واقتراح بدائل فورية وترشيد ميزانية الأسرة في ولاية {selectedWilayaName}.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => setIsExpanded((prev) => !prev)}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors"
            >
              <span>{isExpanded ? 'طي نصائح القفة' : 'عرض نصائح القفة'}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Financial KPI Summary Bar */}
        {customBasket.length > 0 && isExpanded && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-3 border-t border-white/15">
            <div className="bg-white/10 backdrop-blur-xs rounded-lg p-2.5 border border-white/10">
              <span className="text-[11px] text-emerald-200/80 block">تكلفة القفة بالتجزئة:</span>
              <span className="text-sm sm:text-base font-bold font-mono text-white">
                {totalRetail.toLocaleString('ar-DZ')} د.ج
              </span>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-lg p-2.5 border border-white/10">
              <span className="text-[11px] text-emerald-200/80 block">سعر أسواق الرحمة:</span>
              <span className="text-sm sm:text-base font-bold font-mono text-emerald-300">
                {totalRahma.toLocaleString('ar-DZ')} د.ج
              </span>
            </div>

            <div className="bg-emerald-500/20 backdrop-blur-xs rounded-lg p-2.5 border border-emerald-400/40">
              <span className="text-[11px] text-emerald-200 block font-medium">مبلغ التوفير المحقق:</span>
              <div className="flex items-baseline gap-1">
                <span className="text-sm sm:text-base font-extrabold font-mono text-emerald-300">
                  {totalSavings.toLocaleString('ar-DZ')} د.ج
                </span>
                <span className="text-[10px] text-emerald-300 font-bold">({savingsPercent}%)</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-lg p-2.5 border border-white/10 flex flex-col justify-center">
              <button
                onClick={handleConsultAI}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold text-xs rounded-md shadow-xs transition-colors"
                title="توليد استشارة ذكية مخصصة للقفة"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>تحليل القفة بالمستشار ⚡</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Body Area */}
      {isExpanded && (
        <div className="p-4 sm:p-5">
          {customBasket.length === 0 ? (
            /* Empty Basket State */
            <div className="text-center py-6 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-300">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-3">
                <ShoppingBag className="w-6 h-6 text-emerald-700" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 mb-1">
                قفة التموين (customBasket) فارغة حالياً
              </h4>
              <p className="text-xs text-slate-600 max-w-md mx-auto mb-4 leading-relaxed">
                أضف السلع التي تشتريها عادة لأسرتك، وسيقوم المستشار الذكي بتحليلها وتقديم خطة ترشيد استهلاك مخصصة وبدائل وطنية أوفر توفر لك ما يصل إلى 40% من ميزانيتك.
              </p>

              {onLoadSampleBasket && (
                <button
                  onClick={onLoadSampleBasket}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>شحن قفة أسبوعية نموذجية للاختبار (زيت، دجاج، بطاطا، حليب، سميد)</span>
                </button>
              )}
            </div>
          ) : (
            /* Populated Basket State with Itemized Tips */
            <div>
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span>نصائح استهلاك وتوفير مخصصة لكل سلعة في قفتك:</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowItemDetails((prev) => !prev)}
                    className="text-slate-600 hover:text-emerald-700 font-semibold"
                  >
                    {showItemDetails ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
                  </button>
                  {onClearBasket && (
                    <button
                      onClick={onClearBasket}
                      className="text-rose-600 hover:text-rose-700 flex items-center gap-1 font-semibold mr-2 border-r border-slate-200 pr-2"
                      title="إفراغ القفة"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>إفراغ</span>
                    </button>
                  )}
                </div>
              </div>

              {showItemDetails && (
                <div className="space-y-3 mb-4">
                  {customBasket.map((item) => {
                    const advice = getItemConsumptionAdvice(item, familySize, selectedWilayaName);
                    const prod = item.product;
                    const itemRetail = prod.averageRetailPrice * item.quantity;
                    const itemRahma = prod.rahmaMarketPrice * item.quantity;
                    const itemSavings = Math.max(0, itemRetail - itemRahma);
                    const hasAlternative = prod.alternatives && prod.alternatives.length > 0;
                    const alt = hasAlternative ? prod.alternatives[0] : null;
                    const isAltAdded = addedAltId === prod.id;

                    return (
                      <div
                        key={prod.id}
                        className="bg-slate-50/80 rounded-xl border border-slate-200 p-3.5 hover:border-emerald-300 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">
                              {prod.name}
                            </span>
                            <span className="text-xs bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600 font-mono">
                              {item.quantity} {prod.unit}
                            </span>
                            {prod.priceCeiling && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                                <ShieldCheck className="w-3 h-3" />
                                <span>مسقف: {prod.priceCeiling} د.ج</span>
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-xs">
                            <div className="font-mono text-slate-600">
                              تجزئة: <span className="font-bold text-slate-800">{itemRetail} د.ج</span>
                            </div>
                            <div className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                              رحمة: {itemRahma} د.ج
                              {itemSavings > 0 && ` (توفير ${itemSavings} د.ج)`}
                            </div>
                            {onRemoveFromBasket && (
                              <button
                                onClick={() => onRemoveFromBasket(prod.id)}
                                className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                                title="إزالة من القفة"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Personalized Advice Body */}
                        <div className="bg-white p-3 rounded-lg border border-slate-200/80 space-y-2 text-xs">
                          <div className="flex items-start gap-2 text-slate-700">
                            <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            <div className="leading-relaxed">
                              <span className="font-bold text-slate-900 ml-1">{advice.title}:</span>
                              <span>{advice.advice}</span>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px]">
                            <div className="flex items-center gap-1.5 text-slate-600">
                              <Store className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="font-medium text-slate-800">أفضل منفذ في {selectedWilayaName}:</span>
                              <span className="text-slate-600">{advice.marketRecommendation}</span>
                            </div>

                            {/* Cheaper Alternative Quick Action */}
                            {hasAlternative && alt && (
                              <div className="flex items-center gap-2 mr-auto sm:mr-0">
                                <span className="text-emerald-700 font-semibold">
                                  بديل أوفر: {alt.name} ({alt.price} د.ج - وفر {alt.savingDzd} د.ج)
                                </span>
                                {onAddToBasket && (
                                  <button
                                    onClick={() => handleAddAlternative(item)}
                                    className={`px-2 py-1 rounded text-[11px] font-bold transition-colors flex items-center gap-1 ${
                                      isAltAdded
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    }`}
                                  >
                                    {isAltAdded ? (
                                      <>
                                        <Check className="w-3 h-3" />
                                        <span>أضيف للقفة!</span>
                                      </>
                                    ) : (
                                      <>
                                        <Plus className="w-3 h-3" />
                                        <span>إضافة البديل</span>
                                      </>
                                    )}
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Bottom Callout & Quick Action */}
              <div className="bg-emerald-50/80 rounded-xl p-3.5 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-emerald-900">
                  <Coins className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>
                    عند اعتماد خطة الشراء التضامنية لهذه القفة توفر ما مقداره{' '}
                    <strong className="text-emerald-800 font-bold">{totalSavings.toLocaleString('ar-DZ')} د.ج</strong>{' '}
                    من ميزانيتك المقدرة بـ {budget || '5000'} د.ج!
                  </span>
                </div>

                <button
                  onClick={handleConsultAI}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg shadow-xs transition-colors shrink-0 flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>طلب خطة استهلاك شاملة بالمستشار 🚀</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
