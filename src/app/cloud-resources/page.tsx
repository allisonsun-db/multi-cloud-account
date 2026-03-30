"use client"

import * as React from "react"
import { AppShell } from "@/components/shell"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { ExternalLink, Search, ListFilter, ChevronRight, ChevronLeft } from "lucide-react"
import { CLOUD_LOGO } from "@/components/ui/location-picker"

// ─── Credential configuration data ────────────────────────────────────────────

type Credential = {
  id: string
  name: string
  roleArn: string
  created: string
}

const CREDENTIALS: Credential[] = [
  { id: "1",  name: "databricks-credentials-v1",                         roleArn: "arn:aws:iam::707343435239:role/us-west-2-dev-e2-dogfood-unity-catalog-workspace-sa-role",  created: "03/03/2025" },
  { id: "2",  name: "test_uc_by_default_configuration",                  roleArn: "arn:aws:iam::707343435239:role/us-west-2-dev-e2-dogfood-unity-catalog-workspace-sa-role",  created: "01/30/2025" },
  { id: "3",  name: "osp-load-test-1",                                   roleArn: "arn:aws:iam::189836941263:role/Temp-Product-IAM-Role_1736504708677",                        created: "12/11/2024" },
  { id: "4",  name: "workspace",                                         roleArn: "arn:aws:iam::189836941263:role/down-scoped-iam-role-staging",                               created: "10/14/2024" },
  { id: "5",  name: "[DO NOT DELETE] Down Scoped IAM Dogfooding",        roleArn: "arn:aws:iam::189836941263:role/down-scoped-iam-role-staging",                               created: "10/04/2024" },
  { id: "6",  name: "brickstore-us-west-2",                              roleArn: "arn:aws:iam::189836941263:role/brickstore-us-west-2-compute",                               created: "01/08/2024" },
  { id: "7",  name: "brickstore-us-west-2-compute-2",                   roleArn: "arn:aws:iam::189836941263:role/brickstore-us-west-2-compute-2",                              created: "01/03/2024" },
  { id: "8",  name: "panchen-uc-by-default-dbvpc2",                     roleArn: "arn:aws:iam::125074849712:role/panchen-uc-by-default-dbvpc",                                created: "09/05/2023" },
  { id: "9",  name: "panchen-uc-by-default-dbvpc",                      roleArn: "arn:aws:iam::125074849712:role/panchen-uc-by-default-dbvpc",                                created: "09/05/2023" },
  { id: "10", name: "[DO NOT DELETE] Unity Catalog WEST US 2 TEST IAM ROLE", roleArn: "arn:aws:iam::707343435239:role/us-west-2-dev-e2-dogfood-unity-catalog-workspace-sa-role", created: "06/10/2022" },
  { id: "11", name: "prod-cross-account-role",                           roleArn: "arn:aws:iam::707343435239:role/prod-cross-account-databricks-role",                         created: "05/22/2022" },
  { id: "12", name: "staging-cross-account-role",                        roleArn: "arn:aws:iam::189836941263:role/staging-cross-account-databricks-role",                      created: "04/15/2022" },
]

// ─── Storage configuration data ───────────────────────────────────────────────

type Storage = {
  id: string
  name: string
  bucketName: string
  created: string
}

const STORAGE_CONFIGS: Storage[] = [
  { id: "1",  name: "prod-root-storage",            bucketName: "s3://databricks-prod-root-707343435239-us-west-2",          created: "03/03/2025" },
  { id: "2",  name: "staging-root-storage",         bucketName: "s3://databricks-staging-root-707343435239-us-west-2",       created: "01/30/2025" },
  { id: "3",  name: "osp-load-test-storage",        bucketName: "s3://osp-load-test-databricks-189836941263",                 created: "12/11/2024" },
  { id: "4",  name: "workspace-default-storage",    bucketName: "s3://databricks-workspace-default-189836941263-us-east-1",  created: "10/14/2024" },
  { id: "5",  name: "[DO NOT DELETE] dogfood-root", bucketName: "s3://databricks-dogfood-root-189836941263",                 created: "10/04/2024" },
  { id: "6",  name: "brickstore-us-west-2-storage", bucketName: "s3://brickstore-us-west-2-databricks-root",                 created: "01/08/2024" },
  { id: "7",  name: "brickstore-east-storage",      bucketName: "s3://brickstore-us-east-1-databricks-root",                 created: "01/03/2024" },
  { id: "8",  name: "panchen-uc-storage",           bucketName: "s3://panchen-uc-by-default-databricks-125074849712",        created: "09/05/2023" },
  { id: "9",  name: "panchen-dev-storage",          bucketName: "s3://panchen-dev-databricks-root-125074849712",             created: "09/05/2023" },
  { id: "10", name: "[DO NOT DELETE] unity-catalog-test-storage", bucketName: "s3://unity-catalog-west-us-2-test-707343435239", created: "06/10/2022" },
]

// ─── Pagination ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10

function Pagination({ page, total, onPage }: { page: number; total: number; onPage: (p: number) => void }) {
  const totalPages = Math.ceil(total / PAGE_SIZE)
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-end gap-1 pt-4">
      <Button
        variant="ghost"
        size="icon-sm"
        disabled={page === 1}
        onClick={() => onPage(page - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <Button
          key={p}
          variant={p === page ? "default" : "ghost"}
          size="icon-sm"
          onClick={() => onPage(p)}
          aria-label={`Page ${p}`}
          className="min-w-[32px]"
        >
          {p}
        </Button>
      ))}
      <Button
        variant="ghost"
        size="icon-sm"
        disabled={page === totalPages}
        onClick={() => onPage(page + 1)}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

// ─── Credential configuration tab ─────────────────────────────────────────────

function CredentialConfigTab() {
  const [filter, setFilter] = React.useState("")
  const [page, setPage] = React.useState(1)

  const filtered = CREDENTIALS.filter((c) =>
    c.name.toLowerCase().includes(filter.toLowerCase()) ||
    c.roleArn.toLowerCase().includes(filter.toLowerCase())
  )
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <div className="relative w-[280px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Filter credential configurations"
            value={filter}
            onChange={(e) => { setFilter(e.target.value); setPage(1) }}
            className="pl-8"
          />
        </div>
        <div className="ml-auto">
          <Button size="sm">Add credential configuration</Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[38%] text-foreground">Name</TableHead>
            <TableHead className="w-[46%] text-foreground">Role ARN</TableHead>
            <TableHead className="w-[16%] text-foreground">Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paged.map((cred) => (
            <TableRow key={cred.id}>
              <TableCell>
                <a href="#" className="text-primary hover:underline truncate block max-w-[340px]">
                  {cred.name}
                </a>
              </TableCell>
              <TableCell className="text-sm text-foreground font-mono truncate max-w-[400px]">
                <span className="block truncate">{cred.roleArn}</span>
              </TableCell>
              <TableCell className="text-sm text-foreground">{cred.created}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Pagination page={page} total={filtered.length} onPage={setPage} />
    </div>
  )
}

// ─── Storage configuration tab ────────────────────────────────────────────────

function StorageConfigTab() {
  const [filter, setFilter] = React.useState("")
  const [page, setPage] = React.useState(1)

  const filtered = STORAGE_CONFIGS.filter((s) =>
    s.name.toLowerCase().includes(filter.toLowerCase()) ||
    s.bucketName.toLowerCase().includes(filter.toLowerCase())
  )
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-foreground">
        Configure the root S3 bucket that Databricks uses to store cluster logs, notebook revisions, and job results.{" "}
        <a href="#" className="text-primary inline-flex items-center gap-0.5 hover:underline">
          Learn more <ExternalLink className="h-3 w-3" />
        </a>
      </p>

      <div className="flex items-center gap-3">
        <div className="relative w-[280px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Filter storage configurations"
            value={filter}
            onChange={(e) => { setFilter(e.target.value); setPage(1) }}
            className="pl-8"
          />
        </div>
        <div className="ml-auto">
          <Button size="sm">Add storage configuration</Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[38%] text-foreground">Name</TableHead>
            <TableHead className="w-[46%] text-foreground">Bucket name</TableHead>
            <TableHead className="w-[16%] text-foreground">
              <span className="inline-flex items-center gap-1">
                Created <ListFilter className="h-3.5 w-3.5 text-muted-foreground" />
              </span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paged.map((s) => (
            <TableRow key={s.id}>
              <TableCell>
                <a href="#" className="text-primary hover:underline truncate block max-w-[340px]">
                  {s.name}
                </a>
              </TableCell>
              <TableCell className="text-sm text-foreground font-mono">
                <span className="block truncate">{s.bucketName}</span>
              </TableCell>
              <TableCell className="text-sm text-foreground">{s.created}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Pagination page={page} total={filtered.length} onPage={setPage} />
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function CloudResourcesPage() {
  return (
    <AppShell activeItem="cloud-resources">
      <div className="flex flex-col p-6 w-full">
        <div className="flex items-center gap-2 mb-4">
          <h1 className="text-xl font-semibold text-foreground">Cloud resources</h1>
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            (<img src={CLOUD_LOGO["AWS"]} alt="AWS" width={14} height={14} className="object-contain dark:[filter:brightness(0)_invert(1)]" />AWS only)
          </span>
        </div>

        <Tabs defaultValue="credential-configuration">
          <TabsList variant="line" className="w-full justify-start border-b border-border mb-6">
            <TabsTrigger value="credential-configuration" className="flex-none">Credential configuration</TabsTrigger>
            <TabsTrigger value="storage-configuration" className="flex-none">Storage configuration</TabsTrigger>
          </TabsList>

          <TabsContent value="credential-configuration">
            <CredentialConfigTab />
          </TabsContent>
          <TabsContent value="storage-configuration">
            <StorageConfigTab />
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}
