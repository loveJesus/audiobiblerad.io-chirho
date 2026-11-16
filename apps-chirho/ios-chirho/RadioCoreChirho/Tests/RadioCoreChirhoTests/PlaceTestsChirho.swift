// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// Places: carrying a position between recordings, reading verse timings, what is remembered on the
// device, and the first station of a first run.

import Foundation
import Testing

@testable import RadioCoreChirho

@Suite("Places and memory")
struct PlaceTestsChirho {
    // MARK: Positions

    @Test("A position carries by verse, then by fraction, then from the start")
    func positionsCarryChirho() {
        let timedChirho = PositionChirho.captureChirho(
            secondsChirho: 25, durationChirho: 40, timingsChirho: [0, 10, 20, 30])
        #expect(timedChirho.verseChirho == 3)
        #expect(timedChirho.verseFractionChirho == 0.5)
        let byVerseChirho = timedChirho.mappedChirho(durationChirho: 60, timingsChirho: [0, 15, 30, 45])
        #expect(byVerseChirho.modeChirho == .verseChirho)
        #expect(abs(byVerseChirho.secondsChirho - 37.45) < 0.000_001)
        let byFractionChirho = timedChirho.mappedChirho(durationChirho: 80, timingsChirho: nil)
        #expect(byFractionChirho == MappedPositionChirho(secondsChirho: 50, modeChirho: .fractionChirho))
        #expect(
            PositionChirho.zeroChirho.mappedChirho(durationChirho: 80, timingsChirho: nil)
                == MappedPositionChirho(secondsChirho: 0, modeChirho: .startChirho))
        // The last verse runs to the end of the recording; nothing lands past the end.
        let lastVerseChirho = PositionChirho.captureChirho(
            secondsChirho: 39, durationChirho: 40, timingsChirho: [0, 10, 20, 30])
        #expect(lastVerseChirho.verseChirho == 4)
        #expect(lastVerseChirho.mappedChirho(durationChirho: 10, timingsChirho: nil).secondsChirho == 9.75)
        let damagedChirho = PositionChirho.captureChirho(
            secondsChirho: .nan, durationChirho: -.infinity, timingsChirho: nil)
        #expect(damagedChirho == PositionChirho.zeroChirho)
    }

    @Test("Verse timings are read only when they are a short, ordered list of times")
    func timingsAreBoundedChirho() {
        #expect(VerseTimingsChirho.parseChirho(Data(#"{"verses":[0,1.5,1.5,9]}"#.utf8)) == [0, 1.5, 1.5, 9])
        for badChirho in [
            #"{"verses":[]}"#, #"{"verses":[3,2]}"#, #"{"verses":[-1]}"#, #"{"verses":["1"]}"#,
            #"{"verses":[1,null]}"#, #"[0,1]"#, #"{"other":[1]}"#, "not json"
        ] {
            #expect(VerseTimingsChirho.parseChirho(Data(badChirho.utf8)) == nil, "\(badChirho)")
        }
        let hugeChirho = "{\"verses\":[" + Array(repeating: "1", count: 40_000).joined(separator: ",") + "]}"
        #expect(VerseTimingsChirho.parseChirho(Data(hugeChirho.utf8)) == nil)
    }

    // MARK: Memory

    @Test("What is remembered reads back exactly, and only its own fields are stored")
    func memoryRoundTripsChirho() throws {
        let catalogueChirho = try FixturesChirho.radioCatalogueChirho()
        let rememberedChirho = RememberedRadioChirho(
            stationIdChirho: "partial-b", refChirho: FixturesChirho.refChirho("MAT", 1),
            secondsChirho: 12.5,
            followedChirho: FollowedPlaceChirho(
                stationIdChirho: "full-a", refChirho: FixturesChirho.refChirho("JHN", 3),
                positionChirho: PositionChirho(
                    secondsChirho: 300, durationChirho: 600, verseChirho: 16,
                    verseFractionChirho: 0.25)),
            explicitOffChirho: true, soundsEnabledChirho: false)
        let dataChirho = rememberedChirho.encodedChirho()
        #expect(dataChirho.count <= RememberedRadioChirho.largestBytesChirho)
        #expect(RememberedRadioChirho.readChirho(dataChirho, catalogueChirho: catalogueChirho) == rememberedChirho)
        let keysChirho = try #require(
            try JSONSerialization.jsonObject(with: dataChirho) as? [String: Any]
        ).keys.sorted()
        #expect(
            keysChirho == [
                "book_id_chirho", "chapter_chirho", "explicit_off_chirho", "followed_place_chirho",
                "seconds_chirho", "sounds_enabled_chirho", "station_id_chirho"
            ])
    }

    @Test("A damaged or foreign memory is a first run, and a damaged followed place is dropped alone")
    func damagedMemoryIsFirstRunChirho() throws {
        let catalogueChirho = try FixturesChirho.radioCatalogueChirho()
        func readChirho(_ textChirho: String) -> RememberedRadioChirho? {
            RememberedRadioChirho.readChirho(Data(textChirho.utf8), catalogueChirho: catalogueChirho)
        }
        let placeChirho = #""station_id_chirho":"full-a","book_id_chirho":"JHN","chapter_chirho":3"#
        #expect(readChirho("{\(placeChirho),\"seconds_chirho\":10}")?.secondsChirho == 10)
        #expect(readChirho("{\(placeChirho),\"seconds_chirho\":-1}") == nil)
        #expect(readChirho("{\(placeChirho),\"seconds_chirho\":90000}") == nil)
        #expect(readChirho("{\(placeChirho),\"seconds_chirho\":\"10\"}") == nil)
        #expect(readChirho(#"{"station_id_chirho":"gone","book_id_chirho":"JHN","chapter_chirho":3,"seconds_chirho":0}"#) == nil)
        #expect(readChirho(#"{"station_id_chirho":"full-a","book_id_chirho":"JHN","chapter_chirho":22,"seconds_chirho":0}"#) == nil)
        #expect(readChirho(#"{"station_id_chirho":"full-a","book_id_chirho":"ZZZ","chapter_chirho":1,"seconds_chirho":0}"#) == nil)
        #expect(readChirho("not json") == nil)
        #expect(readChirho("{\(placeChirho),\"seconds_chirho\":0,\"pad\":\"\(String(repeating: "x", count: 2100))\"}") == nil)
        let followedChirho = readChirho(
            "{\(placeChirho),\"seconds_chirho\":0,\"followed_place_chirho\":{\"station_id_chirho\":\"full-a\",\"book_id_chirho\":\"JHN\",\"chapter_chirho\":3,\"seconds_chirho\":1,\"duration_chirho\":2,\"verse_chirho\":null,\"verse_fraction_chirho\":7}}")
        #expect(followedChirho != nil)
        #expect(followedChirho?.followedChirho == nil)
        #expect(followedChirho?.explicitOffChirho == false)
        #expect(followedChirho?.soundsEnabledChirho == true)
    }

    // MARK: A first run

    @Test("A first run follows the device's languages, broadest match last")
    func languagesMatchChirho() {
        let availableChirho: Set<String> = ["en", "es", "zh", "ida-x-tiriki"]
        #expect(InitialStationChirho.matchLanguageChirho(preferredChirho: ["zh-Hans-CN", "en"], availableChirho: availableChirho) == "zh")
        #expect(InitialStationChirho.matchLanguageChirho(preferredChirho: ["fr-FR", "es_419"], availableChirho: availableChirho) == "es")
        #expect(InitialStationChirho.matchLanguageChirho(preferredChirho: ["ida-x-tiriki"], availableChirho: availableChirho) == "ida-x-tiriki")
        #expect(InitialStationChirho.matchLanguageChirho(preferredChirho: ["fr", "de"], availableChirho: availableChirho) == nil)
        let ninthChirho = Array(repeating: "fr", count: 8) + ["en"]
        #expect(InitialStationChirho.matchLanguageChirho(preferredChirho: ninthChirho, availableChirho: availableChirho) == nil)
    }

    @Test("The first station prefers the common translation, the fullest recording and a documented reader")
    func firstStationChirho() throws {
        let catalogueChirho = try FixturesChirho.sharedCatalogueChirho()
        let englishChirho = InitialStationChirho.chooseChirho(
            catalogueChirho: catalogueChirho, preferredLanguagesChirho: ["en-GB"], randomChirho: { 0 })
        #expect(englishChirho.idChirho == "helloao-bsb-souer")
        let spanishChirho = InitialStationChirho.chooseChirho(
            catalogueChirho: catalogueChirho, preferredLanguagesChirho: ["es-MX"], randomChirho: { 0.99 })
        #expect(spanishChirho.idChirho == "librivox-rva-es")
        let unknownChirho = InitialStationChirho.chooseChirho(
            catalogueChirho: catalogueChirho, preferredLanguagesChirho: ["xx"], randomChirho: { 0 })
        #expect(unknownChirho.languageCodeChirho == "en")
    }
}
