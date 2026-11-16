// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// What the radio shows: its phase, the station and passage, the position and a short note. Part of
// spec-chirho/workflows-chirho/experience-chirho/native_players_workflow_chirho.md.

import Foundation

public enum RadioPhaseChirho: String, Sendable, Equatable {
    /// Silent: not yet on, turned Off, or paused by the system.
    case offChirho
    /// Waiting for an audio output. On a Watch this is headphones or a supported speaker.
    case startingChirho
    /// A stream was asked for and has not sounded yet, or stopped to buffer.
    case loadingChirho
    case playingChirho
    /// The stream failed. On tries again; the dial tries another station.
    case errorChirho
}

public struct RadioStateChirho: Sendable, Equatable {
    public var phaseChirho: RadioPhaseChirho = .offChirho
    public var stationIdChirho: String
    public var refChirho: ChapterRefChirho
    /// Position in the chapter, in seconds.
    public var secondsChirho: Double = 0
    /// The chapter's length once the stream reports it; 0 until then.
    public var durationChirho: Double = 0
    public var verseChirho: Int?
    /// A short note for the listener, or empty.
    public var messageChirho: String = ""
    public var soundsEnabledChirho: Bool = true
    /// From On to the first sound, in milliseconds, once per visit.
    public var firstSoundMsChirho: Int?
    /// From the latest turn of the dial to its first sound, in milliseconds.
    public var switchMsChirho: Int?

    public init(stationIdChirho: String, refChirho: ChapterRefChirho) {
        self.stationIdChirho = stationIdChirho
        self.refChirho = refChirho
    }

    /// On, in any of its stages: the power control reads Off.
    public var isOnChirho: Bool {
        phaseChirho == .startingChirho || phaseChirho == .loadingChirho
            || phaseChirho == .playingChirho
    }
}

/// The radio's bounds. Tests shorten the waits; nothing raises them to hide a failure.
public struct RadioOptionsChirho: Sendable {
    /// From asking for a stream to its first sound, or from a stall to sound again.
    public var loadTimeoutSecondsChirho: Double = 15
    /// How long a dial turn waits for verse timings before carrying the place by fraction.
    public var timingsWaitSecondsChirho: Double = 1.5
    /// Chapters skipped after unplayable files before the radio says it cannot play.
    public var recoveryLimitChirho: Int = 3
    /// How often the position is remembered while playing.
    public var saveIntervalSecondsChirho: Double = 5
    /// Timings files kept in memory.
    public var timingsCacheLimitChirho: Int = 8

    public init() {}
}

/// The radio's notes to the listener, worded as the web radio words them.
public enum RadioMessagesChirho {
    public static let movedChirho =
        "This passage is unavailable here. Your original place is kept for the next station."
    public static let recoveringChirho = "The stream failed. Trying the next available chapter."
    public static let noChaptersChirho =
        "This station has no available chapters. Turn the dial to another station."
    public static let unavailableChirho =
        "This chapter is unavailable. Turn the dial to another station."
    public static let slowChirho = "This stream is taking too long. Try again or turn the dial."
    public static let unplayableChirho =
        "This stream could not play. Try again or turn the dial to another station."
    public static let networkChirho = "The connection was lost. Turn the radio on to try again."
    public static let noOutputChirho =
        "No audio output is available. Connect headphones or a speaker, then turn the radio on."
    public static let bookMissingChirho = "This book is unavailable here. Turn the dial to find it."
}
