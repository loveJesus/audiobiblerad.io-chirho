// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// What a player-backed transport has asked of its player, kept apart from the player itself so
// that every report the player makes is read against what was actually asked. A start that waits
// for its stream, and then for its seek, is the transport's own hold; the platform can only pause
// a player that was told to play. Used by RadioPlaybackChirho's PlayerTransportChirho. Part of
// spec-chirho/workflows-chirho/experience-chirho/native_players_workflow_chirho.md.

import Foundation

/// The transport's side of one player: which stream is current, whether the radio wants sound,
/// whether the player itself was told to play, and a start still waiting to be placed.
public struct PlayerIntentChirho: Sendable, Equatable {
    /// The stream every report is checked against. A load or a clear moves it on.
    public private(set) var generationChirho = 0
    /// The radio asked for sound from the current stream.
    public private(set) var expectingPlayChirho = false
    /// The player itself was told to play, since the last load, pause or platform stop.
    public private(set) var playerToldChirho = false
    /// Where a start waits for the stream to be ready. Its seek is placed then, never before.
    public private(set) var pendingStartSecondsChirho: Double?
    /// The start's own seek was placed and has not reported back yet.
    public private(set) var placingStartChirho = false

    public init() {}

    /// A new stream replaces the old one. True when the player should play at once.
    public mutating func loadChirho(startSecondsChirho: Double?, playChirho: Bool) -> Bool {
        generationChirho += 1
        pendingStartSecondsChirho = startSecondsChirho.flatMap { $0 > 0 ? $0 : nil }
        placingStartChirho = false
        expectingPlayChirho = playChirho
        playerToldChirho = false
        guard playChirho, pendingStartSecondsChirho == nil else { return false }
        return tellPlayChirho()
    }

    /// The radio wants sound. True when the player should play now; a start still waiting for its
    /// stream, or for its own seek, sounds once that seek reports back.
    public mutating func playChirho() -> Bool {
        expectingPlayChirho = true
        guard pendingStartSecondsChirho == nil, !placingStartChirho else { return false }
        return tellPlayChirho()
    }

    /// The radio asked for quiet.
    public mutating func pauseChirho() {
        expectingPlayChirho = false
        playerToldChirho = false
    }

    /// The radio moved the place itself, which replaces a start still waiting. A start already
    /// being placed still ends with its own seek's report, finished or cancelled.
    public mutating func seekChirho() {
        pendingStartSecondsChirho = nil
    }

    /// The stream is let go entirely.
    public mutating func clearChirho() {
        generationChirho += 1
        expectingPlayChirho = false
        playerToldChirho = false
        pendingStartSecondsChirho = nil
        placingStartChirho = false
    }

    /// The stream of that generation is ready: the waiting start to seek to, if there is one.
    public mutating func readyChirho(generationChirho readyGenerationChirho: Int) -> Double? {
        guard readyGenerationChirho == generationChirho, let secondsChirho = pendingStartSecondsChirho
        else { return nil }
        pendingStartSecondsChirho = nil
        placingStartChirho = true
        return secondsChirho
    }

    /// The start's seek reported back for that generation, finished or cancelled. True when the
    /// player should play now.
    public mutating func startPlacedChirho(generationChirho placedGenerationChirho: Int) -> Bool {
        guard placedGenerationChirho == generationChirho else { return false }
        placingStartChirho = false
        guard expectingPlayChirho else { return false }
        return tellPlayChirho()
    }

    /// The player of that generation reports itself paused, short of a failure or the chapter's
    /// end, which report themselves. True when that is the platform stopping the radio, which can
    /// only pause a player that was told to play: while a start still waits for its stream or its
    /// seek, the pause is the transport's own hold.
    public mutating func pausedChirho(
        generationChirho pausedGenerationChirho: Int, failedChirho: Bool, atEndChirho: Bool
    ) -> Bool {
        guard pausedGenerationChirho == generationChirho, expectingPlayChirho, playerToldChirho,
            !failedChirho, !atEndChirho
        else { return false }
        expectingPlayChirho = false
        playerToldChirho = false
        return true
    }

    private mutating func tellPlayChirho() -> Bool {
        playerToldChirho = true
        return true
    }
}
