// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// The bundled catalogue and chapter addresses: what is offered, what is refused, and known
// addresses from the shared snapshot. The full station-by-chapter comparison with the web is in
// ParityTestsChirho.

import Foundation
import Testing

@testable import RadioCoreChirho

@Suite("The bundled catalogue")
struct CatalogueTestsChirho {
    @Test("The shared snapshot offers all 29 built-in stations over the 66 books")
    func sharedSnapshotLoadsChirho() throws {
        let catalogueChirho = try FixturesChirho.sharedCatalogueChirho()
        #expect(catalogueChirho.stationsChirho.count == 29)
        #expect(catalogueChirho.skippedStationCountChirho == 0)
        #expect(catalogueChirho.booksChirho.count == 66)
        #expect(catalogueChirho.totalChaptersChirho == 1189)
        #expect(catalogueChirho.stationsChirho.allSatisfy { !$0.creditChirho.isEmpty })
    }

    @Test("Known addresses resolve exactly as the web builds them")
    func knownAddressesChirho() throws {
        let catalogueChirho = try FixturesChirho.sharedCatalogueChirho()
        func addressChirho(_ stationIdChirho: String, _ bookIdChirho: String, _ chapterChirho: Int)
            throws -> ChapterAudioChirho?
        {
            let stationChirho = try #require(catalogueChirho.stationChirho(stationIdChirho))
            return catalogueChirho.resolveChapterChirho(
                stationChirho, bookIdChirho: bookIdChirho, chapterChirho: chapterChirho)
        }
        let johnChirho = try #require(try addressChirho("helloao-bsb-hays", "JHN", 3))
        #expect(
            johnChirho.urlChirho.absoluteString
                == "https://audio.bible.helloao.org/api/BSB/JHN/3/audio/hays.mp3")
        #expect(
            johnChirho.timingsUrlChirho?.absoluteString
                == "https://bible.helloao.org/api/BSB/JHN/3.hays.audioTimings.json")
        #expect(
            try addressChirho("openbible-bsb-gilbert", "PSA", 23)?.urlChirho.absoluteString
                == "https://openbible.com/audio/gilbert/BSB_19_Psa_023_G.mp3")
        #expect(
            try addressChirho("openbible-bsb-gilbert", "TIT", 1)?.urlChirho.absoluteString
                == "https://openbible.com/audio/gilbert/BSB_56_Tts_001_G.mp3")
        #expect(
            try addressChirho("librivox-rva-es", "GEN", 1)?.urlChirho.absoluteString
                == "https://archive.org/download/bible_rva_01_genesis_v_2_1806_librivoxa/genesis_01_rva_64kb.mp3")
        #expect(try addressChirho("helloao-bsb-hays", "JHN", 22) == nil)
        #expect(try addressChirho("helloao-bsb-hays", "XYZ", 1) == nil)
    }

    @Test("A contract version this player does not read is refused whole")
    func wrongVersionIsRefusedChirho() throws {
        let dataChirho = try FixturesChirho.catalogueDataChirho(
            [FixturesChirho.stationJsonChirho("one", hostChirho: "a.example", coverageChirho: ["GEN": [[1, 2]]])],
            versionChirho: 2)
        #expect(throws: CatalogueErrorChirho.wrongVersionChirho(2)) {
            try CatalogueChirho(dataChirho: dataChirho)
        }
    }

    @Test("A canon that is not the 66 books is refused whole")
    func badCanonIsRefusedChirho() throws {
        let booksChirho = Array(try FixturesChirho.booksJsonChirho().dropLast())
        let dataChirho = try FixturesChirho.catalogueDataChirho(
            [FixturesChirho.stationJsonChirho("one", hostChirho: "a.example", coverageChirho: ["GEN": [[1, 2]]])],
            booksChirho: booksChirho)
        #expect(throws: CatalogueErrorChirho.badBooksChirho) {
            try CatalogueChirho(dataChirho: dataChirho)
        }
    }

    @Test("A station that cannot be played safely is skipped and the rest stay on the dial")
    func damagedStationsAreSkippedChirho() throws {
        let goodChirho = FixturesChirho.stationJsonChirho(
            "good", hostChirho: "a.example", coverageChirho: ["GEN": [[1, 2]]])
        var resolverChirho = FixturesChirho.stationJsonChirho(
            "resolver", hostChirho: "a.example", coverageChirho: ["GEN": [[1, 2]]])
        resolverChirho["locator_chirho"] = ["kind_chirho": "resolver"]
        let uncreditedChirho = FixturesChirho.stationJsonChirho(
            "uncredited", hostChirho: "a.example", coverageChirho: ["GEN": [[1, 2]]],
            extraChirho: ["credit_chirho": ""])
        let overlongChirho = FixturesChirho.stationJsonChirho(
            "overlong", hostChirho: "a.example", coverageChirho: ["OBA": [[1, 2]]])
        let miscountedChirho = FixturesChirho.stationJsonChirho(
            "miscounted", hostChirho: "a.example", coverageChirho: ["GEN": [[1, 2]]],
            extraChirho: ["chapter_count_chirho": 5])
        let oddTimingsChirho = FixturesChirho.stationJsonChirho(
            "odd-timings", hostChirho: "a.example", coverageChirho: ["GEN": [[1, 2]]],
            extraChirho: ["timings_chirho": ["template_chirho": "https://a.example/t.json", "format_chirho": "srt"]])
        let badIdChirho = FixturesChirho.stationJsonChirho(
            "Bad_Id", hostChirho: "a.example", coverageChirho: ["GEN": [[1, 2]]])
        let catalogueChirho = try CatalogueChirho(
            dataChirho: FixturesChirho.catalogueDataChirho([
                goodChirho, resolverChirho, uncreditedChirho, overlongChirho, miscountedChirho,
                oddTimingsChirho, badIdChirho, goodChirho
            ]))
        #expect(catalogueChirho.stationsChirho.map(\.idChirho) == ["good"])
        #expect(catalogueChirho.skippedStationCountChirho == 7)
    }

    @Test("Only HTTPS addresses on a named host are ever played")
    func onlySecureAddressesChirho() throws {
        var plainChirho = FixturesChirho.stationJsonChirho(
            "plain", hostChirho: "a.example", coverageChirho: ["GEN": [[1, 2]]])
        plainChirho["locator_chirho"] = [
            "kind_chirho": "pattern", "template_chirho": "http://a.example/{book_upper_chirho}/{chapter_chirho}.mp3"
        ]
        let catalogueChirho = try CatalogueChirho(dataChirho: FixturesChirho.catalogueDataChirho([plainChirho]))
        let stationChirho = try #require(catalogueChirho.stationsChirho.first)
        #expect(catalogueChirho.resolveChapterChirho(stationChirho, bookIdChirho: "GEN", chapterChirho: 1) == nil)
    }

    @Test("Templates fill every placeholder, keep stray braces and refuse unknown names")
    func templatesChirho() throws {
        let catalogueChirho = try FixturesChirho.sharedCatalogueChirho()
        let psalmsChirho = try #require(catalogueChirho.bookChirho("PSA"))
        let johnChirho = try #require(catalogueChirho.bookChirho("JHN"))
        #expect(
            catalogueChirho.expandTemplateChirho(
                "{book_upper_chirho}/{book_lower_chirho}/{book_order_pad2_chirho}/{chapter_chirho}/{chapter_pad2_chirho}/{chapter_pad3_chirho}/{chapter_pad_book_chirho}",
                bookChirho: psalmsChirho, chapterChirho: 7, bookCodesChirho: nil)
                == "PSA/psa/19/7/07/007/007")
        #expect(
            catalogueChirho.expandTemplateChirho(
                "{chapter_pad_book_chirho}", bookChirho: johnChirho, chapterChirho: 3, bookCodesChirho: nil)
                == "03")
        #expect(
            catalogueChirho.expandTemplateChirho(
                "{{Odd}{chapter_chirho}}", bookChirho: johnChirho, chapterChirho: 3, bookCodesChirho: nil)
                == "{{Odd}3}")
        #expect(
            catalogueChirho.expandTemplateChirho(
                "{unknown_chirho}", bookChirho: johnChirho, chapterChirho: 3, bookCodesChirho: nil) == nil)
        #expect(
            catalogueChirho.expandTemplateChirho(
                "{book_code_chirho}", bookChirho: johnChirho, chapterChirho: 3, bookCodesChirho: "missing")
                == nil)
    }

    @Test("A partial station lands on the next chapter it has, wrapping round the canon")
    func landingWrapsChirho() throws {
        let catalogueChirho = try FixturesChirho.radioCatalogueChirho()
        let partialChirho = try #require(catalogueChirho.stationChirho("partial-b"))
        #expect(
            catalogueChirho.chapterAtOrAfterChirho(partialChirho, bookIdChirho: "JHN", chapterChirho: 3)
                == FixturesChirho.refChirho("MAT", 1))
        #expect(
            catalogueChirho.nextChapterChirho(partialChirho, bookIdChirho: "MAT", chapterChirho: 28)
                == FixturesChirho.refChirho("MAT", 1))
        #expect(
            catalogueChirho.previousChapterChirho(partialChirho, bookIdChirho: "MAT", chapterChirho: 1)
                == FixturesChirho.refChirho("MAT", 28))
        #expect(catalogueChirho.offeredBooksChirho(partialChirho).map(\.idChirho) == ["MAT"])
        #expect(catalogueChirho.offeredChaptersChirho(partialChirho, bookIdChirho: "MAT") == Array(1...28))
        #expect(catalogueChirho.chapterAtOrAfterChirho(partialChirho, bookIdChirho: "XYZ", chapterChirho: 1) == nil)
        #expect(catalogueChirho.chapterAtOrAfterChirho(partialChirho, bookIdChirho: "MAT", chapterChirho: 0) == nil)
    }
}
