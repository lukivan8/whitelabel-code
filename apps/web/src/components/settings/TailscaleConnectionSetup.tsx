import { useState } from "react";
import { desktopTailscaleStateAtom } from "~/state/desktopTailscale";
import { useEnvironmentQuery } from "~/state/query";
import { CommandBlock } from "../CommandBlock";
import { Button } from "../ui/button";
import { Alert, AlertDescription } from "../ui/alert";

const CONNECTION_MESSAGES: Readonly<Record<string, string>> = {
  NeedsLogin: "Sign in to Tailscale, then find machines again.",
  NeedsMachineAuth: "Approve this device in Tailscale, then find machines again.",
  Stopped: "Turn on Tailscale, then find machines again.",
  Starting: "Tailscale is starting. Wait for it to connect, then find machines again.",
};

export function TailscaleConnectionSetup({
  disabled = false,
  onSelectHost,
}: {
  readonly disabled?: boolean;
  readonly onSelectHost?: (host: string) => void;
}) {
  const [discoveryRequested, setDiscoveryRequested] = useState(false);
  const query = useEnvironmentQuery(discoveryRequested ? desktopTailscaleStateAtom : null);
  const canDiscover = onSelectHost && window.desktopBridge?.discoverTailscalePeers !== undefined;

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Connect Tailscale on both devices. On the computer with your code, enable Tailscale HTTPS in
        Settings → Sharing &amp; access and create a pairing link.
      </p>
      <details>
        <summary className="cursor-pointer text-sm text-muted-foreground">
          Set up a command-line server
        </summary>
        <div className="mt-2 space-y-2">
          <CommandBlock command="npx t3 serve --tailscale-serve" />
          <p className="text-xs text-muted-foreground">
            For an already running server, use <code>npx t3 pair --tailscale</code>.
          </p>
        </div>
      </details>
      {canDiscover ? (
        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            disabled={disabled || (discoveryRequested && query.isPending)}
            onClick={() => {
              if (discoveryRequested) query.refresh();
              else setDiscoveryRequested(true);
            }}
          >
            {discoveryRequested && query.isPending ? "Reading tailnet…" : "Find tailnet machines"}
          </Button>
          {query.error ? (
            <Alert variant="error">
              <AlertDescription>{query.error}</AlertDescription>
            </Alert>
          ) : null}
          {query.data ? (
            <div className="space-y-2" aria-live="polite">
              {query.data.backendState !== "Running" ? (
                <p className="text-sm text-muted-foreground">
                  {CONNECTION_MESSAGES[query.data.backendState] ??
                    "Open Tailscale and connect to your tailnet, then find machines again."}
                </p>
              ) : query.data.peers.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No other machines with MagicDNS names were found. You can still paste a full
                  pairing link below.
                </p>
              ) : (
                <>
                  <p className="text-xs text-muted-foreground">
                    Select a machine to fill its HTTPS address. It still needs Tailscale HTTPS, a
                    running T3 server, and a pairing code.
                  </p>
                  {query.data.peers.map((peer) => (
                    <div key={peer.dnsName} className="flex flex-wrap items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={disabled || !peer.online}
                        aria-label={`Use ${peer.dnsName}`}
                        onClick={() => onSelectHost?.(`https://${peer.dnsName}`)}
                      >
                        {peer.name} · {peer.online ? "Online in Tailscale" : "Offline"}
                      </Button>
                      <span className="min-w-0 break-all text-xs text-muted-foreground">
                        {peer.dnsName}
                      </span>
                    </div>
                  ))}
                </>
              )}
            </div>
          ) : null}
        </div>
      ) : null}
      <p className="text-xs text-muted-foreground">
        No T3 Connect account is needed. The same HTTPS pairing link or QR code works in the
        official mobile app with Tailscale connected.
      </p>
    </div>
  );
}
