import { Dialog as BaseDialog } from "@base-ui-components/react/dialog";
import clsx from "clsx";
import type { ComponentProps } from "react";

const Root = BaseDialog.Root;
const Trigger = BaseDialog.Trigger;
const Close = BaseDialog.Close;

function Title({ className, ...props }: ComponentProps<typeof BaseDialog.Title>) {
  return <BaseDialog.Title className={clsx("text-xl font-semibold text-foreground", className)} {...props} />;
}

function Description({ className, ...props }: ComponentProps<typeof BaseDialog.Description>) {
  return <BaseDialog.Description className={clsx("mt-2 text-base text-muted-foreground", className)} {...props} />;
}

function Popup({ children, className, ...props }: ComponentProps<typeof BaseDialog.Popup>) {
  return (
    <BaseDialog.Portal>
      <BaseDialog.Backdrop className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
      <BaseDialog.Popup
        className={clsx(
          "fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
          "w-full max-w-md bg-background border border-border p-6",
          "transition-all duration-200",
          "data-[ending-style]:opacity-0 data-[ending-style]:scale-95",
          "data-[starting-style]:opacity-0 data-[starting-style]:scale-95",
          className,
        )}
        {...props}
      >
        {children}
      </BaseDialog.Popup>
    </BaseDialog.Portal>
  );
}

export const Dialog = { Root, Trigger, Close, Popup, Title, Description };
