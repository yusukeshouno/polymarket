"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { Lang } from "@/lib/i18n";

interface LangCtx {
  lang: Lang;
  toggle: () => void;
}

const Ctx = createContext<LangCtx>({ lang: "en", toggle: () => {} });

export function LangProvider({
  initial,
  children,
}: {
  initial: Lang;
  children: ReactNode;
}) {
  const [lang, setLang] = useState<Lang>(initial);

  const toggle = useCallback(() => {
    setLang((prev) => {
      const next: Lang = prev === "en" ? "ja" : "en";
      // Update URL without navigation (keeps tag param etc.)
      const url = new URL(window.location.href);
      if (next === "en") {
        url.searchParams.delete("lang");
      } else {
        url.searchParams.set("lang", next);
      }
      window.history.replaceState({}, "", url.toString());
      return next;
    });
  }, []);

  return <Ctx.Provider value={{ lang, toggle }}>{children}</Ctx.Provider>;
}

export function useLang() {
  return useContext(Ctx);
}
