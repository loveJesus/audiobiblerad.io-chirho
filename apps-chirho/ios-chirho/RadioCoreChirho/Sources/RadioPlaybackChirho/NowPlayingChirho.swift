// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// The lock screen, Control Center, headphones and the Watch's Now Playing: play, pause, next and
// previous chapter, and moving within the chapter. System commands go straight to the radio's own
// controls and never make interface sounds. Part of
// spec-chirho/workflows-chirho/experience-chirho/native_players_workflow_chirho.md and the web's
// spec-chirho/workflows-chirho/experience-chirho/media_controls_workflow_chirho.md.

import Foundation
import MediaPlayer
import RadioCoreChirho

/// What the system's controls may ask of the radio.
public struct NowPlayingActionsChirho: Sendable {
    public let onChirho: @MainActor @Sendable () -> Void
    public let offChirho: @MainActor @Sendable () -> Void
    public let toggleChirho: @MainActor @Sendable () -> Void
    public let nextChirho: @MainActor @Sendable () -> Void
    public let previousChirho: @MainActor @Sendable () -> Void
    public let seekChirho: @MainActor @Sendable (Double) -> Void

    public init(
        onChirho: @escaping @MainActor @Sendable () -> Void,
        offChirho: @escaping @MainActor @Sendable () -> Void,
        toggleChirho: @escaping @MainActor @Sendable () -> Void,
        nextChirho: @escaping @MainActor @Sendable () -> Void,
        previousChirho: @escaping @MainActor @Sendable () -> Void,
        seekChirho: @escaping @MainActor @Sendable (Double) -> Void
    ) {
        self.onChirho = onChirho
        self.offChirho = offChirho
        self.toggleChirho = toggleChirho
        self.nextChirho = nextChirho
        self.previousChirho = previousChirho
        self.seekChirho = seekChirho
    }
}

@MainActor
public final class NowPlayingChirho {
    private var targetsChirho: [(MPRemoteCommand, Any)] = []
    private var shownKeyChirho = ""
    private var shownAtChirho = 0.0
    private var shownSecondsChirho = 0.0

    public init() {}

    public func connectChirho(_ actionsChirho: NowPlayingActionsChirho) {
        let centerChirho = MPRemoteCommandCenter.shared()
        func addChirho(_ commandChirho: MPRemoteCommand, _ actionChirho: @escaping @MainActor @Sendable () -> Void) {
            commandChirho.isEnabled = true
            let targetChirho = commandChirho.addTarget { @Sendable _ in
                Task { @MainActor in actionChirho() }
                return .success
            }
            targetsChirho.append((commandChirho, targetChirho))
        }
        addChirho(centerChirho.playCommand, actionsChirho.onChirho)
        addChirho(centerChirho.pauseCommand, actionsChirho.offChirho)
        addChirho(centerChirho.stopCommand, actionsChirho.offChirho)
        addChirho(centerChirho.togglePlayPauseCommand, actionsChirho.toggleChirho)
        addChirho(centerChirho.nextTrackCommand, actionsChirho.nextChirho)
        addChirho(centerChirho.previousTrackCommand, actionsChirho.previousChirho)
        // Chapter buttons rather than ten-second skips.
        centerChirho.skipForwardCommand.isEnabled = false
        centerChirho.skipBackwardCommand.isEnabled = false
        let seekCommandChirho = centerChirho.changePlaybackPositionCommand
        seekCommandChirho.isEnabled = true
        let seekChirho = actionsChirho.seekChirho
        let targetChirho = seekCommandChirho.addTarget { @Sendable eventChirho in
            guard let positionChirho = eventChirho as? MPChangePlaybackPositionCommandEvent else {
                return .commandFailed
            }
            let secondsChirho = positionChirho.positionTime
            Task { @MainActor in seekChirho(secondsChirho) }
            return .success
        }
        targetsChirho.append((seekCommandChirho, targetChirho))
    }

    /// Shows what is playing. The system runs the clock from the rate, so this is sent when
    /// something changes, or when the position has drifted from the system's own reckoning.
    public func showChirho(
        titleChirho: String, artistChirho: String, albumChirho: String, stateChirho: RadioStateChirho,
        nowSecondsChirho: Double
    ) {
        let playingChirho = stateChirho.phaseChirho == .playingChirho
        let keyChirho = "\(titleChirho)|\(artistChirho)|\(playingChirho)|\(Int(stateChirho.durationChirho))"
        let expectedChirho =
            shownSecondsChirho + (playingChirho ? max(0, nowSecondsChirho - shownAtChirho) : 0)
        guard keyChirho != shownKeyChirho || abs(expectedChirho - stateChirho.secondsChirho) > 2 else {
            return
        }
        shownKeyChirho = keyChirho
        shownAtChirho = nowSecondsChirho
        shownSecondsChirho = stateChirho.secondsChirho
        var infoChirho: [String: Any] = [
            MPMediaItemPropertyTitle: titleChirho,
            MPMediaItemPropertyArtist: artistChirho,
            MPMediaItemPropertyAlbumTitle: albumChirho,
            MPNowPlayingInfoPropertyElapsedPlaybackTime: stateChirho.secondsChirho,
            MPNowPlayingInfoPropertyPlaybackRate: playingChirho ? 1.0 : 0.0
        ]
        if stateChirho.durationChirho > 0 {
            infoChirho[MPMediaItemPropertyPlaybackDuration] = stateChirho.durationChirho
        }
        MPNowPlayingInfoCenter.default().nowPlayingInfo = infoChirho
    }
}
