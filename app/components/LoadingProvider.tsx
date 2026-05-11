"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

import LoadingGlow from "./LoadingGlow";

const Ctx = createContext<(v: boolean) => void>(() => {});

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(false);

  const set = useCallback((v: boolean) => setLoading(v), []);

  return (
    <Ctx.Provider value={set}>
      {children}
      <LoadingGlow visible={loading} />
    </Ctx.Provider>
  );
}

export function useGlobalLoading() {
  return useContext(Ctx);
}
