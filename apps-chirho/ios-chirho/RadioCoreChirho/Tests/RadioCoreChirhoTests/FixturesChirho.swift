// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// Stand-ins for the platform, and catalogues to test against: the real shared snapshot, and a
// small made-up one whose coverage each test can reason about.

import Foundation
import Testing

@testable import RadioCoreChirho

enum FixturesChirho {
    /// apps-chirho/shared-chirho/catalogue_chirho.json, the file both apps bundle.
    static let sharedCatalogueUrlChirho = URL(fileURLWithPath: #filePath)
        .deletingLastPathComponent().deletingLastPathComponent().deletingLastPathComponent()
        .deletingLastPathComponent().deletingLastPathComponent()
        .appendingPathComponent("shared-chirho/catalogue_chirho.json")

    static func sharedCatalogueChirho() throws -> CatalogueChirho {
        try CatalogueChirho(dataChirho: Data(contentsOf: sharedCatalogueUrlChirho))
    }

    /// The canon as the shared snapshot lists it.
    static func booksJsonChirho() throws -> [[String: Any]] {
        let objectChirho = try JSONSerialization.jsonObject(
            with: Data(contentsOf: sharedCatalogueUrlChirho))
        return try #require((objectChirho as? [String: Any])?["books_chirho"] as? [[String: Any]])
    }

    /// A station whose files are `https://<host>/<BOOK>/<chapter>.mp3`, covering `coverageChirho`.
    static func stationJsonChirho(
        _ idChirho: String, hostChirho: String, coverageChirho: [String: [[Int]]],
        timingsChirho: Bool = false, extraChirho: [String: Any] = [:]
    ) -> [String: Any] {
        let countChirho = coverageChirho.values.flatMap { $0 }.reduce(0) { $0 + $1[1] - $1[0] + 1 }
        var stationChirho: [String: Any] = [
            "id_chirho": idChirho, "source_id_chirho": "test", "language_code_chirho": "en",
            "language_name_chirho": "English", "language_english_chirho": "English",
            "version_chirho": "Test Version \(idChirho)", "version_code_chirho": "TST",
            "voice_chirho": "", "voice_kind_chirho": "unknown", "source_name_chirho": "Test",
            "source_url_chirho": "https://\(hostChirho)/", "licence_id_chirho": "CC0-1.0",
            "licence_name_chirho": "CC0", "licence_url_chirho": "https://\(hostChirho)/licence",
            "credit_chirho": "Test recording", "licence_evidence_url_chirho": "https://\(hostChirho)/",
            "licence_read_on_chirho": "2026-11-16",
            "locator_chirho": [
                "kind_chirho": "pattern",
                "template_chirho": "https://\(hostChirho)/{book_upper_chirho}/{chapter_chirho}.mp3"
            ],
            "has_timings_chirho": timingsChirho, "coverage_chirho": coverageChirho,
            "coverage_checked_on_chirho": "2026-11-16", "chapter_count_chirho": countChirho
        ]
        if timingsChirho {
            stationChirho["timings_chirho"] = [
                "template_chirho": "https://\(hostChirho)/{book_upper_chirho}/{chapter_chirho}.json",
                "format_chirho": "verse-starts-list-chirho"
            ]
        }
        stationChirho.merge(extraChirho) { $1 }
        return stationChirho
    }

    static func everyBookChirho(_ booksChirho: [[String: Any]]) -> [String: [[Int]]] {
        Dictionary(
            uniqueKeysWithValues: booksChirho.map {
                ($0["id_chirho"] as! String, [[1, $0["chapters_chirho"] as! Int]])
            })
    }

    static func catalogueDataChirho(
        _ stationsChirho: [[String: Any]], versionChirho: Int = 1,
        booksChirho: [[String: Any]]? = nil
    ) throws -> Data {
        try JSONSerialization.data(withJSONObject: [
            "contract_version_chirho": versionChirho,
            "books_chirho": try booksChirho ?? booksJsonChirho(),
            "book_code_schemes_chirho": [String: [String]](),
            "stations_chirho": stationsChirho
        ])
    }

    /// Three stations: `full-a` with timings, `partial-b` with Matthew only, `full-c` with timings.
    static func radioCatalogueChirho() throws -> CatalogueChirho {
        let booksChirho = try booksJsonChirho()
        let everyChirho = everyBookChirho(booksChirho)
        return try CatalogueChirho(
            dataChirho: catalogueDataChirho([
                stationJsonChirho(
                    "full-a", hostChirho: "a.example", coverageChirho: everyChirho,
                    timingsChirho: true),
                stationJsonChirho(
                    "partial-b", hostChirho: "b.example", coverageChirho: ["MAT": [[1, 28]]]),
                stationJsonChirho(
                    "full-c", hostChirho: "c.example", coverageChirho: everyChirho,
                    timingsChirho: true)
            ]))
    }

    /// Built once: decoding the canon again for every test would crowd the main actor they share.
    static let radioChirho: CatalogueChirho = try! radioCatalogueChirho()

    static func refChirho(_ bookIdChirho: String, _ chapterChirho: Int) -> ChapterRefChirho {
        ChapterRefChirho(bookIdChirho: bookIdChirho, chapterChirho: chapterChirho)
    }
}

/// Plays nothing; records what it was asked, and lets a test speak for any stream it loaded.
@MainActor
final class FakeTransportChirho: RadioTransportChirho {
    struct LoadChirho {
        let urlChirho: URL
        let startSecondsChirho: Double?
        let playChirho: Bool
        let eventsChirho: @MainActor (TransportEventChirho) -> Void
    }

    private(set) var loadsChirho: [LoadChirho] = []
    /// `load`, `play`, `pause`, `seek` and `clear`, in order.
    private(set) var logChirho: [String] = []

    func loadChirho(
        _ urlChirho: URL, startSecondsChirho: Double?, playChirho: Bool,
        eventsChirho: @escaping @MainActor (TransportEventChirho) -> Void
    ) {
        loadsChirho.append(
            LoadChirho(
                urlChirho: urlChirho, startSecondsChirho: startSecondsChirho,
                playChirho: playChirho, eventsChirho: eventsChirho))
        logChirho.append("load")
    }

    func playChirho() { logChirho.append("play") }
    func pauseChirho() { logChirho.append("pause") }
    /// Every seek, in seconds.
    private(set) var seeksChirho: [Double] = []
    func seekChirho(toSecondsChirho: Double) {
        logChirho.append("seek")
        seeksChirho.append(toSecondsChirho)
    }
    func clearChirho() { logChirho.append("clear") }

    /// Speaks for a stream: the latest by default, or the `loadIndexChirho`th.
    func sendChirho(_ eventChirho: TransportEventChirho, loadIndexChirho: Int? = nil) {
        guard let loadChirho = loadIndexChirho.map({ loadsChirho[$0] }) ?? loadsChirho.last else { return }
        loadChirho.eventsChirho(eventChirho)
    }

    var lastUrlChirho: String? { loadsChirho.last?.urlChirho.absoluteString }

    func clearLogChirho() { logChirho.removeAll() }
}

/// An output that is ready at once, refuses, or waits until the test decides.
@MainActor
final class FakeRouteChirho: AudioRouteChirho {
    var resultChirho: RouteActivationChirho = .activeChirho
    var holdChirho = false
    private var waitingChirho: CheckedContinuation<RouteActivationChirho, Never>?
    private(set) var releasesChirho = 0

    func activateChirho() async -> RouteActivationChirho {
        guard holdChirho else { return resultChirho }
        return await withCheckedContinuation { waitingChirho = $0 }
    }

    func finishChirho(_ resultChirho: RouteActivationChirho) {
        waitingChirho?.resume(returning: resultChirho)
        waitingChirho = nil
    }

    var isWaitingChirho: Bool { waitingChirho != nil }

    func releaseChirho() { releasesChirho += 1 }
}

@MainActor
final class MemoryStoreChirho: PreferenceStoreChirho {
    var dataChirho: Data?
    init(_ dataChirho: Data? = nil) { self.dataChirho = dataChirho }
    func readChirho() -> Data? { dataChirho }
    func writeChirho(_ dataChirho: Data) { self.dataChirho = dataChirho }
}

/// Timings files by address; any other address has none.
struct FakeTimingsChirho: TimingsLoaderChirho {
    var filesChirho: [URL: Data] = [:]
    func loadTimingsChirho(_ urlChirho: URL) async -> Data? { filesChirho[urlChirho] }
}

@MainActor
final class ClockChirho {
    var nowChirho = 1_000.0
}

/// A controller over the fakes, remembering `rememberedChirho` when given.
@MainActor
struct RadioRigChirho {
    let controllerChirho: RadioControllerChirho
    let transportChirho: FakeTransportChirho
    let routeChirho: FakeRouteChirho
    let storeChirho: MemoryStoreChirho
    let clockChirho: ClockChirho

    init(
        catalogueChirho: CatalogueChirho, rememberedChirho: RememberedRadioChirho? = nil,
        timingsChirho: FakeTimingsChirho = FakeTimingsChirho(),
        optionsChirho: RadioOptionsChirho = RadioRigChirho.quickOptionsChirho
    ) {
        transportChirho = FakeTransportChirho()
        routeChirho = FakeRouteChirho()
        storeChirho = MemoryStoreChirho(rememberedChirho?.encodedChirho())
        let clockChirho = ClockChirho()
        self.clockChirho = clockChirho
        controllerChirho = RadioControllerChirho(
            catalogueChirho: catalogueChirho, transportChirho: transportChirho,
            routeChirho: routeChirho, storeChirho: storeChirho, timingsLoaderChirho: timingsChirho,
            preferredLanguagesChirho: ["en-US"], optionsChirho: optionsChirho,
            clockChirho: { clockChirho.nowChirho }, randomChirho: { 0 })
    }

    static var quickOptionsChirho: RadioOptionsChirho {
        var optionsChirho = RadioOptionsChirho()
        optionsChirho.loadTimeoutSecondsChirho = 0.2
        optionsChirho.timingsWaitSecondsChirho = 0.2
        return optionsChirho
    }

    /// What the store holds now, read back as the app would read it on the next launch.
    func storedChirho() -> RememberedRadioChirho? {
        storeChirho.dataChirho.flatMap {
            RememberedRadioChirho.readChirho($0, catalogueChirho: controllerChirho.catalogueChirho)
        }
    }

    static func rememberedChirho(
        _ stationIdChirho: String, _ refChirho: ChapterRefChirho, secondsChirho: Double = 0,
        explicitOffChirho: Bool = false
    ) -> RememberedRadioChirho {
        RememberedRadioChirho(
            stationIdChirho: stationIdChirho, refChirho: refChirho, secondsChirho: secondsChirho,
            followedChirho: FollowedPlaceChirho(
                stationIdChirho: stationIdChirho, refChirho: refChirho,
                positionChirho: PositionChirho(
                    secondsChirho: secondsChirho, durationChirho: 0, verseChirho: nil,
                    verseFractionChirho: 0)),
            explicitOffChirho: explicitOffChirho, soundsEnabledChirho: true)
    }
}

/// Lets queued main-actor tasks run for a while, for checks that something does not happen.
@MainActor
func settleChirho(_ secondsChirho: Double = 0.05) async throws {
    try await Task.sleep(nanoseconds: UInt64(secondsChirho * 1_000_000_000))
}

/// Waits until `conditionChirho` holds, at most `secondsChirho`, letting queued main-actor work
/// run. False when it never held. Only the test waits; the radio's own bounds are unchanged.
@MainActor
func untilChirho(_ secondsChirho: Double = 3, _ conditionChirho: () -> Bool) async throws -> Bool {
    let deadlineChirho = ContinuousClock.now + .milliseconds(Int(secondsChirho * 1000))
    while !conditionChirho() {
        guard ContinuousClock.now < deadlineChirho else { return false }
        try await Task.sleep(nanoseconds: 10_000_000)
    }
    return true
}
