import { GlobeIcon } from "@phosphor-icons/react";
import { useRouteLoaderData } from "react-router";
import type { loader } from "../../app/root";
import type { Locale } from "../lib/i18n";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  ru: "Русский",
};

function switchLocale(locale: Locale) {
  document.cookie = `locale=${locale}; path=/; max-age=${60 * 60 * 24 * 365}`;
  window.location.reload();
}

export function LanguageSwitcher() {
  const data = useRouteLoaderData<typeof loader>("root");
  const current = data?.locale ?? "en";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="secondary" />}>
        <GlobeIcon size={16} />
        <span className="hidden sm:inline">{LOCALE_LABELS[current]}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem disabled={current === "en"} onClick={() => switchLocale("en")}>
          English
        </DropdownMenuItem>
        <DropdownMenuItem disabled={current === "ru"} onClick={() => switchLocale("ru")}>
          Русский
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
