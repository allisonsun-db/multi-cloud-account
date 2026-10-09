"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

// Beta assets replication toggle + opt-in confirmation, shared by the create and edit
// failover group forms. Opting in is permanent once the group is saved, so `locked`
// renders the toggle on and disabled.
export function BetaAssetsField({
  checked,
  onCheckedChange,
  locked = false,
  mode,
}: {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  locked?: boolean
  mode: "create" | "edit"
}) {
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [confirmed, setConfirmed] = React.useState(false)

  return (
    <>
      <p className="mt-3 text-sm font-semibold">Beta assets</p>
      <div className="flex items-center gap-2">
        <Switch
          checked={checked}
          disabled={locked}
          onCheckedChange={(on) => {
            if (on) {
              setConfirmed(false)
              setDialogOpen(true)
            } else {
              onCheckedChange(false)
            }
          }}
        />
        <p className="text-sm text-accent-foreground">
          {locked
            ? "Beta assets are replicated. This can't be turned off."
            : "Replicate assets that are in Beta."}{" "}
          <Link href="#" className="text-primary hover:underline">
            Learn more
          </Link>
        </p>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader className="px-6 pt-4 pb-0">
            <DialogTitle className="text-[22px] font-semibold leading-7">Replicate beta assets</DialogTitle>
          </DialogHeader>
          <DialogBody className="px-6 pt-4 pb-4 flex flex-col gap-4">
            <p className="text-sm text-accent-foreground">
              Beta assets will be replicated to your secondary workspace. They may have{" "}
              <Link href="#" className="text-primary hover:underline">known gaps</Link>
              {" "}and need manual setup after a failover. This can&apos;t be turned off once the failover group is{" "}
              {mode === "create" ? "created" : "saved"}.{" "}
              <Link href="#" className="text-primary hover:underline">Learn more</Link>
            </p>
            <p className="text-sm text-foreground">
              <span className="font-semibold text-accent-foreground">Beta assets included:</span> Genie agents, foreign catalogs
            </p>
            <div className="flex items-start gap-2">
              <Checkbox
                id="beta-confirm"
                className="mt-0.5"
                checked={confirmed}
                onCheckedChange={(c) => setConfirmed(c === true)}
              />
              <Label htmlFor="beta-confirm" className="block font-normal leading-5">
                I understand beta assets may have known gaps that require manual setup.
              </Label>
            </div>
          </DialogBody>
          <DialogFooter className="px-6 pt-4 pb-6">
            <DialogClose asChild>
              <Button variant="outline" size="sm">Cancel</Button>
            </DialogClose>
            <Button
              size="sm"
              disabled={!confirmed}
              onClick={() => {
                onCheckedChange(true)
                setDialogOpen(false)
              }}
            >
              Replicate beta assets
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
