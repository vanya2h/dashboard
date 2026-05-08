import type { ComponentProps } from "react";

import { cn } from "~/lib/utils";

export type CardProps = ComponentProps<"div"> & {
  active?: boolean;
  hoverable?: boolean;
};

export function Card({ active = false, hoverable = false, className, ...props }: CardProps) {
  return (
    <CardRaw
      className={cn(
        "flex flex-col rounded-xl",
        "border border-border",
        "bg-card p-4 sm:p-6 text-left transition-[background-color,border-color] duration-300 ease-out",
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

function CardRaw({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex flex-col", "p-4 sm:p-6 text-left", className)} {...props} />;
}

export type CardListProps = CardProps;

function CardList({ className, ...props }: CardListProps) {
  return <Card className={cn("overflow-hidden p-0 sm:p-0", className)} {...props} />;
}

export type CardEntryProps = ComponentProps<"div">;

function CardEntry({ className, ...props }: CardEntryProps) {
  return <CardEntryRaw className={cn("px-4 sm:px-5 py-4 sm:py-5 last:pb-6", className)} {...props} />;
}

export type CardEntryRawProps = ComponentProps<"div">;

function CardEntryRaw({ className, ...props }: CardEntryRawProps) {
  return <div className={cn("border-b border-border last:border-b-0", className)} {...props} />;
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
Card.EntryRaw = CardEntryRaw;
Card.Heading = CardHeading;
Card.SubHeading = CardSubheading;
Card.Raw = CardRaw;
