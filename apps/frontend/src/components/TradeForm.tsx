import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { useQuotesStore } from "@/lib/quotesStore";
import { appToBackendSymbol } from "@/lib/symbols";
import { useOpenOrdersStore } from "@/lib/openOrdersStore";
import { toDecimalNumber } from "@/lib/utils";

export default function TradeForm() {
  const { selectedSymbol, quotes } = useQuotesStore();
  const q = quotes[selectedSymbol];
  const [type, setType] = useState<"long" | "short">("long");
  const [quantity, setQuantity] = useState(0);
  const [leverage, setLeverage] = useState(1);
  const [slippage, setSlippage] = useState(0.1);

  const openPrice = q ? (type === "long" ? q.ask_price : q.bid_price) : 0; // integer price from ws (scaled)
  const decimal = q ? q.decimal : 4;

  const upsert = useOpenOrdersStore((s) => s.upsert);
  const { mutate, isPending, isSuccess, error } = useMutation({
    mutationFn: async () => {
      const slippageBips = Math.round(Number(slippage) * 100);
      const payload = {
        asset: appToBackendSymbol(selectedSymbol),
        type,
        quantity: Number(quantity),
        leverage: Number(leverage),
        slippage: slippageBips,
        openPrice,
        decimal,
      };
      const { data } = await api.post("/trade/open", payload);
      return data;
    },
    onSuccess: (data: any) => {
      if (data?.order) {
        upsert(data.order);
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        mutate();
      }}
      style={{ display: "grid", gap: 10 }}
    >
      <div style={{ display: "flex", gap: 8 }}>
        <button
          type="button"
          onClick={() => setType("long")}
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: 8,
            border: type === "long" ? "2px solid #16a34a" : "1px solid #eee",
            background: type === "long" ? "#e6f7ec" : "#fff",
            fontWeight: 600,
          }}
        >
          Long
        </button>
        <button
          type="button"
          onClick={() => setType("short")}
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: 8,
            border: type === "short" ? "2px solid #dc2626" : "1px solid #eee",
            background: type === "short" ? "#fdecec" : "#fff",
            fontWeight: 600,
          }}
        >
          Short
        </button>
      </div>

      <label style={{ display: "grid", gap: 6, fontSize: 12 }}>
        Asset
        <input
          value={selectedSymbol}
          disabled
          style={{ padding: 8, border: "1px solid #eee", borderRadius: 6 }}
        />
      </label>

      <label style={{ display: "grid", gap: 6, fontSize: 12 }}>
        Quantity
        <input
          type="number"
          step="0.0001"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          required
          style={{ padding: 8, border: "1px solid #eee", borderRadius: 6 }}
        />
      </label>

      <label style={{ display: "grid", gap: 6, fontSize: 12 }}>
        Leverage
        <input
          type="number"
          step="1"
          min={1}
          value={leverage}
          onChange={(e) => setLeverage(Number(e.target.value))}
          required
          style={{ padding: 8, border: "1px solid #eee", borderRadius: 6 }}
        />
      </label>

      <label style={{ display: "grid", gap: 6, fontSize: 12 }}>
        Slippage (%)
        <input
          type="number"
          step="0.01"
          value={slippage}
          onChange={(e) => setSlippage(Number(e.target.value))}
          required
          style={{ padding: 8, border: "1px solid #eee", borderRadius: 6 }}
        />
      </label>

      <div style={{ display: "grid", gap: 4, fontSize: 12 }}>
        <div>
          Open Price: {openPrice ? toDecimalNumber(openPrice, decimal) : "-"}
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        style={{
          padding: "10px 12px",
          borderRadius: 8,
          border: "1px solid #eee",
          background: "#111",
          color: "#fff",
          fontWeight: 600,
        }}
      >
        {isPending ? "Placing…" : "Place Order"}
      </button>

      {isSuccess ? (
        <div style={{ color: "#16a34a", fontSize: 12 }}>Order placed.</div>
      ) : null}
      {error ? (
        <div style={{ color: "#dc2626", fontSize: 12 }}>
          {(error as Error).message || "Failed"}
        </div>
      ) : null}
    </form>
  );
}
