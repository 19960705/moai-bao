import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "h-11 w-full border border-rule bg-paper px-3 text-sm text-ink outline-none placeholder:text-muted focus-visible:border-ink",
        className,
      )}
      {...props}
    />
  );
}
