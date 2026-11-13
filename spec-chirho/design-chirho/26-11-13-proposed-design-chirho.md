<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->

# Proposed design

Written at setup on 2026-11-13 by the seat that stood the project up. **It is a proposal.** Nothing
here is built, and the fleet should change whatever the work proves wrong. The decisions marked
"L.J.'s" are not the fleet's to take.

## The measure

Time from opening the app to hearing Scripture, and time from turning the dial to hearing the next
version. Measure both from the first working slice and report the numbers. A feature that makes
either slower needs a reason.

## Shape: one catalogue, several thin players

```
sources ──▶ catalogue builder ──▶ catalogue (small static files)
                                        │
        web player ◀────────────────────┤
        iOS and Apple Watch ◀───────────┤──▶ audio streamed straight from each source's own host
        Android ◀───────────────────────┘
```

- **The catalogue is the shared contract.** A station is one language, one version and one voice
  from one source, with its licence, the credit it requires, and a way to find the audio for a
  book and chapter. Three ways cover every source found so far:
  - a **pattern**, where the address is built from the book and chapter (Free Use Bible API,
    openbible.com, Bible in Every Language);
  - an **index**, where file names are irregular and each chapter's address is listed (eBible.org,
    LibriVox);
  - a **resolver**, where our server asks the source for a short-lived address (Bible Brain).
- **Audio is never copied.** Players stream from the source's own host. That honours the licences,
  costs us no storage or bandwidth, and keeps the catalogue tiny.
- **The players stay thin.** Each one reads the catalogue, plays a chapter, and turns the dial. The
  logic worth sharing is small; the data is what must agree.

## The players

- **Web:** this repository's root, SvelteKit on Cloudflare Workers. It also serves the catalogue
  and, later, the resolver endpoint. Browsers refuse sound before a tap, so the first screen is one
  large control that starts it.
- **iOS and Apple Watch:** native SwiftUI in `apps-chirho/ios-chirho/`, one project with a shared
  Swift package. The Watch's crown is a natural dial.
- **Android:** native Kotlin in `apps-chirho/android-chirho/`, using the platform's media session
  so the lock screen and headphones work.

Why native and not a wrapped web page: the Watch app has to be native in any case; playing in the
background, lock-screen controls and an instant start are the whole product; and the interface is
one screen. The sibling Hinneh project already uses this layout (`apps-chirho/ios-chirho/`,
`apps-chirho/android-chirho/`). **The choice is L.J.'s to confirm** before native work starts.

## Turning the dial

- The next station plays the **same book and chapter**.
- Where it starts inside the chapter, best first: the same verse, when both stations have verse
  timings; otherwise the same fraction of the chapter; otherwise the start.
- At the end of a chapter the next chapter starts on its own. A missing chapter is skipped.
- The last station and place are remembered on the device. No account, no tracking.

## The radio sounds

- Nine short sounds: static sweeps, tuning whistles, beeps, clicks.
- **Make them, do not download them.** A small deterministic script synthesises them, so the files
  are ours, identical on every platform, and reproducible. One generator, one set of files.
- A sound plays while the next station loads and stops when its first audio arrives, so the static
  lasts exactly as long as the wait.
- One switch turns them off. It is remembered. They never play over Scripture.

## Languages

- Language names come from the data, written in the language itself.
- Keep the interface nearly wordless so it needs little translation.
- Whether the interface text and store listings are translated is L.J.'s.

## Hosting and the key

- The catalogue starts as static files. Split it by language when it grows. Object storage only if
  it is truly needed.
- Any source key lives in the server's secret store. It never enters this repository, a web page,
  or an app bundle.
- The resolver must serve our own apps only. Bible Brain's terms forbid relaying its content or
  metadata to other developers.

## Decisions that are L.J.'s

1. The source licence. The sibling public project uses GPL-3.0.
2. Native apps, as proposed above, or a wrapped web app.
3. App identifiers. A proposal that follows the sibling projects' pattern:
   `io.audiobiblerad.radiochirho`. Permanent once published.
4. Asking Faith Comes By Hearing for the Bible Brain key.
5. The first push, any deploy, any DNS change, any store listing.
