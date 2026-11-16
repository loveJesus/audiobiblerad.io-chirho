// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// Reading the bundled catalogue. The whole file is refused for a contract version this player does
// not read or for a canon that is not the 66 books; a single station that cannot be played safely
// is skipped and the rest stay on the dial. Part of
// spec-chirho/workflows-chirho/experience-chirho/native_players_workflow_chirho.md.

import Foundation

public enum CatalogueErrorChirho: Error, Sendable, Equatable {
    /// The app has no catalogue resource.
    case missingChirho
    case tooLargeChirho
    case unreadableChirho
    /// The file's contract version, which this player does not read.
    case wrongVersionChirho(Int)
    /// The book list is not the 66 books in canon order.
    case badBooksChirho
    case noStationsChirho
}

/// Every station this player can offer, the canon and the book-code schemes.
public struct CatalogueChirho: Sendable {
    /// The contract version this player reads; another is refused whole.
    public static let contractVersionChirho = 1
    /// Far above the 29-station file, and a bound on what a damaged resource can make us decode.
    public static let largestBytesChirho = 4_000_000
    /// The bundled resource: `catalogue_chirho.json`.
    public static let resourceNameChirho = "catalogue_chirho"

    public let booksChirho: [BookChirho]
    public let bookCodeSchemesChirho: [String: [String]]
    /// In the web's order, grouped by language. The dial follows it.
    public let stationsChirho: [StationChirho]
    /// Stations in the file that are not offered: an unknown kind, a damaged entry, no chapters.
    public let skippedStationCountChirho: Int
    /// All chapters in the canon: 1,189.
    public let totalChaptersChirho: Int

    private let booksByIdChirho: [String: BookChirho]
    private let stationsByIdChirho: [String: StationChirho]

    private struct VersionProbeChirho: Decodable {
        let contractVersionChirho: Int
        enum CodingKeys: String, CodingKey { case contractVersionChirho = "contract_version_chirho" }
    }

    /// One station, or nothing when it cannot be read: the others still load.
    private struct LossyStationChirho: Decodable {
        let stationChirho: StationChirho?
        init(from decoderChirho: any Decoder) throws {
            stationChirho = try? StationChirho(from: decoderChirho)
        }
    }

    private struct FileChirho: Decodable {
        let booksChirho: [BookChirho]
        let bookCodeSchemesChirho: [String: [String]]
        let stationsChirho: [LossyStationChirho]
        enum CodingKeys: String, CodingKey {
            case booksChirho = "books_chirho"
            case bookCodeSchemesChirho = "book_code_schemes_chirho"
            case stationsChirho = "stations_chirho"
        }
    }

    public init(dataChirho: Data) throws(CatalogueErrorChirho) {
        guard dataChirho.count <= Self.largestBytesChirho else { throw .tooLargeChirho }
        let decoderChirho = JSONDecoder()
        guard let probeChirho = try? decoderChirho.decode(VersionProbeChirho.self, from: dataChirho)
        else { throw .unreadableChirho }
        guard probeChirho.contractVersionChirho == Self.contractVersionChirho else {
            throw .wrongVersionChirho(probeChirho.contractVersionChirho)
        }
        guard let fileChirho = try? decoderChirho.decode(FileChirho.self, from: dataChirho) else {
            throw .unreadableChirho
        }
        guard Self.isCanonChirho(fileChirho.booksChirho) else { throw .badBooksChirho }
        let booksByIdChirho = Dictionary(
            uniqueKeysWithValues: fileChirho.booksChirho.map { ($0.idChirho, $0) })

        var stationsChirho: [StationChirho] = []
        var seenChirho = Set<String>()
        var skippedChirho = 0
        for entryChirho in fileChirho.stationsChirho {
            guard let stationChirho = entryChirho.stationChirho,
                !seenChirho.contains(stationChirho.idChirho),
                Self.coverageFitsChirho(stationChirho, booksByIdChirho: booksByIdChirho)
            else {
                skippedChirho += 1
                continue
            }
            seenChirho.insert(stationChirho.idChirho)
            stationsChirho.append(stationChirho)
        }
        guard !stationsChirho.isEmpty else { throw .noStationsChirho }

        booksChirho = fileChirho.booksChirho
        bookCodeSchemesChirho = fileChirho.bookCodeSchemesChirho
        self.stationsChirho = stationsChirho
        skippedStationCountChirho = skippedChirho
        totalChaptersChirho = fileChirho.booksChirho.reduce(0) { $0 + $1.chaptersChirho }
        self.booksByIdChirho = booksByIdChirho
        stationsByIdChirho = Dictionary(
            uniqueKeysWithValues: stationsChirho.map { ($0.idChirho, $0) })
    }

    /// The catalogue the app ships with. The first On reads only this.
    public static func bundledChirho(in bundleChirho: Bundle = .main) throws(CatalogueErrorChirho)
        -> CatalogueChirho
    {
        guard
            let urlChirho = bundleChirho.url(
                forResource: resourceNameChirho, withExtension: "json"),
            let dataChirho = try? Data(contentsOf: urlChirho, options: .mappedIfSafe)
        else { throw .missingChirho }
        return try CatalogueChirho(dataChirho: dataChirho)
    }

    /// The book for an id, or nothing. Safe with a remembered or otherwise untrusted value.
    public func bookChirho(_ idChirho: String) -> BookChirho? { booksByIdChirho[idChirho] }

    /// The station for an id, or nothing. Safe with a remembered or otherwise untrusted value.
    public func stationChirho(_ idChirho: String) -> StationChirho? { stationsByIdChirho[idChirho] }

    /// 66 books numbered 1 to 66 in order, each with its own code and from 1 to 150 chapters.
    private static func isCanonChirho(_ booksChirho: [BookChirho]) -> Bool {
        guard booksChirho.count == 66 else { return false }
        var idsChirho = Set<String>()
        for (indexChirho, bookChirho) in booksChirho.enumerated() {
            guard bookChirho.orderChirho == indexChirho + 1,
                (1...150).contains(bookChirho.chaptersChirho),
                !bookChirho.idChirho.isEmpty,
                idsChirho.insert(bookChirho.idChirho).inserted
            else { return false }
        }
        return true
    }

    /// Every covered book is a real book, every range stays inside it, and the stated chapter
    /// count is what the ranges hold. A station that disagrees with itself is not offered.
    private static func coverageFitsChirho(
        _ stationChirho: StationChirho, booksByIdChirho: [String: BookChirho]
    ) -> Bool {
        var countChirho = 0
        for (bookIdChirho, rangesChirho) in stationChirho.coverageChirho {
            guard let bookChirho = booksByIdChirho[bookIdChirho] else { return false }
            for rangeChirho in rangesChirho {
                guard rangeChirho.lastChirho <= bookChirho.chaptersChirho else { return false }
                countChirho += rangeChirho.lastChirho - rangeChirho.firstChirho + 1
            }
        }
        return countChirho > 0 && countChirho == stationChirho.chapterCountChirho
    }
}
