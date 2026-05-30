import Link from "next/link";

export function Logo({ size = 22 }: { size?: number }) {
  return (
    <Link href="/" className="flex items-center gap-2 group">
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <defs>
          <linearGradient
            id="logo-g"
            x1="16"
            y1="30"
            x2="16"
            y2="2"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#1E5BD8" />
            <stop offset="100%" stopColor="#4A8FFF" />
          </linearGradient>
        </defs>
        {/* idle capital — converging streams */}
        <path
          d="M6 26.5C8.5 20 12 16.5 16 13.5"
          stroke="url(#logo-g)"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <path
          d="M16 27V13.5"
          stroke="url(#logo-g)"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <path
          d="M26 26.5C23.5 20 20 16.5 16 13.5"
          stroke="url(#logo-g)"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        {/* channeled into yield — ascending */}
        <path
          d="M16 13.5V6.5"
          stroke="#F4B53F"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M11.8 10L16 5.6L20.2 10"
          stroke="#F4B53F"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-base font-semibold tracking-tight">
        Arbi<span className="text-muted-strong">Flow</span>
      </span>
    </Link>
  );
}
