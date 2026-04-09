"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronUp, ChevronDown, Info, CircleCheck, ExternalLink } from "lucide-react"
import { AppShell } from "@/components/shell"
import { PageHeader } from "@/components/shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Breadcrumb, BreadcrumbList, BreadcrumbItem,
  BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { CLOUD_LOGO } from "@/components/ui/location-picker"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

// ─── Data ─────────────────────────────────────────────────────────────────────

const REGIONS: Record<string, string[]> = {
  AWS: [
    "us-east-1", "us-east-2", "us-west-1", "us-west-2",
    "eu-west-1", "eu-west-2", "eu-central-1",
    "ap-southeast-1", "ap-southeast-2", "ap-northeast-1",
  ],
  Azure: [
    "eastus", "eastus2", "westus", "westus2",
    "westeurope", "northeurope",
    "southeastasia", "eastasia",
  ],
  GCP: [
    "us-central1", "us-east1", "us-west1",
    "europe-west1", "europe-west2",
    "asia-east1", "asia-southeast1",
  ],
}

// ─── FormSection ──────────────────────────────────────────────────────────────

function FormSection({
  title,
  children,
  defaultOpen = true,
  headerActions,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  headerActions?: React.ReactNode
}) {
  const [open, setOpen] = React.useState(defaultOpen)
  const ref = React.useRef<HTMLDivElement>(null)

  function toggle() {
    const opening = !open
    setOpen(opening)
    if (opening) {
      setTimeout(() => ref.current?.scrollIntoView({ behavior: "smooth", block: "end" }), 50)
    }
  }

  return (
    <div ref={ref} className="rounded-md border border-border overflow-hidden">
      <button
        type="button"
        onClick={toggle}
        className={cn(
          "flex w-full items-center justify-between px-4 py-3 bg-muted transition-colors",
          !open && "hover:bg-border/60"
        )}
      >
        <span className="text-sm font-semibold text-foreground">{title}</span>
        <span className="flex items-center gap-2">
          {headerActions && (
            <span onClick={(e) => e.stopPropagation()}>{headerActions}</span>
          )}
          {open
            ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
            : <ChevronDown className="h-4 w-4 text-muted-foreground" />
          }
        </span>
      </button>
      {open && <div>{children}</div>}
    </div>
  )
}

// ─── FormRow ─────────────────────────────────────────────────────────────────

function FormRow({
  label,
  required,
  info,
  hint,
  labelHint,
  children,
}: {
  label: string
  required?: boolean
  info?: boolean
  hint?: React.ReactNode
  labelHint?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className={cn("flex flex-col sm:flex-row gap-1 sm:gap-4 px-4 py-2.5 sm:py-2", hint ? "sm:items-start" : "sm:h-12 sm:items-center")}>
      <div className={cn("flex flex-col gap-0.5 sm:w-[280px] sm:shrink-0", hint && "sm:pt-[6px]")}>
        <div className="flex items-center gap-1">
          <span className="text-sm text-foreground">{label}</span>
          {required && <span className="text-destructive text-sm">*</span>}
          {info && <Info className="h-3.5 w-3.5 text-muted-foreground" />}
          {labelHint && <span className="text-xs text-muted-foreground">{labelHint}</span>}
        </div>
      </div>
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        {children}
        {hint && <p className="text-xs text-muted-foreground pt-1 px-2">{hint}</p>}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function NewWorkspaceForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [name, setName] = React.useState(searchParams.get("name") ?? "")
  const [cloud, setCloud] = React.useState("")
  const [region, setRegion] = React.useState("")
  const [credential, setCredential] = React.useState("")
  const [storage, setStorage] = React.useState("")
  const [metastore, setMetastore] = React.useState("")
  const [computeNetworkConfig, setComputeNetworkConfig] = React.useState("")
  const [networkConfig, setNetworkConfig] = React.useState("")
  const [privateLink, setPrivateLink] = React.useState("")
  const [cmkManaged, setCmkManaged] = React.useState("")
  const [cmkStorage, setCmkStorage] = React.useState("")
  const [projectId, setProjectId] = React.useState("")
  const [resourceGroup, setResourceGroup] = React.useState("")
  const [pricingTier, setPricingTier] = React.useState("")
  const [secureClusterConnectivity, setSecureClusterConnectivity] = React.useState(false)
  const [customVNet, setCustomVNet] = React.useState(false)

  const regions = cloud ? (REGIONS[cloud] ?? []) : []
  const canSubmit = name.trim() && cloud && region

  function handleCreate() {
    router.push("/workspaces/1")
  }

  return (
    <AppShell activeItem="workspaces">
      <div className="max-w-[800px] mx-auto w-full">
      <div className="flex flex-col gap-6 p-4 sm:p-6 pb-0">

        <PageHeader
          breadcrumbs={
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/workspaces">Workspaces</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Create workspace</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          }
          title="Create workspace using cloud account"
        />

        <div className="flex flex-col gap-4">

          {/* Basics */}
          <FormSection title="Basics">
            <FormRow label="Name" required>
              <Input
                placeholder="my-workspace"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </FormRow>
            <FormRow label="Cloud and region" required>
              <div className="flex flex-col sm:flex-row gap-2">
                <Select value={cloud || undefined} onValueChange={(v) => { setCloud(v); setRegion("") }}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select cloud" />
                  </SelectTrigger>
                  <SelectContent>
                    {(["AWS", "Azure", "GCP"] as const).map((c) => (
                      <SelectItem key={c} value={c}>
                        <span className="flex items-center gap-2">
                          <img
                            src={CLOUD_LOGO[c]}
                            alt={c}
                            width={14}
                            height={14}
                            className={cn("object-contain", c === "AWS" && "dark:[filter:brightness(0)_invert(1)]")}
                          />
                          {c}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={region || undefined} onValueChange={setRegion} disabled={!cloud}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder={cloud ? "Select region" : "Select a cloud first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </FormRow>
            {cloud === "Azure" && (
              <FormRow label="Pricing tier">
                <Select value={pricingTier || undefined} onValueChange={setPricingTier}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </FormRow>
            )}
            {cloud === "GCP" && (
              <FormRow label="Project ID" required hint={<a href="#" className="text-primary inline-flex items-center gap-0.5">How to find it <ExternalLink className="h-3 w-3" /></a>}>
                <Input
                  placeholder="my-gcp-project"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                />
              </FormRow>
            )}
          </FormSection>

          {/* Compute */}
          <FormSection title="Compute">
            {!cloud ? (
              <div className="px-4 py-6 text-sm text-muted-foreground">Select a cloud to configure compute.</div>
            ) : <>
            <FormRow label="Serverless compute">
              <div className="flex items-center gap-1.5 text-sm text-accent-foreground">
                <CircleCheck className="h-4 w-4 text-[var(--success)]" />
                Enabled
              </div>
            </FormRow>
            <div className="border-t border-border mx-4" />
            <FormRow label="Classic compute">
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex">
                      <Switch id="classic-compute" checked disabled />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-56">
                    At the moment, classic compute must be enabled for workspaces using cloud accounts.
                  </TooltipContent>
                </Tooltip>
                <span className="text-sm text-accent-foreground">Enable</span>
              </div>
            </FormRow>
            {cloud === "GCP" && <>
            <FormRow label="Network configuration">
              <Select value={computeNetworkConfig || undefined} onValueChange={setComputeNetworkConfig}>
                <SelectTrigger>
                  <SelectValue placeholder="Select network configuration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new-network" className="text-primary focus:text-primary">Add new network configuration</SelectItem>
                  <SelectItem value="prod-vpc-config">prod-vpc-config</SelectItem>
                  <SelectItem value="staging-private-link">staging-private-link</SelectItem>
                  <SelectItem value="analytics-vpc">analytics-vpc</SelectItem>
                </SelectContent>
              </Select>
            </FormRow>
            </>}
            {cloud === "Azure" && <>
            <FormRow label="Resource group" info>
              <Input
                placeholder="my-resource-group"
                value={resourceGroup}
                onChange={(e) => setResourceGroup(e.target.value)}
              />
            </FormRow>
            </>}
            {cloud === "AWS" && <>
            <FormRow label="Compute credentials" required>
              <Select value={credential || undefined} onValueChange={setCredential}>
                <SelectTrigger>
                  <SelectValue placeholder="Select credential" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new-credential" className="text-primary focus:text-primary">Add new compute credential</SelectItem>
                  <SelectItem value="prod-compute-cred">prod-compute-cred</SelectItem>
                  <SelectItem value="staging-compute-cred">staging-compute-cred</SelectItem>
                  <SelectItem value="dev-compute-cred">dev-compute-cred</SelectItem>
                </SelectContent>
              </Select>
            </FormRow>
            <FormRow label="Network configuration">
              <Select value={computeNetworkConfig || undefined} onValueChange={setComputeNetworkConfig}>
                <SelectTrigger>
                  <SelectValue placeholder="Select network configuration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new-network" className="text-primary focus:text-primary">Add new network configuration</SelectItem>
                  <SelectItem value="prod-vpc-config">prod-vpc-config</SelectItem>
                  <SelectItem value="staging-private-link">staging-private-link</SelectItem>
                  <SelectItem value="analytics-vpc">analytics-vpc</SelectItem>
                </SelectContent>
              </Select>
            </FormRow>
            </>}
            </>}
          </FormSection>

          {/* Storage */}
          <FormSection title="Storage">
            {cloud === "GCP" ? (
              <div className="px-4 py-6 text-sm text-muted-foreground">
                Two GCS buckets will be automatically created in your GCP project for workspace storage.{" "}
                <a href="#" className="text-primary">Learn more</a>
              </div>
            ) : cloud === "Azure" ? (
              <div className="px-4 py-6 text-sm text-muted-foreground">Storage will be automatically provisioned for you.</div>
            ) : !cloud ? (
              <div className="px-4 py-6 text-sm text-muted-foreground">Select a cloud to configure storage.</div>
            ) : <>
            <FormRow label="Workspace storage" required>
              <Select value={storage || undefined} onValueChange={setStorage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select storage configuration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new" className="text-primary focus:text-primary">Add new cloud storage</SelectItem>
                  <SelectItem value="existing-1">prod-storage-bucket</SelectItem>
                  <SelectItem value="existing-2">staging-storage-bucket</SelectItem>
                </SelectContent>
              </Select>
            </FormRow>
            <FormRow label="Metastore">
              <Select value={metastore || undefined} onValueChange={setMetastore}>
                <SelectTrigger>
                  <SelectValue placeholder="Select metastore" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prod-metastore">prod-metastore</SelectItem>
                  <SelectItem value="staging-metastore">staging-metastore</SelectItem>
                  <SelectItem value="dev-metastore">dev-metastore</SelectItem>
                </SelectContent>
              </Select>
            </FormRow>
            </>}
          </FormSection>

          {/* Networking */}
          <FormSection title="Networking">
            {!cloud ? (
              <div className="px-4 py-6 text-sm text-muted-foreground">Select a cloud to configure networking.</div>
            ) : <>
            {cloud === "Azure" ? (<>
              <FormRow label="Secure cluster connectivity" info>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={secureClusterConnectivity}
                    onCheckedChange={(v) => setSecureClusterConnectivity(!!v)}
                  />
                  <span className="text-sm text-foreground">Deploy workspace with secure cluster connectivity</span>
                </div>
              </FormRow>
              <FormRow label="Virtual Network (VNet)" info>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={customVNet}
                    onCheckedChange={(v) => setCustomVNet(!!v)}
                  />
                  <span className="text-sm text-foreground">Deploy workspace in custom VNet</span>
                </div>
              </FormRow>
            </>) : <>
            <FormRow label="Network connectivity configuration" required>
              <Select value={networkConfig || undefined} onValueChange={setNetworkConfig}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prod-ncc">prod-ncc</SelectItem>
                  <SelectItem value="staging-ncc">staging-ncc</SelectItem>
                  <SelectItem value="analytics-ncc">analytics-ncc</SelectItem>
                </SelectContent>
              </Select>
            </FormRow>
            <FormRow label="Private link (optional)" info>
              <Select value={privateLink || undefined} onValueChange={setPrivateLink}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="front-end">Front-end only</SelectItem>
                  <SelectItem value="back-end">Back-end only</SelectItem>
                  <SelectItem value="both">Front-end and back-end</SelectItem>
                </SelectContent>
              </Select>
            </FormRow>
            </>}
            </>}
          </FormSection>

          {/* Encryption */}
          <FormSection title="Encryption (optional)" defaultOpen={false}>
            <FormRow label="CMK for managed services" info>
              <Select value={cmkManaged || undefined} onValueChange={setCmkManaged}>
                <SelectTrigger>
                  <SelectValue placeholder="Select key" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new-key" className="text-primary focus:text-primary">Add new encryption key</SelectItem>
                  <SelectItem value="encryption-key">encryption-key (Assigned identity)</SelectItem>
                  <SelectItem value="key-2">key-2 (Assigned identity)</SelectItem>
                </SelectContent>
              </Select>
            </FormRow>
            <FormRow label="CMK for workspace storage" info>
              <Select value={cmkStorage || undefined} onValueChange={setCmkStorage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select key" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new-key" className="text-primary focus:text-primary">Add new encryption key</SelectItem>
                  <SelectItem value="encryption-key">encryption-key (Assigned identity)</SelectItem>
                  <SelectItem value="key-2">key-2 (Assigned identity)</SelectItem>
                </SelectContent>
              </Select>
            </FormRow>
          </FormSection>

        </div>

      </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-background flex items-center justify-end gap-2 px-4 sm:px-6 py-4">
          <Button variant="outline" size="sm" onClick={() => router.push("/workspaces")}>
            Cancel
          </Button>
          <Button size="sm" disabled={!canSubmit} onClick={handleCreate}>
            Create workspace
          </Button>
        </div>

      </div>
    </AppShell>
  )
}

export default function NewWorkspacePage() {
  return (
    <React.Suspense fallback={null}>
      <NewWorkspaceForm />
    </React.Suspense>
  )
}
