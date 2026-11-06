/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ProductItem,
  WilayaData,
  PlatformStats,
  CitizenPriceReport,
  BasketItem,
  ActiveTab,
  DEFAULT_WILAYAS,
  ProducerOffer,
  MarketAlert,
  GeoMapResponse,
  GeoReportPoint,
  CitizenProfile,
  CitizenPointsHistory,
  CitizenRewardItem,
} from './types/index.ts';
import { Header } from './components/Header.tsx';
import { HeroBanner } from './components/HeroBanner.tsx';
import { PriceMonitorView } from './components/PriceMonitorView.tsx';
import { GeoMapView } from './components/GeoMapView.tsx';
import { ProducerDirectView } from './components/ProducerDirectView.tsx';
import { ReceiptScannerView } from './components/ReceiptScannerView.tsx';
import { AdvisorChatView } from './components/AdvisorChatView.tsx';
import { BasketOptimizerView } from './components/BasketOptimizerView.tsx';
import { FieldReportsView } from './components/FieldReportsView.tsx';
import { ReportModal } from './components/ReportModal.tsx';
import { GeoReportModal } from './components/GeoReportModal.tsx';
import { ProducerOfferModal } from './components/ProducerOfferModal.tsx';
import { SmartAlertsDrawer } from './components/SmartAlertsDrawer.tsx';
import { UserProfileModal } from './components/UserProfileModal.tsx';
import { Footer } from './components/Footer.tsx';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const CITIZEN_PROFILE_STORAGE_KEY = 'aesip_citizen_profile_v2';

const DEFAULT_CITIZEN_PROFILE: CitizenProfile = {
  id: 'cit-dz-user-1',
  displayName: 'مواطن راصد',
  wilayaCode: '16',
  wilayaName: 'الجزائر العاصمة',
  phoneOrAlias: 'هوية رقابية مشفرة',
  totalPoints: 125,
  tier: 'مواطن يقظ',
  tierBadgeColor: 'border-emerald-300 text-emerald-800 bg-emerald-50',
  nextTierPoints: 250,
  stats: {
    reportsSubmitted: 3,
    violationsReported: 1,
    verificationsConfirmed: 4,
    receiptsScanned: 2,
  },
  availableRewards: [
    {
      id: 'rew-onab-300',
      title: 'قسيمة تخفيض 300 د.ج لدى نقاط مجمع أوناب (ONAB)',
      partner: 'الديوان الوطني لتغذية الأنعام (ONAB)',
      discountValue: 'خصم 300 د.ج',
      pointsCost: 100,
      category: 'discount',
      description: 'صالحة لشراء الدجاج الطازج المذبوح أو البيض من جميع نقاط البيع التابعة للمجمع.',
      redeemed: false,
      couponCode: 'ONAB-DZ-7419',
    },
    {
      id: 'rew-rahma-500',
      title: 'قسيمة تموين 500 د.ج بأسواق الرحمة والتضامن',
      partner: 'أسواق الرحمة والتعاونيات الوطنية',
      discountValue: 'خصم 500 د.ج',
      pointsCost: 200,
      category: 'discount',
      description: 'تخفيض مباشر على قفة الخضر والمواد الأساسية في أسواق الرحمة المعتمدة بولايتك.',
      redeemed: false,
      couponCode: 'RAHMA-DZ-3891',
    },
    {
      id: 'rew-sms-alerts',
      title: 'اشتراك أولوية التنبيهات الفورية (SMS Alerts)',
      partner: 'منصة المواطن الهجينة',
      discountValue: 'خدمة مجانية',
      pointsCost: 80,
      category: 'sms_alerts',
      description: 'استقبال رسائل تنبيه عاجلة فور توفر سلع نادرة أو أسعار استثنائية في بلديتك.',
      redeemed: false,
      couponCode: 'ALERTS-VIP-2026',
    },
    {
      id: 'rew-trust-badge',
      title: 'وسام المواطن الرقابي الموثوق (Trust Verification)',
      partner: 'مديريات التجارة وقمع الغش',
      discountValue: 'أولوية رقابية',
      pointsCost: 250,
      category: 'recognition',
      description: 'منح بلاغاتك الميدانية أولوية التحقيق والتدخل الفوري من قبل فرق الرقابة وقمع الغش.',
      redeemed: false,
      couponCode: 'VERIFIED-CIT-01',
    },
  ],
  pointsHistory: [
    {
      id: 'hist-init',
      action: 'مكافأة الانضمام للمنصة',
      points: 50,
      description: 'هدية ترحيبية لتفعيل حساب الرقابة المجتمعية التشاركية.',
      timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
      type: 'market_update',
    },
    {
      id: 'hist-rep-1',
      action: 'رصد سعر مائدة محلي',
      points: 25,
      description: 'إرسال رصد ميداني لسعر البطاطا والزيت في دكان الحي.',
      timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
      type: 'report_price',
    },
    {
      id: 'hist-conf-1',
      action: 'تأكيد بلاغ في بلدية الحراش',
      points: 15,
      description: 'تأكيد وجود البيع المشروط على الحليب والزيت لمساعدة الجيران.',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      type: 'confirm_report',
    },
    {
      id: 'hist-geo-1',
      action: 'رصد بؤرة تضخيم غير قانوني',
      points: 50,
      description: 'تسجيل بلاغ جغرافي موثق بإحداثيات GPS عن سقف سعر السميد.',
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
      type: 'report_violation',
    },
    {
      id: 'hist-scan-1',
      action: 'فحص فاتورة شراء بالذكاء الاصطناعي',
      points: 20,
      description: 'مسح تذكرة سوبرماركت واكتشاف زيادة في أسعار الطماطم المصبرة.',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      type: 'scan_receipt',
    },
  ],
};

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('monitor');
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [wilayas, setWilayas] = useState<WilayaData[]>(DEFAULT_WILAYAS);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [reports, setReports] = useState<CitizenPriceReport[]>([]);
  const [producerOffers, setProducerOffers] = useState<ProducerOffer[]>([]);
  const [alerts, setAlerts] = useState<MarketAlert[]>([]);
  const [geoData, setGeoData] = useState<GeoMapResponse | null>(null);
  const [selectedWilaya, setSelectedWilaya] = useState<string>('16'); // 16 = الجزائر العاصمة default
  const [customBasket, setCustomBasket] = useState<BasketItem[]>([]);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isGeoReportModalOpen, setIsGeoReportModalOpen] = useState<boolean>(false);
  const [geoModalInitialCoords, setGeoModalInitialCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isProducerModalOpen, setIsProducerModalOpen] = useState<boolean>(false);
  const [isAlertsDrawerOpen, setIsAlertsDrawerOpen] = useState<boolean>(false);
  const [advisorInitialQuery, setAdvisorInitialQuery] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Citizen Profile & Rewards Points System State
  const [citizenProfile, setCitizenProfile] = useState<CitizenProfile>(() => {
    try {
      const saved = localStorage.getItem(CITIZEN_PROFILE_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_CITIZEN_PROFILE;
  });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem(CITIZEN_PROFILE_STORAGE_KEY, JSON.stringify(citizenProfile));
    } catch (e) {
      console.error(e);
    }
  }, [citizenProfile]);

  const awardCitizenPoints = (
    amount: number,
    action: string,
    type: CitizenPointsHistory['type'],
    description: string
  ) => {
    setCitizenProfile((prev) => {
      const newTotal = prev.totalPoints + amount;

      let tier = prev.tier;
      let badgeColor = prev.tierBadgeColor;
      let nextTierPoints = prev.nextTierPoints;

      if (newTotal >= 400) {
        tier = 'حارس القدرة الشرائية';
        badgeColor = 'border-purple-300 text-purple-800 bg-purple-50';
        nextTierPoints = 1000;
      } else if (newTotal >= 250) {
        tier = 'مراقب مجتمعي متميز';
        badgeColor = 'border-teal-300 text-teal-800 bg-teal-50';
        nextTierPoints = 400;
      } else if (newTotal >= 100) {
        tier = 'مواطن يقظ';
        badgeColor = 'border-emerald-300 text-emerald-800 bg-emerald-50';
        nextTierPoints = 250;
      }

      const newHistoryItem: CitizenPointsHistory = {
        id: `pts-${Date.now()}`,
        action,
        points: amount,
        description,
        timestamp: new Date().toISOString(),
        type,
      };

      const newStats = { ...prev.stats };
      if (type === 'report_price') newStats.reportsSubmitted += 1;
      if (type === 'report_violation') newStats.violationsReported += 1;
      if (type === 'confirm_report') newStats.verificationsConfirmed += 1;
      if (type === 'scan_receipt') newStats.receiptsScanned += 1;

      return {
        ...prev,
        totalPoints: newTotal,
        tier,
        tierBadgeColor: badgeColor,
        nextTierPoints,
        pointsHistory: [newHistoryItem, ...prev.pointsHistory],
        stats: newStats,
      };
    });

    showToast(`🎉 مكافأة المواطن: تم إضافة +${amount} نقطة لرصيدك! (${action})`);
  };

  const handleRedeemReward = (rewardId: string) => {
    setCitizenProfile((prev) => {
      const reward = prev.availableRewards.find((r) => r.id === rewardId);
      if (!reward || prev.totalPoints < reward.pointsCost || reward.redeemed) return prev;

      const updatedRewards = prev.availableRewards.map((r) =>
        r.id === rewardId ? { ...r, redeemed: true } : r
      );

      const historyItem: CitizenPointsHistory = {
        id: `pts-redeem-${Date.now()}`,
        action: `استبدال مكافأة: ${reward.title}`,
        points: -reward.pointsCost,
        description: `تم توليد رمز القسيمة بنجاح (${reward.couponCode || 'PROMO-DZ'})`,
        timestamp: new Date().toISOString(),
        type: 'market_update',
      };

      return {
        ...prev,
        totalPoints: prev.totalPoints - reward.pointsCost,
        availableRewards: updatedRewards,
        pointsHistory: [historyItem, ...prev.pointsHistory],
      };
    });
    showToast('🎉 تهانينا! تم استبدال المكافأة وتفعيل قسيمتك بنجاح!');
  };

  const handleUpdateProfile = (updated: Partial<CitizenProfile>) => {
    setCitizenProfile((prev) => ({ ...prev, ...updated }));
    showToast('تم تحديث بيانات الملف الشخصي بنجاح.');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Initial data loading from ai_service endpoints
  const loadData = async () => {
    try {
      setLoading(true);
      const [prodsRes, wilayasRes, statsRes, reportsRes, offersRes, alertsRes, geoRes] = await Promise.all([
        fetch(`/api/ai_service/products?wilayaCode=${selectedWilaya}`),
        fetch('/api/ai_service/wilayas'),
        fetch('/api/ai_service/stats'),
        fetch('/api/ai_service/reports'),
        fetch('/api/ai_service/producer-offers'),
        fetch('/api/ai_service/alerts'),
        fetch('/api/ai_service/reports/geo-map'),
      ]);

      if (!prodsRes.ok || !wilayasRes.ok) {
        throw new Error('فشل جلب بيانات السوق والسلع من الخادم');
      }

      const prodsData = await prodsRes.json();
      const wilayasData = await wilayasRes.json();
      const statsData = statsRes.ok ? await statsRes.json() : null;
      const reportsData = reportsRes.ok ? await reportsRes.json() : [];
      const offersData = offersRes.ok ? await offersRes.json() : [];
      const alertsData = alertsRes.ok ? await alertsRes.json() : [];
      const geoMapData = geoRes.ok ? await geoRes.json() : null;

      setProducts(prodsData);
      if (Array.isArray(wilayasData) && wilayasData.length > 0) {
        setWilayas(wilayasData);
      }
      setStats(statsData);
      setReports(reportsData);
      setProducerOffers(offersData);
      setAlerts(alertsData);
      setGeoData(geoMapData);
      setError(null);
    } catch (err: unknown) {
      console.error(err);
      setError('تعذر تحميل البيانات المحلية، يرجى التأكد من تشغيل الخدمة.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedWilaya]);

  const handleAddToBasket = (product: ProductItem) => {
    setCustomBasket((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    showToast(`تمت إضافة "${product.name}" إلى قفة التموين بنجاح.`);
  };

  const handleRemoveFromBasket = (productId: string) => {
    setCustomBasket((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearBasket = () => {
    setCustomBasket([]);
    showToast('تم إفراغ قفة التموين.');
  };

  const handleLoadSampleBasket = () => {
    if (products.length > 0) {
      const sampleIds = ['oil-5l', 'chicken-fresh', 'potato-white', 'milk-bag', 'semolina-10kg'];
      const picked = products.filter((p) => sampleIds.includes(p.id));
      if (picked.length > 0) {
        setCustomBasket(
          picked.map((p) => ({
            product: p,
            quantity: p.id === 'milk-bag' ? 4 : p.id === 'potato-white' ? 5 : 1,
          }))
        );
        showToast('تم شحن قفة أسبوعية نموذجية بنجاح!');
        return;
      }
    }
  };

  const handleOpenAdvisorWithQuery = (query: string) => {
    setAdvisorInitialQuery(query);
    setActiveTab('advisor');
  };

  const handleRefreshReports = async () => {
    try {
      const res = await fetch('/api/ai_service/reports');
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
      showToast('تم تسجيل وتحديث بلاغات وأسعار الميدان بنجاح.');
    } catch (e) {
      console.error(e);
    }
  };

  const handleRefreshGeoMap = async () => {
    try {
      const res = await fetch('/api/ai_service/reports/geo-map');
      if (res.ok) {
        const data = await res.json();
        setGeoData(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleConfirmGeoReport = async (reportId: string) => {
    try {
      const res = await fetch(`/api/ai_service/reports/geo-map/${reportId}/confirm`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        showToast(data.message || 'تم تسجيل تأكيدك بنجاح وتعزيز المراقبة المجتمعية!');
        awardCitizenPoints(15, 'تأكيد صحة بلاغ ميداني', 'confirm_report', 'المساهمة في التحقق المجتمعي لردع المضاربة بالحي.');
        // Update local state optimistically
        setGeoData((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            reports: prev.reports.map((r) => (r.id === reportId ? data.report : r)),
          };
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleGeoReportSubmitted = (newReport: GeoReportPoint, triggeredAlert?: MarketAlert | null) => {
    showToast(`تم تسجيل البلاغ الجغرافي عن "${newReport.productName}" بنجاح.`);
    awardCitizenPoints(50, 'بلاغ جغرافي عن تجاوزات', 'report_violation', `رصد مخالفة لـ ${newReport.productName} في بلدية ${newReport.commune}`);
    if (triggeredAlert) {
      setAlerts((prev) => [triggeredAlert, ...prev]);
      showToast(`⚠️ تنبيه رقابي عاجل: تم رصد بؤرة تجاوزات جديدة في بلدية ${newReport.commune}!`);
    }
    handleRefreshGeoMap();
    // Refresh stats in background
    fetch('/api/ai_service/stats')
      .then((res) => (res.ok ? res.json() : null))
      .then((st) => {
        if (st) setStats(st);
      })
      .catch(() => {});
  };

  const handleOpenGeoReportModal = (coords?: { lat: number; lng: number }) => {
    if (coords) {
      setGeoModalInitialCoords(coords);
    } else {
      setGeoModalInitialCoords(null);
    }
    setIsGeoReportModalOpen(true);
  };

  const handleRefreshOffers = async () => {
    try {
      const res = await fetch('/api/ai_service/producer-offers');
      if (res.ok) {
        const data = await res.json();
        setProducerOffers(data);
      }
      showToast('تم تسجيل ونشر عرض المنتج الفلاحي بنجاح.');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg border border-slate-800 text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200 max-w-md text-center">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        basketCount={customBasket.length}
        alertCount={alerts.length}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenAlertsDrawer={() => setIsAlertsDrawerOpen(true)}
        citizenPoints={citizenProfile.totalPoints}
        citizenTier={citizenProfile.tier}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
      />

      <main className="flex-1">
        {/* Error Notification if any */}
        {error && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Hero Section shown on the primary price monitor view */}
        {activeTab === 'monitor' && (
          <HeroBanner stats={stats} setActiveTab={setActiveTab} />
        )}

        {/* View Switcher */}
        {activeTab === 'monitor' && (
          <PriceMonitorView
            products={products}
            wilayas={wilayas}
            selectedWilaya={selectedWilaya}
            setSelectedWilaya={setSelectedWilaya}
            onAddToBasket={handleAddToBasket}
            onOpenAdvisorWithQuery={handleOpenAdvisorWithQuery}
          />
        )}

        {activeTab === 'geomap' && (
          <GeoMapView
            geoData={geoData}
            wilayas={wilayas}
            products={products}
            selectedWilaya={selectedWilaya}
            setSelectedWilaya={setSelectedWilaya}
            onOpenReportModalWithCoords={handleOpenGeoReportModal}
            onConfirmReport={handleConfirmGeoReport}
            onRefreshData={handleRefreshGeoMap}
          />
        )}

        {activeTab === 'producers' && (
          <ProducerDirectView
            offers={producerOffers}
            wilayas={wilayas}
            selectedWilaya={selectedWilaya}
            setSelectedWilaya={setSelectedWilaya}
            onOpenOfferModal={() => setIsProducerModalOpen(true)}
          />
        )}

        {activeTab === 'receipt_scanner' && (
          <ReceiptScannerView
            onOpenReportModalWithItem={(name, price) => {
              handleOpenGeoReportModal();
            }}
            onReceiptScanned={(res) => {
              awardCitizenPoints(
                20,
                'فحص وتحليل تذكرة شراء (AI OCR)',
                'scan_receipt',
                `تحليل فاتورة لمتجر "${res.storeName || 'تجزئة'}" وكشف الأسعار.`
              );
            }}
          />
        )}

        {activeTab === 'advisor' && (
          <AdvisorChatView
            wilayas={wilayas}
            selectedWilaya={selectedWilaya}
            setSelectedWilaya={setSelectedWilaya}
            onAddToBasket={handleAddToBasket}
            initialQuery={advisorInitialQuery}
            customBasket={customBasket}
            onRemoveFromBasket={handleRemoveFromBasket}
            onClearBasket={handleClearBasket}
            onLoadSampleBasket={handleLoadSampleBasket}
          />
        )}

        {activeTab === 'optimizer' && (
          <BasketOptimizerView
            wilayas={wilayas}
            selectedWilaya={selectedWilaya}
            setSelectedWilaya={setSelectedWilaya}
            customBasket={customBasket}
            onRemoveFromBasket={handleRemoveFromBasket}
            onClearBasket={handleClearBasket}
          />
        )}

        {activeTab === 'reports' && (
          <FieldReportsView
            reports={reports}
            onOpenReportModal={() => setIsReportModalOpen(true)}
          />
        )}
      </main>

      {/* Citizen Simple Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        wilayas={wilayas}
        onReportSubmitted={() => {
          handleRefreshReports();
          awardCitizenPoints(25, 'رصد سعر سلعة في السوق', 'report_price', 'تحديث بيانات السوق الميدانية.');
        }}
      />

      {/* GIS Geo-Mapping Enforcement Report Modal */}
      <GeoReportModal
        isOpen={isGeoReportModalOpen}
        onClose={() => setIsGeoReportModalOpen(false)}
        wilayas={wilayas}
        onReportSubmitted={handleGeoReportSubmitted}
        initialCoords={geoModalInitialCoords}
      />

      {/* Producer Direct Offer Registration Modal */}
      <ProducerOfferModal
        isOpen={isProducerModalOpen}
        onClose={() => setIsProducerModalOpen(false)}
        wilayas={wilayas}
        onOfferSubmitted={() => {
          handleRefreshOffers();
          awardCitizenPoints(30, 'تسجيل منتج محلي مباشر', 'producer_offer', 'دعم تسويق المنتوجات الفلاحية مباشرة للمواطن.');
        }}
      />

      {/* Citizen Profile & Rewards Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={citizenProfile}
        wilayas={wilayas}
        onUpdateProfile={handleUpdateProfile}
        onRedeemReward={handleRedeemReward}
      />

      {/* Smart Market Alerts Drawer */}
      <SmartAlertsDrawer
        isOpen={isAlertsDrawerOpen}
        onClose={() => setIsAlertsDrawerOpen(false)}
        alerts={alerts}
        wilayas={wilayas}
        selectedWilaya={selectedWilaya}
        setSelectedWilaya={setSelectedWilaya}
      />

      {/* Clean Civic Footer */}
      <Footer setActiveTab={setActiveTab} />
    </div>
  );
}
