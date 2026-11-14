<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->

# Audio Bible Radio: project instructions

Jesus Christ is Lord.

Global conventions live in `~/.claude/CLAUDE.md`. This file covers only what is specific to this
project. `CLAUDE.md` is a symlink to it.

## What this is

Audio Bible Radio plays the audio Bible, in many languages, as quickly as turning on a radio. It is
a free Love Jesus Software ministry project for the web, iOS including Apple Watch, and Android.

**The measure of the product** is the time from opening it to hearing Scripture, and the time from
turning the dial to hearing the next version. Everything else comes second.

Read these before planning anything, in this order:

1. `workspace-chirho/private-chirho/26-11-13-owner-words-chirho.md`: L.J.'s exact words. Local
   only, not version controlled.
2. `spec-chirho/client-chirho/26-11-13-owner-request-chirho.md`: what he asked for, how it was
   read, and what he has **not** decided.
3. `spec-chirho/sources-chirho/26-11-13-public-audio-sources-chirho.md`: which audio we may play,
   from where, and under what terms.
4. `spec-chirho/design-chirho/26-11-13-proposed-design-chirho.md`: a proposal, not a ruling.
5. The newest file in `spec-chirho/tasklists-chirho/`.

## This repository is public source

On 2026-11-13 L.J. directed that the project have its GitHub open-source remote ready to push to.
`gh_chirho` points at `github.com/loveJesus/audiobiblerad.io-chirho`, a **public** repository.
On 2026-11-14 L.J. instructed the coordinator to commit and push the prepared source and licence
package, and the first source push completed that day. The default branch is `main_chirho`.
The licence is GPL-3.0-or-later with the section 7 app-store permission; the nine original radio
sounds are CC0. Scripture recordings keep their publishers' terms.

- **Everything committed is published.** No credentials, no private notes, nobody's personal
  details, no facts about other projects or clients. Write commit messages, spec files and
  progress rows for strangers.
- **Private material lives only in `workspace-chirho/private-chirho/`**, which is gitignored. If
  something must not be public, it goes there and never into history. History cannot be unpushed.
- **Commits use this repository's own author identity**, a GitHub no-reply address set in the
  local git config, the same one the sibling public project uses. Do not override it with a
  personal address: author emails are published with every commit.
- **Before every push, scan the outgoing commits:**
  `gitleaks git --redact --log-opts="gh_chirho/main_chirho..HEAD"` once the remote has a branch, or
  `gitleaks git --redact` for the first push.
- **The first source push was authorised by L.J. on 2026-11-14.** Ordinary source pushes need a
  clean outgoing-history scan. A change to the chosen licence or repository visibility needs
  his word.

## Facts that are easy to get wrong

- **The name is "Audio Bible Radio". The domain is `audiobiblerad.io`:** the word "radio" is split
  across the dot. `audiobibleradio.io` and `audiobibleradio.com` are **not** ours. A test in
  `src/lib/site-chirho/` guards the spelling.
- **The domain** was registered at Hostinger on 2026-11-13 and renews on 2027-11-13. It still
  points at the registrar's parking page: nothing of ours is live. The registrar token is in the
  private `.env` as `HOSTINGER_API_KEY_CHIRHO`. Reading the domain record is fine; changing
  nameservers or DNS records waits for L.J.
- **"Publicly available" audio is not "free to redistribute".** A station ships only when its
  licence and required credit are recorded in the sources file. Stream from the source's own host.
  Do not mirror, bundle or re-host audio.
- **Bible Brain needs a key in L.J.'s name.** Do not sign up for him, and do not use anyone else's
  key. Until the key exists, build that adapter against the documented API with fixtures. Its terms
  allow streaming only, require free access, and forbid relaying its content to other developers.
- **The radio sounds must be ours.** Synthesise them with a deterministic script. Never download
  sound effects from the web. Nine of them, with one switch to turn them off.
- **"Fast" means time to first sound.** Playback speed is a nice extra, not the point.
- **Browsers block sound before a tap.** The web player needs one tap to start, by design.
- **Voices:** some recordings may be synthetic. Record the voice kind for every station, and say
  "unknown" until the maker confirms it.
- **The build machine's disk was 99% full on 2026-11-13.** Check free space before native builds,
  reuse caches, and do not create extra build folders.

## Layout

- Repository root: the SvelteKit web app on Cloudflare Workers. It will also serve the catalogue
  and the resolver endpoint.
- `apps-chirho/ios-chirho/` and `apps-chirho/android-chirho/`: native apps, to be created once
  L.J. confirms native. The sibling project at `../visual-biblical-language-reader-chirho/` shows
  the layout.
- `spec-chirho/`: the record. Progress rows in `spec-chirho/progress-chirho.sqlite`, written with
  `bun spec-chirho/log_step_chirho.ts`.
- `workspace-chirho/private-chirho/`: local only.

## Commands

```bash
bun install --frozen-lockfile
bun run dev
bun run gen            # REQUIRED after editing wrangler.jsonc
bun run check          # 0 errors AND 0 warnings
bun run lint
bun run test:unit --run
bun run test:e2e
bun run build
```

## Working as a fleet

- The room is `bibleradio-chirho`. The launcher registers each seat, but being registered is not
  being visible: **post once early**, saying who you are and which brick you take, and again at
  every real landing. Read the `metropoliluya` skill for the protocol.
- **One coordinator** speaks to L.J. and reports to AICEO: `BIBLERADIO_CHIRHO/gpt_chirho`, unless
  the fleet agrees otherwise in the room. Put open decisions to L.J. together, once.
- **Agree who owns which paths** before writing. Commit only files you changed, by name. Never
  stage or reset another seat's work.
- Report milestones to AICEO and keep routine status in this room. Never post secrets.

```bash
curl -fsS http://127.0.0.1:37371/health_chirho             # broker up?
tmux display-message -p '#{session_name}:#{window_index}'  # who am I
```

## Not the fleet's to do without L.J.'s word

- Change the chosen licence or the repository's visibility.
- Deploy, create any cloud resource, or change DNS or nameservers.
- Create store listings, app records or developer-console entries.
- Sign up with any provider, accept terms, or request a key.
- Spend money, or write to a rights holder.

Nothing is deployed and no cloud resource exists.
