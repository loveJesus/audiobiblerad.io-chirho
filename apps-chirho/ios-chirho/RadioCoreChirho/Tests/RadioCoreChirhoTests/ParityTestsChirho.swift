// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// Every station and every chapter, resolved here and by the web's own TypeScript. The expectations
// are written to a temporary file by scripts-chirho/native-chirho/ios-chirho/write_locator_parity_chirho.ts
// and named in RADIO_PARITY_FILE_CHIRHO; scripts-chirho/native-chirho/ios-chirho/check_core_chirho.sh
// does both. Without that file the comparison is skipped, not passed.

import Foundation
import Testing

@testable import RadioCoreChirho

@Suite("Parity with the web catalogue")
struct ParityTestsChirho {
    static let fileChirho = ProcessInfo.processInfo.environment["RADIO_PARITY_FILE_CHIRHO"]

    /// Each row: station, book and chapter indexes; the audio and timings addresses or null; then
    /// the next, at-or-after and previous chapters, each as a book index and chapter, or -1 and 0.
    @Test(
        "Every station and chapter resolves, lands and steps exactly as on the web",
        .enabled(
            if: ParityTestsChirho.fileChirho != nil,
            "Set RADIO_PARITY_FILE_CHIRHO; check_core_chirho.sh does."))
    func everyChapterMatchesChirho() throws {
        let catalogueChirho = try FixturesChirho.sharedCatalogueChirho()
        let pathChirho = try #require(Self.fileChirho)
        let objectChirho = try JSONSerialization.jsonObject(
            with: try Data(contentsOf: URL(fileURLWithPath: pathChirho)))
        let fileChirho = try #require(objectChirho as? [String: Any])
        let stationIdsChirho = try #require(fileChirho["station_ids_chirho"] as? [String])
        let bookIdsChirho = try #require(fileChirho["book_ids_chirho"] as? [String])
        let rowsChirho = try #require(fileChirho["rows_chirho"] as? [[Any]])
        #expect(stationIdsChirho == catalogueChirho.stationsChirho.map(\.idChirho))
        #expect(bookIdsChirho == catalogueChirho.booksChirho.map(\.idChirho))
        #expect(rowsChirho.count == catalogueChirho.stationsChirho.count * catalogueChirho.totalChaptersChirho)

        func describeChirho(_ refChirho: ChapterRefChirho?) -> String {
            refChirho.map { "\($0.bookIdChirho) \($0.chapterChirho)" } ?? "none"
        }
        func expectedRefChirho(_ rowChirho: [Any], _ atChirho: Int) -> String {
            guard let indexChirho = rowChirho[atChirho] as? Int, indexChirho >= 0,
                let chapterChirho = rowChirho[atChirho + 1] as? Int
            else { return "none" }
            return "\(bookIdsChirho[indexChirho]) \(chapterChirho)"
        }
        var mismatchesChirho: [String] = []
        for rowChirho in rowsChirho {
            guard rowChirho.count == 11, let stationIndexChirho = rowChirho[0] as? Int,
                let bookIndexChirho = rowChirho[1] as? Int, let chapterChirho = rowChirho[2] as? Int
            else {
                mismatchesChirho.append("malformed row \(rowChirho)")
                break
            }
            let stationChirho = catalogueChirho.stationsChirho[stationIndexChirho]
            let bookIdChirho = bookIdsChirho[bookIndexChirho]
            let audioChirho = catalogueChirho.resolveChapterChirho(
                stationChirho, bookIdChirho: bookIdChirho, chapterChirho: chapterChirho)
            let actualChirho = [
                audioChirho?.urlChirho.absoluteString ?? "none",
                audioChirho?.timingsUrlChirho?.absoluteString ?? "none",
                describeChirho(catalogueChirho.nextChapterChirho(stationChirho, bookIdChirho: bookIdChirho, chapterChirho: chapterChirho)),
                describeChirho(catalogueChirho.chapterAtOrAfterChirho(stationChirho, bookIdChirho: bookIdChirho, chapterChirho: chapterChirho)),
                describeChirho(catalogueChirho.previousChapterChirho(stationChirho, bookIdChirho: bookIdChirho, chapterChirho: chapterChirho))
            ]
            let wantedChirho = [
                rowChirho[3] as? String ?? "none", rowChirho[4] as? String ?? "none",
                expectedRefChirho(rowChirho, 5), expectedRefChirho(rowChirho, 7),
                expectedRefChirho(rowChirho, 9)
            ]
            if actualChirho != wantedChirho, mismatchesChirho.count < 10 {
                mismatchesChirho.append("\(stationChirho.idChirho) \(bookIdChirho) \(chapterChirho): \(actualChirho) != \(wantedChirho)")
            }
        }
        #expect(mismatchesChirho.isEmpty, "\(mismatchesChirho.joined(separator: "\n"))")
    }
}
