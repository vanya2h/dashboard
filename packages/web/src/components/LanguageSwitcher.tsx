import { GlobeIcon } from "@phosphor-icons/react";
import { useRouteLoaderData } from "react-router";
import type { loader } from "../../app/root";
import type { Locale } from "../lib/i18n";
import { Button } from "./ui/Button";
import { Menu } from "./ui/Menu";

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
    <Menu.Root>
      <Menu.Trigger render={<Button />}>
        <GlobeIcon size={16} />
        {LOCALE_LABELS[current]}
      </Menu.Trigger>
      <Menu.Popup>
        <Menu.Item disabled={current === "en"} onClick={() => switchLocale("en")}>
          English
        </Menu.Item>
        <Menu.Item disabled={current === "ru"} onClick={() => switchLocale("ru")}>
          Русский
        </Menu.Item>
      </Menu.Popup>
    </Menu.Root>
  );
}
