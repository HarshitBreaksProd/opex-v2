import { useQuotesStore } from "@/lib/quotesStore";
import { formatPrice } from "@/lib/quotesStore";

export default function QuotesTable() {
  const quotes = useQuotesStore((s) => s.quotes);
  const rows = Object.entries(quotes);
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
                textAlign: "right",
                padding: 8,
                borderBottom: "1px solid #eee",
              }}
            >
              Bid
            </th>
            <th
              style={{
                textAlign: "right",
                padding: 8,
                borderBottom: "1px solid #eee",
              }}
            >
              Ask
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([symbol, q]) => (
            <tr key={symbol}>
              <td style={{ padding: 8, borderBottom: "1px solid #f5f5f5" }}>
                {symbol}
              </td>
              <td
                style={{
                  padding: 8,
                  borderBottom: "1px solid #f5f5f5",
                  textAlign: "right",
                }}
              >
                {formatPrice(q.bid_price, q.decimal)}
              </td>
              <td
                style={{
                  padding: 8,
                  borderBottom: "1px solid #f5f5f5",
                  textAlign: "right",
                }}
              >
                {formatPrice(q.ask_price, q.decimal)}
              </td>
            </tr>
          ))}
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={3}
                style={{ padding: 12, color: "#888", textAlign: "center" }}
              >
                Waiting for quotes…
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
