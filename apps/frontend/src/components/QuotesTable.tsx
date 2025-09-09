import { useEffect, useRef, useState } from "react";
import { useQuotesStore } from "@/lib/quotesStore";
import { formatPrice } from "@/lib/quotesStore";

function FlashNumber({ value, decimal }: { value: number; decimal: number }) {
  const prevRef = useRef<number | null>(null);
  const [dir, setDir] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = value;
    if (prev === null || prev === value) return;
    setDir(value > prev ? "up" : "down");
  }, [value]);

  const cls =
    dir === "up"
      ? "bg-green-100 text-green-700"
      : dir === "down"
        ? "bg-red-100 text-red-700"
        : "";

  return (
    <span className={`inline-block rounded px-1 ${cls}`}>
      {formatPrice(value, decimal)}
    </span>
  );
}

export default function QuotesTable() {
  const quotes = useQuotesStore((s) => s.quotes);
  const rows = Object.entries(quotes);
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border-b px-2 py-2 text-left text-sm font-medium">
              Asset
            </th>
            <th className="border-b px-2 py-2 text-right text-sm font-medium">
              Bid
            </th>
            <th className="border-b px-2 py-2 text-right text-sm font-medium">
              Ask
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([symbol, q]) => (
            <tr key={symbol}>
              <td className="border-b px-2 py-2">{symbol}</td>
              <td className="border-b px-2 py-2 text-right">
                <FlashNumber value={q.bid_price} decimal={q.decimal} />
              </td>
              <td className="border-b px-2 py-2 text-right">
                <FlashNumber value={q.ask_price} decimal={q.decimal} />
              </td>
            </tr>
          ))}
          {rows.length === 0 ? (
            <tr>
              <td
                className="px-3 py-3 text-center text-muted-foreground"
                colSpan={3}
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
