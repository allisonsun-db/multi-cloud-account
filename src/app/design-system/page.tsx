"use client";

import { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  AlertTriangle,
  Search,
  Settings,
  Plus,
  Trash2,
  ChevronDown,
  Eye,
  EyeOff,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import { TopBar } from "@/components/shell/TopBar";
import { Sidebar } from "@/components/shell/Sidebar";
import { PageHeader } from "@/components/shell/PageHeader";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogBody,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
  BreadcrumbEllipsis,
} from "@/components/ui/breadcrumb";

import * as Icons from "@/components/icons";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mb-16 scroll-mt-6">
      <div className="mb-6 border-b border-border pb-4">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

function DemoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4">
      <span className="w-24 shrink-0 text-xs text-muted-foreground">{label}</span>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </div>
  );
}

// ─── Color Swatch ─────────────────────────────────────────────────────────────

function Swatch({ color, label, hex, cssVar }: { color: string; label: string; hex: string; cssVar?: string }) {
  return (
    <div className="flex flex-col gap-1.5 min-w-[80px]">
      <div
        className="h-10 w-full rounded border border-black/10"
        style={{ background: color }}
      />
      <div>
        <div className="text-xs font-semibold text-foreground">{label}</div>
        <div className="text-[11px] text-muted-foreground font-mono">{hex}</div>
        {cssVar && <div className="text-[11px] text-muted-foreground font-mono truncate">{cssVar}</div>}
      </div>
    </div>
  );
}

// ─── Table sample data ────────────────────────────────────────────────────────

const tableData = [
  { name: "main", type: "Notebook", status: "Running",  updated: "2 min ago" },
  { name: "etl-pipeline", type: "Pipeline",  status: "Success",  updated: "1 hr ago" },
  { name: "analytics", type: "Notebook", status: "Idle",     updated: "3 hrs ago" },
  { name: "model-train", type: "Job",      status: "Failed",   updated: "5 hrs ago" },
  { name: "data-ingest", type: "Pipeline",  status: "Running",  updated: "12 min ago" },
];

const statusColor: Record<string, string> = {
  Running: "teal",
  Success: "lime",
  Idle:    "secondary",
  Failed:  "destructive",
};

// ─── Main page ────────────────────────────────────────────────────────────────

export default function DesignSystemPage() {
  const [iconSearch, setIconSearch] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const iconEntries = Object.entries(Icons) as [string, React.ComponentType<{ size?: number; className?: string }>][];
  const filteredIcons = iconEntries.filter(([name]) =>
    name.toLowerCase().includes(iconSearch.toLowerCase())
  );

  return (
    <div>
        <div className="mb-12">
          <h1 className="text-2xl font-semibold text-foreground">
            Databricks UI — Component Reference
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            DuBois design tokens applied to shadcn/ui. Browse components and copy patterns.
          </p>
        </div>

        {/* ── Colors ─────────────────────────────────────────────────────── */}
        <Section id="colors" title="Colors" description="DuBois primitive palette. Always use semantic CSS variables in components, not raw hex.">
          <div className="flex flex-col gap-8">
            <Group label="Blue — Primary Actions">
              <div className="flex flex-wrap gap-4">
                <Swatch color="#4BA3D6" label="blue-400" hex="#4BA3D6" />
                <Swatch color="#2E86C1" label="blue-500" hex="#2E86C1" />
                <Swatch color="#2272B4" label="blue-600" hex="#2272B4" cssVar="--primary" />
                <Swatch color="#0E538B" label="blue-700" hex="#0E538B" />
                <Swatch color="#04355D" label="blue-800" hex="#04355D" />
              </div>
            </Group>

            <Group label="Grey — Neutrals">
              <div className="flex flex-wrap gap-4">
                <Swatch color="#F7F7F7" label="grey-050" hex="#F7F7F7" cssVar="--muted" />
                <Swatch color="#E8ECF0" label="grey-100" hex="#E8ECF0" cssVar="--border" />
                <Swatch color="#BDCDD9" label="grey-300" hex="#BDCDD9" />
                <Swatch color="#5F7281" label="grey-500" hex="#5F7281" cssVar="--muted-fg" />
                <Swatch color="#2A3A45" label="grey-700" hex="#2A3A45" />
                <Swatch color="#11171C" label="grey-800" hex="#11171C" cssVar="--foreground" />
              </div>
            </Group>

            <Group label="Semantic">
              <div className="flex flex-wrap gap-4">
                <Swatch color="#C82D4C" label="Destructive" hex="#C82D4C" cssVar="--destructive" />
                <Swatch color="#277C43" label="Success" hex="#277C43" cssVar="--success" />
                <Swatch color="#BE501E" label="Warning" hex="#BE501E" cssVar="--warning" />
              </div>
            </Group>

            <Group label="Secondary Palette — For Tags & Categorical">
              <div className="flex flex-wrap gap-4">
                <Swatch color="#E86247" label="coral"     hex="#E86247" />
                <Swatch color="#A0694A" label="brown"     hex="#A0694A" />
                <Swatch color="#5B7BE8" label="indigo"    hex="#5B7BE8" />
                <Swatch color="#D4A800" label="lemon"     hex="#D4A800" />
                <Swatch color="#6CBF3C" label="lime"      hex="#6CBF3C" />
                <Swatch color="#D966C5" label="pink"      hex="#D966C5" />
                <Swatch color="#9B6AE8" label="purple"    hex="#9B6AE8" />
                <Swatch color="#2DB0A0" label="teal"      hex="#2DB0A0" />
                <Swatch color="#22B8CF" label="turquoise" hex="#22B8CF" />
              </div>
            </Group>
          </div>
        </Section>

        {/* ── Typography ─────────────────────────────────────────────────── */}
        <Section id="typography" title="Typography" description="Base: 13px / 20px line-height. Bold = 600 (never 700). Helvetica Neue.">
          <div className="flex flex-col gap-4 border border-border rounded-md p-6">
            <div className="flex items-baseline gap-4 border-b border-border pb-4">
              <span className="w-24 shrink-0 text-xs text-muted-foreground">h1 / 32px</span>
              <h1>Databricks Platform</h1>
            </div>
            <div className="flex items-baseline gap-4 border-b border-border pb-4">
              <span className="w-24 shrink-0 text-xs text-muted-foreground">h2 / 22px</span>
              <h2>Workspace Overview</h2>
            </div>
            <div className="flex items-baseline gap-4 border-b border-border pb-4">
              <span className="w-24 shrink-0 text-xs text-muted-foreground">h3 / 18px</span>
              <h3>Catalog Explorer</h3>
            </div>
            <div className="flex items-baseline gap-4 border-b border-border pb-4">
              <span className="w-24 shrink-0 text-xs text-muted-foreground">h4 / 15px</span>
              <h4>Table Properties</h4>
            </div>
            <div className="flex items-baseline gap-4 border-b border-border pb-4">
              <span className="w-24 shrink-0 text-xs text-muted-foreground">body / 13px</span>
              <p>The quick brown fox jumps over the lazy dog. Base font size is 13px with 20px line-height.</p>
            </div>
            <div className="flex items-baseline gap-4 border-b border-border pb-4">
              <span className="w-24 shrink-0 text-xs text-muted-foreground">small / 12px</span>
              <p className="text-xs text-muted-foreground">Secondary metadata, timestamps, helper text</p>
            </div>
            <div className="flex items-baseline gap-4">
              <span className="w-24 shrink-0 text-xs text-muted-foreground">code / 12px</span>
              <code className="font-mono text-xs bg-secondary px-1.5 py-0.5 rounded">SELECT * FROM catalog.schema.table</code>
            </div>
          </div>
        </Section>

        {/* ── Spacing ────────────────────────────────────────────────────── */}
        <Section id="spacing" title="Spacing" description="Base unit: 8px. xs=4px · sm=8px · md=16px · lg=24px · xl=32px">
          <div className="flex flex-col gap-3">
            {[
              { token: "xs",  px: 4  },
              { token: "sm",  px: 8  },
              { token: "md",  px: 16 },
              { token: "lg",  px: 24 },
              { token: "xl",  px: 32 },
              { token: "2xl", px: 48 },
            ].map(({ token, px }) => (
              <div key={token} className="flex items-center gap-4">
                <span className="w-8 text-xs text-muted-foreground font-mono">{token}</span>
                <div
                  className="h-6 bg-primary/20 rounded border-l-2 border-primary"
                  style={{ width: px }}
                />
                <span className="text-xs text-muted-foreground">{px}px</span>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Buttons ────────────────────────────────────────────────────── */}
        <Section id="buttons" title="Buttons" description="DuBois heights: 32px (sm, default) · 24px (xs). All use 4px radius, weight 600.">
          <div className="flex flex-col gap-6">
            <DemoRow label="Default">
              <Button>Primary</Button>
              <Button size="xs">Primary xs</Button>
              <Button size="icon-sm"><Plus className="h-4 w-4" /></Button>
              <Button size="icon-xs"><Plus className="h-4 w-4" /></Button>
            </DemoRow>
            <DemoRow label="Outline">
              <Button variant="outline">Outline</Button>
              <Button variant="outline" size="xs">Outline xs</Button>
              <Button variant="outline" size="icon-sm"><Settings className="h-4 w-4" /></Button>
            </DemoRow>
            <DemoRow label="Ghost">
              <Button variant="ghost">Ghost</Button>
              <Button variant="ghost" size="xs">Ghost xs</Button>
              <Button variant="ghost" size="icon-sm"><Trash2 className="h-4 w-4" /></Button>
            </DemoRow>
            <DemoRow label="Destructive">
              <Button variant="destructive">Delete</Button>
              <Button variant="destructive" size="sm">Delete sm</Button>
            </DemoRow>
            <DemoRow label="Link">
              <Button variant="link">Link button</Button>
            </DemoRow>
            <DemoRow label="With icons">
              <Button><Plus className="h-4 w-4" />New notebook</Button>
              <Button variant="outline"><Search className="h-4 w-4" />Search</Button>
              <Button variant="outline"><ChevronDown className="h-4 w-4" />Options</Button>
            </DemoRow>
            <DemoRow label="States">
              <Button disabled>Disabled</Button>
              <Button variant="outline" disabled>Disabled</Button>
              <Button variant="ghost" disabled>Disabled</Button>
            </DemoRow>
          </div>
        </Section>

        {/* ── Form Controls ──────────────────────────────────────────────── */}
        <Section
          id="forms"
          title="Form Controls"
          description="Labels for inputs, selects, and textareas use font-semibold (600). 32px control height, 4px radius, grey100 border, blue600 focus ring."
        >
          <div className="grid grid-cols-2 gap-8">
            <div className="flex flex-col gap-4">
              <Group label="Text Input">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="demo-input">Cluster name</Label>
                  <Input id="demo-input" placeholder="my-cluster" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="demo-disabled">Disabled</Label>
                  <Input id="demo-disabled" placeholder="Cannot edit" disabled />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="demo-error">Error state</Label>
                  <Input id="demo-error" placeholder="Invalid value" aria-invalid />
                  <span className="text-xs text-destructive">This field is required</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="demo-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="demo-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      className="pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </Group>
            </div>

            <div className="flex flex-col gap-4">
              <Group label="Textarea">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="demo-textarea">Description</Label>
                  <Textarea id="demo-textarea" placeholder="Add a description..." rows={3} />
                </div>
              </Group>

              <Group label="Checkbox">
                <div className="flex flex-col gap-2">
                  {["Enable autoscaling", "Spot instances", "Single node"].map((label) => (
                    <div key={label} className="flex items-center gap-2">
                      <Checkbox id={label} />
                      <Label htmlFor={label} className="font-normal cursor-pointer">{label}</Label>
                    </div>
                  ))}
                  <div className="flex items-center gap-2">
                    <Checkbox id="disabled-check" disabled />
                    <Label htmlFor="disabled-check" className="font-normal opacity-40">Disabled option</Label>
                  </div>
                </div>
              </Group>

              <Group label="Switch">
                <div className="flex flex-col gap-2">
                  {[
                    { label: "Auto-termination", id: "sw1", checked: true },
                    { label: "Spot fallback", id: "sw2", checked: false },
                  ].map(({ label, id, checked }) => (
                    <div key={id} className="flex items-center justify-between">
                      <Label htmlFor={id} className="font-normal cursor-pointer">{label}</Label>
                      <Switch id={id} defaultChecked={checked} />
                    </div>
                  ))}
                </div>
              </Group>
            </div>
          </div>
        </Section>

        {/* ── Badges ─────────────────────────────────────────────────────── */}
        <Section id="badges" title="Badges & Tags" description="Rectangular (4px radius). DuBois secondary palette for categorical labeling.">
          <div className="flex flex-col gap-5">
            <Group label="Semantic">
              <div className="flex flex-wrap gap-2">
                <Badge variant="default">Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="destructive">Error</Badge>
                <Badge variant="outline">Outline</Badge>
              </div>
            </Group>
            <Group label="DuBois Secondary Palette">
              <div className="flex flex-wrap gap-2">
                <Badge variant="coral">Coral</Badge>
                <Badge variant="brown">Brown</Badge>
                <Badge variant="indigo">Indigo</Badge>
                <Badge variant="lemon">Lemon</Badge>
                <Badge variant="lime">Lime</Badge>
                <Badge variant="pink">Pink</Badge>
                <Badge variant="purple">Purple</Badge>
                <Badge variant="teal">Teal</Badge>
                <Badge variant="turquoise">Turquoise</Badge>
              </div>
            </Group>
            <Group label="In context">
              <div className="flex flex-wrap gap-2">
                <Badge variant="lime">Running</Badge>
                <Badge variant="teal">Streaming</Badge>
                <Badge variant="secondary">Idle</Badge>
                <Badge variant="destructive">Failed</Badge>
                <Badge variant="indigo">Scheduled</Badge>
                <Badge variant="lemon">Pending</Badge>
                <Badge variant="coral">Deprecated</Badge>
                <Badge variant="purple">Beta</Badge>
              </div>
            </Group>
          </div>
        </Section>

        {/* ── Alerts ─────────────────────────────────────────────────────── */}
        <Section id="alerts" title="Alerts" description="Left-border accent with tinted background. Four severity levels.">
          <div className="flex flex-col gap-3">
            <Alert variant="info">
              <Info className="h-4 w-4" />
              <AlertTitle>Cluster is starting</AlertTitle>
              <AlertDescription>Your cluster is being provisioned. This may take a few minutes.</AlertDescription>
            </Alert>
            <Alert variant="success">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Pipeline succeeded</AlertTitle>
              <AlertDescription>All 1,204 records processed without errors.</AlertDescription>
            </Alert>
            <Alert variant="warning">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>High memory usage</AlertTitle>
              <AlertDescription>Cluster memory is at 87%. Consider scaling up or optimizing queries.</AlertDescription>
            </Alert>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Job failed</AlertTitle>
              <AlertDescription>Task "transform_data" failed after 3 retries. Check the logs for details.</AlertDescription>
            </Alert>
          </div>
        </Section>

        {/* ── Tables ─────────────────────────────────────────────────────── */}
        <Section id="tables" title="Tables" description="DuBois row hover (rgba 4%) and selected (rgba 8%) states. Semibold column headers.">
          <div className="border border-border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableData.map((row) => (
                  <TableRow key={row.name}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell className="text-muted-foreground">{row.type}</TableCell>
                    <TableCell>
                      <Badge variant={statusColor[row.status] as Parameters<typeof Badge>[0]["variant"]}>
                        {row.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{row.updated}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon-sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon-sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Section>

        {/* ── Cards ──────────────────────────────────────────────────────── */}
        <Section id="cards" title="Cards" description="8px radius, db-sm shadow. Tighter padding than shadcn defaults.">
          <div className="grid grid-cols-3 gap-4">
            {/* Metric card */}
            <Card>
              <CardHeader>
                <CardDescription>Active clusters</CardDescription>
                <CardTitle className="text-2xl font-semibold">14</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">↑ 3 from yesterday</p>
              </CardContent>
            </Card>

            {/* Status card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>etl-prod-v2</CardTitle>
                  <Badge variant="lime">Running</Badge>
                </div>
                <CardDescription>Last run 2 min ago</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">124 tasks · 0 errors</p>
              </CardContent>
              <CardFooter className="gap-2">
                <Button size="sm">View logs</Button>
                <Button variant="ghost" size="sm">Stop</Button>
              </CardFooter>
            </Card>

            {/* Skeleton card */}
            <Card>
              <CardHeader>
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </CardContent>
            </Card>
          </div>
        </Section>

        {/* ── Dialogs ────────────────────────────────────────────────────── */}
        <Section id="dialogs" title="Dialogs & Sheets" description="40px padding, no header/footer dividers. 8px radius.">
          <div className="flex flex-wrap gap-3">
            {/* Confirm dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Confirm dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete cluster?</DialogTitle>
                  <DialogDescription>
                    This will permanently delete <strong>my-cluster-01</strong> and all associated data. This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter showCloseButton>
                  <Button variant="destructive">Delete cluster</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Form dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button>Create notebook</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create notebook</DialogTitle>
                  <DialogDescription>Add a new notebook to your workspace.</DialogDescription>
                </DialogHeader>
                <DialogBody className="py-4">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="nb-name">Name</Label>
                      <Input id="nb-name" placeholder="my-analysis" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="nb-lang">Default language</Label>
                      <Input id="nb-lang" placeholder="Python" />
                    </div>
                  </div>
                </DialogBody>
                <DialogFooter showCloseButton>
                  <Button>Create</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Tabs inside dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Tabbed dialog</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Cluster settings</DialogTitle>
                </DialogHeader>
                <DialogBody className="py-2">
                  <Tabs defaultValue="config">
                    <TabsList variant="line">
                      <TabsTrigger value="config">Configuration</TabsTrigger>
                      <TabsTrigger value="libs">Libraries</TabsTrigger>
                      <TabsTrigger value="logs">Logs</TabsTrigger>
                    </TabsList>
                    <TabsContent value="config" className="pt-4">
                      <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-1.5">
                          <Label>Cluster name</Label>
                          <Input placeholder="my-cluster" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <Label>Node type</Label>
                          <Input placeholder="Standard_DS3_v2" />
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="libs" className="pt-4">
                      <p className="text-sm text-muted-foreground">No libraries installed.</p>
                    </TabsContent>
                    <TabsContent value="logs" className="pt-4">
                      <p className="text-sm text-muted-foreground">No recent logs.</p>
                    </TabsContent>
                  </Tabs>
                </DialogBody>
                <DialogFooter showCloseButton>
                  <Button>Save changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Tooltip demos */}
            <div className="flex items-center gap-2 ml-4">
              <span className="text-xs text-muted-foreground">Tooltips:</span>
              {(["top", "bottom", "left", "right"] as const).map((side) => (
                <Tooltip key={side}>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="xs">{side}</Button>
                  </TooltipTrigger>
                  <TooltipContent side={side}>
                    Tooltip on {side}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        </Section>

        {/* ── Tabs ───────────────────────────────────────────────────────── */}
        <Section
          id="tabs-demo"
          title="Tabs"
          description="Line variant: bottom border, list padding px-0 py-1, gap-4 (16px) between tabs, no horizontal padding on tab labels. Pill variant: muted track, px-2 on triggers."
        >
          <div className="flex flex-col gap-6">
            <Group label="Line variant (DuBois style)">
              <Tabs defaultValue="tab1">
                <TabsList variant="line">
                  <TabsTrigger value="tab1">Overview</TabsTrigger>
                  <TabsTrigger value="tab2">Schema</TabsTrigger>
                  <TabsTrigger value="tab3">Sample data</TabsTrigger>
                  <TabsTrigger value="tab4">Permissions</TabsTrigger>
                </TabsList>
                <TabsContent value="tab1" className="pt-4">
                  <p className="text-sm text-muted-foreground">Table overview and metadata.</p>
                </TabsContent>
                <TabsContent value="tab2" className="pt-4">
                  <p className="text-sm text-muted-foreground">Column definitions and types.</p>
                </TabsContent>
                <TabsContent value="tab3" className="pt-4">
                  <p className="text-sm text-muted-foreground">First 100 rows of data.</p>
                </TabsContent>
                <TabsContent value="tab4" className="pt-4">
                  <p className="text-sm text-muted-foreground">Access control settings.</p>
                </TabsContent>
              </Tabs>
            </Group>

            <Group label="Pill variant">
              <Tabs defaultValue="a">
                <TabsList>
                  <TabsTrigger value="a">Notebooks</TabsTrigger>
                  <TabsTrigger value="b">Pipelines</TabsTrigger>
                  <TabsTrigger value="c">Jobs</TabsTrigger>
                </TabsList>
                <TabsContent value="a" className="pt-4">
                  <p className="text-sm text-muted-foreground">Your notebooks.</p>
                </TabsContent>
                <TabsContent value="b" className="pt-4">
                  <p className="text-sm text-muted-foreground">Your pipelines.</p>
                </TabsContent>
                <TabsContent value="c" className="pt-4">
                  <p className="text-sm text-muted-foreground">Your jobs.</p>
                </TabsContent>
              </Tabs>
            </Group>
          </div>
        </Section>

        {/* ── Avatar + Misc ──────────────────────────────────────────────── */}
        <Section id="misc" title="Misc Components">
          <div className="flex flex-col gap-6">
            <Group label="Avatars">
              <div className="flex items-center gap-3">
                {["JD", "AS", "MK", "RW", "TN"].map((initials) => (
                  <Avatar key={initials}>
                    <AvatarFallback className="text-xs bg-secondary text-secondary-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
            </Group>

            <Group label="Separator">
              <div className="flex flex-col gap-3 w-64">
                <Separator />
                <div className="flex items-center gap-3">
                  <Separator className="flex-1" />
                  <span className="text-xs text-muted-foreground">or</span>
                  <Separator className="flex-1" />
                </div>
              </div>
            </Group>

            <Group label="Skeleton">
              <div className="flex flex-col gap-2 w-72">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-3 w-64" />
                <Skeleton className="h-3 w-56" />
              </div>
            </Group>
          </div>
        </Section>

        {/* ── Icons ──────────────────────────────────────────────────────── */}
        <Section id="icons" title="Icons" description={`${iconEntries.length} Databricks-specific DuBois icons. All 16×16, currentColor.`}>
          <div className="mb-3">
            <Input
              placeholder="Search icons..."
              value={iconSearch}
              onChange={(e) => setIconSearch(e.target.value)}
              className="max-w-xs"
            />
          </div>
          {filteredIcons.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No icons match &ldquo;{iconSearch}&rdquo;</p>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-1">
              {filteredIcons.map(([name, Icon]) => (
                <Tooltip key={name}>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col items-center gap-2 rounded p-3 hover:bg-secondary cursor-default transition-colors">
                      <Icon size={16} className="text-foreground shrink-0" />
                      <span className="text-[10px] text-muted-foreground text-center leading-tight truncate w-full text-center">
                        {name.replace("Icon", "")}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>{name}</TooltipContent>
                </Tooltip>
              ))}
            </div>
          )}
        </Section>

        {/* ── Breadcrumb ─────────────────────────────────────────────────── */}
        <Section id="breadcrumb" title="Breadcrumb" description="Navigation trail. Links use text-primary, current page uses text-muted-foreground, separator is a small ChevronRight.">
          <div className="flex flex-col gap-4">
            <Group label="Default">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#">Workspace</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#">Catalog</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>main</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </Group>

            <Group label="Deeper path">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#">Data Engineering</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#">Pipelines</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#">prod-etl</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Settings</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </Group>

            <Group label="With ellipsis">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#">Workspace</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbEllipsis />
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#">prod-etl</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Settings</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </Group>
          </div>
        </Section>

        {/* ── AI Components ──────────────────────────────────────────────── */}
        <Section id="ai" title="AI Components" description="Databricks AI gradient: #4299E0 → #CA42E0 → #FF5F46 at 135°">
          <div className="flex flex-col gap-6">
            <Group label="AI Gradient Background">
              <div className="h-16 rounded-md bg-ai-gradient" />
            </Group>

            <Group label="AI Gradient Text">
              <p className="text-2xl font-semibold text-ai-gradient">
                Databricks AI / BI
              </p>
            </Group>

            <Group label="AI Gradient Border Card">
              <div className="relative rounded-md p-px bg-ai-gradient w-72">
                <div className="rounded-[calc(0.375rem-1px)] bg-card px-4 py-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="h-4 w-4 text-ai-gradient" style={{ color: "#CA42E0" }} />
                    <span className="text-sm font-semibold">AI Suggestion</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Based on your data, this column contains timestamps. Convert to DateType?
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Button size="xs">Apply</Button>
                    <Button size="xs" variant="ghost">Dismiss</Button>
                  </div>
                </div>
              </div>
            </Group>

            <Group label="AI Sparkle Button">
              <Button className="bg-ai-gradient text-white hover:opacity-90 border-0">
                <Sparkles className="h-4 w-4" />
                Generate with AI
              </Button>
            </Group>

            <Group label="Inline AI indicator">
              <div className="flex items-center gap-2 text-sm">
                <span
                  className="inline-flex h-2 w-2 rounded-full bg-ai-gradient"
                />
                <span className="text-muted-foreground">AI-generated content</span>
              </div>
            </Group>
          </div>
        </Section>

        <Separator className="my-8" />

        {/* ── Shell ──────────────────────────────────────── */}
        <Section id="shell" title="Shell" description="App-level layout components: TopBar and Sidebar.">
          <div className="flex flex-col gap-8">

            <Group label="TopBar">
              <div className="overflow-hidden rounded-md border border-border">
                <TopBar sidebarOpen={true} userInitial="N" />
              </div>
              <div className="overflow-hidden rounded-md border border-border mt-2">
                <TopBar sidebarOpen={false} userInitial="N" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Top: sidebar open · Bottom: sidebar collapsed</p>
            </Group>

            <Group label="Sidebar — expanded">
              <div className="overflow-hidden rounded-md border border-border" style={{ height: 480 }}>
                <Sidebar open={true} activeItem="workspace" />
              </div>
            </Group>


            <Group label="PageHeader — minimal">
              <div className="rounded-md border border-border p-6">
                <PageHeader title="Page title" />
              </div>
            </Group>

            <Group label="PageHeader — with breadcrumb + actions">
              <div className="rounded-md border border-border p-6">
                <PageHeader
                  breadcrumbs={
                    <Breadcrumb>
                      <BreadcrumbList>
                        <BreadcrumbItem>
                          <BreadcrumbLink href="#">Workspace</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                          <BreadcrumbPage>Catalog</BreadcrumbPage>
                        </BreadcrumbItem>
                      </BreadcrumbList>
                    </Breadcrumb>
                  }
                  title="main"
                  titleIcons={
                    <Button variant="ghost" size="icon-xs" aria-label="Copy link">
                      <Plus className="h-4 w-4" />
                    </Button>
                  }
                  actions={
                    <>
                      <Button variant="ghost" size="icon-xs">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">Share</Button>
                      <Button size="sm">Create</Button>
                    </>
                  }
                />
              </div>
            </Group>

            <Group label="PageHeader — with description">
              <div className="rounded-md border border-border p-6">
                <PageHeader
                  title="SQL Warehouses"
                  description="Serverless compute for running SQL queries and dashboards."
                  actions={<Button size="sm">Create warehouse</Button>}
                />
              </div>
            </Group>

            <Group label="Full shell">
              <div className="text-sm text-muted-foreground">
                Visit{" "}
                <a href="/shell" className="text-primary underline underline-offset-2">
                  /shell
                </a>{" "}
                to see the full AppShell with TopBar + Sidebar + demo content.
              </div>
            </Group>
          </div>
        </Section>

        <Separator className="my-8" />
        <p className="text-xs text-muted-foreground pb-8">
          Databricks Designer Starter Kit · DuBois tokens on shadcn/ui · Tailwind v4
        </p>
    </div>
  );
}
