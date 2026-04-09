import * as React from "react"
import { cn } from "@/lib/utils"

// Figma asset URLs (node 5010-1877) — valid for 7 days from last fetch
const FIGMA_VECTOR = "https://www.figma.com/api/mcp/asset/14ce09eb-3a3b-4341-92a6-ca259da13741"
const FIGMA_SHAPE  = "https://www.figma.com/api/mcp/asset/19d0d1f3-9554-4b8e-a28a-86cae6b7b852"

interface DashedArrowProps {
  direction?: "horizontal" | "vertical"
  /** Length of the arrow in px. Ignored for horizontal (fills container). */
  length?: number
  className?: string
}

export function DashedArrow({ direction = "horizontal", length = 80, className }: DashedArrowProps) {
  if (direction === "horizontal") {
    // Faithfully replicates Figma structure: dashed vector line + 8×8 arrowhead
    return (
      <div className={cn("relative h-[8px] w-full", className)}>
        {/* Dashed vector line — spans full width, leaves 1.25% for arrowhead gap */}
        <div className="absolute inset-y-0 left-0 right-[1.25%] top-[calc(50%+0.5px)] -translate-y-1/2 h-0">
          <div className="absolute inset-[-0.5px_0]">
            <img alt="" className="block max-w-none size-full" src={FIGMA_VECTOR} />
          </div>
        </div>
        {/* 8×8 arrowhead, offset -4px so it sits flush at the right edge */}
        <div className="absolute right-[-4px] size-[8px] top-[calc(50%+0.5px)] -translate-y-1/2">
          <div className="absolute aspect-square left-[-50%] right-1/2 top-1/2 -translate-y-1/2">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={FIGMA_SHAPE} />
          </div>
        </div>
      </div>
    )
  }

  // Vertical: dashed line + wide downward triangle arrowhead
  const svgW = 20
  const h = length
  const cx = svgW / 2
  const aw = 14
  const ah = 9
  const ax = (svgW - aw) / 2
  return (
    <svg
      width={svgW}
      height={h}
      viewBox={`0 0 ${svgW} ${h}`}
      className={cn("text-muted-foreground shrink-0", className)}
      aria-hidden
    >
      <line
        x1={cx} y1={0} x2={cx} y2={h - ah}
        stroke="currentColor"
        strokeWidth={1}
        strokeDasharray="4 3"
      />
      <polygon
        points={`${ax} ${h - ah}, ${ax + aw} ${h - ah}, ${cx} ${h}`}
        fill="currentColor"
      />
    </svg>
  )
}
