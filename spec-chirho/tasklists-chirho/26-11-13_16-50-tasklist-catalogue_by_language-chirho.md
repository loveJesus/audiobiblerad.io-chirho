<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->

# Catalogue by language: Davar Audio Bibles

Owner of this list: the catalogue seat. Tick a box when the step is truly done and checked.

## Why

Davar Audio Bibles serves 431 recordings in 389 languages, a file per chapter, from its own host,
free for non-commercial use with its notices shown. It fits this project's rule as it stands. It
is fifteen times the catalogue we have, so it cannot be bundled the way the first 29 stations are.

## Decided at the start

- **Nothing that plays today changes.** The 29 built-in stations, every existing export and the
  register stay as they are. The staged web work is not touched and must stay green.
- **Stations load by language, on demand.** A small list of languages, then one small file per
  language holding complete stations. Once a language is loaded, finding a chapter is as it is
  today: no network, same functions, same shapes.
- **What we serve is a snapshot we measured,** not a live read of the source. A station ships only
  with its notices on record and its chapters measured, the same rule as before.
- **The files are data, not code:** `static/catalogue-chirho/`, sharded by the first letter of
  the language code, served by the worker as they are.
- **The source refuses clients that are not browsers.** Its lists are read in a real browser
  session and saved; a script turns that reading into the files. A script-driven headless
  browser was tried and refused, and is not disguised to get round that.
- **Out of scope here:** the screen and the player. Choosing among hundreds of stations belongs
  to the web seat. Native apps wait for the owner, and for a word with Davar.

## Steps

- [x] The contract gains, without changing anything existing: an address override for a chapter
      whose file is named out of pattern; a reader that accepts a station loaded at run time
      only when it is well formed; a language list and a loader for one language.
- [x] Davar's naming, as data: its 66 book names, and the two chapter widths it uses.
- [x] Read the library's index and all 431 file lists in a browser; keep the reading outside the
      repository and record its size, date and hash.
- [x] A script turns the reading into the language list, the language files, the evidence and a
      register of every station with both of its notices. Logic in the library, with tests.
- [x] Every chapter a station claims is a file its own list names. Chapters whose files cannot be
      matched to a book and chapter are left out and counted.
- [x] Load the first chapter of every station in a real browser and record what answered.
- [x] Tests that walk every language file on disk: licence, credit, coverage, address form.
- [x] Sources file and workflow page brought up to date. The fleet report is the coordinator's.
- [x] Whole tree green (check 0 errors and 0 warnings, lint clean, 149 unit tests), committed by path.

## Joel and Malachi in the Hebrew count (approved by the coordinator, room messages 34071 to 34074)

- [x] On 59 recordings that list a Joel 4, a Malachi 3 and no Malachi 4, play the fourth file as
      Joel 3 and hold back the second and third, which are each part of Joel 2.
- [x] Remap only recordings approved by name, in `davar_numbering_chirho.ts`; the two that list a
      Joel 4 in another pattern stay as they are. A reading that disagrees stops the build.
- [x] Cite the crosswalk sources and say what they do and do not support; say that Hebrew
      Malachi 3 holds Malachi 4 too.
- [x] Sources file: put back the four sections (downloads only, Tier 2, Tier 3, not read yet)
      that the first Davar commit dropped by mistake.
- [ ] Playing a chapter from two files, which would bring Joel 2 back: proposed in the room
      before any work on it.

## Log

- 2026-11-13 16:50 EST: started. Agent code `BIBLERADIO-CLAUDE2-CHIRHO`. The progress database is
  part of the coordinator's uncommitted work, so this unit is logged here until it can be
  written there.
- 2026-11-13 16:45 EST: the coordinator returned and keeps the progress database; this unit's
  start and end are sent to it in the room.
- 2026-11-13: built. 431 stations in 389 languages, 349,722 chapters, none refused. 67 listed
  files name no chapter this catalogue counts, 61 of them a fourth chapter of Joel in recordings
  numbered as Hebrew Bibles are. That numbering is not carried yet and is written up in the
  sources file.
- 2026-11-13 17:27 EST: the web seat finished the language chooser on this contract. The
  sources file now says so.
- 2026-11-13 17:57 EST: Joel numbering corrected on the 59 approved recordings. 349,663
  chapters; 8 files left out, 118 held back as parts of a chapter. The coordinator's review of
  every position found only the expected 59 withdrawals and 59 remaps.
