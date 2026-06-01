"use client";

import { ReactNode, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppKit } from "@reown/appkit/react";
import { useAccount, useDisconnect } from "wagmi";
import { formatAddress } from "@/lib/format";
import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost";
type Size = "sm" | "md" | "lg";

const sizeClasses: Record<Size, string> = {
  sm: "px-3.5 py-1.5 text-sm gap-1.5",
  md: "px-5 py-3 text-sm gap-2",
  lg: "px-6 py-3.5 text-base gap-2",
};

export function ConnectButton({
  children,
  variant = "primary",
  size = "sm",
  redirectOnConnect = true,
  className = "",
}: {
  children?: ReactNode;
  variant?: Variant;
  size?: Size;
  redirectOnConnect?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const { open } = useAppKit();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  // Redirect only on the connect *transition* (false → true), not when a
  // component mounts already-connected — otherwise returning to the landing
  // while connected bounces the user straight back to /app.
  const prevConnected = useRef(isConnected);
  useEffect(() => {
    if (redirectOnConnect && isConnected && !prevConnected.current) {
      router.push("/app");
    }
    prevConnected.current = isConnected;
  }, [isConnected, redirectOnConnect, router]);

  const baseBtn =
    variant === "primary" ? "btn-primary text-white" : "btn-ghost text-foreground";

  if (isConnected && address) {
    return (
      <button
        type="button"
        onClick={() => disconnect()}
        className={cn(
          baseBtn,
          sizeClasses[size],
          "font-mono tabular rounded-md inline-flex items-center font-medium",
          className,
        )}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-mint animate-pulse" />
        {formatAddress(address)}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => open()}
      className={cn(
        baseBtn,
        sizeClasses[size],
        "rounded-md inline-flex items-center font-medium",
        className,
      )}
    >
      {children ?? "Connect wallet"}
    </button>
  );
}
