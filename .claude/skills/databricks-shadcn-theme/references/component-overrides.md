# DuBois Component Overrides for shadcn/ui

Per-component guidance for making shadcn/ui components match the DuBois design system.
Apply these after running `npx shadcn@latest add <component>`.

**Priority legend:**
- **P0** — Must fix for visual correctness. These are the most visible differences.
- **P1** — Important for density and layout consistency.
- **P2** — Polish; noticeable to designers but won't break the experience.

---

## P0 — Button (`components/ui/button.tsx`)

DuBois buttons have tighter sizing, 4px radius, and different variant names than shadcn.

### Sizes
| DuBois Size | Height | shadcn class | Notes |
|-------------|--------|--------------|-------|
| Default (lg) | 40px | `h-10` | shadcn default is also h-10 ✓ |
| Medium (md) | 32px | `h-8` | shadcn `sm` = h-9, change to h-8 |
| Small (sm) | 24px | `h-6` | Add as new "xs" variant |

### Variants mapping
| DuBois Variant | shadcn Variant | Changes needed |
|----------------|----------------|----------------|
| `primary` | `default` | bg-primary, white text — correct |
| `default` (outline) | `outline` | grey100 border, transparent bg |
| `tertiary` (ghost) | `ghost` | No border, transparent |
| `danger` | `destructive` | red600 bg — correct |
| `link` | `link` | blue600 text — correct |

### Key changes to `buttonVariants` in `button.tsx`

```tsx
const buttonVariants = cva(
  // Base classes — DuBois specific
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        default:     "bg-primary text-primary-foreground hover:bg-[hsl(207,82%,30%)] active:bg-[hsl(208,92%,19%)]",
        outline:     "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        ghost:       "hover:bg-accent hover:text-accent-foreground",
        destructive: "bg-destructive text-destructive-foreground hover:bg-[hsl(348,73%,40%)]",
        link:        "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",    // 40px height
        sm:      "h-8 px-4 py-1.5",   // 32px height (DuBois md)
        xs:      "h-6 px-3 py-1",     // 24px height (DuBois sm)
        icon:    "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-xs": "h-6 w-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

**Key diffs from shadcn default:**
- `rounded` (4px) instead of `rounded-md` (6px)
- `font-semibold` (600) instead of `font-medium` (500)
- `disabled:opacity-40` instead of `disabled:opacity-50`
- No `lg` size (DuBois doesn't have one)
- `sm` height = 32px (`h-8`), not 36px (`h-9`)

---

## P0 — Input (`components/ui/input.tsx`)

```tsx
// Replace className in <input>:
className={cn(
  "flex h-10 w-full rounded border border-input bg-background px-3 py-1.5",
  "text-sm ring-offset-background",                           // 13px via text-sm
  "placeholder:text-muted-foreground",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0",
  "disabled:cursor-not-allowed disabled:opacity-40",
  "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
  className
)}
```

**Key diffs:**
- `h-10` (40px height) — same as default ✓
- `ring-offset-0` — DuBois focus ring is inset, no offset
- `border-input` → grey100/grey700 (set by globals.css)
- `opacity-40` disabled state (not 50%)
- Add `aria-invalid` error state styles

---

## Label (`components/ui/label.tsx`)

Field labels (inputs, selects, textareas) use **`font-semibold` (600)** per DuBois. For checkbox, radio, and switch labels that should read as body text next to the control, pass **`className="font-normal"`** (and e.g. `cursor-pointer`) so `tailwind-merge` overrides the default weight.

---

## P0 — Badge (`components/ui/badge.tsx`)

Add DuBois secondary color variants. Each uses light background + darker text.

```tsx
const badgeVariants = cva(
  "inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default:     "border-transparent bg-primary text-primary-foreground",
        secondary:   "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground",
        outline:     "border-border text-foreground",
        // DuBois secondary palette
        coral:      "border-transparent bg-coral-100 text-coral-700",
        brown:      "border-transparent bg-brown-100 text-brown-700",
        indigo:     "border-transparent bg-indigo-100 text-indigo-700",
        lemon:      "border-transparent bg-lemon-100 text-lemon-700",
        lime:       "border-transparent bg-lime-100 text-lime-700",
        pink:       "border-transparent bg-pink-100 text-pink-700",
        purple:     "border-transparent bg-purple-100 text-purple-700",
        teal:       "border-transparent bg-teal-100 text-teal-700",
        turquoise:  "border-transparent bg-turquoise-100 text-turquoise-700",
      },
    },
    defaultVariants: { variant: "default" },
  }
);
```

**Note:** `rounded-sm` (4px) instead of shadcn's `rounded-full`. DuBois tags are rectangular.

---

## P1 — Dialog (`components/ui/dialog.tsx`)

DuBois dialogs use generous 40px padding and remove header/footer dividers.

```tsx
// DialogContent — replace padding and remove border from header area
const DialogContent = React.forwardRef<...>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%]",
        "gap-0 rounded-md border bg-background shadow-db-lg duration-200",  // gap-0, rounded-md (8px)
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
        "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPortal>
));

// DialogHeader — 40px top padding, 20px bottom, NO border-bottom
const DialogHeader = ({ className, ...props }) => (
  <div
    className={cn("flex flex-col space-y-1 px-10 pt-10 pb-5", className)}
    {...props}
  />
);

// DialogFooter — 40px bottom/side padding, NO border-top
const DialogFooter = ({ className, ...props }) => (
  <div
    className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 px-10 pb-10 pt-5", className)}
    {...props}
  />
);

// DialogBody (add this custom section between Header and Footer)
const DialogBody = ({ className, ...props }) => (
  <div
    className={cn("px-10 py-0", className)}
    {...props}
  />
);
```

---

## P1 — Table (`components/ui/table.tsx`)

```tsx
// TableRow — add DuBois hover/selected states
const TableRow = React.forwardRef<...>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b border-border transition-colors",
      "hover:bg-[rgba(68,83,95,0.04)] dark:hover:bg-[rgba(189,205,219,0.04)]",  // DuBois row hover
      "data-[state=selected]:bg-[rgba(68,83,95,0.08)] dark:data-[state=selected]:bg-[rgba(189,205,219,0.08)]",
      className
    )}
    {...props}
  />
));

// TableHead — 13px font, medium weight
const TableHead = React.forwardRef<...>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-10 px-3 text-left align-middle text-xs font-semibold text-muted-foreground",
      "[&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
));

// TableCell — tighter padding, 13px font
const TableCell = React.forwardRef<...>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "px-3 py-2 align-middle text-sm",   // py-2 = 8px, tighter than shadcn's py-4
      "[&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
));
```

---

## P1 — Alert (`components/ui/alert.tsx`)

DuBois alerts use colored left borders and tinted backgrounds.

```tsx
const alertVariants = cva(
  "relative w-full rounded-md border-l-4 p-4 text-sm",   // left border accent, not full border
  {
    variants: {
      variant: {
        default:     "border-l-primary bg-primary/5 text-foreground",
        info:        "border-l-primary bg-primary/5 text-foreground",
        destructive: "border-l-destructive bg-destructive/5 text-foreground [&>svg]:text-destructive",
        warning:     "border-l-[hsl(var(--warning))] bg-[hsl(var(--warning))]/5 text-foreground",
        success:     "border-l-[hsl(var(--success))] bg-[hsl(var(--success))]/5 text-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  }
);
```

---

## P2 — Tabs (`components/ui/tabs.tsx`)

DuBois **line** tabs (`TabsList variant="line"`): full-width list with `border-b border-border` (often via `className` on `TabsList`), **no horizontal padding** on the list (`px-0 py-1`), **`gap-4`** (16px between tabs), **TabsTrigger** `px-0`; active tab uses primary text + semibold + `after:` blue underline indicator. **Default** pill tabs: `TabsList` `bg-muted p-[3px]`, **TabsTrigger** `px-2`.

```tsx
// Usage — line variant (typical page tabs)
<TabsList variant="line" className="w-full justify-start border-b border-border mb-6">
  <TabsTrigger value="a">Subscription & billing</TabsTrigger>
</TabsList>
```

---

## P2 — Tooltip (`components/ui/tooltip.tsx`)

DuBois tooltips: grey800 bg, 12px font, no arrow.

```tsx
const TooltipContent = React.forwardRef<...>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded px-3 py-1.5 text-xs",
      "bg-grey-800 text-white dark:bg-grey-100 dark:text-grey-800",   // DuBois: dark bg in light mode
      "animate-in fade-in-0 zoom-in-95",
      "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
      "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
      "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
));
```

---

## P2 — Card (`components/ui/card.tsx`)

DuBois cards: 8px radius (not 4px), subtle shadow.

```tsx
const Card = React.forwardRef<...>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-md border border-border bg-card text-card-foreground shadow-db-sm",
      className
    )}
    {...props}
  />
));

// CardHeader — tighter padding
const CardHeader = React.forwardRef<...>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1 p-4", className)}   // p-4 = 16px, not p-6
    {...props}
  />
));

// CardContent
const CardContent = React.forwardRef<...>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("p-4 pt-0", className)}
    {...props}
  />
));

// CardFooter
const CardFooter = React.forwardRef<...>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-4 pt-0", className)}
    {...props}
  />
));
```

---

## Component Override Summary

| Priority | Component | Done? | Key changes |
|----------|-----------|-------|-------------|
| P0 | `button.tsx` | ☐ | 4px radius, 40/32/24 heights, font-semibold |
| P0 | `input.tsx` | ☐ | 40px h, 13px font, 4px radius, ring-offset-0 |
| P0 | `badge.tsx` | ☐ | 4px radius, 9 secondary color variants |
| P1 | `dialog.tsx` | ☐ | 40px padding, no header/footer borders |
| P1 | `table.tsx` | ☐ | DuBois hover/selected colors, tighter cells |
| P1 | `alert.tsx` | ☐ | Left border accent, tinted backgrounds |
| P2 | `tabs.tsx` | ☐ | Blue bottom indicator, 600 weight active |
| P2 | `tooltip.tsx` | ☐ | grey800 bg, 12px font |
| P2 | `card.tsx` | ☐ | 8px radius (rounded-md), db-sm shadow |

---

## Tips for Applying Overrides with Claude Code

Ask Claude one component at a time with this prompt pattern:

```
Open src/components/ui/button.tsx and apply the DuBois overrides from
.claude/skills/databricks-shadcn-theme/references/component-overrides.md.
Read the component-overrides.md file first, then update button.tsx.
```

This ensures Claude reads the reference file and applies the exact changes, rather than
guessing from memory.
