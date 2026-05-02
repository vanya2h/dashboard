import { DropdownMenu } from "@cloudflare/kumo/components/dropdown";
import { GlobeIcon } from "@phosphor-icons/react";
import { useRouteLoaderData } from "react-router";
import type { loader } from "../../app/root";
import type { Locale } from "../lib/i18n";

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
      <DropdownMenu.Trigger
        render={
          <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors focus:outline-none" />
        }
      >
        <GlobeIcon size={16} />
        {LOCALE_LABELS[current]}
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item disabled={current === "en"} onClick={() => switchLocale("en")}>
          English
        </DropdownMenu.Item>
        <DropdownMenu.Item disabled={current === "ru"} onClick={() => switchLocale("ru")}>
          Русский
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
}
