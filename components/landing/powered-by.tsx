"use client";

import type { ReactNode } from "react";

type Brand = { name: string; color: string; glyph: ReactNode };

const brands: Brand[] = [
  {
    name: "Arbitrum",
    color: "#28A0F0",
    glyph: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
        <rect
          x="4.2"
          y="4.2"
          width="7.6"
          height="7.6"
          rx="1.4"
          transform="rotate(45 8 8)"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    name: "DeFiLlama",
    color: "#5AC8A8",
    glyph: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="5" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: "Reown",
    color: "#4B7BFF",
    glyph: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="5.4" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="8" cy="8" r="1.9" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: "Relay",
    color: "#8B7BFF",
    glyph: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
        <path
          d="M3.5 4L7 8L3.5 12"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8 4L11.5 8L8 12"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    name: "Enso",
    color: "#34E0A1",
    glyph: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
        <circle
          cx="8"
          cy="8"
          r="5.2"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeDasharray="29 6"
          transform="rotate(45 8 8)"
        />
      </svg>
    ),
  },
  {
    name: "Aave",
    color: "#B6509E",
    glyph: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
        <path d="M8 2.2L13 5.1V10.9L8 13.8L3 10.9V5.1Z" fill="currentColor" />
      </svg>
    ),
  },
];

// Two copies fill wide viewports; the rendered list duplicates this once more so
// the -50% scroll (app/globals.css .animate-scroll-x) loops seamlessly.
const row = [...brands, ...brands];

export function PoweredBy() {
  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 pt-20 lg:pt-24 text-center">
        <div className="text-[11px] font-mono uppercase tracking-widest text-muted">
          Powered by · infrastructure we build on
        </div>
      </div>
      <div className="relative overflow-hidden py-10 lg:py-12">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        <div className="flex animate-scroll-x whitespace-nowrap">
          {[...row, ...row].map((b, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 px-7 shrink-0"
            >
              <span
                className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
                style={{
                  color: b.color,
                  backgroundColor: `${b.color}14`,
                  border: `1px solid ${b.color}33`,
                }}
              >
                {b.glyph}
              </span>
              <span className="text-sm font-medium tracking-tight text-muted-strong">
                {b.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
