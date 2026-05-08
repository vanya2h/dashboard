import { code } from "@streamdown/code";
import type { ComponentProps } from "react";
import { type ExtraProps, Streamdown } from "streamdown";

import { cn } from "~/lib/utils";

export function Markdown({ children, isAnimating = false }: { children: string; isAnimating?: boolean }) {
  return (
    <div className="text-sm leading-relaxed text-foreground [&_p]:mb-3 [&_pre]:rounded-lg [&_pre]:text-xs [&_pre]:overflow-x-auto [&_code:not(pre_code)]:text-xs">
      <Streamdown
        animated
        isAnimating={isAnimating}
        plugins={{ code }}
        shikiTheme={["github-light", "github-dark"]}
        components={{ ul: MarkdownUl, ol: MarkdownOl, li: MarkdownLi }}
      >
        {children}
      </Streamdown>
    </div>
  );
}

function MarkdownUl({ node: _node, className, ...restProps }: ComponentProps<"ul"> & ExtraProps) {
  return <ul className={cn("list-none pl-2", className)} {...restProps} />;
}

function MarkdownOl({ node: _node, className, ...restProps }: ComponentProps<"ol"> & ExtraProps) {
  return <ol className={cn("list-decimal pl-4", className)} {...restProps} />;
}

function MarkdownLi({ node: _node, className, ...restProps }: ComponentProps<"li"> & ExtraProps) {
  return (
    <li
      className={cn(
        "relative before:text-muted-foreground in-[ul]:pl-6 in-[ul]:before:absolute in-[ul]:before:left-0 in-[ul]:before:content-['—']",
        className,
      )}
      {...restProps}
    />
  );
}
