<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->

# Radio sounds

The radio gives three kinds of feedback: a tuning cue while a station loads, a click for a button and a tick for a knob step. Scripture never passes through any of this.

## Two sets of sounds

- **The open set** lives in this repository and is CC0. Nine tuning sounds are written by `scripts-chirho/generate_radio_sounds_chirho.ts`. The click and the knob detent are written by `scripts-chirho/sounds-chirho/generate_interface_sounds_chirho.ts`. Both scripts synthesise from fixed numbers, with no recorded or downloaded audio as input, and both verify the checked-in bytes with a check flag (`--check` and `--check-chirho`).
- **The purchased set** is eleven short cuts from sound effects the owner bought: nine tuning cues, a button click and a knob turn. The purchase allows them inside the published radio, not in its public source. The cuts and their manifest stay in a private, ignored folder. A build copies them into `static/sounds-chirho/licensed-chirho/`, which Git ignores, so the deployed site serves them and the repository never holds them.

Each build writes `static/sounds-chirho/profile_chirho.json`, also ignored, naming the set to play. A copy of the source without the private folder names the open set. So does the page itself, until the profile arrives or if it cannot be read.

## Build: choosing and preparing the set

`bun run dev` and `bun run build` run `bun run sounds:prepare-chirho` first, which is `scripts-chirho/sounds-chirho/prepare_sounds_chirho.ts`.

```mermaid
flowchart TD
    start_chirho[sounds:prepare-chirho before dev or build] --> open_chirho{Every open sound present, 16-bit PCM, peak at most 0.16?}
    open_chirho -- no --> stop_chirho[Stop the build and name the missing or loud file]
    open_chirho -- yes --> private_chirho{Private cut manifest present?}
    private_chirho -- no --> release_chirho{Release build with --require-licensed-chirho?}
    release_chirho -- yes --> stop_chirho
    release_chirho -- no --> clear_chirho[Delete any old purchased copies]
    clear_chirho --> open_profile_chirho[Write the open profile, if Git ignores it]
    private_chirho -- yes --> ignored_chirho{Git ignores both outputs?}
    ignored_chirho -- no --> stop_chirho
    ignored_chirho -- yes --> manifest_chirho{Manifest names exactly the eleven clips at their expected paths?}
    manifest_chirho -- no --> stop_chirho
    manifest_chirho -- yes --> verify_chirho[Read each listed clip; check size, SHA-256 and level]
    verify_chirho --> stage_chirho[Copy into a staging folder and read every copy back]
    stage_chirho -- any mismatch --> keep_chirho[Discard the staging folder; last good copies stay]
    keep_chirho --> stop_chirho
    stage_chirho -- all match --> swap_chirho[Swap the tuning and interface folders in whole]
    swap_chirho --> licensed_profile_chirho[Write the purchased profile]
```

The preparer opens only files the manifest lists, inside the private folder. It never opens the original recordings beside them. Inside a Git work tree it copies nothing until `git check-ignore` confirms both outputs are ignored.

The purchased knob recording is a whole turn, about a dozen detents in 1.06 s. Its strongest detent starts at 0.90 s and only silence follows, so the profile starts that clip at 0.90 s. One knob step then plays exactly one tick, which ends by itself.

## Page: playing feedback

```mermaid
flowchart TD
    create_chirho[Page creates the sounds] --> elements_chirho[Two audio elements: tuning, and controls shared by click and knob]
    create_chirho --> on_chirho{Sounds switch on?}
    on_chirho -- yes, first time --> fetch_chirho[Ask once for profile_chirho.json, never awaited]
    on_chirho -- no --> use_open_chirho
    fetch_chirho --> valid_chirho{Valid profile with only /sounds-chirho/ .wav paths?}
    valid_chirho -- yes --> use_profile_chirho[Use it for later sounds]
    valid_chirho -- no --> use_open_chirho[Keep the open set]
    request_chirho[Player or receiver asks for a sound] --> enabled_chirho{Sounds switch on and not disposed?}
    enabled_chirho -- no --> silent_chirho[Play nothing]
    enabled_chirho -- yes --> kind_chirho{Which sound?}
    kind_chirho -- tuning, a station is loading --> tuning_chirho[A cue different from the last, on the tuning element]
    kind_chirho -- click, after a deliberate press --> click_chirho[Restart the controls element with the click]
    kind_chirho -- knob, once per committed value --> spacing_chirho{Within 60 ms of the last tick, or a click still sounding?}
    spacing_chirho -- yes --> silent_chirho
    spacing_chirho -- no --> knob_chirho[Restart the controls element with the tick]
    tuning_chirho --> finite_chirho[Play once, never loop]
    click_chirho --> finite_chirho
    knob_chirho --> finite_chirho
    finite_chirho --> end_chirho[Stop on natural end, or at the ceiling counted from the request: 1.5 s tuning, 2 s controls]
```

- `stopChirho()` stops only the tuning cue. Scripture starting, a pause, a failure, a new request or Off call it, and a click already sounding plays on. The receiver plays its click after Off, so Off is heard.
- Turning the sounds off, or disposing of them, stops both elements at once. While they are off, as in the embedded widget by default, the profile is not even requested.
- Every play carries a number. A ceiling timer or refused play belonging to an older sound finds a newer number and does nothing. An ended event counts only while the element reports it has ended, because one queued before a restart arrives after it. A rejected play never reaches Scripture.
- The element is believed over its events in the other direction too. At the end of a recording a browser marks the element ended and paused, and delivers the ended event in a later task; in the WebKit runs measured, it was marked ended a few tens of milliseconds before it paused. A key press can arrive in between. So a click counts as still sounding only while its element is neither paused nor ended, and a knob step in that gap is heard. Restarting a loaded clip cleared both flags at once in every Chromium and WebKit run measured, so a click restarted in that gap is still protected.
- Every sound has a ceiling counted from the request, loading included: 1.5 s for a tuning cue, 2 s for a click or tick. Some WebKit runs add startup and completion-event overhead to a clip's own length. In the probes below, the media clock started about 0.28 s after `playing`, and the ended event followed the end by about 0.06 s; this overhead is measured and variable, not an engine guarantee. The 2 s ceiling leaves room for a slow start. A sound still going at its ceiling has stalled and is let go. A click or tick that has already ended, with only its event still to come, stays loaded as at a natural end.
- A sound let go keeps its old `currentSrc`, but has no `src` attribute, no duration and no error. A decode failure keeps its source and reports error code 4.
- When a play is refused and the element reports an error, the recording is forgotten, so the next deliberate request assigns the source again and loads it afresh. Nothing retries by itself. A refusal by policy (NotAllowedError) carries no error, so the loaded clip is kept and reused.
- The tuning element lets go of its recording when a cue ends. The controls element keeps its last clip loaded, so the next tick or click starts at once.
- Automatic chapter recovery and continuation ask for no sound. A new deliberate retry may start a tuning cue.
- Scripture never enters an AudioContext. Cross-origin source audio has no CORS header and would fall silent if routed through Web Audio.

## Level

Each effect's quietness is encoded in its samples. Every sound, open or purchased, peaks at or below 0.16 of full scale, whatever volume the element reports. This follows [Apple's documented iOS volume behaviour](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/Using_HTML5_Audio_Video/Device-SpecificConsiderations/Device-SpecificConsiderations.html), under which an element's volume may be ignored. The open set peaks at 0.12 (interface) and below 0.16 (tuning). The purchased cuts peak between 0.10 and 0.14.

## Verification

- `bun run test:unit --run src/lib/sounds-chirho` covers channel lifetimes and races with a stand-in element, the split between tuning and controls, knob spacing, a knob step between a click's end and its ended event (in both engines' orders, and after an interruption), a click restarted in that gap, the ceilings for a stalled sound and for an ended clip whose event is late, a fresh load after a media error but reuse after a policy refusal, a late refusal from a broken older clip, profile arrival, failure and rejection, the level of every open file, and the preparer against temporary folders. The preparer tests cover a changed clip, a missing or extra manifest entry, a path outside the folder, a loud clip, outputs Git would not ignore, the source-only path and a release build.
- Deliberately breaking each guard showed every behaviour test fails without it. Two guards are backed by a second check: the ceiling timer's number (the timer is also cleared) and the source hash (the copy is read back too).
- On 2026-11-14 the bundled runtime played the real prepared files through real audio elements in Chromium, with muted output. The click played 0 to 0.283 s. A knob step played 0.90 to 1.061 s, twice on the loaded element. A tuning cue ended at its natural end, after which its element held no source. A cue stopped at 150 ms left a sounding click to finish. A knob step made inside a click's pause event, after the element had paused at its end and before its ended event, played 0.90 to 1.061 s. A click restarted at that moment stayed protected from a knob step, and the late ended event of the click before it was ignored.
- On 2026-11-15, stand-alone probes ran the bundled runtime on the real prepared files in Playwright WebKit 27.2 and Chromium 158, measuring events and attributes rather than position. Restarting the same loaded click, or the same loaded tick at 0.90 s, cleared `ended` and `paused` at once in three places: after the ended event, in the first task that saw `ended` (WebKit had not yet paused), and inside the pause event. A knob step 150 ms into a click restarted that way was refused, and late ended events from the click before it were ignored. A knob step in WebKit's ended-but-not-paused moment replaced the finished click.
- On 2026-11-15, the click's first response was held back on purpose. Held 1.0 s, the earlier 1.2 s ceiling let the click go 1 to 49 ms after `playing`, before native completion, leaving the element paused with no `src` attribute, no duration and no error. With the same hold, the 2 s ceiling let it play to its end and stay loaded. Held 2.6 s, the click was let go at 2 s, with `play()` rejected as AbortError and no error. A corrupt click instead reported error code 4 and NotSupportedError.
- On 2026-11-15 the click was first answered 503, then served normally. In both engines, the published runtime's second press restarted the failed element in place and was refused at once, without a new request. The current runtime assigned the source again, and the click played to its end. After a corrupt click was repaired, WebKit fetched it again and played it. Chromium served the same address from its in-page media cache and failed again. A request with no gesture was refused with NotAllowedError and no element error in both engines; the next trusted press reused the loaded click in place.
- Three read-only runs of the public site in WebKit on 2026-11-15 played the purchased On click 38 to 59 ms after the press.
- Root's integrated checks and the published follow-up are recorded in `spec-chirho/evidence-chirho/sound-deadline-chirho/`. The delayed-start and HTTP 503 retry cases fail against the previous compiled code and pass with the fix in Chromium and WebKit. Native On/3D/Off click events complete on the public radio in both engines while the same publisher audio advances; the previous failed checks are retained. These event checks do not measure acoustic output.
- Physical phones, Safari and the receiver's wiring are not covered here. The receiver and its browser tests check the wiring.
