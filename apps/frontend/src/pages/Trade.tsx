import { useSessionProbe } from "@/lib/session";
import { useQuotesFeed, useQuotesStore, formatPrice } from "@/lib/quotesStore";
import CandlesChart, { TimeframeSwitcher } from "@/components/CandlesChart";
import QuotesTable from "@/components/QuotesTable";
import TradeForm from "@/components/TradeForm";
import OpenOrders from "@/components/OpenOrders";
import { useUsdBalance } from "@/lib/balance";
import { useOpenOrdersStore } from "@/lib/openOrdersStore";
import { backendToAppSymbol } from "@/lib/symbols";
import { toDecimalNumber } from "@/lib/utils";

export default function Trade() {
  useSessionProbe();
  useQuotesFeed();
  const { quotes, selectedSymbol, setSelectedSymbol } = useQuotesStore();
  const q = quotes[selectedSymbol];
  const { data: usdBalance, isLoading: isBalanceLoading } = useUsdBalance();
  const openOrders = Object.values(useOpenOrdersStore((s) => s.ordersById));
  const liveBalance = (() => {
    const base = usdBalance ? usdBalance.balance : 0;
    let pnl = 0;
    for (const o of openOrders) {
      const appSym = backendToAppSymbol(o.asset);
      const lq = quotes[appSym];
      if (!lq) continue;
      const current = o.type === "long" ? lq.bid_price : lq.ask_price;
      pnl +=
        (o.type === "long" ? current - o.openPrice : o.openPrice - current) *
        o.quantity;
    }
    return base + pnl;
  })();
  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 48,
          borderBottom: "1px solid #eee",
          padding: "0 12px",
        }}
      >
        <div style={{ fontWeight: 700 }}>opex</div>
        <div style={{ color: "#111", fontSize: 12, fontWeight: 600 }}>
          Balance:{" "}
          {isBalanceLoading
            ? "Loading…"
            : toDecimalNumber(liveBalance, usdBalance?.decimal ?? 4)}
        </div>
      </nav>
      <main
        style={{
          display: "grid",
          gridTemplateColumns: "25% 50% 25%",
          gap: 8,
          padding: 8,
          height: "calc(100vh - 48px)",
        }}
      >
        {/* Left: Live Prices (25%) */}
        <aside
          style={{ border: "1px solid #eee", borderRadius: 8, padding: 8 }}
        >
          <h4 style={{ margin: 0, marginBottom: 6, fontSize: 14 }}>
            Live Prices
          </h4>
          <QuotesTable />
        </aside>

        {/* Middle: Chart (top 60%) + empty bottom (50% width) */}
        <section
          style={{
            border: "1px solid #eee",
            borderRadius: 8,
            padding: 8,
            minHeight: "70vh",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ display: "flex", gap: 6 }}>
              {["BTCUSDC", "ETHUSDC", "SOLUSDC"].map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSymbol(s)}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 6,
                    border:
                      s === selectedSymbol
                        ? "1px solid #646cff"
                        : "1px solid #eee",
                    background: s === selectedSymbol ? "#f5f6ff" : "#fff",
                    fontSize: 12,
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
            <div style={{ color: "#111", fontSize: 13 }}>
              {q ? (
                <>
                  Bid {formatPrice(q.bid_price, q.decimal)} · Ask{" "}
                  {formatPrice(q.ask_price, q.decimal)}
                </>
              ) : (
                <>Waiting for quotes…</>
              )}
            </div>
            <div style={{ marginLeft: "auto" }}>
              <TimeframeSwitcher />
            </div>
          </div>
          <div style={{ flex: "0 0 60%" }}>
            <CandlesChart symbol={selectedSymbol} />
          </div>
          <div
            style={{
              flex: 1,
              borderTop: "1px solid #f2f2f2",
              minHeight: 0,
              overflow: "auto",
            }}
          >
            <OpenOrders />
          </div>
        </section>

        {/* Right: Reserved (25%) */}
        <aside
          style={{ border: "1px solid #eee", borderRadius: 8, padding: 8 }}
        >
          <h4 style={{ margin: 0, marginBottom: 6, fontSize: 14 }}>
            Open Trade
          </h4>
          <TradeForm />
        </aside>
      </main>
    </div>
  );
}
