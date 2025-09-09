import { create } from "zustand";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export type OpenOrder = {
  id: string;
  type: "long" | "short";
  leverage: number;
  asset: string; // backend symbol like BTC_USDC_PERP
  margin: number;
  quantity: number;
  openPrice: number; // integer per decimal
};

type OpenOrdersState = {
  ordersById: Record<string, OpenOrder>;
  setAll: (orders: OpenOrder[]) => void;
  upsert: (order: OpenOrder) => void;
  remove: (orderId: string) => void;
};

export const useOpenOrdersStore = create<OpenOrdersState>((set) => ({
  ordersById: {},
  setAll: (orders) =>
    set({ ordersById: Object.fromEntries(orders.map((o) => [o.id, o])) }),
  upsert: (order) =>
    set((s) => ({ ordersById: { ...s.ordersById, [order.id]: order } })),
  remove: (orderId) =>
    set((s) => {
      const copy = { ...s.ordersById };
      delete copy[orderId];
      return { ordersById: copy };
    }),
}));

export function useFetchOpenOrders() {
  const setAll = useOpenOrdersStore((s) => s.setAll);
  return useQuery({
    queryKey: ["openOrders"],
    queryFn: async () => {
      const { data } = await api.get("/trade/open");
      // backend returns { message, trades: OpenOrder[] }
      const orders = (data?.trades ??
        data?.orders ??
        data ??
        []) as OpenOrder[];
      setAll(orders);
      return orders;
    },
    staleTime: 10_000,
  });
}

export function useCloseOrder() {
  const remove = useOpenOrdersStore((s) => s.remove);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: string) => {
      await api.post("/trade/close", { orderId });
      return orderId;
    },
    onSuccess: (orderId) => {
      remove(orderId);
      qc.invalidateQueries({ queryKey: ["openOrders"] });
      // Refetch available balance; engine may update it asynchronously
      qc.refetchQueries({ queryKey: ["balance.usd"], exact: true });
      setTimeout(() => {
        qc.refetchQueries({ queryKey: ["balance.usd"], exact: true });
      }, 600);
    },
  });
}
