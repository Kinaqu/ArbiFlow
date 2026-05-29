import { Check, ExternalLink, Loader2 } from "lucide-react";
import { CHAINS, type ChainKey } from "@/lib/tokens";
import type { BridgeStep } from "@/hooks/use-bridge";
import type { ExecStep } from "@/hooks/use-execute";
import { formatEta } from "@/lib/relay";

type NodeStatus = "pending" | "active" | "done";

function sendStatus(s: BridgeStep): NodeStatus {
  if (s === "switching" || s === "approving") return "active";
  if (s === "bridging" || s === "done") return "done";
  return "pending";
}
function transitStatus(s: BridgeStep): NodeStatus {
  if (s === "bridging") return "active";
  if (s === "done") return "done";
  return "pending";
}
function arrivedStatus(s: BridgeStep): NodeStatus {
  return s === "done" ? "done" : "pending";
}
function depositStatus(s: ExecStep): NodeStatus {
  if (s === "routing" || s === "switching" || s === "approving" || s === "executing")
    return "active";
  if (s === "done") return "done";
  return "pending";
}

function NodeIcon({ status }: { status: NodeStatus }) {
  if (status === "done") return <Check className="w-4 h-4 text-mint" />;
  if (status === "active")
    return <Loader2 className="w-4 h-4 animate-spin text-gold" />;
  return <span className="w-1.5 h-1.5 rounded-full bg-border" />;
}

function TxLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[10px] font-mono uppercase tracking-wider text-accent hover:text-foreground inline-flex items-center gap-1"
    >
      {label} <ExternalLink className="w-3 h-3" />
    </a>
  );
}

function Node({
  status,
  title,
  detail,
  last,
  children,
}: {
  status: NodeStatus;
  title: string;
  detail?: string;
  last?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <li className="flex gap-3">
      <div className="flex flex-col items-center">
        <span className="w-5 h-5 flex items-center justify-center">
          <NodeIcon status={status} />
        </span>
        {!last ? (
          <span
            className={`w-px flex-1 my-1 ${
              status === "done" ? "bg-mint/40" : "bg-border"
            }`}
          />
        ) : null}
      </div>
      <div className={`pb-3 min-w-0 ${last ? "" : "flex-1"}`}>
        <div
          className={`text-sm ${
            status === "pending" ? "text-muted" : "text-foreground"
          }`}
        >
          {title}
        </div>
        {detail ? (
          <div className="text-[11px] text-muted font-mono">{detail}</div>
        ) : null}
        {children ? <div className="mt-1 flex gap-2">{children}</div> : null}
      </div>
    </li>
  );
}

/**
 * Live "money in motion" route: origin send → Relay transit → arrival on
 * Arbitrum → deposit into the target protocol. Reads the two leg-hook steps.
 */
export function RouteTimeline({
  originChain,
  destProjectLabel,
  bridgeStep,
  bridgeHashes,
  depositStep,
  approveHash,
  execHash,
  etaSeconds,
  sendLabel,
  receiveLabel,
}: {
  originChain: ChainKey;
  destProjectLabel: string;
  bridgeStep: BridgeStep;
  bridgeHashes: `0x${string}`[];
  depositStep: ExecStep;
  approveHash: string | null;
  execHash: string | null;
  etaSeconds: number;
  sendLabel: string;
  receiveLabel: string;
}) {
  const origin = CHAINS[originChain];
  const arb = CHAINS.arbitrum;
  return (
    <ul className="border-t border-border pt-3">
      <Node
        status={sendStatus(bridgeStep)}
        title={`Send from ${origin.label}`}
        detail={sendLabel}
      >
        {bridgeHashes.map((h, i) => (
          <TxLink key={h} href={`${origin.explorer}/tx/${h}`} label={`tx ${i + 1}`} />
        ))}
      </Node>
      <Node
        status={transitStatus(bridgeStep)}
        title="Bridging via Relay"
        detail={etaSeconds > 0 ? `ETA ${formatEta(etaSeconds)}` : undefined}
      />
      <Node
        status={arrivedStatus(bridgeStep)}
        title={`Arrived on ${arb.label}`}
        detail={receiveLabel}
      />
      <Node
        status={depositStatus(depositStep)}
        title={`Deposit into ${destProjectLabel}`}
        last
      >
        {approveHash ? (
          <TxLink href={`${arb.explorer}/tx/${approveHash}`} label="approve" />
        ) : null}
        {execHash ? (
          <TxLink href={`${arb.explorer}/tx/${execHash}`} label="deposit" />
        ) : null}
      </Node>
    </ul>
  );
}
