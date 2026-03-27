# CLAUDE.md — Databricks Designer Starter Kit

You are building UI for a **Databricks internal tool** using this Next.js + shadcn/ui starter kit.
The DuBois design system rules below are **always active** — apply them to every component you generate.

---

## DuBois Design System Rules

### Typography
- Base font: `-apple-system, BlinkMacSystemFont, "Helvetica Neue", ui-sans-serif, system-ui, sans-serif` (Apple system font first)
- Base size: **13px** — already set on `body` in `globals.css`. Do not set `font-size` on `html`.
- `text-sm` = **13px** (overridden from Tailwind's default 14px)
- Bold weight: **`font-semibold` (600)** — never use `font-bold` (700)
- Line height base: 20px

### Sizing & Spacing
- Spacing grid: **8px base unit** — use `gap-2` (8px), `gap-4` (16px), `gap-6` (24px), `gap-8` (32px)
- Button heights: **32px** (sm `h-8`, default), **24px** (xs `h-6`) — no 40px size in DuBois
- Input/Select height: **32px** (`h-8`)

### Border Radius
- Buttons, inputs, badges, dropdowns: **`rounded`** (4px)
- Cards, modals, panels: **`rounded-md`** (8px)
- Never use `rounded-lg` or `rounded-xl` for interactive elements

### Colors — always use CSS variables, never raw hex
| Element | Class | Value |
|---|---|---|
| Primary action | `bg-primary` / `text-primary` | blue-600 #2272B4 |
| Primary hover | `hover:bg-blue-700` | #0E538B |
| Body text | `text-foreground` | grey-800 #11171C |
| Secondary text | `text-muted-foreground` | grey-500 #5F7281 |
| Page background | `bg-background` | white / grey-800 dark |
| Subtle background | `bg-secondary` / `bg-muted` | grey-050 #F6F7F9 |
| Borders | `border-border` | grey-100 #E8ECF0 |
| Danger | `bg-destructive` / `text-destructive` | red-600 #C82D4C |
| Success | `text-[var(--success)]` | green-600 #277C43 |
| Warning | `text-[var(--warning)]` | yellow-600 #BE501E |

### Component Overrides Already Applied
These shadcn components have DuBois overrides — use them as-is:
- **`Button`** — 4px radius, sizes: `sm` 32px (default) · `xs` 24px · `icon-sm` 32px · `icon-xs` 24px, **font-weight 400 (normal)**, variants: `default` `outline` `ghost` `destructive` `link`
- **`Input`** — 32px height (`h-8`), 4px radius, inset focus ring (no offset)
- **`Select`** / **`SelectTrigger`** — 32px height (`h-8`), 4px radius, no size variants
- **`Label`** — `text-sm` (13px), **`font-semibold` (600)** for field labels; use `className="font-normal"` for checkbox / switch / inline control labels
- **`Badge`** — rectangular (4px radius), variants: `default` `secondary` `destructive` `outline` `coral` `brown` `indigo` `lemon` `lime` `pink` `purple` `teal` `turquoise`
- **`Dialog`** / **`DialogHeader`** / **`DialogFooter`** / **`DialogBody`** — 40px padding, no dividers
- **`Table`** / **`TableRow`** — DuBois hover/selected row colors; **`TableHead`** always `text-sm` (13px)
- **`Alert`** — variants: `default` `info` `warning` `success` `destructive` — full border with light tinted bg, 4px radius. CSS tokens: `--border-danger` `--border-warning` `--border-success` `--background-danger` `--background-warning` `--background-success`
- **`Tabs`** / **`TabsList`** — use `variant="line"` for DuBois underline style; line **TabsList** uses `px-0 py-1`, `gap-4` (16px between tabs), line **TabsTrigger** has no horizontal padding (`px-0`); pill **default** keeps `p-[3px]` on the list and `px-2` on triggers
- **`Tooltip`** — grey-800 background (dark in light mode), `text-sm` (13px)
- **`Card`** — 8px radius, subtle shadow
- **`Breadcrumb`** — `BreadcrumbLink` uses `text-primary` · `BreadcrumbPage` uses `text-muted-foreground` · separator is ChevronRight at `size-3`

### Icons
- **Generic icons** → `lucide-react`, always `className="h-4 w-4"` (16px)
- **Databricks-specific icons** → `@/components/icons` (**445 DuBois icons**)
- **AI gradient icons** → `<DbIcon icon={SparkleIcon} color="ai" size={16} />` from `@/components/ui/db-icon`
- **Icon color in shell/UI chrome** → always `text-muted-foreground` (grey-500) unless active/primary
- **Genie / AI Assistant nav item** → use `AssistantIcon`, never the colored sparkle variant

Key Databricks icons available:
`NotebookIcon` `CatalogIcon` `PipelineIcon` `WorkflowsIcon` `SchemaIcon`
`AssistantIcon` `ModelsIcon` `SparkleDoubleFillIcon` `SparkleFillIcon`
`BranchIcon` `QueryEditorIcon` `WorkspacesIcon` `DataIcon` `ErdIcon`
`SidebarCollapseIcon` `SidebarExpandIcon` `AppIcon` `StorefrontIcon`

### AI Gradient
```css
background: linear-gradient(135deg, #4299E0 20.5%, #CA42E0 46.91%, #FF5F46 79.5%);
```
- Use `className="bg-ai-gradient"` for gradient backgrounds
- Use `className="text-ai-gradient"` for gradient text
- Use `<DbIcon icon={SparkleIcon} color="ai" size={16} />` for AI icons

### Do's and Don'ts
✅ Use semantic CSS variables (`text-foreground`, `bg-primary`, `border-border`)
✅ Use `font-semibold` for headings/emphasis — but **not** for buttons (buttons use `font-normal`)
✅ Use `rounded` (4px) for interactive elements
✅ Use DuBois icons from `@/components/icons` for Databricks concepts
✅ Support dark mode — all tokens are already defined in `globals.css`

❌ Never hardcode hex colors
❌ Never use `font-bold` (700) — use `font-semibold` (600)
❌ Never use `rounded-lg` for buttons/inputs
❌ Never use Databricks brand orange (`#FF3621`) for UI — it's marketing only
❌ Never set `font-size` on `html` element (breaks Tailwind rem scale)

---

## Project Structure

```
src/
├── app/
│   ├── globals.css           ← DuBois theme (Tailwind v4 @theme)
│   ├── layout.tsx            ← ThemeProvider + TooltipProvider
│   ├── page.tsx              ← Home
│   ├── shell/                ← Full shell demo at /shell
│   └── design-system/        ← Component reference at /design-system
├── components/
│   ├── ui/                   ← shadcn components (DuBois-overridden)
│   │   └── db-icon.tsx       ← DbIcon wrapper for Lucide + DuBois icons
│   ├── icons/                ← 445 DuBois SVG components + index.ts
│   ├── shell/
│   │   ├── AppShell.tsx      ← Layout wrapper (owns sidebar open/close state)
│   │   ├── TopBar.tsx        ← 48px top navigation bar
│   │   ├── Sidebar.tsx       ← Collapsible left nav (220px / hidden)
│   │   ├── NewButton.tsx     ← Brand-tinted "+ New" sidebar button (32px, rounded-md)
│   │   ├── PageHeader.tsx    ← Page-level header: breadcrumbs + title + actions
│   │   ├── DatabricksLogo.tsx← SVG lockup, dark-mode aware
│   │   └── index.ts          ← Barrel export
│   └── theme-toggle.tsx
├── scripts/
│   └── sync-icons.mjs        ← Bulk icon sync from DuBois source
└── lib/utils.ts
```

---

## Shell Architecture

### AppShell
Wraps every page. Owns sidebar collapsed/expanded state.

```tsx
import { AppShell } from "@/components/shell"

<AppShell activeItem="workspace" workspace="Production" userInitial="N">
  {/* page content */}
</AppShell>
```

Props: `activeItem` `onNavigate` `workspace` `userInitial`

### Layout rules
| Zone | Background | Notes |
|---|---|---|
| Full shell (outer) | `bg-secondary` | grey-050 — TopBar + Sidebar blend in, no dividing borders |
| TopBar | `bg-secondary` | No `border-b` |
| Sidebar | `bg-secondary` | No `border-r` |
| Main content | `bg-background` + `border border-border` + `rounded-md` | White card · `mb-2 mr-2` · `ml-2` added when sidebar is closed |

### TopBar rules
- Height: `h-12` (48px)
- Logo: `<DatabricksLogo height={18} />` — brickwork `#FF3621`, wordmark `currentColor` (dark-mode aware)
- Search: `h-8 rounded bg-background border-border` (white on grey topbar), `⌘P` kbd hint
- All chrome icons: `text-muted-foreground` — sidebar toggle, AppIcon
- App switcher: `AppIcon` from `@/components/icons` (never `CustomAppIcon` or lucide `LayoutGrid`)
- AI button: `<DbIcon icon={SparkleIcon} color="ai" size={16} />` — always AI gradient, not muted

### Sidebar rules
- Width: `w-[220px]` expanded / `w-0 overflow-hidden` collapsed (fully hidden, never icon-only)
- When collapsed, main content gets `ml-2` for equal left/right spacing (both 8px)
- `+ New` button: `NewButton` component — `h-8` (32px), `rounded-md` (8px), brand-red tint `rgba(255,54,33,…)`
- NewButton and nav scroll together in a single `overflow-y-auto` container
- Active nav item: `bg-primary/10 text-primary font-semibold`
- Inactive nav item: `text-foreground hover:bg-muted-foreground/10`
- Section labels: `text-xs font-normal text-muted-foreground` — collapsible, ChevronRight next to label
- Chevron: `opacity-0` when expanded (shows on `group-hover`), `opacity-100` when collapsed, `rotate-90` when expanded

### Nav sections
| Section | Items |
|---|---|
| (top, unlabelled) | Workspace · Recents · Catalog · Workflows · Compute · Marketplace |
| SQL | SQL Editor · Queries · Dashboards · Genie · Alerts · Query History · SQL Warehouses |
| Data Engineering | Job Runs · Data Ingestion · Pipelines |
| Machine Learning | Playground · Experiments · Features · Models · Serving |

### PageHeader
Page-level header. Place at the top of page content, inside `p-6`.

```tsx
import { PageHeader } from "@/components/shell"
import {
  Breadcrumb, BreadcrumbList, BreadcrumbItem,
  BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { MoreVertical } from "lucide-react"

<PageHeader
  breadcrumbs={
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem><BreadcrumbLink href="#">Workspace</BreadcrumbLink></BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem><BreadcrumbPage>Catalog</BreadcrumbPage></BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  }
  title="main"
  titleIcons={
    <Button variant="ghost" size="icon-xs" aria-label="Copy link">
      <Copy className="h-4 w-4" />
    </Button>
  }
  badge={<Badge variant="purple">Preview</Badge>}
  description="Unity Catalog schema in the production metastore."
  actions={
    <>
      <Button variant="ghost" size="icon-xs"><MoreVertical className="h-4 w-4" /></Button>
      <Button variant="outline" size="sm">Share</Button>
      <Button size="sm">Create table</Button>
    </>
  }
/>
```

Props: `breadcrumbs` `title` `avatar` `titleIcons` `badge` `description` `actions` `className`

---

## Tailwind v4 Notes
- No `tailwind.config.ts` — all theme config is in `globals.css`
- DuBois primitive colors are Tailwind utilities: `bg-blue-600`, `text-grey-800`, etc.
- DuBois secondary badge colors: `bg-coral-100`, `text-teal-700`, etc.
- Custom shadows: `shadow-[var(--shadow-db-sm)]`, `shadow-[var(--shadow-db-lg)]`
