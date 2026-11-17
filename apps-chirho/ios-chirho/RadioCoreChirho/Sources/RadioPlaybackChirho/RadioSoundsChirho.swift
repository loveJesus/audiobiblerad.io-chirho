// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// The radio's interface sounds: static while a deliberately tuned station loads, a click for a
// press and a knob tick for a step of the dial. Two channels, one clip each, so nothing stacks. A
// click replaces whatever the feedback channel holds; a tick sounds only while that channel is
// quiet, so a fast turn never cuts a click or restarts a tick, as on the web. They come only from
// the listener's own presses and dial steps, never from system commands or state updates. The
// Sound switch silences both and lets go of the clips; a quiet system action silences both and
// leaves the switch alone. The clips are short prepared files bundled under native-assets-chirho
// that never loop, and each may start late inside its file, as its profile says. Part of
// spec-chirho/workflows-chirho/radio_sounds_workflow_chirho.md and
// spec-chirho/workflows-chirho/experience-chirho/native_players_workflow_chirho.md.

import AVFoundation
import Foundation
import RadioCoreChirho

@MainActor
public final class RadioSoundsChirho {
    /// The bundled folder that holds `sounds-chirho/profile_chirho.json` and its clips.
    public static let assetsFolderChirho = "native-assets-chirho"
    /// Knob steps closer together than this share one tick, as on the web.
    static let knobSpacingSecondsChirho: TimeInterval = 0.06

    private let profileChirho: SoundProfileChirho?
    private let folderChirho: URL?
    /// Loaded clips by path. At most the profile's own count, which is bounded.
    private var playersChirho: [String: AVAudioPlayer] = [:]
    private var tuningChirho: AVAudioPlayer?
    private var feedbackChirho: AVAudioPlayer?
    /// When the last tick started, on the steady uptime clock.
    private var lastKnobAtChirho = -TimeInterval.infinity
    /// Whether a sound may play now. On a Watch, only through the long-form output actually given.
    private let mayPlayChirho: @MainActor () -> Bool

    /// Silences both channels when switched off, and lets go of the loaded clips.
    public var enabledChirho = false {
        didSet {
            guard enabledChirho != oldValue else { return }
            if enabledChirho { preloadChirho() } else { releaseChirho() }
        }
    }

    public init(bundleChirho: Bundle = .main, mayPlayChirho: @escaping @MainActor () -> Bool) {
        let folderChirho = bundleChirho.url(forResource: Self.assetsFolderChirho, withExtension: nil)
        let profileDataChirho = folderChirho.flatMap {
            try? Data(contentsOf: $0.appendingPathComponent("sounds-chirho/profile_chirho.json"))
        }
        self.folderChirho = folderChirho
        profileChirho = profileDataChirho.flatMap(SoundProfileChirho.parseChirho)
        self.mayPlayChirho = mayPlayChirho
    }

    /// Whether the app carries a usable profile at all.
    public var availableChirho: Bool { profileChirho != nil }

    /// A deliberate press. It always sounds, replacing a click or tick under way.
    public func clickChirho() { playFeedbackChirho(.clickChirho) }

    /// One deliberate step of the dial. It sounds only while the controls are quiet: a click is
    /// never cut, a tick under way finishes first, and steps closer than 60 ms share a tick. No
    /// clip loops, so a step waits at most for the rest of the clip already sounding.
    public func knobChirho() {
        if feedbackChirho?.isPlaying == true { return }
        let atChirho = ProcessInfo.processInfo.systemUptime
        guard atChirho - lastKnobAtChirho >= Self.knobSpacingSecondsChirho else { return }
        if playFeedbackChirho(.knobChirho) { lastKnobAtChirho = atChirho }
    }

    /// Static for a deliberate turn of the dial while the radio is on, chosen at random.
    public func startTuningChirho() {
        guard enabledChirho, mayPlayChirho(),
            let clipChirho = profileChirho?.clipsChirho[.tuningChirho]?.randomElement(),
            let playerChirho = playerChirho(clipChirho)
        else { return }
        tuningChirho?.stop()
        tuningChirho = playerChirho
        startChirho(playerChirho, clipChirho)
    }

    /// The station sounded, or the radio stopped: the static ends now.
    public func stopTuningChirho() {
        tuningChirho?.stop()
        tuningChirho = nil
    }

    /// Stops the static and any click or tick at once, and leaves the Sound switch as it is: for a
    /// quiet system Off, an interruption, or the output going away.
    public func silenceChirho() {
        tuningChirho?.stop()
        feedbackChirho?.stop()
        tuningChirho = nil
        feedbackChirho = nil
    }

    /// The platform's media services came back after going away, and every clip player made before
    /// is gone: lets go of them all, and loads the click and knob again while Sound is on.
    public func rebuildChirho() {
        releaseChirho()
        if enabledChirho { preloadChirho() }
    }

    /// What is left of a click or tick under way, so Off can let the press's own click finish.
    public var feedbackLeftSecondsChirho: TimeInterval {
        guard let feedbackChirho, feedbackChirho.isPlaying else { return 0 }
        return max(0, feedbackChirho.duration - feedbackChirho.currentTime)
    }

    /// Whether the clip started.
    @discardableResult
    private func playFeedbackChirho(_ roleChirho: SoundRoleChirho) -> Bool {
        guard enabledChirho, mayPlayChirho(),
            let clipChirho = profileChirho?.clipsChirho[roleChirho]?.first,
            let playerChirho = playerChirho(clipChirho)
        else { return false }
        if feedbackChirho !== playerChirho { feedbackChirho?.stop() }
        feedbackChirho = playerChirho
        return startChirho(playerChirho, clipChirho)
    }

    /// From the clip's own start, even when the same clip is still sounding from the last press.
    @discardableResult
    private func startChirho(_ playerChirho: AVAudioPlayer, _ clipChirho: SoundClipChirho) -> Bool {
        playerChirho.stop()
        playerChirho.currentTime = min(clipChirho.startSecondsChirho, max(0, playerChirho.duration - 0.01))
        return playerChirho.play()
    }

    private func playerChirho(_ clipChirho: SoundClipChirho) -> AVAudioPlayer? {
        if let loadedChirho = playersChirho[clipChirho.pathChirho] { return loadedChirho }
        guard let folderChirho, let urlChirho = SoundProfileChirho.fileUrlChirho(clipChirho, inChirho: folderChirho),
            let playerChirho = try? AVAudioPlayer(contentsOf: urlChirho)
        else { return nil }
        playerChirho.prepareToPlay()
        playersChirho[clipChirho.pathChirho] = playerChirho
        return playerChirho
    }

    /// The click and knob are loaded ahead, so the first press sounds at once.
    private func preloadChirho() {
        for roleChirho in [SoundRoleChirho.clickChirho, .knobChirho] {
            if let clipChirho = profileChirho?.clipsChirho[roleChirho]?.first { _ = playerChirho(clipChirho) }
        }
    }

    private func releaseChirho() {
        silenceChirho()
        playersChirho.removeAll()
    }
}
