<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->

# Catalogue workflow

How a recording becomes a station, and how a player finds a chapter on it. The code is in
`src/lib/catalogue-chirho/` and `scripts-chirho/catalogue-chirho/`. Correct this page when the
code proves it wrong.

## A recording becomes a station

A station ships only when two things are true: its licence and credit are written down, and its
chapters were measured at the source. A person supplies the first. A script supplies the second.

```mermaid
flowchart TD
    found_chirho[A public recording is found] --> terms_chirho{Do its own pages state the maker,<br/>the voice and the licence?}
    terms_chirho -- no --> held_chirho[Held: noted in the sources file with what is missing]
    terms_chirho -- yes --> record_chirho[Record the licence, the credit and the page they were read on<br/>spec-chirho/sources-chirho/]
    record_chirho --> draft_chirho[Write the station draft<br/>stations-chirho/*_stations_chirho.ts]
    draft_chirho --> register_chirho[List its source<br/>station_sources_chirho.ts]
    register_chirho --> check_chirho[Run the availability check<br/>check_availability_chirho.ts]
    check_chirho --> how_chirho{Does the host publish a folder listing?}
    how_chirho -- yes --> listing_chirho[Read the listing once, then ask for a few files directly]
    how_chirho -- no --> head_chirho[Ask for the headers of every chapter address, a few at a time]
    listing_chirho --> verdict_chirho
    head_chirho --> verdict_chirho
    verdict_chirho{Did every chapter get a clear answer?}
    verdict_chirho -- no --> keep_chirho[Keep the previous coverage and fail the run]
    verdict_chirho -- yes --> write_chirho[Write the coverage file and the evidence file]
    write_chirho --> build_chirho[buildStationChirho joins the draft with its coverage]
    build_chirho --> gate_chirho{At least one chapter, and the ship tests pass?}
    gate_chirho -- no --> absent_chirho[Not in STATIONS_CHIRHO]
    gate_chirho -- yes --> shipped_chirho([In STATIONS_CHIRHO and CATALOGUE_CHIRHO])
```

- The check walks the same drafts the catalogue ships, through the same address builder, so a
  station cannot play from an address that was not the one checked.
- "Absent" needs a clear 404 or 403, asked twice. Anything else is "unverified", and an
  unverified chapter stops the run instead of shrinking the station.
- The coverage file is in `stations-chirho/coverage-chirho/`, one per source. The evidence file,
  with counts, sizes and what was missing, is in `spec-chirho/evidence-chirho/catalogue-chirho/`.
- The ship tests are in `catalogue_chirho.spec.ts`. They name no station, so adding one needs no
  change to them.

## A player finds a chapter

Nothing here touches the network. A player can resolve an address and start playing inside the
same tap.

```mermaid
flowchart TD
    ask_chirho[resolveChapterChirho station, book, chapter] --> real_chirho{A real book and a whole chapter number?}
    real_chirho -- no --> nothing_chirho([Nothing])
    real_chirho -- yes --> covered_chirho{Inside the station's measured coverage?}
    covered_chirho -- no --> nothing_chirho
    covered_chirho -- yes --> kind_chirho{A locator kind this code knows?}
    kind_chirho -- no --> nothing_chirho
    kind_chirho -- pattern --> fill_chirho[expandTemplateChirho fills the address template]
    fill_chirho --> whole_chirho{Every placeholder filled?}
    whole_chirho -- no --> nothing_chirho
    whole_chirho -- yes --> timed_chirho{Does the station have verse timings?}
    timed_chirho -- yes --> both_chirho([The audio address and the timings address])
    timed_chirho -- no --> audio_chirho([The audio address])

    both_chirho --> fetch_chirho[The player fetches the timings file]
    fetch_chirho --> parse_chirho[parseVerseTimingsChirho]
    parse_chirho --> usable_chirho{A list of verse starts that never runs backwards?}
    usable_chirho -- yes --> verse_chirho([Carry the position over by verse])
    usable_chirho -- no --> fraction_chirho([Carry the position over by fraction])

    dial_chirho[The dial lands on another station] --> ator_chirho[chapterAtOrAfterChirho]
    ator_chirho --> same_chirho{Does it have the chapter being played?}
    same_chirho -- yes --> stay_chirho([The same chapter])
    same_chirho -- no --> later_chirho([The next chapter it has, wrapping to its first])

    ended_chirho[A chapter ends] --> next_chirho[nextChapterChirho]
    next_chirho --> later_chirho
```

- A timings file can be missing for a single chapter of a station that otherwise has them. The
  evidence file lists those chapters. The player falls back to the fraction.
- A player that meets a locator or timings kind it does not know must skip that station.
