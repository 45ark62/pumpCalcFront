import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "app/lib/utils"

/**
 * Typography styles match https://ui.shadcn.com/docs/components/typography
 * (utility classes; composed into one component with variants).
 */
const typographyVariants = cva("", {
  variants: {
    variant: {
      h1: "scroll-m-20 text-4xl font-extrabold tracking-tight text-balance lg:text-5xl",
      h2: "mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0",
      h3: "mt-8 scroll-m-20 text-2xl font-semibold tracking-tight",
      h4: "scroll-m-20 text-xl font-semibold tracking-tight",
      p: "leading-7 [&:not(:first-child)]:mt-6",
      lead: "text-xl text-muted-foreground",
      large: "text-lg font-semibold",
      small: "text-sm leading-none font-medium",
      muted: "text-sm text-muted-foreground",
      blockquote: "mt-6 border-l-2 pl-6 italic",
      list: "my-6 ml-6 list-disc [&>li]:mt-2",
      inlineCode:
        "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
    },
  },
  defaultVariants: {
    variant: "p",
  },
})

const defaultTagByVariant: Record<
  NonNullable<VariantProps<typeof typographyVariants>["variant"]>,
  React.ElementType
> = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  p: "p",
  lead: "p",
  large: "div",
  small: "small",
  muted: "p",
  blockquote: "blockquote",
  list: "ul",
  inlineCode: "code",
}

type TypographyProps = React.ComponentPropsWithoutRef<"div"> &
  VariantProps<typeof typographyVariants> & {
    asChild?: boolean
    as?: React.ElementType
  }

function Typography({
  className,
  variant = "p",
  asChild = false,
  as: ComponentProp,
  ...props
}: TypographyProps) {
  const Comp = asChild
    ? Slot.Root
    : ComponentProp ?? defaultTagByVariant[variant ?? "p"]

  return (
    <Comp
      data-slot="typography"
      data-variant={variant}
      className={cn(typographyVariants({ variant, className }))}
      {...props}
    />
  )
}

export { Typography, typographyVariants }
