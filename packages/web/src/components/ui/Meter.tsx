import { Meter as BaseMeter } from "@base-ui-components/react/meter";
import { cn } from "../../lib/cn";

type Props = {
  value: number;
  label: string;
  showValue?: boolean;
  className?: string;
};

export function Meter({ value, label, showValue = false, className }: Props) {
  return (
    <BaseMeter.Root value={value} className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-baseline justify-between text-[11px] font-mono uppercase tracking-[0.15em]">
        <BaseMeter.Label className="text-muted-foreground">{label}</BaseMeter.Label>
        {showValue && <BaseMeter.Value className="text-foreground tabular-nums" />}
      </div>
      <BaseMeter.Track className="h-1 bg-muted overflow-hidden">
        <BaseMeter.Indicator className="block h-full bg-foreground transition-[width] duration-500 ease-out" />
      </BaseMeter.Track>
    </BaseMeter.Root>
  );
}
