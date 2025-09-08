export type BackpackDataType = {
  A: string;
  B: string;
  E: number;
  T: number;
  a: string;
  b: string;
  e: string;
  s: string;
  u: number;
};

export type FilteredDataType = {
  ask_price: number;
  bid_price: number;
  decimal: number;
};

export type UserBalance = {
  balance: number;
  decimal: number;
};

export enum OrderType {
  long = "long",
  short = "short",
}

export type OpenOrders = {
  id: string;
  openPrice: number;
  leverage: number;
  asset: string;
  margin: number;
  quantity: number;
  type: OrderType;
};

export type AssetBalance = Record<
  string,
  {
    balance: number;
    decimal: number;
  }
>;

export type EngineResponseType = {
  type: string;
  reqId: string;
  payload: unknown;
};
