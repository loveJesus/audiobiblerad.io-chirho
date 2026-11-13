<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->

# Recording numbering and chapters with several parts

## Immediate correction

The 2026-11-13 source snapshot includes 61 recordings with a fourth Joel file. Of these, 59 also list only three Malachi files. This paired pattern suggests Hebrew-style numbering. It is an inference from filenames, not an assessment of the spoken contents or a provider-confirmed classification.

The canonical crosswalk itself is established independently. [SIL's English versification data](https://github.com/sillsdev/ptx2pdf/blob/master/python/lib/ptxprint/eng.vrs) maps English Joel 2:28–32 to original Joel 3:1–5, English Joel 3:1–21 to original Joel 4:1–21, and English Malachi 4:1–6 to original Malachi 3:19–24. The same comparison appears in the SBL Handbook of Style, appendix E, printed page 175 ([university-hosted publisher PDF](https://cpb-us-w2.wpmucdn.com/voices.uchicago.edu/dist/2/96/files/2016/06/the-sbl-handbook-of-stylesblhs-2f93p03.pdf)). These references establish the numbering relationship; they do not identify what a particular recording actually reads.

Coordinator decision, broker 34071: proceed with the reversible correction for those 59 explicitly recorded cases. Canonical Joel 3 resolves to their listed fourth file. Joel 2 is withheld until both constituent files can play as one chapter, rather than presenting 27 of its 32 verses as complete. No general rule rewrites every recording that happens to list four Joel files. Required evidence and tests retain the affected ids, matched source names, the inference and its limits, updated counts and unchanged controls.

Fang (`davar-fanbsga-davr-ot-n`) and Batak Toba (`davar-bbclai-davr-ot-n`) list both Joel 4 and Malachi 4. Their classification remains unresolved and this correction does not rewrite them. For the inferred Hebrew-style cases, Malachi 4 is not separately offered. Their third Malachi file is expected to contain the material of canonical chapters 3 and 4 together; this is wider content, not a demonstrated one-to-one canonical chapter match. Splitting it would require content boundaries, beyond the Joel correction.

## Requirements for the next playback contract

This section is a design requirement, not an implemented interface. An unadorned list of following URLs cannot support meaningful whole-chapter seeking and fraction carry when the remaining durations are unknown.

- Represent every part in order, including the first, with its source address and measured finite duration in seconds. Retain the existing first address for the current simple-chapter surface. Document where and when durations were measured; do not guess them from bytes or infer them from a different reader.
- Bound both the part count and total duration. The proposed initial ceiling is eight parts and one day in total, matching the persisted-position bound. A malformed or unsupported composite must be rejected as a whole rather than silently reduced to its first part.
- Gate composite data by a contract version or explicit reader capability. Existing readers must not interpret a newly combined chapter as one truncated file. The original 29 stations remain ordinary single-file stations.
- Keep one Scripture media element and one continuous chapter position. Saved seconds and seek fractions refer to the sum of parts, with a measured prefix locating the active file. Persisting must restore the right part and offset directly. Metadata drift needs a bounded, documented correction rule.
- Continue parts automatically, advancing the Bible chapter only after its final part. A part boundary does not change the followed passage or replay station-tuning effects. Pause, tune, stale events and failure recovery remain fenced across every transition.
- Prove seeking in both directions across a part boundary, reopening in the last part, station changes by overall fraction, automatic continuation exactly once, pause during transition, late failures and preservation of saved progress when a later part is unavailable. Use generated fixtures for routine browser tests.

The first useful measurement batch is only the affected component files, with explicit request and byte bounds. Larger per-book sampling and a complete host sweep are separate work. No 20,000- or 349,722-request run is started by this decision. Provider contact remains the owner's to send.
