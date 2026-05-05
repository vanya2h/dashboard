import type { ElementType } from "react";
import { cn } from "../lib/cn";

type AnimatedTextProps = {
  text: string;
  split: "char" | "word";
  animation: string;
  stagger: number;
  delay?: number;
  className?: string;
  as?: ElementType;
};

export function AnimatedText({
  text,
  split,
  animation,
  stagger,
  delay = 0,
  className,
  as: Tag = "span",
}: AnimatedTextProps) {
  const words = text.split(/(\s+)/);
  let unitIndex = 0;

  return (
    <Tag aria-label={text} className={className}>
      {words.map((word, i) => {
        if (/^\s+$/.test(word)) {
          return (
            <span key={i} aria-hidden="true">
              {word}
            </span>
          );
        }
        if (split === "word") {
          const idx = unitIndex++;
          return (
            <span
              key={i}
              aria-hidden="true"
              className={cn("inline-block", animation)}
              style={{ animationDelay: `${delay + idx * stagger}ms` }}
            >
              {word}
            </span>
          );
        }
        return (
          <span key={i} aria-hidden="true" className="inline-block">
            {Array.from(word).map((ch, j) => {
              const idx = unitIndex++;
              return (
                <span
                  key={j}
                  className={cn("inline-block", animation)}
                  style={{ animationDelay: `${delay + idx * stagger}ms` }}
                >
                  {ch}
                </span>
              );
            })}
          </span>
        );
      })}
    </Tag>
  );
}
