import { Menu as BaseMenu } from "@base-ui-components/react/menu";
import clsx from "clsx";
import type { ComponentProps } from "react";

const Root = BaseMenu.Root;
const Trigger = BaseMenu.Trigger;

function Popup({ children, className, ...props }: ComponentProps<typeof BaseMenu.Popup>) {
  return (
    <BaseMenu.Portal>
      <BaseMenu.Positioner sideOffset={6} className="z-50 outline-none">
        <BaseMenu.Popup
          className={clsx(
            "min-w-[200px] bg-background border border-border p-1",
            "shadow-lg",
            "transition-all duration-150",
            "data-[ending-style]:opacity-0 data-[ending-style]:scale-95",
            "data-[starting-style]:opacity-0 data-[starting-style]:scale-95",
            "origin-[var(--transform-origin)]",
            className,
          )}
          {...props}
        >
          {children}
        </BaseMenu.Popup>
      </BaseMenu.Positioner>
    </BaseMenu.Portal>
  );
}

function Item({ className, ...props }: ComponentProps<typeof BaseMenu.Item>) {
  return (
    <BaseMenu.Item
      className={clsx(
        "flex items-center gap-2 px-3 py-2 text-sm cursor-pointer select-none outline-none",
        "data-[highlighted]:bg-muted/60",
        "data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed",
        className,
      )}
      {...props}
    />
  );
}

function Group({ className, ...props }: ComponentProps<typeof BaseMenu.Group>) {
  return <BaseMenu.Group className={clsx("flex flex-col", className)} {...props} />;
}

function GroupLabel({ className, ...props }: ComponentProps<typeof BaseMenu.GroupLabel>) {
  return <BaseMenu.GroupLabel className={clsx("px-3 py-2", className)} {...props} />;
}

function Separator({ className, ...props }: ComponentProps<typeof BaseMenu.Separator>) {
  return <BaseMenu.Separator className={clsx("my-1 h-px bg-border", className)} {...props} />;
}

export const Menu = { Root, Trigger, Popup, Item, Group, GroupLabel, Separator };
