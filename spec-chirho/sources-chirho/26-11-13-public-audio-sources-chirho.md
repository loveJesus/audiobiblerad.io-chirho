<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->

# Public audio Bible sources

Read on 2026-11-13. Every address below was opened that day, and the status codes and byte counts
are from that day. Licences change, so re-read a source's own page before shipping a station from it.

The rule this file serves: **"publicly available" is not the same as "free to redistribute".** A
station ships only when its licence and the credit it requires are recorded here.

## In short

- **Playable today with no key and clear terms:** English in several voices and Mandarin from the
  Free Use Bible API, 13 languages from Bible in Every Language, and English from eBible.org.
- **The largest catalogue, Bible Brain, needs a free API key in the owner's name** and allows
  streaming only. Reaching "any language" depends on it.
- Two sites could not be read with a plain fetcher and one has unclear rights. They are at the end.

## Tier 1: playable today without a key

### Free Use Bible API (bible.helloao.org)

- **Audio it serves:** Berean Standard Bible (`BSB`) in three voices named `hays`, `souer` and
  `david`, and the Chinese Union Version (`cmn_cuv`) in one voice named `mandarin`. This list comes
  from the project's own source file `packages/helloao-tools/generation/audio.ts` in
  `github.com/HelloAOLab/bible-api`. Three more Chinese ids and `AAB` reuse the same recordings.
- **Address pattern:** `https://audio.bible.helloao.org/api/{translation}/{BOOK}/{chapter}/audio/{voice}.mp3`
  with the book as an upper-case three-letter code and the chapter without padding. Example:
  `https://audio.bible.helloao.org/api/BSB/GEN/1/audio/david.mp3` returned 200, `audio/mpeg`,
  7,033,707 bytes, and accepts range requests.
- **Verse timings:** `https://bible.helloao.org/api/{translation}/{BOOK}/{chapter}.{voice}.audioTimings.json`
  holds a `verses` list of start times in seconds. Present for both `BSB` and `cmn_cuv`. This is
  what lets two stations stay on the same verse when the dial turns.
- **Chapter lookup:** `https://bible.helloao.org/api/{translation}/{BOOK}/{chapter}.json` returns
  `thisChapterAudioLinks` and the next and previous chapter links. `.../api/BSB/books.json` lists 66
  books and 1,189 chapters with their codes and chapter counts.
- **Text catalogue:** `https://bible.helloao.org/api/available_translations.json` lists 1,505 text
  translations in 1,168 languages with each language's own name. Audio exists only for the ids
  above; the list is still useful for language names.
- **Terms:** its documentation says the API is MIT licensed, adds no restrictions of its own, and
  that responses may be cached, stored and downloaded without expiry. Each text keeps its own notice.
- **Licence of the recordings:** the Berean audio page (`https://bereanbible.com/audio/`) says the
  recordings narrated by Bob Souer, Barry Hays and Jordan Gilbert "have been dedicated to the public
  domain (CC0 1.0)". The Berean text is public domain since 2023-04-30
  (`https://berean.bible/licensing.htm`).
- **Not established today:** who the `david` voice is, whether it is a person or a synthetic voice,
  and the licence of the Mandarin recording. Find the maker's statement before shipping those two.

### openbible.com/audio

- **What:** a plain file listing at `https://openbible.com/audio/`. Folders seen: `hays`, `souer`,
  `gilbert`, `david`, `arabella`, `sophia`, `bsb_frederick_surrey`, `bsb_musical`, `gilbert_music`,
  `kjv`, `kjv_sophia`, `kjv_musical`, `msb`, `msb_arabella`, `msb_sophia`, `msb_frederick_surrey`.
  The `kjv`, `msb` and `david` folders each hold 1,189 chapter files plus one archive.
- **File names:** `{VERSION}_{book order, 2 digits}_{Book code}_{chapter, 3 digits}{suffix}.mp3`, for
  example `KJV_43_Jhn_003.mp3` (200, `audio/mpeg`, 8,018,820 bytes, accepts range requests),
  `BSB_01_Gen_001_D.mp3` and `MSB_01_Gen_001_D.mp3`. The book code is capitalised (`Gen`, `1Sa`,
  `Jhn`) and Titus is written `Tts`. The suffix marks the voice: `_H` for Hays, none for Souer, `_D`
  for David.
- **Licence:** the named Berean narrators are CC0 as above. No page read today states who recorded
  the `kjv` and `msb` folders or the other voices, or under what terms.
- **Not established today:** several folder names look like synthetic voices. Nothing read today
  confirms it. Listeners should be told when a voice is synthetic, so record the voice kind as
  unknown until the maker says.

### Bible in Every Language audio (Wycliffe Associates)

- **Licence:** the site's footer says "Unless otherwise mentioned, all work is licensed under a
  Creative Commons Attribution-ShareAlike 4.0 International License." Credit is required.
- **Address pattern, verified:**
  `https://audio-content.bibleineverylanguage.org/content/{lang}/ulb/{book}/{chapter}/CONTENTS/mp3/hi/chapter/{lang}_ulb_{book}_c{chapter}.mp3`
  with the book as a lower-case three-letter code and the chapter without padding. The `mp3/hi`
  part means high quality, not Hindi. `ulb` is the version, the Unlocked Literal Bible.
- **Verified with all 21 chapters of John:** `en`, `gu`, `hi`, `kn`, `ml`, `mr`, `ne`, `or`, `pa`,
  `sw`, `ta`, `te`, `vi` (English, Gujarati, Hindi, Kannada, Malayalam, Marathi, Nepali, Odia,
  Punjabi, Swahili, Tamil, Telugu, Vietnamese).
- **Samples:** Hindi John 3 returned 200, `audio/mpeg`, 6,089,246 bytes; Swahili John 3 returned
  200, 6,700,302 bytes. Both accept range requests. Padding check: `hi_ulb_psa_c23` 200,
  `hi_ulb_psa_c023` 404, `hi_ulb_gen_c1` 200, `hi_ulb_gen_c01` 404.
- **Gaps:** the site says "Some chapters may be missing", so availability has to be checked chapter
  by chapter. Listed on the site with no John audio: `ilo`, `tl`, `ida-x-tiriki`, `lto`.
- **More languages exist than were verified.** The language page also showed Amharic, Arabic,
  Assamese, Bengali, Cebuano, Latin American Spanish, Persian, French, Hausa, Indonesian, Khmer, Lao
  and Burmese. None of them answered at the `ulb` pattern, so they use another version code that
  was not found today.
- **Reading the site:** `https://audio.bibleineverylanguage.org/` refuses plain fetchers (403) and
  needs a real browser. The audio host itself serves plain requests.

### eBible.org, World English Bible

- `https://ebible.org/webaudio/`: recordings by Michael Paul Johnson "are in the Public Domain.
  They are not copyrighted. Please feel free to download, copy, mirror, and share these files."
- `https://ebible.org/eng-web/audio/`: a recording by Winfred W. Henson. "You may download, copy,
  and listen to this recording of the Holy Bible freely."
- **File names are irregular**, for example `43_John/0999 John-Chapter Three.mp3`. This source needs
  a chapter index built by reading its 66 book pages; a pattern will not do.

### LibriVox

- Public-domain recordings by volunteers, published one book at a time. The API
  (`https://librivox.org/api/feed/audiobooks?title=%5EBible&format=json&limit=50`) returned 50
  entries, the limit asked for: 45 English (KJV, ASV, WEB, Douay-Rheims), 3 French (Louis Segond
  1910), 1 Latin (Vulgate) and 1 Hebrew (Genesis, 50 sections). A search for `^Biblia` returned 4
  Portuguese (Almeida) and `^Bibel` returned 3 German (Luther 1912).
- **Limits:** coverage is partial in every language, and a section is not always one chapter (Luke
  has 12 sections for 24 chapters). Each entry needs its own mapping.

## Tier 2: needs a key or an agreement in the owner's name

### Bible Brain, the Digital Bible Platform (Faith Comes By Hearing)

The largest catalogue of audio Bibles. The terms below are from the API licence at
`https://www.faithcomesbyhearing.com/bible-brain/license`, marked "Last Modified: 4/15/21".

- **A key is required**, granted to one named person: "you must (a) provide us with your name,
  email, a description of your intended use and purpose for the API". They "may approve or deny
  your API Key request at our sole discretion", and "You may not share your API Key with any other
  person". There is no fee.
- **Free to listeners:** "You enable your End Users to access DBP Content completely free of charge".
- **Streaming only:** content is for use "solely through DBP (and not separately through offline
  download) for your personal, non-commercial use". "No DBP Content may be downloaded or made
  available for offline use ... except for DBP Content that is accessible via the /download endpoint".
- **Credit must be easy to reach:** allowed "only if all copyright information from the
  corresponding Content Licensors is readily accessible to them (for instance, via a clickable
  'Copyrighted Material – LEARN MORE' button at the bottom of each chapter". Notices must be
  "conspicuously" posted.
- **Their terms go to every listener:** "Provide a copy of the DBP T&Cs to all End Users".
- **No relaying to others:** "You do not create a proxy distribution network for DBP Content (for
  instance, enabling other developers to use DBP Content or metadata via your servers or API
  instead of ours)".
- **Faith guidelines:** use must accord with their Statement of Faith and Mission Statement.
- **On request,** they may ask for an account on our app that shows what listeners get.
- **The API** is described at `https://4.dbt.io/open-api-4.json` (version 4.0.0-beta, 31 paths,
  key scheme `dbp_key`). Useful paths: `/languages`, `/bibles`, `/bibles/{id}`,
  `/bibles/filesets/{fileset_id}/{book}/{chapter}`, `/bibles/{bible_id}/copyright`,
  `/timestamps/{fileset_id}/{book}/{chapter}`, `/download/list`. No call was made today because
  there is no key.
- **How audio arrives** (their core concepts page): files sit behind a delivery network and the API
  returns signed addresses. Audio filesets come as 64 kbps MP3, as 16 kbps Opus, and for a few as
  an HLS stream. Some have approximate verse start times. A version can have drama and non-drama
  recordings.
- **Question to settle with them when asking for the key:** this project's source is public, so the
  key cannot live in the code or in a web page. The clean answer is our own server holding the key
  and handing signed addresses to our own apps only. Their terms forbid relaying to other
  developers, so ask them to confirm that this arrangement is acceptable.

### Others, not read at their own pages today

The Free Use Bible API's documentation compares itself with two more services. These are its
characterisations, not checked at the source: API.Bible needs an account and key, allows 5,000
calls a month on its starter plan and needs a licence per translation for commercial use; the
YouVersion Platform needs app registration, a key and an agreement with each publisher.

## Tier 3: do not use without asking first

- **Wordproject** (`https://www.wordproject.org/bibles/audio/`): many languages with direct files.
  Its copyright page claims "the right of fair use for non-profit purposes" and says of the
  narrations that "several have been done or sponsored by wordproject". That leaves the rest
  unaccounted for. Write to them before using any of it.
- **Faith Comes By Hearing MP3 downloads:** free personal downloads behind a form. It is not a
  source for an app.

## Not read today

`https://open.bible/` (refuses plain fetchers), API.Bible's own terms, the YouVersion Platform's
own terms, Global Recordings Network, Talking Bibles, Scripture Earth, Door43, Audio Treasure, and
collections on the Internet Archive.

## What this means for speed

Chapter files are 6 to 8 MB. Every host tested accepts range requests, so a player can start
before the whole file arrives and can jump to a position without fetching what comes before it.
