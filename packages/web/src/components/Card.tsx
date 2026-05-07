import type { ComponentProps } from "react";

import { cn } from "~/lib/utils";

export type CardProps = ComponentProps<"div"> & {
  active?: boolean;
  hoverable?: boolean;
};

export function Card({ active = false, hoverable = false, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-xl",
        "border border-border",
        "bg-card p-6 text-left transition-[background-color,border-color] duration-300 ease-out",
        "backdrop-blur-3xl",
        active
          ? "border-border-active bg-card-active"
          : hoverable
            ? "hover:border-border-hover hover:bg-card-hover"
            : "",
        className,
      )}
      {...props}
    />
  );
}

export type CardListProps = CardProps;

function CardList({ className, ...props }: CardListProps) {
  return <Card className={cn("overflow-hidden p-0", className)} {...props} />;
}

export type CardEntryProps = ComponentProps<"div">;

function CardEntry({ className, ...props }: CardEntryProps) {
  return <div className={cn("px-6 py-4 border-b border-border last:border-b-0 last:pb-6", className)} {...props} />;
}

export type CardHeadingProps = ComponentProps<"h2">;

function CardHeading({ className, ...props }: CardHeadingProps) {
  return <h2 className={cn("font-bold text-xl text-foreground", className)} {...props} />;
}

export type CardSubheadingProps = ComponentProps<"p">;

function CardSubheading({ className, ...props }: CardSubheadingProps) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

Card.List = CardList;
Card.Entry = CardEntry;
Card.Heading = CardHeading;
Card.CardSubheading = CardSubheading;
