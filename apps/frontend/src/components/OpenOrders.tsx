import { useMemo } from "react";
import {
  useOpenOrdersStore,
  useFetchOpenOrders,
  useCloseOrder,
} from "@/lib/openOrdersStore";
import { useQuotesStore } from "@/lib/quotesStore";
import { toDecimalNumber } from "@/lib/utils";

function appToDisplaySymbol(backendSymbol: string): string {
  // BTC_USDC_PERP -> BTCUSDC
  return backendSymbol.replace("_USDC_PERP", "USDC").replaceAll("_", "");
}

export default function OpenOrders() {
  // fetch on mount
  useFetchOpenOrders();
  const { mutate: closeOrder, isPending: isClosing } = useCloseOrder();
  const orders = Object.values(useOpenOrdersStore((s) => s.ordersById));
  const quotes = useQuotesStore((s) => s.quotes);

  const rows = useMemo(() => {
    return orders.map((o) => {
      const appSym = appToDisplaySymbol(o.asset);
      const q = quotes[appSym];
      const decimal = q?.decimal ?? 4;
      const current = q
        ? o.type === "long"
          ? q.bid_price
          : q.ask_price
        : o.openPrice;
      const diff =
        o.type === "long" ? current - o.openPrice : o.openPrice - current;
      const pnlInt = Math.round(diff * o.quantity);
      return { ...o, appSym, decimal, current, pnlInt };
    });
  }, [orders, quotes]);

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th
              style={{
                textAlign: "left",
                padding: 8,
                borderBottom: "1px solid #eee",
              }}
            >
              Asset
            </th>
            <th
              style={{
                textAlign: "center",
                padding: 8,
                borderBottom: "1px solid #eee",
              }}
            >
              Type
            </th>
            <th
              style={{
                textAlign: "right",
                padding: 8,
                borderBottom: "1px solid #eee",
              }}
            >
              Open
            </th>
            <th
              style={{
                textAlign: "right",
                padding: 8,
                borderBottom: "1px solid #eee",
              }}
            >
              Current
            </th>
            <th
              style={{
                textAlign: "right",
                padding: 8,
                borderBottom: "1px solid #eee",
              }}
            >
              Qty
            </th>
            <th
              style={{
                textAlign: "right",
                padding: 8,
                borderBottom: "1px solid #eee",
              }}
            >
              Levg
            </th>
            <th
              style={{
                textAlign: "right",
                padding: 8,
                borderBottom: "1px solid #eee",
              }}
            >
              PnL (int)
            </th>
            <th style={{ padding: 8, borderBottom: "1px solid #eee" }} />
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td style={{ padding: 8, borderBottom: "1px solid #f5f5f5" }}>
                {r.appSym}
              </td>
              <td
                style={{
                  padding: 8,
                  borderBottom: "1px solid #f5f5f5",
                  textTransform: "capitalize",
                  textAlign: "center",
                }}
              >
                {r.type}
              </td>
              <td
                style={{
                  padding: 8,
                  borderBottom: "1px solid #f5f5f5",
                  textAlign: "right",
                }}
              >
                {toDecimalNumber(r.openPrice, r.decimal)}
              </td>
              <td
                style={{
                  padding: 8,
                  borderBottom: "1px solid #f5f5f5",
                  textAlign: "right",
                }}
              >
                {toDecimalNumber(r.current, r.decimal)}
              </td>
              <td
                style={{
                  padding: 8,
                  borderBottom: "1px solid #f5f5f5",
                  textAlign: "right",
                }}
              >
                {r.quantity}
              </td>
              <td
                style={{
                  padding: 8,
                  borderBottom: "1px solid #f5f5f5",
                  textAlign: "right",
                }}
              >
                {r.leverage}
              </td>
              <td
                style={{
                  padding: 8,
                  borderBottom: "1px solid #f5f5f5",
                  textAlign: "right",
                  color: r.pnlInt >= 0 ? "#16a34a" : "#dc2626",
                }}
              >
                {toDecimalNumber(r.pnlInt, r.decimal)}
              </td>
              <td
                style={{
                  padding: 8,
                  borderBottom: "1px solid #f5f5f5",
                  textAlign: "right",
                }}
              >
                <button
                  onClick={() => closeOrder(r.id)}
                  disabled={isClosing}
                  style={{
                    color: isClosing ? "#888" : "#fff",
                    padding: "6px 10px",
                    borderRadius: 6,
                    border: "1px solid #eee",
                  }}
                >
                  Close
                </button>
              </td>
            </tr>
          ))}
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={8}
                style={{ padding: 12, color: "#888", textAlign: "center" }}
              >
                No open orders
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
