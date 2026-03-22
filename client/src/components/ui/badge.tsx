import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:     "border-transparent bg-[#111111] text-white",
        secondary:   "border-[#E8E8E8] bg-[#F7F7F7] text-[#111111]",
        destructive: "border-transparent bg-[#DC2626] text-white",
        outline:     "border-[#E8E8E8] text-[#666666]",
        hot:         "border-transparent bg-[#DC2626] text-white",
        warm:        "border-transparent bg-[#D97706] text-white",
        cold:        "border-transparent bg-[#6B7280] text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
