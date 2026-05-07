import { Trans } from "@lingui/react/macro";
import { GithubLogoIcon } from "@phosphor-icons/react";
import { LanguageSwitcher } from "./LanguageSwitcher";

import { Button } from "~/components/ui/button";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border bg-background">
      <div className="px-6 py-3 flex items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-4 min-w-0">
          <span className="whitespace-nowrap">
            <Trans>© {currentYear} Learning Tracker</Trans>
          </span>
          <span className="whitespace-nowrap">
            <Trans>Beta</Trans>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Button variant="secondary" render={<a href="mailto:hi@vanya2h.me" />}>
            <Trans>Send feedback</Trans>
          </Button>
          <Button
            variant="secondary"
            size="icon"
            render={
              <a
                href="https://github.com/vanya2h/learn"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
              />
            }
          >
            <GithubLogoIcon />
          </Button>
        </div>
      </div>
    </footer>
  );
}
