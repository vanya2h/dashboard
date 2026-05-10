import { DEFAULT_LOCALE, isLocale, type Locale } from "../../src/lib/i18n";
import { useRootData } from "./useRootData";

export function useLocale(): Locale {
  const raw = useRootData()?.locale;
  return raw && isLocale(raw) ? raw : DEFAULT_LOCALE;
}
