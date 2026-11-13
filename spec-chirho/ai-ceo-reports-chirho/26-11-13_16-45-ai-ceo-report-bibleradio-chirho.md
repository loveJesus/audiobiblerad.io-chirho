<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->

# Fleet report: Audio Bible Radio, 2026-11-13 16:45 EST

The first report from this fleet; there is none before it. One report for the whole fleet,
compiled by the catalogue seat, which is acting coordinator while the coordinator seat is
unavailable (until 2026-11-18).

## In one paragraph

The project was started today. By this afternoon the catalogue is committed: 29 stations in 26
languages, every one of 18,894 chapter addresses checked at its source. The web radio that plays
them is built and verified by the seat that wrote it, and is staged but **not yet committed**:
that seat became unavailable at the commit step. Nothing is pushed, deployed, registered or sent.

## What is measured, and by whom

| Claim                                                                          | Status                      |
| ------------------------------------------------------------------------------ | --------------------------- |
| Type check: 0 errors, 0 warnings, 475 files                                    | Measured, 16:41, this seat  |
| Lint: Prettier and ESLint clean, whole tree                                    | Measured, 16:41, this seat  |
| Unit and component tests: 124 pass in 14 files                                 | Measured, 16:41, this seat  |
| Nine radio sounds match their generator, 202,812 bytes                         | Measured, 16:41, this seat  |
| 18,894 chapter addresses answer with audio; 29 stations, 26 languages          | Measured today, this seat   |
| A full turn of the dial from John 3 returns to John 3                          | Measured, 15:30, this seat  |
| Browser tests: 11 pass against the built worker                                | Reported by the web seat    |
| Production build succeeds; worker 572,256 bytes, 107 KiB gzipped               | Reported by the web seat    |
| Real streams reach "playing": 287 ms, 31 ms, 141 ms, and 1,415 ms for LibriVox | Reported by the web seat    |
| No credential value in the build output; history scan clean                    | Reported by the web seat    |
| Any phone, any Apple device, any native app                                    | Not established by anything |

The measurements above were taken on the working tree with the staged web work in it.

## The catalogue (committed)

Commits `1773565`, `4c18fdd`, `1070b43`, `59bdbf1`, `3e38d42`, `a80cc64` on `main_chirho`.

- **Stations:** English in four voices; Gujarati, Hindi, Kannada, Malayalam, Marathi, Punjabi,
  Tamil and Telugu complete; Vietnamese, Odia, Swahili, Nepali, Tiriki and Olutsotso in part; and
  from LibriVox most of the Bible in Spanish and a book or two each in ten more languages.
- **The rule that a station ships only with its licence on record** is enforced by a test:
  `spec-chirho/sources-chirho/station_register_chirho.md` is written from the catalogue and the
  test fails when they differ.
- **Evidence:** `spec-chirho/evidence-chirho/catalogue-chirho/`. The check found one chapter that
  its publisher lists and its host does not have; it is left out.
- **One station is held** by our own caution, with a clear licence: its voice may be text to
  speech, and the owner has not said whether he wants such voices.

## The web radio (staged, not committed)

44 files in the index: the player, the nine sounds and their generator, the screen, a credits
page, a catalogue endpoint, browser tests and evidence. Its own verification notes are at
`spec-chirho/evidence-chirho/web-radio-chirho/verification_notes_chirho.md`.

- The catalogue seat reviewed the player twice. The first review found two defects worth fixing
  before landing: the dial lost its place after a station that lacks the chapter, and a network
  failure was treated as a missing chapter and moved the saved place. Both were repaired, and the
  recheck drove the real player with the real catalogue through both cases.
- Its last open step was the commit and this report.
- **It has been left exactly as it was.** A safety copy was made without touching the index or the
  working tree: a commit object kept under `refs/backups-chirho/`, and the files git does not
  track copied to the ignored private workspace. The index and status were identical before and
  after.

## Open failures and limits

- The web radio is not in history. Until it is, the first playable slice exists on one machine.
- The browser tests were not re-run for this report: the web seat's own preview server is still
  running on the port they use, and it was left alone.
- No physical device has played it. Loudness of the sounds on iOS is reasoned, not heard.
- Native apps are not started and wait for the owner.

## Waiting on the owner

Already put to him by the coordinator:

1. The source licence. The first push waits for it.
2. Native apps, or a wrapped web app.
3. The app identifier.
4. The Bible Brain key request, which only he can send.

New from the catalogue, not yet put to him:

5. Whether a text-to-speech voice may be a station. Yes releases one complete English station
   now and opens complete Spanish, Portuguese and Chinese from one publisher.
6. Whether to play a translation its own translators mark as a draft.
7. Whether the radio may keep its own copies of recordings whose licence allows it. Open.Bible
   offers 157 languages that way and no other.

And one for today: what to do about the staged web work (wait, restore the seat, or reassign).

## Next

- **Catalogue seat, now:** Davar Audio Bibles, 431 recordings in 389 languages, served a file per
  chapter from its own host under terms that allow free, non-commercial use with notices shown.
  It needs the catalogue to load by language. That work is additive and does not touch the
  staged web work; every existing station and export stays as it is.
- **Web seat, on return, or whoever the owner names:** commit the staged landing; then give the
  player a way to choose among hundreds of stations.
- **After the owner's answers:** native apps, Bible Brain, and the held recordings.
