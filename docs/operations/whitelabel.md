# Maintaining whitelabel

whitelabel is a personal fork of [T3 Code](https://github.com/pingdotgg/t3code).
Keep the MIT license and original copyright notice with the application.

## Branches and remotes

- `origin`: `https://github.com/lukivan8/whitelabel-code.git`.
- `upstream`: `https://github.com/pingdotgg/t3code.git`.
- `main`: unmodified upstream source; never put personal commits here.
- `whitelabel`: the default branch, containing personal changes and upstream merges.

For a fresh checkout:

```sh
git clone --filter=blob:none --single-branch --branch whitelabel https://github.com/lukivan8/whitelabel-code.git
cd whitelabel-code
git remote add upstream https://github.com/pingdotgg/t3code.git
git config remote.upstream.fetch '+refs/heads/main:refs/remotes/upstream/main'
git config rerere.enabled true
vp i
vp run dev:desktop
```

Install Vite+ as described in the upstream README. It selects the Node and pnpm
versions pinned by the repository. Development uses checkout-local `.t3` state.
The packaged desktop app defaults to `~/.whitelabel/userdata`, with separate
Electron profiles and the `whitelabel` URL scheme. An explicit `T3CODE_HOME`
still overrides the default; leave it unset to keep the two installed apps separate.
The desktop's optional terminal command is `whitelabel`, so the official `t3`
command can remain installed.

## Bring in updates

Commit personal work first, then merge upstream. Merges preserve the history of
an evolving personal fork and do not require rewriting already pushed commits.

```sh
git switch whitelabel
git status --short
git fetch upstream main
git merge upstream/main
vp i
vp run check:changed upstream/main
git push origin whitelabel
git push origin upstream/main:main
```

Proceed with the merge only when the working tree is clean. If it conflicts,
resolve each file, stage the resolutions and run `git merge --continue`; use
`git merge --abort` to return to the pre-merge state. Never use GitHub's discard
commits option on `whitelabel`. Git's `rerere` remembers previous resolutions.
For a less frequent upgrade cadence, merge a reviewed upstream release tag
instead of `upstream/main` and run checks against that tag.

Keep personal features in small, focused commits. Prefer existing settings and
extension points; avoid renaming workspace packages, wire protocols, database
fields, or internal services just for branding. Shared identity values live in
`packages/shared/src/forkBranding.ts`.

## Build and updates

```sh
vp run dist:desktop:dmg:arm64
```

The build uses the fork's app ID and release feed by default. Its download and
recovery links also point to this fork. This repository has no custom releases
until you build and upload them; upstream releases are source updates to merge,
not installers to apply over whitelabel. Preview versions intentionally have no
automatic update feed. Signing and notarization require your own credentials.

`T3CODE_DESKTOP_UPDATE_REPOSITORY` can override the desktop feed, followed by
`GITHUB_REPOSITORY` in CI. Set them to this fork when building here. The standalone
server still uses the upstream `T3CODE_HOME` interface: set it explicitly to a
separate directory if running the server directly outside the desktop app or dev runner.

This first customization targets web and desktop. Native mobile branding,
marketing pages and T3-hosted services retain upstream configuration.
Hosted authentication, relay, store distribution, and release signing need their
own configuration before distributing a fully independent product.

The web and desktop use the W mark in `assets/whitelabel/icon.svg`. Regenerate its
PNG/ICO renditions with `vp run icons:whitelabel`.

## SSH and other T3 Code installations

Tailscale is the primary pairing option in onboarding and Add environment.
Desktop peer discovery is an optional local IPC capability, so older desktop
bridges fall back to manual pairing. The server RPC protocol is unchanged and
the official mobile app can pair over the same Tailscale HTTPS endpoint. See
[Connect with Tailscale](../user/remote-access.md#connect-with-tailscale).

SSH is built in and does not require a T3 Connect account. In the desktop app,
open **Settings → Environments → Add environment → SSH**, then enter an SSH
alias from `~/.ssh/config` or `user@host`. The desktop manages authentication,
starts or reuses the remote server, and forwards its local port. Agents, Git,
files, and provider credentials stay on that host. See the requirements in
[Desktop-managed SSH](../user/remote-access.md#desktop-managed-ssh).

The SSH bootstrap downloads the official server at the desktop's upstream
version, independently of whitelabel's desktop update feed. Keep that version
available upstream; a custom unpublished version needs a configured runtime
source. Desktop updates still come from this fork.

The fork retains upstream RPC contracts and the renderer origins official servers
accept. Its `whitelabel` OS links, app ID, and storage remain separate. Official
clients can pair with the fork server, and the fork can connect to compatible
official servers. This depends on protocol/version compatibility and advertised
capabilities; it is not a promise that arbitrary future versions interoperate.
Existing installations still need a new pairing or SSH connection because the
fork has its own client profile. Native mobile apps do not manage this desktop's
SSH tunnel: use a reachable LAN/VPN endpoint for mobile access, or keep this
desktop running and configure a separately reachable host connection.
