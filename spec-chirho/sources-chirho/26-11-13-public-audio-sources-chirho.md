<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->

# Public audio Bible sources

First read on 2026-11-13, when the project was set up. Read again and measured the same day, when
the catalogue was built: every address pattern below was put through the availability check, and
the counts are from that check. Licences change, so re-read a source's own page before shipping a
new station from it.

The rule this file serves: **"publicly available" is not the same as "free to redistribute".** A
station ships only when its licence and the credit it requires are recorded here.

The record is in three places:

- **This page:** each source, the words that grant its licence, and what was held back and why.
- **`station_register_chirho.md`, beside this page:** every station that ships, with its licence,
  its credit and the page the licence was read on. It is written from the catalogue, and a test
  fails when it differs from what ships.
- **`spec-chirho/evidence-chirho/catalogue-chirho/`:** what the availability check measured.

## In short

- **Playing now with no key:** 29 stations in 26 languages. English in four voices; Gujarati, Hindi,
  Kannada, Malayalam, Marathi, Nepali, Odia, Punjabi, Swahili, Tamil, Telugu, Vietnamese, Tiriki
  and Olutsotso from Bible in Every Language; and from LibriVox most of the Bible in Spanish, and
  a book or two each in Chinese, Dutch, Greek, Ancient Greek, German, French, Hebrew, Church
  Slavonic, Portuguese and Maori. The station register beside this page lists every one.
- **The largest catalogue, Bible Brain, needs a free API key in the owner's name** and allows
  streaming only.
- **In the catalogue, loaded by language on demand:** 431 stations in 389 languages from Davar
  Audio Bibles, 349,722 chapters, served a file per chapter from its own host, free for
  non-commercial use with its notices shown. The web player has no way to choose among them
  yet; that is the next piece of work on the screen. Its register is
  `davar_station_register_chirho.md`, beside this page.
- **Open.Bible offers 157 languages under open licences with no key,** as downloads only. Playing
  them means keeping copies, which is the owner's decision.
- **Not playing, for three different reasons.** Each source below says which applies.
  - **No licence on record:** the maker has not said who is speaking or under which terms. These
    cannot ship until that is read.
  - **Clear terms, our own caution:** a voice that may be text to speech, or a text its translators
    call a draft. Nothing forbids these. They wait for the owner's preference.
  - **Clear terms, work to do:** file names that follow no rule and need a chapter index.

## Tier 1: no key needed, a file per chapter

### Free Use Bible API (bible.helloao.org)

- **Stations:** `helloao-bsb-hays` and `helloao-bsb-souer`, the Berean Standard Bible read by
  Barry Hays and by Bob Souer. Each has all 1,189 chapters.
- **Audio it serves:** Berean Standard Bible (`BSB`) in three voices named `hays`, `souer` and
  `david`, and the Chinese Union Version (`cmn_cuv`) in one voice named `mandarin`. This list comes
  from the project's own source file `packages/helloao-tools/generation/audio.ts` in
  `github.com/HelloAOLab/bible-api`. Three more Chinese ids and `AAB` reuse the same recordings.
- **Address pattern:** `https://audio.bible.helloao.org/api/{translation}/{BOOK}/{chapter}/audio/{voice}.mp3`
  with the book as an upper-case three-letter code and the chapter without padding.
- **Verse timings:** `https://bible.helloao.org/api/{translation}/{BOOK}/{chapter}.{voice}.audioTimings.json`
  holds a `verses` list of start times in seconds, verse 1 first. This is what lets two stations
  stay on the same verse when the dial turns. Every file was fetched and read: 1,188 of 1,189 for
  Hays and 1,187 for Souer. Leviticus 19 is missing for both and Psalm 150 for Souer; those answer 404. No file runs backwards. A chapter opens with a spoken heading, so verse 1 starts a few
  seconds in.
- **Text catalogue:** `https://bible.helloao.org/api/available_translations.json` lists 1,505 text
  translations in 1,168 languages with each language's own name. Audio exists only for the ids
  above.
- **Terms:** its documentation says the API is MIT licensed, adds no restrictions of its own, and
  that responses may be cached, stored and downloaded without expiry. Each text keeps its own notice.
- **Licence of the recordings:** the Berean audio page (`https://bereanbible.com/audio/`) says:
  "The Holy Bible, Berean Standard Bible, BSB Audio narrated by Bob Souer, Barry Hays, and Jordan
  Gilbert. These audio versions of God's Word have been dedicated to the public domain (CC0 1.0)".
  The Berean text is public domain since 2023-04-30 (`https://berean.bible/licensing.htm`).
- **Credit:** CC0 asks for none. The stations name the version and the narrator anyway.
- **Held back:** the `david` voice and the Mandarin recording. Nothing read says who or what the
  `david` voice is, or under which licence either recording is offered.

### openbible.com/audio

- **Station:** `openbible-bsb-gilbert`, the Berean Standard Bible read by Jordan Scott Gilbert,
  with all 1,189 chapters. It is one of the three narrations the Berean audio page dedicates to the
  public domain, quoted above.
- **What:** a plain file listing at `https://openbible.com/audio/`. Its downloads page
  (`https://openbible.com/audio.htm`) names the folders: "BSB - Jordan Scott Gilbert" (`gilbert`),
  "BSB - Barry Hays" (`hays`), "BSB - Bob Souer" (`souer`), "BSB - Gilbert + Music"
  (`gilbert_music`), "BSB - David" (`david`), "KJV - David" (`kjv`) and "MSB - David" (`msb`).
  Other folders seen in the listing and named nowhere: `arabella`, `sophia`, `bsb_frederick_surrey`,
  `bsb_musical`, `kjv_sophia`, `kjv_musical`, `msb_arabella`, `msb_sophia`, `msb_frederick_surrey`.
- **File names:** `{VERSION}_{book order, 2 digits}_{Book code}_{chapter, 3 digits}{suffix}.mp3`, for
  example `BSB_01_Gen_001_G.mp3`. The book codes were read from the listings themselves: the
  letter after a leading digit is a capital (`1Sa`), and Titus is written `Tts`. The suffix marks
  the voice: `_G` for Gilbert, `_H` for Hays, none for Souer, `_D` for David, `_Gm` for Gilbert
  with music.
- **Measured:** the `gilbert`, `hays`, `souer`, `david`, `kjv` and `msb` folders each list exactly
  1,189 chapter files. `gilbert_music` lists 260, the New Testament.
- **Held back:** every `david` folder, which includes the King James Version and the Majority
  Standard Bible, and the editions with music. No page read says who or what the David voice is,
  who made the music, or under which licence any of them is offered. Several folder names look
  like synthetic voices; nothing read confirms it.

### Bible in Every Language audio (Wycliffe Associates)

- **Stations:** fifteen, named `biel-ulb-` or `biel-reg-` and the language tag. English, Gujarati,
  Hindi, Kannada, Malayalam, Marathi, Nepali, Odia, Punjabi, Swahili, Tamil, Telugu and Vietnamese
  are the Unlocked Literal Bible. Tiriki and Olutsotso are each a community's own translation.
- **Licence:** the footer of `https://bibleineverylanguage.org/` says: "This site is offered by
  Wycliffe Associates and our partners to provide access to tools and resources needed to complete
  the work of Bible translation for the local church. Unless otherwise mentioned, all work is
  licensed under a Creative Commons Attribution-ShareAlike 4.0 International License."
- **Credit:** required. Each station names the version, Bible in Every Language, Wycliffe
  Associates and partners, and the licence, and says the recording is played unchanged.
- **Address pattern:**
  `https://audio-content.bibleineverylanguage.org/content/{lang}/{version}/{book}/{chapter}/CONTENTS/mp3/hi/chapter/{lang}_{version}_{book}_c{chapter}.mp3`
  with the book as a lower-case three-letter code and the chapter without padding. The `mp3/hi`
  part means high quality, not Hindi.
- **What the site offers,** read with a real browser on 2026-11-13: it lists 30 languages. For 13
  of them the entry is greyed out and leads nowhere: Amharic, Arabic, Assamese, Bengali, Cebuano,
  Latin American Spanish, Persian, French, Hausa, Indonesian, Khmer, Lao and Burmese have no audio
  there. Of the 17 that open, Ilocano and Tagalog list no MP3 book. That leaves 15.
- **The versions:** 13 languages are the Unlocked Literal Bible, `ulb` in the address. Tiriki and
  Olutsotso are filed under `reg`. The publisher's own manifest for each
  (`Tech_Advance/ida-x-tiriki_reg` and `Tech_Advance/lto_reg` on
  `content.bibletranslationtools.org`) gives the title "Bible", the publisher Wycliffe Associates,
  the creator "Bible translation community" and the rights "CC BY-SA 4.0"; the repositories are
  described as "Tiriki Bible Kenya" and "Olutsotso Bible".
- **Measured:** every chapter address of every station was asked for, 17,835 in all.
  - Nine languages have all 1,189 chapters: English, Gujarati, Hindi, Kannada, Malayalam, Marathi,
    Punjabi, Tamil and Telugu.
  - Vietnamese has 1,180 and Odia 1,175. Each lacks a few scattered chapters.
  - Swahili has 566: Genesis to 2 Kings with gaps, half of 2 Chronicles, Job, the four Gospels and
    most of the letters. It has no Acts, Romans, Colossians or Revelation as MP3.
  - Nepali has 259: the New Testament less one chapter of Matthew.
  - Tiriki has 74 and Olutsotso 76: the shorter New Testament letters. Neither has a
    Gospel.
  - The evidence file lists what is missing, book by book.
- **Voices:** the site names no reader. It offers the recordings as "source audio" for
  translators. The voice kind is recorded as unknown.
- **Not played:** where a chapter has no MP3 the site sometimes offers a WAV file instead, for
  example the Swahili Revelation. Those are uncompressed and far too large to start quickly.
- **Reading the site:** `https://audio.bibleineverylanguage.org/` refuses plain fetchers (403) and
  needs a real browser. The audio host itself serves plain requests.

### eBible.org

Nothing from this host plays yet. Each recording below waits for a different reason, marked in
bold.

- **World English Bible British Edition** (`ebible-webbe` in the register's held list): all 1,189
  chapters at `https://ebible.org/eng-webbe/mp3/eng-webbe_{number}_{BOOK}_{chapter}.mp3`, for
  example `eng-webbe_073_JHN_03.mp3`. The number is eBible's own: Genesis is 002 and Malachi 040,
  Matthew is 070 and Revelation 096, with the numbers between kept for books outside the 66. The
  chapter has two digits, three in Psalms.
  - **Licence:** `https://ebible.org/webaudio/` says: "World English Bible British Edition audio is
    free to download and use." The translation's details page offers "MP3 Audio" to "Stream or
    download". Each file's own tag says: "Text by EBible.org", "Audio by
    PublicDomainAudioBibles.com", "The text and audio are released to the public domain and can be
    used without restriction".
  - **Small files:** John 3 is 966,728 bytes, against 4,522,276 for the same chapter read by Barry
    Hays. It would start quickly on a slow connection.
  - **Our own caution, not a licence question:** its maker says its other recordings were made
    "using a licensed high quality text to speech engine" (see the next source), and no page says
    whether this one was. The project's rule is to record a voice as unknown until its maker says,
    and nothing forbids a synthetic voice. The owner has not yet said whether he wants them, so
    this one waits for his preference. Its chapters are measured and one line releases it.
- **Santa Biblia libre para el mundo** (Spanish, every chapter, `https://ebible.org/spablm/mp3/`)
  and **Sainte Bible libre pour le monde** (French, the New Testament,
  `https://ebible.org/frasbl/mp3/`): public domain, under regular names. **Our own caution, not a
  licence question:** each translation's own page says "This is a draft translation. It is being
  proofread and edited." They wait for the owner's preference on playing a draft of Scripture.
  Not yet measured. The Spanish folder writes four books its own way: `ECL`, `NAH`, `ZAC` and
  `FLM`.
- **Recordings by Michael Paul Johnson** (`https://ebible.org/webaudio/mp3.htm`): "in the Public
  Domain. They are not copyrighted. Please feel free to download, copy, mirror, and share these
  files." **Work to do:** the set is partial and its names are irregular: Psalms 1 and 2, Matthew,
  Mark 1 to 7, John, Romans 1 to 5, Hebrews, and several short letters as one file each. It needs
  a chapter index.
- **A recording by Winfred W. Henson** (`https://ebible.org/eng-web/audio/`): "You may download,
  copy, and listen to this recording of the Holy Bible freely." **Work to do:** complete, read by
  a person, with irregular names such as `43_John/0999 John-Chapter Three.mp3`. It needs a chapter
  index built from its 66 book pages, and is the next English station worth adding.
- **The New Testament "recorded by FCBH"** (`https://ebible.org/eng-web/mp3/`): **no licence on
  record.** No terms are stated beside it, and Faith Comes By Hearing's own terms are the ones
  under Tier 2.
- **Folders with only an archive:** `spabes`, `spaRV1909`, `spabll`, `porbrbsl`, `cmnswcb`,
  `engBBE` and `eng-kjv2006` each hold a zip file and no chapter files, so there is nothing to
  stream from this host. The same recordings are on the next source.

### PublicDomainAudioBibles.com

A private ministry that makes and gives away audio Bibles, and the maker of the eBible.org audio
above. Read on 2026-11-13. Its terms are clear and allow this use. **Nothing from it plays yet and
nothing was measured:** most of it is text to speech, which waits for the owner's preference.

- **What it offers:** the Reina Valera 1909 in Spanish, La Biblia en Español Sencillo, the Biblia
  Libre Latinoamericana, the Bíblia Portuguesa Mundial in Brazilian Portuguese, the World Chinese
  Bible, the King James Version, the Bible in Basic English in four accents, the New Heart English
  Bible, and the World English Bible read by David Williams and by Winfred Henson. These would be
  the first complete Spanish, Portuguese and Chinese stations.
- **Licence:** its home page says the Bibles "can be legally downloaded, copied, and used for any
  purpose without major restrictions (some require attribution)", and its about page: "The Bible
  Audio files offered on PublicDomainAudioBibles.com for streaming and download can be freely
  copied and reused for your personal and ministry projects." Each Bible's page gives its own
  statement, for example of the Reina Valera 1909: "released into the public domain in 2017. It
  can be used for any ministry or commercial purpose without restriction."
- **Voices, in its own words:** the Reina Valera 1909, the King James Version and the Bible in
  Basic English were made "using a licensed high quality text to speech engine". The World English
  Bible recordings are by named narrators; of Winfred Henson's it says the narrator placed it in
  the public domain in 2017.
- **What it waits for:** the owner's preference on synthetic voices, which is already on his
  list. Nothing forbids them. The two World English Bible narrations are read by people and wait
  only for their address pattern to be read and their chapters measured.
- **To keep in mind, not a condition:** the site is paid for by donations, and says "There is a
  cost to prepare and serve these files". Its terms invite streaming and reuse, so playing from
  its host is permitted and is this project's design. A radio that grew large would spend their
  bandwidth, so the traffic sent to this host is worth watching as use grows. A courtesy note to
  them is drafted for the owner, should he wish to send one. Nobody has been contacted.

### LibriVox

- **Stations:** eleven, each named `librivox-`, the version and the language tag.
  - Spanish, the Reina-Valera Antigua: 45 books, 986 chapters, all read by one volunteer. It
    lacks Isaiah, the twelve minor prophets, Mark, Acts, Colossians, 1 and 2 Timothy, Titus, and
    1 and 2 Peter.
  - Chinese, the Chinese Union Version: Mark, Luke and John.
  - Dutch, the Statenvertaling: John and Revelation.
  - Greek, the Patriarchal Text of 1904: Matthew and Colossians. Ancient Greek, Stephanus's text
    of 1550: James. LibriVox files these under two language names, and so does the catalogue.
  - German, Luther's Bible of 1912: Matthew. French, Le Maistre de Sacy's translation: Mark.
  - Hebrew: Genesis. Church Slavonic: Genesis. Portuguese, Almeida: Ruth and Ecclesiastes.
  - Maori: Matthew 1 to 9, which is all that was recorded.
- **Measured:** every listed address was asked for, 1,297 in all, and 1,296 answered with audio.
  The one that did not is Joshua 18 in Spanish: LibriVox's catalogue lists an address for it that
  the Internet Archive answers with 404. It is left out, and the station plays on from Joshua 17
  to Joshua 19.
- **Licence:** `https://librivox.org/pages/public-domain/` says: "LibriVox records only texts that
  are in the public domain (in the USA ...), and all our recordings are public domain (definitely
  in the USA, and maybe in your country as well ...). This means anyone can use all our recordings
  however they wish (even to sell them)." It adds that a recording is "public domain in the USA,
  but not necessarily in other countries". Every text read here was first published before 1920.
- **Credit:** none is asked for. The stations name the version and LibriVox.
- **Voices:** human. LibriVox states its aim as "To make all books in the public domain available,
  narrated by real people". Readers are volunteers; the stations credit "LibriVox volunteers".
- **How a book qualifies:** LibriVox publishes one book at a time, and a recording's sections are
  not always chapters: its French John has 5 sections for 21 chapters, and its Spanish Isaiah
  reads two chapters to a section. A recording is indexed only when it has exactly one section
  per chapter, numbered in order, each titled with its chapter number. A recording may hold
  several short books one after another, or stop early; the project list says which. The index
  is written from LibriVox's catalogue (`https://librivox.org/api/feed/audiobooks`) by
  `scripts-chirho/catalogue-chirho/build_librivox_index_chirho.ts`, which refuses to write
  anything if a single recording fails the rule.
- **Where they were found:** the catalogue's "Bibles" genre, 192 recordings on 2026-11-13, 104 of
  them English. English is well served elsewhere and was not indexed.
- **Where the files are:** on the Internet Archive, under names that follow no rule. An address
  redirects once to a storage host, which sends an open cross-origin header and accepts range
  requests. LibriVox's catalogue gives addresses at `www.archive.org`, which only redirects to
  `archive.org`; the index starts at the second, which saves a round trip. Measured first byte of
  a ranged request: 0.9 seconds, against 1.2 through the extra hop. These stations start more
  slowly than the others.
- **Held back, work to do:** a Portuguese Proverbs whose sections had no address yet; a Spanish 1
  and 2 Timothy with the same gap; the Spanish Isaiah, minor prophets, Jonah and Titus, a Chinese
  Matthew and Romans, a Greek 1 and 2 Peter and a Hebrew Exodus, all read several chapters to a
  section. Playing those needs a start time inside a file, which the contract does not have yet.

## Clear terms and playable from the source, loaded by language

### Davar Audio Bibles (davaraudiobibles.org)

The largest source found that fits this project's rule as it stands: it serves a file per
chapter from its own host. Read with a real browser on 2026-11-13. Its 431 recordings are in
the catalogue as stations that load by language, on demand, so that the first sound costs what
it did before. The web player cannot choose among them yet.

- **How much:** its "Audio Bible Library" lists 431 recordings in 389 languages across 67
  countries: 132 whole Bibles, 172 Old Testaments, 125 New Testaments and 2 portions. 116
  languages have a whole Bible. India has 80 recordings, Kenya 25, Tanzania 24, Ghana and
  Nigeria 22 each, Ethiopia 21, Indonesia 20, Cameroon 19.
- **Whole Bibles include** Assamese, Bengali, Gujarati, Hausa, Hindi, Igbo, Indonesian, Javanese,
  Kannada, Khmer, Lingala, Luganda, Malayalam, Marathi, Nepali, Odia, Persian, Punjabi, Russian,
  Sundanese, Swahili, Tamil, Telugu, Twi, Urdu, Vietnamese and Yoruba.
- **Terms,** on its library page: "This audio is free to download and distribute, but it may not
  be sold or used for any commercial purpose. When sharing, you must include the copyright
  notice visibly on any physical label or digital display. All other rights are reserved by the
  copyright holder." So: free use only, and each station must show its notices. 69 recordings
  also carry a CC BY-SA notice of their own.
- **Credit:** the library's index gives each recording a text notice and an audio notice, for
  example "Afar Bible © Bible Society of Ethiopia" and "Afar Audio Bible ℗ 2023, Davar Partners
  International". Both must be shown.
- **Where the files are:** the library is a player at `listen.dbs.org` reading
  `https://audio.dbs.org/index.json`. Each recording has an id such as `AHRTLF_DAVR_NT_N`, a list
  of its files at `https://audio.dbs.org/{id}/index.txt`, and chapters at
  `https://audio.dbs.org/{id}/40_Matthew_01.mp3`: the book's number, its English name and the
  chapter. Its player also asks each recording for a list of verse timings; the one recording
  tried had none.
- **Tested from another website, in a browser:** a chapter loaded in an audio element in 0.16
  seconds, and the index and a recording's file list could both be read. So a web page of ours
  can play it and can read what each recording has.
- **Measured on 2026-11-13, in a browser:** the index and all 431 file lists, 349,789 file names.
  A chapter is claimed only when the recording's own list names a file for it: 349,722 chapters,
  and every address the catalogue gives was matched, letter for letter, against a listed name.
  113 stations have every chapter. The first listed file of each of the 431 recordings was then
  loaded in an audio element on another website, and all 431 answered. The numbers, and what
  was left out, are in `spec-chirho/evidence-chirho/catalogue-chirho/davar_snapshot_chirho.json`.
- **What that does and does not prove:** coverage here is what each recording's own list says
  it has. Only 431 files, one per recording, were opened. The other chapters were not each
  asked for, so a file that is listed but broken would be found only when played. The built-in
  stations were measured chapter by chapter; these were not.
- **Naming:** most recordings follow one of two patterns. 1,865 chapters are named otherwise (a
  stray space, another width, a book code in place of a name) and are reached by an address
  written out for that chapter.
- **Left out, 67 files:** 61 recordings number Joel in four chapters, as Hebrew Bibles do, and
  this catalogue counts three. Their fourth is not offered, and their first three are played
  under the numbers the recording gives them. Also left out: two psalms split across two files,
  and two chapters of Daniel that are not among the 66 books' chapters. Carrying a recording's
  own chapter numbering is work not yet done.
- **Voices:** the library names no reader and does not say how its recordings are voiced, so
  every station says "unknown".
- **How it is kept current:** what the catalogue holds is a reading taken on a day, not a live
  view. `scripts-chirho/catalogue-chirho/build_davar_languages_chirho.ts` rebuilds the language
  files, the evidence and the register from a new reading. The reading itself, about 10 MB, is
  not kept in the repository; its size and hash are in the evidence.
- **Not settled:** whether a phone app is served. The host answers 403 to a client that is not a
  browser, so a native app may be refused, and the reading has to be made in a browser. This
  project does not disguise a script as a browser to get round that. Asking Davar would settle
  it; that is the owner's to send.

LibriVox's.

## Next for the catalogue

In rough order of what each would add.

1. **Davar Audio Bibles, the remaining parts:** the stations are in the catalogue. Still to do:
   a way for the listener to choose among 389 languages, which belongs to the player; a
   recording's own chapter numbering, for the 61 that count Joel in four; and a word with Davar
   before any native app relies on its host.
2. **Bible Brain**, once the owner has the key: a third locator kind, where our own server asks
   for a short-lived address. It streams, so it needs no storage of ours.
3. **Open.Bible**, if the owner allows keeping copies of openly licensed recordings: 157
   languages, many with verse timings. It needs storage, and a way to unpack archives that does
   not pass through the build machine.
4. **The owner's preference on synthetic voices.** A yes releases `ebible-webbe` in one line and
   opens complete Spanish, Portuguese and Chinese Bibles at PublicDomainAudioBibles.com, whose
   address patterns still have to be read and measured.
5. **Winfred Henson's World English Bible** on eBible.org: a complete Bible read by a person. It
   needs a chapter index built from its 66 book pages.
6. **A start time inside a file.** Several LibriVox recordings read two or more chapters to a
   section: the Spanish Isaiah and minor prophets, a Chinese Matthew and Romans, a Hebrew Exodus.
   Playing them by chapter needs the contract to carry where in the file a chapter begins.
7. **The makers who have not said:** the `david` voice, the Mandarin recording, the editions with
   music. A question to the Berean Bible's publisher would settle three of the four folders.
8. **Sources not read yet,** listed above.
9. **Measuring again.** Hosts change. Run the availability check for every source before each
   release, and read what changed in the register before committing it.

## What this means for speed

- John 3 is between 4.5 and 7.4 MB at most sources and under 1 MB at eBible.org. Every host
  accepts range requests, so a player can start before the whole file arrives and can jump to a
  position without fetching what comes before it.
- **The audio hosts of the Free Use Bible API, Bible in Every Language, openbible.com and
  eBible.org send no cross-origin header.** A web page can play their files with a plain audio
  element. It cannot read them with `fetch`, and routing them through Web Audio gives silence.
- The verse timings files do send an open cross-origin header, so a web page can read them.
- **How soon the first byte comes,** asking for the first 64 KB of John 1 from one machine in the
  eastern United States on 2026-11-13: about 0.05 seconds at the Free Use Bible API, 0.08 to 0.2
  at Bible in Every Language, 0.12 to 0.2 at openbible.com, and 0.9 at the Internet Archive. One
  place and one afternoon, so a guide and not a promise. The Free Use Bible API stations come
  first in the catalogue, which makes the quickest host the first one a new listener hears.
- Bible in Every Language sends its audio with a download header (`content-disposition:
attachment`). An audio element plays it all the same; opening the address in a browser tab
  downloads the file instead.
- Nothing is copied. Where the sizes were measured on 2026-11-13, one station's whole Bible is
  between 4 and 5.6 GB. It stays on the source's host.
