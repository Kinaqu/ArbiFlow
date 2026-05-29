import Link from "next/link";

export function Logo({ size = 22 }: { size?: number }) {
  return (
    <Link href="/" className="flex items-center gap-2 group">
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        className="text-accent"
      >
        <defs>
          <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4A8FFF" />
            <stop offset="100%" stopColor="#1E5BD8" />
          </linearGradient>
        </defs>
        <path
          d="M6 26L16 4L26 26L21 26L16 14L11 26L6 26Z"
          fill="url(#logo-g)"
        />
        <path
          d="M13 20H19L16 14L13 20Z"
          fill="#F4B53F"
        />
      </svg>
      <span className="text-base font-semibold tracking-tight">
        Arbi<span className="text-muted-strong">Flow</span>
      </span>
    </Link>
  );
}
