import type { DesktopTailscaleDiscovery } from "@t3tools/contracts";
import * as Effect from "effect/Effect";
import * as Schema from "effect/Schema";
import { Atom } from "effect/reactivity";

class TailscaleDiscoveryError extends Schema.TaggedError<TailscaleDiscoveryError>()(
  "TailscaleDiscoveryError",
  { cause: Schema.Defect() },
) {
  override get message(): string {
    return "Could not read Tailscale. Open Tailscale, sign in, and make sure its CLI is available.";
  }
}

const discoverPeers = Effect.fn("desktop.tailscale.discoverPeers")(function* () {
  return yield* Effect.tryPromise({
    try: (): Promise<DesktopTailscaleDiscovery> => {
      const discover = window.desktopBridge?.discoverTailscalePeers;
      return discover ? discover() : Promise.reject(new Error("Tailscale discovery unavailable"));
    },
    catch: (cause) => new TailscaleDiscoveryError({ cause }),
  });
});

export const desktopTailscaleStateAtom = Atom.make(discoverPeers()).pipe(
  Atom.swr({ staleTime: 30_000, revalidateOnMount: true }),
  Atom.keepAlive,
  Atom.withLabel("desktop:tailscale-peers"),
);
