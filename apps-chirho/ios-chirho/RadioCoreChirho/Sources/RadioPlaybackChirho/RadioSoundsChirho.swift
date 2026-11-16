// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// The radio's interface sounds: static while a deliberately tuned station loads, a click for a
// press and a knob for each step of the dial. Two channels, one clip each, so nothing stacks: a
// new clip on a channel replaces the one before it. They come only from the listener's own presses
// and dial steps, never from system commands or state updates, and the Sound switch silences
// both. The clips are short prepared files bundled under native-assets-chirho; the knob clip may
// start late inside its file, as its profile says. Part of
// spec-chirho/workflows-chirho/radio_sounds_workflow_chirho.md and
// spec-chirho/workflows-chirho/experience-chirho/native_players_workflow_chirho.md.

import AVFoundation
import Foundation
import RadioCoreChirho

@MainActor
public final class RadioSoundsChirho {
    /// The bundled folder that holds `sounds-chirho/profile_chirho.json` and its clips.
    public static let assetsFolderChirho = "native-assets-chirho"

    private let profileChirho: SoundProfileChirho?
    private let folderChirho: URL?
    /// Loaded clips by path. At most the profile's own count, which is bounded.
    private var playersChirho: [String: AVAudioPlayer] = [:]
    private var tuningChirho: AVAudioPlayer?
    private var feedbackChirho: AVAudioPlayer?
    /// Whether a sound may play now. On a Watch, only once the long-form output is active.
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

    public func clickChirho() { playFeedbackChirho(.clickChirho) }

    public func knobChirho() { playFeedbackChirho(.knobChirho) }

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

    private func playFeedbackChirho(_ roleChirho: SoundRoleChirho) {
        guard enabledChirho, mayPlayChirho(),
            let clipChirho = profileChirho?.clipsChirho[roleChirho]?.first,
            let playerChirho = playerChirho(clipChirho)
        else { return }
        if feedbackChirho !== playerChirho { feedbackChirho?.stop() }
        feedbackChirho = playerChirho
        startChirho(playerChirho, clipChirho)
    }

    /// From the clip's own start, even when the same clip is still sounding from the last step.
    private func startChirho(_ playerChirho: AVAudioPlayer, _ clipChirho: SoundClipChirho) {
        playerChirho.stop()
        playerChirho.currentTime = min(clipChirho.startSecondsChirho, max(0, playerChirho.duration - 0.01))
        playerChirho.play()
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
        tuningChirho?.stop()
        feedbackChirho?.stop()
        tuningChirho = nil
        feedbackChirho = nil
        playersChirho.removeAll()
    }
}
