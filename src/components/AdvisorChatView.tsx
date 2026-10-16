import React, { useState } from 'react';
import { WilayaData, ProductItem, DEFAULT_WILAYAS } from '../types/index.ts';
import { Sparkles, Send, MapPin, Users, Coins, HelpCircle, Plus, Check } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  wilaya?: string;
  relatedProducts?: ProductItem[];
  timestamp: string;
}

interface AdvisorChatViewProps {
  wilayas: WilayaData[];
  selectedWilaya: string;
  setSelectedWilaya: (code: string) => void;
  onAddToBasket: (product: ProductItem) => void;
  initialQuery?: string;
}

export const AdvisorChatView: React.FC<AdvisorChatViewProps> = ({
  wilayas,
  selectedWilaya,
  setSelectedWilaya,
  onAddToBasket,
  initialQuery = '',
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `مرحباً بك في **مستشار المواطن الذكي** للاستهلاك وتدبير الميزانية بالدينار الجزائري (DZD).
أنا هنا لمساعدتك على:
1. تخطيط مشتريات القفة العائلية بأفضل توزيع للميزانية.
2. اقتراح بدائل غذائية وطنية أوفر تحافظ على نفس القيمة الغذائية وتخفض الفاتورة بنسبة 30% إلى 70%.
3. التحقق من الأسعار المسقفة قانونياً (الزيت، الحليب، السكر، السميد، بقوليات الديوان).
4. دلك على نقاط البيع التضامنية وأسواق الرحمة في ولايتك.

اكتب سؤالك أو اختر أحد الاستفسارات الشائعة أدناه:`,
      timestamp: new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputQuery, setInputQuery] = useState<string>(initialQuery);
  const [familySize, setFamilySize] = useState<number>(4);
  const [budget, setBudget] = useState<string>('5000');
  const [loading, setLoading] = useState<boolean>(false);
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  const activeWilayas = wilayas && wilayas.length > 0 ? wilayas : DEFAULT_WILAYAS;
  const currentWilaya = activeWilayas.find((w) => w.code === selectedWilaya) || activeWilayas[0];

  const quickPrompts = [
    `عندي ميزانية 4000 د.ج، كيف نوزع قفة أسبوع لعائلة من 4 أفراد في ${currentWilaya.nameAr}؟`,
    `ما هي المواد المسقفة قانونياً في الجزائر وما هي أسعارها المحددة؟`,
    `ما هي أفضل بدائل اللحوم الحمراء الأوفر بالدينار الجزائري؟`,
    `أين أجد نقاط بيع دجاج أوناب وبقوليات الديوان OAIC في ${currentWilaya.nameAr}؟`,
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || inputQuery).trim();
    if (!textToSend || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      wilaya: currentWilaya.nameAr,
      timestamp: new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai_service/advisor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: textToSend,
          wilaya: currentWilaya.nameAr,
          familySize: familySize,
          budget: budget ? Number(budget) : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('فشل الاتصال بخدمة المستشار الذكي');
      }

      const data = await response.json();

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.aiAdviceText || 'عذراً، لم أتمكن من استخراج التوصية في الوقت الحالي.',
        wilaya: currentWilaya.nameAr,
        relatedProducts: data.relatedProducts,
        timestamp: new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: unknown) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: 'حدث خطأ مؤقت أثناء معالجة الاستشارة. يرجى إعادة المحاولة أو التحقق من البيانات المحلية.',
        timestamp: new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = (product: ProductItem) => {
    onAddToBasket(product);
    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }));
    }, 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Advisor Header & Profile Settings */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-lg">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <h2>مستشار الاستهلاك والبدائل الهجين</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              مدعوم بنموذج الذكاء الاصطناعي مع ربط حي بقاعدة بيانات الأسعار التموينية الجزائرية.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">الولاية المعتمدة للاستشارة:</span>
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <select
                value={selectedWilaya}
                onChange={(e) => setSelectedWilaya(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none"
              >
                {activeWilayas.map((w) => (
                  <option key={w.code} value={w.code}>
                    ولاية {w.nameAr}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* User Context Toggles (Family Size & Budget) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <Users className="w-4 h-4 text-slate-500" />
            <span className="text-slate-600">أفراد الأسرة:</span>
            <div className="flex items-center gap-1 mr-auto font-mono">
              {[2, 4, 6, 8].map((size) => (
                <button
                  key={size}
                  onClick={() => setFamilySize(size)}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    familySize === size
                      ? 'bg-emerald-700 text-white font-bold'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <Coins className="w-4 h-4 text-slate-500" />
            <span className="text-slate-600">ميزانية تقريبية:</span>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="5000"
              className="w-24 px-2 py-1 bg-white border border-slate-200 rounded text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <span className="text-slate-500 font-semibold">د.ج</span>
          </div>
        </div>
      </div>

      {/* Quick Prompts Strip */}
      <div className="mb-6">
        <div className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>استفسارات استهلاكية شائعة للمواطن:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="text-right text-xs bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 border border-slate-200 hover:border-emerald-300 py-1.5 px-3 rounded-lg transition-colors leading-relaxed"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="space-y-4 mb-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-4 rounded-xl border leading-relaxed text-sm ${
              msg.sender === 'user'
                ? 'bg-emerald-800 text-white border-emerald-900 mr-8 sm:mr-16'
                : 'bg-white text-slate-800 border-slate-200 ml-4 sm:ml-12 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-2 opacity-80 border-b border-black/5 pb-1">
              <span className="font-semibold">
                {msg.sender === 'user' ? 'استفسار المواطن' : 'المستشار الذكي لمنصة المواطن'}
              </span>
              <span className="font-mono tabular-nums">{msg.timestamp}</span>
            </div>

            {/* Markdown-style content rendering */}
            <div className="whitespace-pre-line text-xs sm:text-sm space-y-2">
              {msg.text}
            </div>

            {/* Related Product Cards (if provided by advisor response) */}
            {msg.relatedProducts && msg.relatedProducts.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="text-xs font-semibold text-slate-700 mb-2">
                  سلع مقترحة ذات صلة باستشارتك:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {msg.relatedProducts.map((p) => {
                    const isAdded = Boolean(addedIds[p.id]);
                    return (
                      <div
                        key={p.id}
                        className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-800">{p.name}</div>
                          <div className="text-[11px] text-emerald-700 font-mono tabular-nums">
                            {p.rahmaMarketPrice} د.ج في التعاونيات (مسقف: {p.priceCeiling || 'حر'} د.ج)
                          </div>
                        </div>

                        <button
                          onClick={() => handleAddProduct(p)}
                          className={`p-1.5 rounded-md transition-colors ${
                            isAdded
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white text-slate-700 border border-slate-200 hover:bg-emerald-50 hover:text-emerald-800'
                          }`}
                          title="إضافة للقفة"
                        >
                          {isAdded ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="bg-white p-4 rounded-xl border border-slate-200 ml-4 sm:ml-12 shadow-xs">
            <div className="flex items-center gap-2 text-xs text-emerald-700 font-medium animate-pulse">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>جاري تحليل الأسواق والأسعار المسقفة وبناء التوصية الاستهلاكية...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm sticky bottom-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder={`اكتب سؤالك أو استفسارك عن أسعار السلع في ${currentWilaya.nameAr}...`}
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            disabled={loading}
            className="flex-1 py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || loading}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            <span>إرسال</span>
            <Send className="w-3.5 h-3.5 rotate-180" />
          </button>
        </form>
      </div>
    </div>
  );
};
