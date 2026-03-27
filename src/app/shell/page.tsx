"use client"

import * as React from "react"
import { AppShell, PageHeader } from "@/components/shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  HomeIcon,
  FolderIcon,
  FolderBranchFillIcon,
  NotebookIcon,
  StarIcon,
  StarFillIcon,
  TrashIcon,
  UserGroupIcon,
  ChevronRightIcon,
  OverflowIcon,
} from "@/components/icons"
import {
  Breadcrumb, BreadcrumbList, BreadcrumbItem,
  BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Search, ChevronDown, ArrowUpDown, LayoutGrid } from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

type FileType = "Folder" | "Git folder" | "Notebook"

type FileItem = {
  id: string
  name: string
  type: FileType
  owner: string
  createdAt: string
  updatedAt: string
}

type PathItem = { id: string; label: string }

type TreeNode = {
  id: string
  label: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: React.ComponentType<any>
  children?: TreeNode[]
}

// ─── Tree ──────────────────────────────────────────────────────────────────────

const TREE: TreeNode[] = [
  {
    id: "home",
    label: "Home",
    icon: HomeIcon,
    children: [
      { id: "home-drafts",   label: "Drafts",   icon: FolderIcon },
      { id: "home-apps",     label: "Apps",     icon: FolderIcon },
      { id: "home-projects", label: "Projects", icon: FolderIcon },
    ],
  },
  { id: "shared", label: "Shared with me", icon: UserGroupIcon },
  {
    id: "workspace-root",
    label: "Workspace",
    icon: FolderIcon,
    children: [
      { id: "ws-users",  label: "Users",  icon: UserGroupIcon },
      { id: "ws-repos",  label: "Repos",  icon: FolderBranchFillIcon },
      { id: "ws-shared", label: "Shared", icon: FolderIcon },
    ],
  },
  { id: "favorites", label: "Favorites", icon: StarIcon },
  { id: "trash",     label: "Trash",     icon: TrashIcon },
]

// ─── File data ─────────────────────────────────────────────────────────────────

const FILES: Record<string, FileItem[]> = {
  home: [
    { id: "home-drafts",   name: "Drafts",                  type: "Folder",     owner: "Joy Xie", createdAt: "May 19, 2025, 01:37 PM", updatedAt: "May 19, 2025, 01:37 PM" },
    { id: "home-apps",     name: "Apps",                    type: "Folder",     owner: "Joy Xie", createdAt: "Feb 13, 2025, 02:30 PM", updatedAt: "Feb 13, 2025, 02:30 PM" },
    { id: "home-projects", name: "Projects",                type: "Folder",     owner: "Joy Xie", createdAt: "Jan 10, 2025, 09:00 AM", updatedAt: "Mar 01, 2026, 11:00 AM" },
    { id: "h4",            name: "(Clone) draft",           type: "Folder",     owner: "Joy Xie", createdAt: "Mar 04, 2025, 02:13 PM", updatedAt: "Mar 04, 2025, 02:13 PM" },
    { id: "h5",            name: "(Clone) Qualtrics fee...", type: "Folder",     owner: "Joy Xie", createdAt: "Nov 28, 2023, 10:33 AM", updatedAt: "Nov 28, 2023, 10:33 AM" },
    { id: "h6",            name: "(Clone) volume-app",      type: "Folder",     owner: "Joy Xie", createdAt: "Mar 07, 2025, 11:44 AM", updatedAt: "Mar 07, 2025, 11:44 AM" },
    { id: "h7",            name: ".apps",                   type: "Folder",     owner: "Joy Xie", createdAt: "Feb 20, 2026, 03:49 PM", updatedAt: "Feb 20, 2026, 03:49 PM" },
    { id: "h8",            name: ".assistant",              type: "Folder",     owner: "Joy Xie", createdAt: "Jan 30, 2026, 04:27 PM", updatedAt: "Jan 30, 2026, 04:27 PM" },
    { id: "h9",            name: "AgentSt...",              type: "Git folder", owner: "Joy Xie", createdAt: "Sep 11, 2025, 10:22 AM", updatedAt: "-" },
    { id: "h10",           name: "api-app-insights-do...",  type: "Folder",     owner: "Joy Xie", createdAt: "Nov 06, 2025, 01:36 PM", updatedAt: "Nov 06, 2025, 01:36 PM" },
    { id: "h11",           name: "App-cost...",             type: "Git folder", owner: "Joy Xie", createdAt: "Aug 07, 2025, 01:31 PM", updatedAt: "-" },
    { id: "h12",           name: "Apps-starter",            type: "Git folder", owner: "Joy Xie", createdAt: "Dec 15, 2025, 01:00 PM", updatedAt: "-" },
    { id: "h13",           name: "customer_churn_model",    type: "Notebook",   owner: "Joy Xie", createdAt: "Jan 15, 2025, 09:00 AM", updatedAt: "Mar 04, 2025, 10:30 AM" },
    { id: "h14",           name: "etl_pipeline_v2",         type: "Notebook",   owner: "Joy Xie", createdAt: "Feb 01, 2025, 11:00 AM", updatedAt: "Feb 28, 2025, 03:15 PM" },
  ],
  "home-drafts": [
    { id: "d1", name: "scratch_analysis",        type: "Notebook", owner: "Joy Xie", createdAt: "May 10, 2025, 11:00 AM", updatedAt: "May 19, 2025, 01:37 PM" },
    { id: "d2", name: "wip_feature_exploration", type: "Notebook", owner: "Joy Xie", createdAt: "Apr 22, 2025, 03:00 PM", updatedAt: "May 01, 2025, 09:15 AM" },
    { id: "d3", name: "temp_sql_queries",        type: "Notebook", owner: "Joy Xie", createdAt: "Mar 30, 2025, 02:00 PM", updatedAt: "Apr 05, 2025, 04:45 PM" },
  ],
  "home-apps": [
    { id: "a1", name: "data-quality-dashboard",  type: "Folder",   owner: "Joy Xie", createdAt: "Feb 13, 2025, 02:30 PM", updatedAt: "Mar 01, 2026, 10:00 AM" },
    { id: "a2", name: "pipeline-monitor",        type: "Folder",   owner: "Joy Xie", createdAt: "Jan 05, 2025, 09:00 AM", updatedAt: "Feb 20, 2026, 03:49 PM" },
    { id: "a3", name: "cost-explorer-app",       type: "Git folder", owner: "Joy Xie", createdAt: "Aug 07, 2025, 01:31 PM", updatedAt: "-" },
    { id: "a4", name: "app_launcher",            type: "Notebook", owner: "Joy Xie", createdAt: "Dec 01, 2025, 11:00 AM", updatedAt: "Jan 15, 2026, 02:00 PM" },
  ],
  "home-projects": [
    { id: "p1", name: "ml-platform-v2",          type: "Git folder", owner: "Joy Xie", createdAt: "Jan 10, 2025, 09:00 AM", updatedAt: "-" },
    { id: "p2", name: "unified-analytics",       type: "Folder",   owner: "Joy Xie", createdAt: "Nov 20, 2024, 10:00 AM", updatedAt: "Mar 01, 2026, 11:00 AM" },
    { id: "p3", name: "realtime-ingestion",      type: "Git folder", owner: "Joy Xie", createdAt: "Sep 05, 2024, 02:00 PM", updatedAt: "-" },
    { id: "p4", name: "project_kickoff_notes",   type: "Notebook", owner: "Joy Xie", createdAt: "Oct 14, 2024, 08:30 AM", updatedAt: "Nov 01, 2024, 05:00 PM" },
  ],
  shared: [
    { id: "s1", name: "Team dashboards",         type: "Folder",     owner: "Alex Rivera",  createdAt: "Jan 10, 2025, 09:00 AM", updatedAt: "Mar 01, 2025, 02:00 PM" },
    { id: "s2", name: "prod_feature_store",      type: "Notebook",   owner: "Jordan Kim",   createdAt: "Nov 05, 2024, 10:30 AM", updatedAt: "Feb 20, 2025, 04:45 PM" },
    { id: "s3", name: "data-quality-checks",     type: "Git folder", owner: "Sam Nakamura", createdAt: "Oct 22, 2024, 01:00 PM", updatedAt: "-" },
    { id: "s4", name: "ML Models",               type: "Folder",     owner: "Morgan Ellis", createdAt: "Sep 30, 2024, 08:00 AM", updatedAt: "Jan 15, 2025, 11:00 AM" },
    { id: "s5", name: "onboarding_guide",        type: "Notebook",   owner: "Taylor Okonkwo", createdAt: "Aug 01, 2024, 09:00 AM", updatedAt: "Sep 10, 2024, 03:00 PM" },
  ],
  "workspace-root": [
    { id: "ws-users",  name: "Users",  type: "Folder", owner: "System", createdAt: "Jan 01, 2023, 12:00 AM", updatedAt: "Mar 04, 2026, 10:00 AM" },
    { id: "ws-repos",  name: "Repos",  type: "Folder", owner: "System", createdAt: "Jan 01, 2023, 12:00 AM", updatedAt: "Mar 04, 2026, 10:00 AM" },
    { id: "ws-shared", name: "Shared", type: "Folder", owner: "System", createdAt: "Jan 01, 2023, 12:00 AM", updatedAt: "Jan 01, 2023, 12:00 AM" },
  ],
  "ws-users": [
    { id: "u1", name: "joy@databricks.com",      type: "Folder", owner: "System", createdAt: "Mar 15, 2023, 09:00 AM", updatedAt: "Mar 04, 2026, 10:00 AM" },
    { id: "u2", name: "alex.rivera@example.com", type: "Folder", owner: "System", createdAt: "Apr 01, 2023, 10:00 AM", updatedAt: "Jan 15, 2026, 03:00 PM" },
    { id: "u3", name: "jordan.kim@example.com",  type: "Folder", owner: "System", createdAt: "Apr 01, 2023, 10:00 AM", updatedAt: "Feb 20, 2026, 11:00 AM" },
    { id: "u4", name: "sam.nakamura@example.com",type: "Folder", owner: "System", createdAt: "Jun 01, 2023, 08:00 AM", updatedAt: "Mar 01, 2026, 09:00 AM" },
  ],
  "ws-repos": [
    { id: "r1", name: "ml-platform-v2",          type: "Git folder", owner: "Joy Xie",       createdAt: "Jan 10, 2025, 09:00 AM", updatedAt: "-" },
    { id: "r2", name: "data-quality-checks",     type: "Git folder", owner: "Sam Nakamura",  createdAt: "Oct 22, 2024, 01:00 PM", updatedAt: "-" },
    { id: "r3", name: "cost-explorer-app",       type: "Git folder", owner: "Joy Xie",       createdAt: "Aug 07, 2025, 01:31 PM", updatedAt: "-" },
    { id: "r4", name: "realtime-ingestion",      type: "Git folder", owner: "Joy Xie",       createdAt: "Sep 05, 2024, 02:00 PM", updatedAt: "-" },
  ],
  "ws-shared": [
    { id: "ws1", name: "Onboarding",             type: "Folder",   owner: "System",          createdAt: "Jan 01, 2023, 12:00 AM", updatedAt: "Sep 10, 2024, 03:00 PM" },
    { id: "ws2", name: "Templates",              type: "Folder",   owner: "System",          createdAt: "Jan 01, 2023, 12:00 AM", updatedAt: "Feb 01, 2025, 10:00 AM" },
    { id: "ws3", name: "shared_cluster_config",  type: "Notebook", owner: "Alex Rivera",     createdAt: "Mar 10, 2024, 02:00 PM", updatedAt: "Nov 20, 2024, 04:00 PM" },
  ],
  favorites: [
    { id: "h5",  name: "(Clone) Qualtrics fee...", type: "Folder",   owner: "Joy Xie",       createdAt: "Nov 28, 2023, 10:33 AM", updatedAt: "Nov 28, 2023, 10:33 AM" },
    { id: "home-apps", name: "Apps",               type: "Folder",   owner: "Joy Xie",       createdAt: "Feb 13, 2025, 02:30 PM", updatedAt: "Feb 13, 2025, 02:30 PM" },
  ],
  trash: [],
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

// Map node ids to display titles (overrides; otherwise use the label from navPath)
const TITLES: Record<string, string> = {
  home: "joy@databricks.com",
}

function FileIcon({ type }: { type: FileType }) {
  if (type === "Git folder") return <FolderBranchFillIcon size={16} className="text-blue-600 shrink-0" />
  if (type === "Notebook")   return <NotebookIcon         size={16} className="text-primary shrink-0" />
  return <FolderIcon size={16} className="text-primary shrink-0" />
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function WorkspacePage() {
  const [activeNav, setActiveNav] = React.useState("workspaces")
  const [navPath, setNavPath]     = React.useState<PathItem[]>([{ id: "home", label: "Home" }])
  const [expanded, setExpanded]   = React.useState<Record<string, boolean>>({ home: true })
  const [search, setSearch]       = React.useState("")
  const [starred, setStarred]     = React.useState<Record<string, boolean>>({
    "h5": true, "home-apps": true,
  })

  const currentId   = navPath[navPath.length - 1].id
  const files       = FILES[currentId] ?? []
  const filtered    = search
    ? files.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()))
    : files

  // Which tree root / child is active
  const activeRootId  = navPath[0].id
  const activeChildId = navPath[1]?.id

  function navigateTree(node: TreeNode) {
    setNavPath([{ id: node.id, label: node.label }])
    setSearch("")
    if (node.children?.length) setExpanded((prev) => ({ ...prev, [node.id]: true }))
  }

  function navigateTreeChild(parent: TreeNode, child: TreeNode) {
    setNavPath([{ id: parent.id, label: parent.label }, { id: child.id, label: child.label }])
    setSearch("")
  }

  function navigateIntoFolder(file: FileItem) {
    if (file.type === "Folder" || file.type === "Git folder") {
      setNavPath((prev) => [...prev, { id: file.id, label: file.name }])
      setSearch("")
    }
  }

  function navigateBreadcrumb(index: number) {
    setNavPath((prev) => prev.slice(0, index + 1))
    setSearch("")
  }

  function navigateWorkspaceRoot() {
    setNavPath([{ id: "workspace-root", label: "Workspace" }])
    setExpanded((prev) => ({ ...prev, "workspace-root": true }))
    setSearch("")
  }

  function toggleStar(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    setStarred((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const pageTitle = TITLES[currentId] ?? navPath[navPath.length - 1].label

  return (
    <AppShell activeItem={activeNav} onNavigate={setActiveNav} mainClassName="overflow-hidden">
      <div className="flex h-full">

        {/* ── Left tree panel ──────────────────────────────────────────── */}
        <aside className="flex w-[220px] shrink-0 flex-col border-r border-border overflow-y-auto">
          <div className="px-3 py-2 text-xs font-semibold text-foreground">Workspace</div>

          <nav className="flex flex-col gap-0.5 px-1 pb-2">
            {TREE.map((node) => {
              const isExpanded = !!expanded[node.id]
              const isRootActive = activeRootId === node.id

              return (
                <div key={node.id}>
                  <button
                    onClick={() => navigateTree(node)}
                    className={cn(
                      "group relative flex h-8 w-full items-center gap-1.5 rounded px-2 text-left text-sm transition-colors",
                      isRootActive
                        ? "bg-primary/10 text-primary font-semibold before:absolute before:left-0 before:top-0 before:h-full before:w-[3px] before:rounded-r-sm before:bg-primary"
                        : "text-foreground hover:bg-muted-foreground/10"
                    )}
                  >
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                      {node.children?.length ? (
                        <ChevronRightIcon
                          size={12}
                          className={cn(
                            "text-muted-foreground transition-transform duration-150",
                            isExpanded && "rotate-90"
                          )}
                          onClick={(e) => {
                            e.stopPropagation()
                            setExpanded((prev) => ({ ...prev, [node.id]: !prev[node.id] }))
                          }}
                        />
                      ) : null}
                    </span>
                    <node.icon
                      size={16}
                      className={cn("shrink-0", isRootActive ? "text-primary" : "text-muted-foreground")}
                    />
                    <span className="truncate">{node.label}</span>
                  </button>

                  {/* Children */}
                  {node.children && isExpanded && (
                    <div className="flex flex-col gap-0.5">
                      {node.children.map((child) => {
                        const isChildActive = isRootActive && activeChildId === child.id
                        return (
                          <button
                            key={child.id}
                            onClick={() => navigateTreeChild(node, child)}
                            className={cn(
                              "relative flex h-8 w-full items-center gap-1.5 rounded pl-10 pr-2 text-left text-sm transition-colors",
                              isChildActive
                                ? "bg-primary/10 text-primary font-semibold before:absolute before:left-0 before:top-0 before:h-full before:w-[3px] before:rounded-r-sm before:bg-primary"
                                : "text-foreground hover:bg-muted-foreground/10"
                            )}
                          >
                            <child.icon
                              size={16}
                              className={cn("shrink-0", isChildActive ? "text-primary" : "text-muted-foreground")}
                            />
                            <span className="truncate">{child.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>
        </aside>

        {/* ── Right content panel ──────────────────────────────────────── */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-6">

            {/* Page header */}
            <PageHeader
              breadcrumbs={
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink
                        href="#"
                        onClick={(e) => { e.preventDefault(); navigateWorkspaceRoot() }}
                      >
                        Workspace
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    {navPath.map((item, i) => (
                      <React.Fragment key={item.id}>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                          {i === navPath.length - 1 ? (
                            <BreadcrumbPage>{TITLES[item.id] ?? item.label}</BreadcrumbPage>
                          ) : (
                            <BreadcrumbLink
                              href="#"
                              onClick={(e) => { e.preventDefault(); navigateBreadcrumb(i) }}
                            >
                              {TITLES[item.id] ?? item.label}
                            </BreadcrumbLink>
                          )}
                        </BreadcrumbItem>
                      </React.Fragment>
                    ))}
                  </BreadcrumbList>
                </Breadcrumb>
              }
              title={pageTitle}
              titleIcons={
                currentId === "home" ? (
                  <button className="text-yellow-400" aria-label="Favorite">
                    <StarIcon size={14} />
                  </button>
                ) : undefined
              }
              actions={
                <>
                  <Button variant="outline" size="sm">Share</Button>
                  <Button size="sm" className="gap-1">
                    Create <ChevronDown className="h-3 w-3" />
                  </Button>
                </>
              }
            />

            {/* Filter bar */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="w-56 pl-8"
                  placeholder="Search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm" className="gap-1">
                Type <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </Button>
              <Button variant="outline" size="sm" className="gap-1">
                Owner <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </Button>
              <Button variant="outline" size="sm" className="gap-1">
                Last modified <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </Button>
              <Button variant="ghost" size="icon-sm" className="ml-auto" aria-label="Toggle columns">
                <LayoutGrid className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>

            {/* File table */}
            {filtered.length === 0 ? (
              <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
                {currentId === "trash"
                  ? "Trash is empty."
                  : search
                    ? `No results for "${search}".`
                    : "This folder is empty."}
              </div>
            ) : (
              <div className="overflow-hidden rounded border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8" />
                      <TableHead>
                        <div className="flex items-center gap-1">
                          Name <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                        </div>
                      </TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Created at</TableHead>
                      <TableHead>Last updated at</TableHead>
                      <TableHead className="w-8" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((file) => {
                      const isFolder = file.type === "Folder" || file.type === "Git folder"
                      return (
                        <TableRow
                          key={file.id}
                          className={cn("group", isFolder && "cursor-pointer")}
                          onClick={() => navigateIntoFolder(file)}
                        >
                          {/* Star */}
                          <TableCell className="w-8 pr-0">
                            <button
                              onClick={(e) => toggleStar(file.id, e)}
                              className={cn(
                                "transition-colors",
                                starred[file.id]
                                  ? "text-yellow-400"
                                  : "text-transparent group-hover:text-muted-foreground/40 hover:!text-yellow-400"
                              )}
                              aria-label="Favorite"
                            >
                              <StarFillIcon size={14} />
                            </button>
                          </TableCell>

                          {/* Name */}
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <FileIcon type={file.type} />
                              <span className={cn(isFolder ? "text-primary hover:underline" : "text-foreground")}>
                                {file.name}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell className="text-muted-foreground">{file.type}</TableCell>
                          <TableCell className="text-muted-foreground">{file.owner}</TableCell>
                          <TableCell className="text-muted-foreground">{file.createdAt}</TableCell>
                          <TableCell className="text-muted-foreground">{file.updatedAt}</TableCell>

                          {/* Row actions */}
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              aria-label="More options"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <OverflowIcon size={14} className="text-muted-foreground" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}

          </div>
        </div>
      </div>
    </AppShell>
  )
}
