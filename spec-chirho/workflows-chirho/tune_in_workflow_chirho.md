<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->

# Web tune-in workflow

Implemented by `RadioPlayerChirho` in `src/lib/player-chirho/radio_player_chirho.ts`. The screen in `src/routes/+page.svelte` enables the player controls once its handler is attached. Browsers require the first tap. One plain media element plays Scripture; a second plays optional effects. No Scripture passes through fetch or Web Audio.

```mermaid
flowchart TD
    open_chirho[Open the web radio] --> memory_chirho[Validate optional device preferences]
    memory_chirho --> place_chirho[Restore the followed passage and actual station place separately]
    place_chirho --> timings_chirho[Prefetch at most three small verse timing files]
    timings_chirho --> tap_chirho[Attach handlers and enable the one-tap play control]
    tap_chirho --> locate_chirho[Resolve a catalogued chapter synchronously]
    locate_chirho --> noise_chirho{Radio sounds enabled?}
    noise_chirho -- yes --> effects_chirho[Start one original sound quietly]
    noise_chirho -- no --> play_chirho
    effects_chirho --> play_chirho[Set source and call play synchronously on the same media element]
    play_chirho --> metadata_chirho[Metadata arrives: restore seconds or map verse, fraction, start]
    metadata_chirho --> playing_chirho[Scripture playing event: stop effects and record latency]
    playing_chirho --> memory_save_chirho[Remember place locally, at most every five seconds plus meaningful transitions]
    playing_chirho --> turn_chirho[Listener turns the dial]
    turn_chirho --> cancel_chirho[Invalidate old request, pause and detach old handlers]
    cancel_chirho --> anchor_chirho[Resolve every dial turn from the followed place, preserving it through partial stations]
    anchor_chirho --> locate_chirho
    playing_chirho --> ended_chirho[Chapter ends]
    ended_chirho --> next_chirho[Choose next available chapter, wrapping at the end]
    next_chirho --> locate_chirho
    play_chirho --> error_chirho{Media error?}
    error_chirho -- unavailable media --> recover_chirho[Keep a recovery checkpoint; try at most three following chapters]
    recover_chirho --> locate_chirho
    error_chirho -- network, policy, limit --> stop_chirho[Roll back failed recovery, unload and show retry or tune action]
    play_chirho --> timeout_chirho[Stop and unload a stream stalled for fifteen seconds]
    timeout_chirho --> stop_chirho
```

Verse timing files are optional. When both recordings' timing data is ready before playback, tuning preserves the verse and fraction within it. Otherwise it maps the chapter fraction, then the start if duration is unknown. Timing response bodies are capped while reading at 64,000 bytes. Timing requests time out after 2.5 seconds; obsolete requests are aborted and at most six timing files are cached. They do not block the synchronous media play call. This also handles source chapters whose timing URL returns 404.

When a station lacks the current book or chapter, its next catalogued passage is used, both before the first tap and while playing. Missing files that disappear after catalogue verification receive at most three recovery attempts. Network failures and stalls stop with an explicit retry. A paused radio stays paused while tuning. A browser/media-control pause also updates the screen.

The language chooser and dynamic restore are documented in [the language workflow](language_workflow_chirho.md). The player holds an active set of complete ordinary stations and a separate current station; replacing the dial does not accumulate every visited language. Preferences contain the current station/place, optional language and dial codes, sound switch and a separate followed place with its source, duration and verse mapping, under one fixed device-local key capped at 2 KB. A detour station cannot overwrite the followed place; it changes only with an explicit passage choice or chapter progression. Seeking within a detour preserves the original followed passage. Failed recovery attempts do not replace persisted progress: a recovered chapter commits only once it plays, while exhausted attempts restore the checkpoint. Invalid or oversized values are discarded; denied or full storage cannot prevent listening. No preference is sent to our server. Page hide, pause and disposal save the last measured place. Disposal detaches handlers, aborts timing requests, stops both elements and unloads media.

Tests: `radio_player_chirho.spec.ts` exercises the state transitions and failure boundaries. `tests-chirho/radio_playback_chirho.e2e.ts` uses the real browser decoder with a small synthesized fixture. The optional live probe records actual source playback separately. Its timings end at the browser playing event, not at measured speaker output. Physical iOS/Watch/Android background and headset behavior remain outside this web evidence.
