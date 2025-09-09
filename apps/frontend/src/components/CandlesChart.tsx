import { useEffect, useRef } from "react";
import { useCandlesStore, useCandlesFeed } from "@/lib/candlesStore";
import type { Timeframe, Candle } from "@/lib/candlesStore";
import {
  createChart,
  CandlestickSeries,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts";
import { useKlines } from "@/lib/klines";
import { useQuotesStore } from "@/lib/quotesStore";

type Props = {
  symbol: string;
};

export default function CandlesChart({ symbol }: Props) {
  // ensure subscription/unsubscription lifecycle
  useCandlesFeed();
  const timeframe = useCandlesStore((s) => s.timeframe);
  const selected = useCandlesStore((s) => {
    const by = s.candlesBySymbol[symbol];
    return by ? by[timeframe] : undefined;
  });
  const EMPTY: ReadonlyArray<Candle> = [] as const;
  const candles = (selected ?? EMPTY) as Candle[];

  // lightweight-charts setup
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  // fetch historical klines (seed data)
  const seedInterval = timeframe;
  const { data: klines } = useKlines(symbol, seedInterval, 100);

  useEffect(() => {
    if (!containerRef.current) return;
    const chart = createChart(containerRef.current, {
      layout: {
        textColor: "black",
        background: { color: "white" },
      },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false },
      grid: { vertLines: { visible: false }, horzLines: { visible: false } },
      height: 320,
    });
    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#16a34a",
      downColor: "#dc2626",
      borderVisible: false,
      wickUpColor: "#16a34a",
      wickDownColor: "#dc2626",
    });
    chart.timeScale().fitContent();

    chartRef.current = chart;
    seriesRef.current = series;

    const ro = new ResizeObserver(() => {
      if (!containerRef.current) return;
      chart.applyOptions({ width: containerRef.current.clientWidth });
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [symbol, timeframe]);

  // seed klines when ready
  useEffect(() => {
    if (!seriesRef.current || !klines?.length) return;
    const last100 = klines.slice(-100);
    seriesRef.current.setData(
      last100.map((k) => ({
        time: k.time as UTCTimestamp,
        open: k.open,
        high: k.high,
        low: k.low,
        close: k.close,
      }))
    );
  }, [klines]);

  // stream latest in-memory candle as updates
  useEffect(() => {
    if (!seriesRef.current || !candles.length) return;
    const last = candles[candles.length - 1]!;
    seriesRef.current.update({
      time: Math.floor(last.t / 1000) as UTCTimestamp,
      open: last.o,
      high: last.h,
      low: last.l,
      close: last.c,
    });
  }, [candles]);

  // direct live update on each WS tick: adjust the ongoing candle for current timeframe
  const live = useQuotesStore((s) => s.quotes[symbol]);
  useEffect(() => {
    if (!seriesRef.current || !live) return;
    const price =
      (live.ask_price + live.bid_price) / 2 / Math.pow(10, live.decimal);
    // determine current bucket for timeframe
    const nowMs = Date.now();
    const bucketMs = (() => {
      switch (timeframe) {
        case "1m":
          return Math.floor(nowMs / 60_000) * 60_000;
        case "5m":
          return Math.floor(nowMs / 300_000) * 300_000;
        case "15m":
          return Math.floor(nowMs / 900_000) * 900_000;
        case "1h":
          return Math.floor(nowMs / 3_600_000) * 3_600_000;
        case "1d":
          return Math.floor(nowMs / 86_400_000) * 86_400_000;
      }
    })();

    // find last bar from current candles state
    const last = candles[candles.length - 1];
    if (last && last.t === bucketMs) {
      const nextBar = {
        time: Math.floor(bucketMs / 1000) as UTCTimestamp,
        open: last.o,
        high: Math.max(last.h, price),
        low: Math.min(last.l, price),
        close: price,
      };
      seriesRef.current.update(nextBar);
    } else if (bucketMs) {
      // start a new bar if none exists for this bucket yet
      seriesRef.current.update({
        time: Math.floor(bucketMs / 1000) as UTCTimestamp,
        open: price,
        high: price,
        low: price,
        close: price,
      });
    }
  }, [live, timeframe, candles, symbol]);

  return <div ref={containerRef} style={{ width: "100%", height: 320 }} />;
}

export function TimeframeSwitcher() {
  const timeframe = useCandlesStore((s) => s.timeframe);
  const setTimeframe = useCandlesStore((s) => s.setTimeframe);
  const tfs: Timeframe[] = ["1m", "5m"];
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {tfs.map((tf) => (
        <button
          key={tf}
          onClick={() => setTimeframe(tf)}
          style={{
            padding: "6px 10px",
            borderRadius: 6,
            border: timeframe === tf ? "1px solid #646cff" : "1px solid #eee",
            background: timeframe === tf ? "#f5f6ff" : "#fff",
          }}
        >
          {tf}
        </button>
      ))}
    </div>
  );
}
