import type { ReactNode } from "react";
import { Container } from "./layout/Container";
import { Footer } from "./Footer";
import { GradientBackground } from "./GradientBg";

import { useTheme } from "~/hooks/useTheme";
import { GRADIENT_PRESETS } from "~/lib/gradient";

export function AuthLayout({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  return (
    <Container>
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-5">
        <div className="lg:col-span-2 flex items-center justify-center px-4 py-16">
          <div className="w-full max-w-md space-y-8 p-6">{children}</div>
        </div>
        <div className="hidden lg:block lg:col-span-3 relative isolate overflow-hidden border-r border-border">
          <GradientBackground
            className="-z-10"
            preset={theme === "dark" ? GRADIENT_PRESETS.heroDark : GRADIENT_PRESETS.heroLight}
          />
        </div>
      </div>
      <Footer />
    </Container>
  );
}
