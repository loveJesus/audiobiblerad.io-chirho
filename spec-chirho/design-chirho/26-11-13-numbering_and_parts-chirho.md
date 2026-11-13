<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->

# Recording numbering and chapters with several parts

## Immediate correction

The 2026-11-13 source snapshot includes 61 recordings with a fourth Joel file. Of these, 59 also list only three Malachi files. This paired pattern suggests Hebrew-style numbering. It is an inference from filenames, not an assessment of the spoken contents or a provider-confirmed classification.

The canonical crosswalk itself is established independently. [SIL's English versification data](https://github.com/sillsdev/ptx2pdf/blob/master/python/lib/ptxprint/eng.vrs) maps English Joel 2:28–32 to original Joel 3:1–5, English Joel 3:1–21 to original Joel 4:1–21, and English Malachi 4:1–6 to original Malachi 3:19–24. The same comparison appears in the SBL Handbook of Style, appendix E, printed page 175 ([university-hosted publisher PDF](https://cpb-us-w2.wpmucdn.com/voices.uchicago.edu/dist/2/96/files/2016/06/the-sbl-handbook-of-stylesblhs-2f93p03.pdf)). These references establish the numbering relationship; they do not identify what a particular recording actually reads.

Coordinator decision, broker 34071: proceed with the reversible correction for those 59 explicitly recorded cases. Canonical Joel 3 resolves to their listed fourth file. Joel 2 is withheld until both constituent files can play as one chapter, rather than presenting 27 of its 32 verses as complete. No general rule rewrites every recording that happens to list four Joel files. Required evidence and tests retain the affected ids, matched source names, the inference and its limits, updated counts and unchanged controls.

Fang (`davar-fanbsga-davr-ot-n`) and Batak Toba (`davar-bbclai-davr-ot-n`) list both Joel 4 and Malachi 4. Their classification remains unresolved and this correction does not rewrite them. For the inferred Hebrew-style cases, Malachi 4 is not separately offered. Their third Malachi file is expected to contain the material of canonical chapters 3 and 4 together; this is wider content, not a demonstrated one-to-one canonical chapter match. Splitting it would require content boundaries, beyond the Joel correction.

## Requirements for the next playback contract

This section records the initial design requirements. The narrower catalogue contract below is implemented at `599fa1e`; player support remains future work. An unadorned list of following URLs cannot support meaningful whole-chapter seeking and fraction carry when the remaining durations are unknown.

- Represent every part in order, including the first, with its source address and measured finite duration in seconds. Retain the existing first address for the current simple-chapter surface. Document where and when durations were measured; do not guess them from bytes or infer them from a different reader.
- Bound both the part count and total duration. The initial proposal of eight parts and one day was narrowed to four parts and two hours in the agreement below. A malformed or unsupported composite must be rejected as a whole rather than silently reduced to its first part.
- Gate composite data by a contract version or explicit reader capability. Existing readers must not interpret a newly combined chapter as one truncated file. The original 29 stations remain ordinary single-file stations.
- Keep one Scripture media element and one continuous chapter position. Saved seconds and seek fractions refer to the sum of parts, with a measured prefix locating the active file. Persisting must restore the right part and offset directly. Metadata drift needs a bounded, documented correction rule.
- Continue parts automatically, advancing the Bible chapter only after its final part. A part boundary does not change the followed passage or replay station-tuning effects. Pause, tune, stale events and failure recovery remain fenced across every transition.
- Prove seeking in both directions across a part boundary, reopening in the last part, station changes by overall fraction, automatic continuation exactly once, pause during transition, late failures and preservation of saved progress when a later part is unavailable. Use generated fixtures for routine browser tests.

The first useful measurement batch is only the affected component files, with explicit request and byte bounds. Larger per-book sampling and a complete host sweep are separate work. No 20,000- or 349,722-request run is started by this decision. Provider contact remains the owner's to send.

## Agreed next catalogue surface, 2026-11-13

Broker 34091 proposed chapter-level omission as compatibility gating; 34094 approved code and the bounded pilot conditions, and 34095 confirmed the refined types. This replaces the earlier suggested ceiling of eight parts and one day with the narrower limits below. The contract and helpers landed at `599fa1e`; no composite data or player support is released by that code-only landing.

`StationChirho` may gain `composite_chapters_chirho`, keyed by canonical book/chapter. Every composite contains the first part and all following parts in order, with measured durations and a measurement date. It contains 2–4 parts, each finite and 1–3,600 seconds, with a total at most 7,200 seconds. Every address is canonical HTTPS, unique across composites, directly in the station template's recording directory, and not already exposed for an ordinary covered chapter. The builder also matches each filename to that recording's own list. Malformed composites reject the entire station.

Composite references stay out of `coverage_chirho` and overrides. Existing public helpers and `chapter_count_chirho` retain their meaning. The raw template filler can still construct an address; the compatibility property is that the old coverage-gated resolver never offers the composite chapter. A prior reader must retain ordinary stations and counts, omit the new field, return null for resolving Joel 2, report no coverage for it, and navigate past it to Joel 3. It must not return a component under another chapter.

New `resolveChapterPlaybackChirho` returns a discriminated `ChapterPlaybackChirho`:

- `single`: the same `url_chirho` and optional `timings_url_chirho` as the existing resolver, plus `total_seconds_chirho: null` while duration is unknown.
- `composite`: the measured ordered `parts_chirho` and finite `total_seconds_chirho`. No verse timings are introduced for these chapters.

The companion opt-in helpers are `offersChapterChirho`, `offeredChapterAtOrAfterChirho`, `nextOfferedChapterChirho` and `offeredChapterCountChirho`. They include composites while preserving the old helpers for existing callers. Contract version 1 may remain because current older readers rebuild recognized fields and skip unsupported chapters through absent coverage. This must be demonstrated by execution of the actual prior reader and resolver, not only a new test implementation that imitates them.

## Pilot authorization and holds

Only the contract/reader/helper/test code is approved initially, with no static data emission. After its tested landing and coordinator acknowledgment, Batch A may attempt exactly six known files: the two Joel components of FRABSF and LINBSDRC, and the two Psalm 9 components of SHRBSDRC. One load at a time, no automatic retries, at most 15 seconds each, and immediate detachment/unloading on metadata, error or timeout. Stop on host refusal without evasion. No audio bytes are intentionally saved or mirrored.

`preload=metadata` is an advisory browser hint, not a byte ceiling; [the HTML standard explicitly permits it to be ignored](https://html.spec.whatwg.org/multipage/media.html#attr-media-preload). Record transferred bytes when observable and mark them unknown otherwise. Do not claim that complete-body transfer was prevented. A finite duration establishes readable metadata only; it does not establish complete sound, correct Scripture content or a validated verse boundary.

The remaining 116 files (Batch B), generation of the 61 composite chapter entries, and main-player integration are held pending review of Batch A and the landed interface. Player integration must separately prove whole-chapter position, part transitions, pause/cancellation and recovery before any feature-completion claim.

## Independent code review and pilot acknowledgment

The coordinator executed the actual prior catalogue at `1948e93` against `599fa1e`, using the current local static files. All 29 built-ins and 431 loaded stations retained identical metadata. Across 546,940 canonical station/chapter positions, every legacy resolver, coverage predicate and navigation result was identical. The new single-file result preserved each address and optional timings address, with null for unknown duration. No static catalogue files changed.

A synthetic composite on the actual French station was then loaded beside a plain control through both versions. The prior reader kept both stations, stripped the unsupported field, retained ordinary coverage and count, and exposed no component address under any of the 1,189 chapters. Its Joel 2 resolution remained null and navigation skipped to Joel 3. The new API offered Joel 2 and summed the synthetic fixture durations correctly. Invalid duration, overlap with an ordinary covered address, another recording's address and duplicates across composites were rejected. Fixture durations are test inputs, not source measurements.

Evidence is in `spec-chirho/evidence-chirho/composite-review-chirho/contract_review_chirho.json`. Independent gates: check 0 errors and 0 warnings, lint clean, 175 unit tests passing. This catalogue-only review does not claim new browser playback, device behavior or spoken-content validation.

Broker 34101 acknowledged Batch A after this review, with the six-attempt conditions above. The catalogue seat owns that measurement; the coordinator made no source-media requests during the code review. Batch B, data generation and player wiring remain held until their separate next decisions.
