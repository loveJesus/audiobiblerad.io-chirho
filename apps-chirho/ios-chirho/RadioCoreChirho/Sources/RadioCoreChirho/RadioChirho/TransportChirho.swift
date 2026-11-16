// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// What the radio's decisions need from a platform, and nothing else: something that plays one
// address and reports what happened, an audio output to ask for, and a way to fetch a small
// timings file. RadioPlaybackChirho supplies AVFoundation ones; the tests supply fakes. Part of
// spec-chirho/workflows-chirho/experience-chirho/native_players_workflow_chirho.md.

import Foundation

public enum TransportFailureChirho: Sendable, Equatable {
    /// The connection failed: offline, timed out, unreachable. Never a reason to skip a chapter.
    case networkChirho
    /// The host answered, but the file cannot be played: missing, refused, or not audio.
    case unplayableChirho

    /// The URL-loading failures that mean the connection, not the file. A media framework wraps
    /// them, so the whole chain of underlying errors is read, a few levels deep.
    static let networkCodesChirho: Set<Int> = [
        NSURLErrorNotConnectedToInternet, NSURLErrorTimedOut, NSURLErrorNetworkConnectionLost,
        NSURLErrorCannotFindHost, NSURLErrorCannotConnectToHost, NSURLErrorDNSLookupFailed,
        NSURLErrorDataNotAllowed, NSURLErrorInternationalRoamingOff, NSURLErrorCallIsActive,
        NSURLErrorSecureConnectionFailed
    ]

    /// Which kind of failure an error is. Anything that is not plainly the connection counts as
    /// an unplayable file, which the radio skips past a bounded number of times.
    public static func classifyChirho(_ errorChirho: (any Error)?) -> TransportFailureChirho {
        var currentChirho = errorChirho.map { $0 as NSError }
        for _ in 0..<8 {
            guard let errorChirho = currentChirho else { break }
            if errorChirho.domain == NSURLErrorDomain, networkCodesChirho.contains(errorChirho.code) {
                return .networkChirho
            }
            currentChirho = errorChirho.userInfo[NSUnderlyingErrorKey] as? NSError
        }
        return .unplayableChirho
    }
}

public enum TransportEventChirho: Sendable, Equatable {
    /// The stream is ready and its length is known.
    case readyChirho(durationSecondsChirho: Double)
    /// Sound is actually coming out.
    case playingChirho
    /// Playback stopped to buffer.
    case waitingChirho
    /// The position inside the chapter, in seconds, while it plays.
    case progressChirho(secondsChirho: Double)
    case endedChirho
    case failedChirho(TransportFailureChirho)
    /// The platform paused it: an interruption, or the output went away.
    case stoppedBySystemChirho
}

/// Plays one address at a time. A new load replaces the old one, and the old one's events stop.
@MainActor
public protocol RadioTransportChirho: AnyObject {
    /// Loads an address. With `startSecondsChirho` it starts there; without, the radio seeks once
    /// the length is known. It plays at once only when `playChirho` is true.
    func loadChirho(
        _ urlChirho: URL, startSecondsChirho: Double?, playChirho: Bool,
        eventsChirho: @escaping @MainActor (TransportEventChirho) -> Void)
    func playChirho()
    func pauseChirho()
    func seekChirho(toSecondsChirho: Double)
    /// Lets go of the current stream entirely.
    func clearChirho()
}

public enum RouteActivationChirho: Sendable, Equatable {
    case activeChirho
    /// No output could be used: on a Watch, no headphones and no supported speaker.
    case unavailableChirho
}

/// The platform's audio output for long listening.
@MainActor
public protocol AudioRouteChirho: AnyObject {
    func activateChirho() async -> RouteActivationChirho
    /// Gives the output back when the listener turns the radio Off.
    func releaseChirho()
}

/// Fetches a verse-timings file of at most `VerseTimingsChirho.largestBytesChirho`; nothing on any failure.
public protocol TimingsLoaderChirho: Sendable {
    func loadTimingsChirho(_ urlChirho: URL) async -> Data?
}
