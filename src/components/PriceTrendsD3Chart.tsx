import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import {
  TrendingDown,
  TrendingUp,
  Minus,
  ShieldCheck,
  Calendar,
  Sparkles,
  BarChart3,
  Info,
  ArrowDownRight,
  ArrowUpRight,
} from 'lucide-react';

export interface CommodityTrendData {
  id: string;
  name: string;
  category: string;
  unit: string;
  officialCeiling: number | null;
  currentRetail: number;
  currentRahma: number;
  change30dPercent: number;
  trendStatus: 'decreasing' | 'increasing' | 'stable';
  dailyHistory: Array<{
    date: Date;
    retailPrice: number;
    rahmaPrice: number;
    notes?: string;
  }>;
}

// Generate realistic 30-day market histories leading up to today
const generate30DayCommodityData = (): CommodityTrendData[] => {
  const today = new Date();

  const createDates = (daysCount = 30) => {
    return Array.from({ length: daysCount }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (daysCount - 1 - i));
      return d;
    });
  };

  const dates = createDates(30);

  // 1. زيت المائدة 5 لتر (مسقف 650 د.ج)
  const oilDaily = dates.map((d, i) => {
    // Fluctuated from 690 down to regulated 650 due to enforcement
    const retail = Math.round(685 - (i / 29) * 35 + (Math.sin(i) * 5));
    const rahma = 650;
    return { date: d, retailPrice: Math.max(650, retail), rahmaPrice: rahma };
  });

  // 2. حليب أكياس مبستر 1 لتر (مسقف 25 د.ج)
  const milkDaily = dates.map((d, i) => {
    // Stable in public points, occasional 30-35 retail spikes
    const retail = i < 15 ? 32 + (i % 2 === 0 ? 2 : -2) : 25 + (i % 3 === 0 ? 3 : 0);
    const rahma = 25;
    return { date: d, retailPrice: retail, rahmaPrice: rahma };
  });

  // 3. سميد قمح صلب ممتاز 10 كغ (مسقف 450 د.ج)
  const semolinaDaily = dates.map((d, i) => {
    // Gradual decline with OAIC distribution from 510 to 460
    const retail = Math.round(510 - (i / 29) * 50 + (Math.cos(i) * 6));
    const rahma = 420;
    return { date: d, retailPrice: retail, rahmaPrice: rahma };
  });

  // 4. سكر أبيض 1 كغ (مسقف 95 د.ج)
  const sugarDaily = dates.map((d, i) => {
    // Very stable at ceiling
    const retail = 95 + (i < 10 ? 3 : 0);
    const rahma = 90;
    return { date: d, retailPrice: retail, rahmaPrice: rahma };
  });

  // 5. دجاج بلدي مذبوح 1 كغ (حر مع تدخل أوناب)
  const chickenDaily = dates.map((d, i) => {
    // Sharp drop from 520 down to 420 as ONAB points flooded market
    const retail = Math.round(520 - (i / 29) * 95 + (Math.sin(i * 0.8) * 12));
    const rahma = Math.round(410 - (i / 29) * 50);
    return { date: d, retailPrice: retail, rahmaPrice: rahma };
  });

  // 6. بطاطا استهلاك 1 كغ (موسم الجني + مخازن ONILEV + ماڨرو)
  const potatoDaily = dates.map((d, i) => {
    // Dropped steeply from 95 to 55-60 DZD
    const retail = Math.round(95 - (i / 29) * 35 + (Math.cos(i * 0.5) * 4));
    const rahma = Math.round(65 - (i / 29) * 15);
    return { date: d, retailPrice: retail, rahmaPrice: rahma };
  });

  // 7. طماطم طازجة 1 كغ (بيوت بلاستيكية بسكرة وماڨرو)
  const tomatoDaily = dates.map((d, i) => {
    // Dropped from 130 to 70 DZD
    const retail = Math.round(130 - (i / 29) * 55 + (Math.sin(i * 0.7) * 8));
    const rahma = Math.round(85 - (i / 29) * 25);
    return { date: d, retailPrice: retail, rahmaPrice: rahma };
  });

  // 8. عدس الديوان الوطني OAIC 1 كغ
  const lentilsDaily = dates.map((d) => {
    // Fixed subsidized by OAIC at 140 DZD
    return { date: d, retailPrice: 155, rahmaPrice: 140 };
  });

  return [
    {
      id: 'potato',
      name: 'بطاطا استهلاك حقلية',
      category: 'خضروات',
      unit: '1 كغ',
      officialCeiling: 65,
      currentRetail: potatoDaily[potatoDaily.length - 1].retailPrice,
      currentRahma: potatoDaily[potatoDaily.length - 1].rahmaPrice,
      change30dPercent: -36.8,
      trendStatus: 'decreasing',
      dailyHistory: potatoDaily,
    },
    {
      id: 'chicken',
      name: 'دجاج بلدي مذبوح (أوناب / تجزئة)',
      category: 'لحوم ودواجن',
      unit: '1 كغ',
      officialCeiling: 480,
      currentRetail: chickenDaily[chickenDaily.length - 1].retailPrice,
      currentRahma: chickenDaily[chickenDaily.length - 1].rahmaPrice,
      change30dPercent: -18.3,
      trendStatus: 'decreasing',
      dailyHistory: chickenDaily,
    },
    {
      id: 'tomato',
      name: 'طماطم طازجة مستديرة',
      category: 'خضروات',
      unit: '1 كغ',
      officialCeiling: null,
      currentRetail: tomatoDaily[tomatoDaily.length - 1].retailPrice,
      currentRahma: tomatoDaily[tomatoDaily.length - 1].rahmaPrice,
      change30dPercent: -42.3,
      trendStatus: 'decreasing',
      dailyHistory: tomatoDaily,
    },
    {
      id: 'oil-5l',
      name: 'زيت المائدة الغذائي 5 لتر',
      category: 'زيوت وسكريات',
      unit: 'قارورة 5 لتر',
      officialCeiling: 650,
      currentRetail: oilDaily[oilDaily.length - 1].retailPrice,
      currentRahma: oilDaily[oilDaily.length - 1].rahmaPrice,
      change30dPercent: -5.1,
      trendStatus: 'decreasing',
      dailyHistory: oilDaily,
    },
    {
      id: 'milk-bag',
      name: 'حليب مبستر أكياس (جيبلي)',
      category: 'حليب ومشتقاته',
      unit: 'كيس 1 لتر',
      officialCeiling: 25,
      currentRetail: milkDaily[milkDaily.length - 1].retailPrice,
      currentRahma: milkDaily[milkDaily.length - 1].rahmaPrice,
      change30dPercent: -21.8,
      trendStatus: 'decreasing',
      dailyHistory: milkDaily,
    },
    {
      id: 'semolina-10kg',
      name: 'سميد قمح صلب ممتاز 10 كغ',
      category: 'حبوب ومشتقات',
      unit: 'كيس 10 كغ',
      officialCeiling: 450,
      currentRetail: semolinaDaily[semolinaDaily.length - 1].retailPrice,
      currentRahma: semolinaDaily[semolinaDaily.length - 1].rahmaPrice,
      change30dPercent: -9.8,
      trendStatus: 'decreasing',
      dailyHistory: semolinaDaily,
    },
    {
      id: 'sugar-1kg',
      name: 'سكر أبيض استهلاك 1 كغ',
      category: 'زيوت وسكريات',
      unit: '1 كغ',
      officialCeiling: 95,
      currentRetail: sugarDaily[sugarDaily.length - 1].retailPrice,
      currentRahma: sugarDaily[sugarDaily.length - 1].rahmaPrice,
      change30dPercent: -3.0,
      trendStatus: 'stable',
      dailyHistory: sugarDaily,
    },
    {
      id: 'lentils-oaic',
      name: 'عدس الديوان الوطني OAIC',
      category: 'بقوليات',
      unit: '1 كغ',
      officialCeiling: 140,
      currentRetail: lentilsDaily[lentilsDaily.length - 1].retailPrice,
      currentRahma: lentilsDaily[lentilsDaily.length - 1].rahmaPrice,
      change30dPercent: 0,
      trendStatus: 'stable',
      dailyHistory: lentilsDaily,
    },
  ];
};

interface PriceTrendsD3ChartProps {
  onAskAdvisorAboutTrend?: (query: string) => void;
  selectedWilayaName: string;
}

export const PriceTrendsD3Chart: React.FC<PriceTrendsD3ChartProps> = ({
  onAskAdvisorAboutTrend,
  selectedWilayaName,
}) => {
  const commodities = useMemo(() => generate30DayCommodityData(), []);
  const [selectedId, setSelectedId] = useState<string>('potato');
  const [activeSeries, setActiveSeries] = useState<'both' | 'retail' | 'rahma'>('both');
  const [hoveredPoint, setHoveredPoint] = useState<{
    date: Date;
    retailPrice: number;
    rahmaPrice: number;
    x: number;
    y: number;
  } | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const selectedCommodity = useMemo(
    () => commodities.find((c) => c.id === selectedId) || commodities[0],
    [commodities, selectedId]
  );

  // Render D3.js Chart
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const svgElement = d3.select(svgRef.current);
    svgElement.selectAll('*').remove(); // Clear previous drawing

    // Determine width dynamically from container
    const containerWidth = containerRef.current.clientWidth || 700;
    const width = Math.max(containerWidth, 340);
    const height = 280;
    const margin = { top: 25, right: 30, bottom: 45, left: 55 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svgElement
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const history = selectedCommodity.dailyHistory;

    // Scales
    const xExtent = d3.extent(history, (d) => d.date) as [Date, Date];
    const xScale = d3.scaleTime().domain(xExtent).range([0, innerWidth]);

    const allPrices: number[] = [];
    history.forEach((d) => {
      allPrices.push(d.retailPrice, d.rahmaPrice);
    });
    if (selectedCommodity.officialCeiling !== null) {
      allPrices.push(selectedCommodity.officialCeiling);
    }

    const minPrice = Math.floor((d3.min(allPrices) || 0) * 0.9);
    const maxPrice = Math.ceil((d3.max(allPrices) || 100) * 1.08);

    const yScale = d3.scaleLinear().domain([minPrice, maxPrice]).nice().range([innerHeight, 0]);

    // Define Gradients
    const defs = svgElement.append('defs');

    // Retail Area Gradient (Rose / Amber)
    const retailGradient = defs
      .append('linearGradient')
      .attr('id', 'retailAreaGrad')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    retailGradient.append('stop').attr('offset', '0%').attr('stop-color', '#f59e0b').attr('stop-opacity', 0.28);
    retailGradient.append('stop').attr('offset', '100%').attr('stop-color', '#f59e0b').attr('stop-opacity', 0.0);

    // Rahma Area Gradient (Emerald)
    const rahmaGradient = defs
      .append('linearGradient')
      .attr('id', 'rahmaAreaGrad')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    rahmaGradient.append('stop').attr('offset', '0%').attr('stop-color', '#10b981').attr('stop-opacity', 0.35);
    rahmaGradient.append('stop').attr('offset', '100%').attr('stop-color', '#10b981').attr('stop-opacity', 0.0);

    // Horizontal Grid Lines
    const yGrid = d3.axisLeft(yScale).ticks(5).tickSize(-innerWidth).tickFormat(() => '');
    g.append('g')
      .attr('class', 'grid y-grid')
      .call(yGrid)
      .selectAll('line')
      .attr('stroke', '#f1f5f9')
      .attr('stroke-dasharray', '3,3');
    g.select('.y-grid .domain').remove();

    // X-Axis
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(Math.max(width / 90, 4))
      .tickFormat((d) => d3.timeFormat('%d %b')(d as Date));

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .attr('color', '#94a3b8')
      .selectAll('text')
      .attr('fill', '#64748b')
      .attr('font-size', '10px')
      .attr('font-family', 'sans-serif')
      .attr('dy', '1em');

    // Y-Axis
    const yAxis = d3
      .axisLeft(yScale)
      .ticks(5)
      .tickFormat((d) => `${d} د.ج`);

    g.append('g')
      .call(yAxis)
      .attr('color', '#94a3b8')
      .selectAll('text')
      .attr('fill', '#475569')
      .attr('font-size', '10px')
      .attr('font-family', 'monospace')
      .attr('font-weight', 'bold');

    // Official Ceiling Line (if applicable)
    if (selectedCommodity.officialCeiling !== null) {
      const ceilingY = yScale(selectedCommodity.officialCeiling);
      g.append('line')
        .attr('x1', 0)
        .attr('x2', innerWidth)
        .attr('y1', ceilingY)
        .attr('y2', ceilingY)
        .attr('stroke', '#ef4444')
        .attr('stroke-width', 1.8)
        .attr('stroke-dasharray', '4,4');

      g.append('rect')
        .attr('x', innerWidth - 110)
        .attr('y', ceilingY - 18)
        .attr('width', 106)
        .attr('height', 16)
        .attr('rx', 4)
        .attr('fill', '#fee2e2')
        .attr('stroke', '#fca5a5')
        .attr('stroke-width', 0.8);

      g.append('text')
        .attr('x', innerWidth - 57)
        .attr('y', ceilingY - 6)
        .attr('text-anchor', 'middle')
        .attr('fill', '#b91c1c')
        .attr('font-size', '9px')
        .attr('font-weight', 'bold')
        .text(`السقف: ${selectedCommodity.officialCeiling} د.ج`);
    }

    // Line Generators
    const retailLine = d3
      .line<{ date: Date; retailPrice: number }>()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.retailPrice))
      .curve(d3.curveMonotoneX);

    const rahmaLine = d3
      .line<{ date: Date; rahmaPrice: number }>()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.rahmaPrice))
      .curve(d3.curveMonotoneX);

    // Area Generators
    const retailArea = d3
      .area<{ date: Date; retailPrice: number }>()
      .x((d) => xScale(d.date))
      .y0(innerHeight)
      .y1((d) => yScale(d.retailPrice))
      .curve(d3.curveMonotoneX);

    const rahmaArea = d3
      .area<{ date: Date; rahmaPrice: number }>()
      .x((d) => xScale(d.date))
      .y0(innerHeight)
      .y1((d) => yScale(d.rahmaPrice))
      .curve(d3.curveMonotoneX);

    // Render Retail Series
    if (activeSeries === 'both' || activeSeries === 'retail') {
      g.append('path')
        .datum(history)
        .attr('fill', 'url(#retailAreaGrad)')
        .attr('d', retailArea);

      g.append('path')
        .datum(history)
        .attr('fill', 'none')
        .attr('stroke', '#f59e0b')
        .attr('stroke-width', 2.4)
        .attr('d', retailLine);
    }

    // Render Rahma / Coop Series
    if (activeSeries === 'both' || activeSeries === 'rahma') {
      g.append('path')
        .datum(history)
        .attr('fill', 'url(#rahmaAreaGrad)')
        .attr('d', rahmaArea);

      g.append('path')
        .datum(history)
        .attr('fill', 'none')
        .attr('stroke', '#059669')
        .attr('stroke-width', 2.8)
        .attr('d', rahmaLine);
    }

    // Interactive Overlay for crosshair and tooltips
    const bisectDate = d3.bisector((d: { date: Date }) => d.date).left;

    const crosshair = g
      .append('line')
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#64748b')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3')
      .style('opacity', 0);

    const focusCircleRetail = g
      .append('circle')
      .attr('r', 5)
      .attr('fill', '#f59e0b')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
      .style('opacity', 0);

    const focusCircleRahma = g
      .append('circle')
      .attr('r', 5.5)
      .attr('fill', '#059669')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
      .style('opacity', 0);

    g.append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .attr('cursor', 'crosshair')
      .on('mousemove', (event) => {
        const [pointerX] = d3.pointer(event);
        const x0 = xScale.invert(pointerX);
        const idx = bisectDate(history, x0, 1);
        const d0 = history[idx - 1];
        const d1 = history[idx];
        if (!d0) return;
        const selectedPoint =
          d1 && x0.getTime() - d0.date.getTime() > d1.date.getTime() - x0.getTime() ? d1 : d0;

        const posX = xScale(selectedPoint.date);
        const posYRetail = yScale(selectedPoint.retailPrice);
        const posYRahma = yScale(selectedPoint.rahmaPrice);

        crosshair.attr('x1', posX).attr('x2', posX).style('opacity', 1);

        if (activeSeries === 'both' || activeSeries === 'retail') {
          focusCircleRetail.attr('cx', posX).attr('cy', posYRetail).style('opacity', 1);
        } else {
          focusCircleRetail.style('opacity', 0);
        }

        if (activeSeries === 'both' || activeSeries === 'rahma') {
          focusCircleRahma.attr('cx', posX).attr('cy', posYRahma).style('opacity', 1);
        } else {
          focusCircleRahma.style('opacity', 0);
        }

        setHoveredPoint({
          date: selectedPoint.date,
          retailPrice: selectedPoint.retailPrice,
          rahmaPrice: selectedPoint.rahmaPrice,
          x: posX + margin.left,
          y: Math.min(posYRetail, posYRahma) + margin.top,
        });
      })
      .on('mouseleave', () => {
        crosshair.style('opacity', 0);
        focusCircleRetail.style('opacity', 0);
        focusCircleRahma.style('opacity', 0);
        setHoveredPoint(null);
      });
  }, [selectedCommodity, activeSeries]);

  const startPrice = selectedCommodity.dailyHistory[0].retailPrice;
  const endPrice = selectedCommodity.dailyHistory[selectedCommodity.dailyHistory.length - 1].retailPrice;
  const priceDiff = endPrice - startPrice;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6 shadow-sm overflow-hidden">
      {/* Header with Title and AI Advisor Query Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
              <BarChart3 className="w-4 h-4" />
            </span>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              مرصد اتجاهات الأسعار (30 يوماً) — رسوم بيانية تفاعلية بتقنية D3.js
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            تحليل تقلبات أسعار السلع التموينية ومقارنة سعر التجزئة بأسعار أسواق الرحمة والسقف القانوني الرسمي.
          </p>
        </div>

        {onAskAdvisorAboutTrend && (
          <button
            onClick={() =>
              onAskAdvisorAboutTrend(
                `ما هو تحليلك لاتجاه سعر ${selectedCommodity.name} في ولاية ${selectedWilayaName} خلال الـ 30 يوماً الماضية، وما هي نصيحتك لتوقيت الشراء؟`
              )
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-all shadow-xs shrink-0 self-start sm:self-center cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>تحليل المنحنى بالمستشار</span>
          </button>
        )}
      </div>

      {/* Commodity Selector Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2.5 mb-4 scrollbar-none">
        {commodities.map((item) => (
          <button
            key={item.id}
            onClick={() => setSelectedId(item.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all shrink-0 cursor-pointer ${
              selectedId === item.id
                ? 'bg-slate-900 text-white font-bold shadow-xs'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>{item.name}</span>
            <span className="font-mono text-[11px] mr-1 opacity-80">
              ({item.change30dPercent < 0 ? item.change30dPercent : `+${item.change30dPercent}`}% )
            </span>
          </button>
        ))}
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
          <span className="text-[11px] text-slate-500 block mb-0.5">سعر التجزئة الحالي:</span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold font-mono tabular-nums text-slate-900">
              {selectedCommodity.currentRetail} د.ج
            </span>
            <span className="text-[10px] text-slate-500">/{selectedCommodity.unit}</span>
          </div>
        </div>

        <div className="bg-emerald-50/70 rounded-xl p-3 border border-emerald-200/80">
          <span className="text-[11px] text-emerald-800 block mb-0.5">أسواق الرحمة والتعاونيات:</span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold font-mono tabular-nums text-emerald-700">
              {selectedCommodity.currentRahma} د.ج
            </span>
            <span className="text-[10px] text-emerald-700">/{selectedCommodity.unit}</span>
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
          <span className="text-[11px] text-slate-500 block mb-0.5">تغير السعر (30 يوماً):</span>
          <div className="flex items-center gap-1">
            {priceDiff < 0 ? (
              <span className="flex items-center text-emerald-700 font-bold font-mono text-sm">
                <ArrowDownRight className="w-4 h-4" />
                <span>{Math.abs(priceDiff)} د.ج ({selectedCommodity.change30dPercent}%)</span>
              </span>
            ) : priceDiff > 0 ? (
              <span className="flex items-center text-amber-700 font-bold font-mono text-sm">
                <ArrowUpRight className="w-4 h-4" />
                <span>+{priceDiff} د.ج (+{selectedCommodity.change30dPercent}%)</span>
              </span>
            ) : (
              <span className="flex items-center text-slate-600 font-bold font-mono text-sm">
                <Minus className="w-4 h-4" />
                <span>مستقر تماماً</span>
              </span>
            )}
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
          <span className="text-[11px] text-slate-500 block mb-0.5">السقف القانوني الرسمي:</span>
          <div className="flex items-baseline gap-1">
            {selectedCommodity.officialCeiling ? (
              <span className="text-sm font-bold font-mono text-red-700 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-red-600" />
                <span>{selectedCommodity.officialCeiling} د.ج</span>
              </span>
            ) : (
              <span className="text-xs font-medium text-slate-500">سعر حر يخضع للعرض والطلب</span>
            )}
          </div>
        </div>
      </div>

      {/* Chart Control Bar (Series Filters & Legend) */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs mb-2 px-1">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-amber-500 rounded-full" />
            <span className="text-slate-700 font-medium">سعر التجزئة العام</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-emerald-600 rounded-full" />
            <span className="text-slate-700 font-medium">سعر الرحمة والتعاونيات</span>
          </div>

          {selectedCommodity.officialCeiling && (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-t border-dashed border-red-500" />
              <span className="text-red-700 font-medium text-[11px]">السقف القانوني</span>
            </div>
          )}
        </div>

        {/* Series Visibility Toggles */}
        <div className="bg-slate-100 rounded-lg p-0.5 flex text-[11px] font-medium">
          <button
            onClick={() => setActiveSeries('both')}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              activeSeries === 'both' ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'text-slate-600'
            }`}
          >
            المساران معاً
          </button>
          <button
            onClick={() => setActiveSeries('retail')}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              activeSeries === 'retail' ? 'bg-white text-amber-900 font-bold shadow-2xs' : 'text-slate-600'
            }`}
          >
            التجزئة فقط
          </button>
          <button
            onClick={() => setActiveSeries('rahma')}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              activeSeries === 'rahma' ? 'bg-white text-emerald-900 font-bold shadow-2xs' : 'text-slate-600'
            }`}
          >
            الرحمة فقط
          </button>
        </div>
      </div>

      {/* D3.js Interactive Chart Canvas */}
      <div ref={containerRef} className="relative w-full overflow-hidden bg-slate-50/60 rounded-xl border border-slate-200/80 p-2">
        <svg ref={svgRef} className="w-full h-[280px] overflow-visible" />

        {/* Hover Tooltip Overlay */}
        {hoveredPoint && (
          <div
            className="absolute z-20 pointer-events-none bg-slate-900/95 text-white p-2.5 rounded-xl shadow-xl text-xs space-y-1 border border-slate-700 font-sans"
            style={{
              left: `${Math.min(Math.max(hoveredPoint.x - 70, 10), (containerRef.current?.clientWidth || 600) - 150)}px`,
              top: `${Math.max(hoveredPoint.y - 75, 10)}px`,
            }}
          >
            <div className="text-[10px] text-slate-400 font-mono pb-1 border-b border-slate-800 flex items-center justify-between">
              <span>{hoveredPoint.date.toLocaleDateString('ar-DZ', { day: 'numeric', month: 'long' })}</span>
              <Calendar className="w-3 h-3 text-slate-400" />
            </div>
            <div className="flex items-center justify-between gap-3 text-amber-400">
              <span>التجزئة:</span>
              <span className="font-mono font-bold">{hoveredPoint.retailPrice} د.ج</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-emerald-400">
              <span>الرحمة/التعاونية:</span>
              <span className="font-mono font-bold">{hoveredPoint.rahmaPrice} د.ج</span>
            </div>
            {selectedCommodity.officialCeiling && (
              <div className="text-[10px] text-red-300 pt-0.5 border-t border-slate-800">
                فارق السقف: {hoveredPoint.retailPrice - selectedCommodity.officialCeiling > 0 ? `+${hoveredPoint.retailPrice - selectedCommodity.officialCeiling} د.ج خرق` : 'مطابق تماماً'}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Analytical Note Footer */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>البيانات مستقاة من مراصد أسواق الرحمة ومسوح الأسعار اليومية للمواطنين عبر الولايات.</span>
        </div>
        <span className="text-emerald-700 font-medium">
          D3.js Vector Engine · تحديث يومي
        </span>
      </div>
    </div>
  );
};
