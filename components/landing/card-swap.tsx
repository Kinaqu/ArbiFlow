"use client";

import { Children, type HTMLAttributes, type ReactNode } from "react";
import { motion } from "framer-motion";

/**
 * One card face. A plain glass panel — CardSwap owns the 3-D positioning, so this
 * just fills its positioner. Reusable on its own for the static fallback grid.
 */
export function Card({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...rest}
      className={`h-full w-full overflow-hidden rounded-2xl border border-border-strong bg-surface-2 ${
        className ?? ""
      }`.trim()}
    >
      {children}
    </div>
  );
}

type CardSwapProps = {
  /** Z-order of the children; `order[0]` is the front card. Owned by the parent. */
  order: number[];
  width?: number;
  height?: number;
  cardDistance?: number;
  verticalDistance?: number;
  skewAmount?: number;
  onCardClick?: (index: number) => void;
  children: ReactNode;
};

/**
 * A controlled 3-D card stack rebuilt with Framer Motion (no GSAP). Each child is
 * placed at a slot derived from its position in `order`; when the parent rotates
 * `order`, Framer tweens every card to its new slot — that's the swap. The fan's
 * bounding box is centred on the container so it sits cleanly inside a column.
 */
export function CardSwap({
  order,
  width = 360,
  height = 320,
  cardDistance = 46,
  verticalDistance = 50,
  skewAmount = 6,
  onCardClick,
  children,
}: CardSwapProps) {
  const cards = Children.toArray(children);
  const total = cards.length;
  const mid = (total - 1) / 2;

  return (
    <div className="absolute inset-0">
      {cards.map((card, idx) => {
        const pos = order.indexOf(idx);
        return (
          <motion.div
            key={idx}
            className={`absolute left-1/2 top-1/2${onCardClick ? " cursor-pointer" : ""}`}
            style={{
              width,
              height,
              marginLeft: -width / 2,
              marginTop: -height / 2,
              zIndex: total - pos,
            }}
            initial={false}
            animate={{
              x: (pos - mid) * cardDistance,
              y: -(pos - mid) * verticalDistance,
              z: -pos * cardDistance * 1.5,
              skewY: skewAmount,
              transformPerspective: 900,
            }}
            transition={{ type: "spring", stiffness: 340, damping: 34 }}
            onClick={onCardClick ? () => onCardClick(idx) : undefined}
          >
            {card}
          </motion.div>
        );
      })}
    </div>
  );
}
