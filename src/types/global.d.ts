// Global type declarations for window object extensions

interface DealClickPayload {
  deal_id: string;
  origin: string;
  destination: string;
  price: number;
  currency: string;
  airline: string;
}

declare global {
  interface Window {
    trackDealClick?: (payload: DealClickPayload) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

export {};

