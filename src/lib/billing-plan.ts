import { createContext, useContext } from "react";
export interface Plan {
  plan?: string;
  active: boolean;
  features: string[];
  expires_at?: string;
}
export const Context = createContext<Plan | null>(null);
export const useWeddingPlan = () => useContext(Context);
