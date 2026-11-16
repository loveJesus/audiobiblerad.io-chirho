// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// A place inside a chapter, and how it is carried to another recording of the same chapter: the
// same verse when both have verse timings, otherwise the same fraction, otherwise the start.
// A port of src/lib/player-chirho/playback_position_chirho.ts. Part of
// spec-chirho/workflows-chirho/experience-chirho/native_players_workflow_chirho.md and the web's
// spec-chirho/workflows-chirho/tune_in_workflow_chirho.md.

import Foundation

public struct PositionChirho: Sendable, Equatable {
    public var secondsChirho: Double
    /// The recording's length when this was taken; 0 when it was not known.
    public var durationChirho: Double
    /// The verse playing then, from 1, when the recording had verse timings.
    public var verseChirho: Int?
    /// How far through that verse, from 0 to 1.
    public var verseFractionChirho: Double

    public init(
        secondsChirho: Double, durationChirho: Double, verseChirho: Int?, verseFractionChirho: Double
    ) {
        self.secondsChirho = secondsChirho
        self.durationChirho = durationChirho
        self.verseChirho = verseChirho
        self.verseFractionChirho = verseFractionChirho
    }

    public static let zeroChirho = PositionChirho(
        secondsChirho: 0, durationChirho: 0, verseChirho: nil, verseFractionChirho: 0)

    /// The position at `secondsChirho` into a recording, with its verse when timings are known.
    public static func captureChirho(
        secondsChirho: Double, durationChirho: Double, timingsChirho: [Double]?
    ) -> PositionChirho {
        let safeSecondsChirho = secondsChirho.isFinite ? max(0, secondsChirho) : 0
        let safeDurationChirho = durationChirho.isFinite ? max(0, durationChirho) : 0
        var verseIndexChirho = -1
        for (indexChirho, startChirho) in (timingsChirho ?? []).enumerated() {
            if startChirho > safeSecondsChirho { break }
            verseIndexChirho = indexChirho
        }
        guard verseIndexChirho >= 0, let timingsChirho else {
            return PositionChirho(
                secondsChirho: safeSecondsChirho, durationChirho: safeDurationChirho,
                verseChirho: nil, verseFractionChirho: 0)
        }
        let startChirho = timingsChirho[verseIndexChirho]
        let endChirho =
            verseIndexChirho + 1 < timingsChirho.count
            ? timingsChirho[verseIndexChirho + 1] : safeDurationChirho
        return PositionChirho(
            secondsChirho: safeSecondsChirho, durationChirho: safeDurationChirho,
            verseChirho: verseIndexChirho + 1,
            verseFractionChirho: endChirho > startChirho
                ? min(1, (safeSecondsChirho - startChirho) / (endChirho - startChirho)) : 0)
    }

    /// Where this position falls in another recording of `durationChirho` seconds.
    public func mappedChirho(durationChirho: Double, timingsChirho: [Double]?) -> MappedPositionChirho {
        let safeDurationChirho = durationChirho.isFinite ? max(0, durationChirho) : 0
        let lastChirho = max(0, safeDurationChirho - 0.1)
        if let timingsChirho, let verseChirho, verseChirho >= 1, verseChirho <= timingsChirho.count {
            let startChirho = timingsChirho[verseChirho - 1]
            let endChirho =
                verseChirho < timingsChirho.count ? timingsChirho[verseChirho] : safeDurationChirho
            let secondsChirho =
                startChirho + max(0, endChirho - startChirho - 0.1) * verseFractionChirho
            return MappedPositionChirho(
                secondsChirho: min(lastChirho, secondsChirho), modeChirho: .verseChirho)
        }
        if self.durationChirho > 0, safeDurationChirho > 0 {
            return MappedPositionChirho(
                secondsChirho: min(
                    lastChirho, max(0, secondsChirho / self.durationChirho * safeDurationChirho)),
                modeChirho: .fractionChirho)
        }
        return MappedPositionChirho(secondsChirho: 0, modeChirho: .startChirho)
    }
}

public enum PositionModeChirho: String, Sendable, Equatable {
    case verseChirho
    case fractionChirho
    case startChirho
}

public struct MappedPositionChirho: Sendable, Equatable {
    public let secondsChirho: Double
    public let modeChirho: PositionModeChirho
}
