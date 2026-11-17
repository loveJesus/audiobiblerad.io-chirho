// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// One AVPlayer that streams a chapter straight from its publisher's host and tells the radio what
// actually happened. Each load starts a new generation and removes the older item's observers, and
// every report is checked against the generation it came from, so the radio never hears from a
// stream it replaced. What the player was asked to do is kept in a PlayerIntentChirho, and each
// report is read against it. Part of
// spec-chirho/workflows-chirho/experience-chirho/native_players_workflow_chirho.md.

import AVFoundation
import Foundation
import RadioCoreChirho
import os

/// AVFoundation's own error for its media services going away under a stream. The SDK declares it
/// for iPhone-family platforms only; the Mac build that runs the package tests has none.
#if os(iOS) || os(watchOS)
    private let servicesErrorChirho: (domainChirho: String, codeChirho: Int)? = (
        domainChirho: AVFoundationErrorDomain, codeChirho: AVError.Code.mediaServicesWereReset.rawValue
    )
#else
    private let servicesErrorChirho: (domainChirho: String, codeChirho: Int)? = nil
#endif

@MainActor
public final class PlayerTransportChirho: RadioTransportChirho {
    /// Made again only when the platform's media services return after going away.
    private var playerChirho: AVPlayer
    /// The current stream, whether the radio wants sound, whether the player was told to play,
    /// and a start still waiting for its stream.
    private var intentChirho = PlayerIntentChirho()
    private var eventsChirho: (@MainActor (TransportEventChirho) -> Void)?
    private var observationsChirho: [NSKeyValueObservation] = []
    private var notificationsChirho: [any NSObjectProtocol] = []
    private var timeObserverChirho: Any?
    private var readySentChirho = false
    private var failedSentChirho = false
    private let loggerChirho = Logger(
        subsystem: "io.audiobiblerad.radiochirho", category: "playback-chirho")

    private var generationChirho: Int { intentChirho.generationChirho }

    public init() {
        playerChirho = PlayerTransportChirho.newPlayerChirho()
    }

    private static func newPlayerChirho() -> AVPlayer {
        let playerChirho = AVPlayer()
        playerChirho.automaticallyWaitsToMinimizeStalling = true
        playerChirho.actionAtItemEnd = .pause
        return playerChirho
    }

    public func loadChirho(
        _ urlChirho: URL, startSecondsChirho: Double?, playChirho: Bool,
        eventsChirho: @escaping @MainActor (TransportEventChirho) -> Void
    ) {
        detachChirho()
        // With a later start, sound waits for the seek once the stream is ready.
        let playNowChirho = intentChirho.loadChirho(
            startSecondsChirho: startSecondsChirho, playChirho: playChirho)
        self.eventsChirho = eventsChirho
        readySentChirho = false
        failedSentChirho = false
        let itemChirho = AVPlayerItem(url: urlChirho)
        observeChirho(itemChirho, generationChirho)
        playerChirho.replaceCurrentItem(with: itemChirho)
        if playNowChirho { playerChirho.play() }
    }

    public func playChirho() {
        if intentChirho.playChirho() { playerChirho.play() }
    }

    public func pauseChirho() {
        intentChirho.pauseChirho()
        playerChirho.pause()
    }

    public func seekChirho(toSecondsChirho secondsChirho: Double) {
        guard secondsChirho.isFinite else { return }
        intentChirho.seekChirho()
        playerChirho.seek(
            to: CMTime(seconds: max(0, secondsChirho), preferredTimescale: 600),
            toleranceBefore: .zero, toleranceAfter: .zero)
    }

    public func clearChirho() {
        detachChirho()
        intentChirho.clearChirho()
        playerChirho.pause()
        playerChirho.replaceCurrentItem(with: nil)
    }

    /// The platform's audio services came back after going away: the player made before them is
    /// gone, so whatever it held is let go and a new player takes its place for the next load.
    public func rebuildChirho() {
        clearChirho()
        playerChirho = PlayerTransportChirho.newPlayerChirho()
    }

    // MARK: Reports

    private func observeChirho(_ itemChirho: AVPlayerItem, _ generationChirho: Int) {
        // Observers hop to the main actor and read the player there; nothing else crosses over.
        observationsChirho = [
            itemChirho.observe(\.status, options: [.new]) { @Sendable [weak self] _, _ in
                guard let self else { return }
                Task { @MainActor in self.itemChangedChirho(generationChirho) }
            },
            itemChirho.observe(\.duration, options: [.new]) { @Sendable [weak self] _, _ in
                guard let self else { return }
                Task { @MainActor in self.itemChangedChirho(generationChirho) }
            },
            playerChirho.observe(\.timeControlStatus, options: [.new]) {
                @Sendable [weak self] _, _ in
                guard let self else { return }
                Task { @MainActor in self.timeControlChangedChirho(generationChirho) }
            }
        ]
        let centerChirho = NotificationCenter.default
        notificationsChirho = [
            centerChirho.addObserver(
                forName: AVPlayerItem.didPlayToEndTimeNotification, object: itemChirho, queue: .main
            ) { @Sendable [weak self] _ in
                guard let self else { return }
                Task { @MainActor in self.sendChirho(.endedChirho, generationChirho) }
            },
            centerChirho.addObserver(
                forName: AVPlayerItem.failedToPlayToEndTimeNotification, object: itemChirho,
                queue: .main
            ) { @Sendable [weak self] notificationChirho in
                let failureChirho = TransportFailureChirho.classifyChirho(
                    notificationChirho.userInfo?[AVPlayerItemFailedToPlayToEndTimeErrorKey]
                        as? any Error, servicesErrorChirho: servicesErrorChirho)
                guard let self else { return }
                Task { @MainActor in self.failChirho(failureChirho, generationChirho) }
            }
        ]
        timeObserverChirho = playerChirho.addPeriodicTimeObserver(
            forInterval: CMTime(seconds: 0.5, preferredTimescale: 600), queue: .main
        ) { @Sendable [weak self] timeChirho in
            let secondsChirho = timeChirho.seconds
            guard let self else { return }
            Task { @MainActor in self.progressChirho(secondsChirho, generationChirho) }
        }
    }

    private func detachChirho() {
        observationsChirho.forEach { $0.invalidate() }
        observationsChirho = []
        notificationsChirho.forEach { NotificationCenter.default.removeObserver($0) }
        notificationsChirho = []
        if let timeObserverChirho { playerChirho.removeTimeObserver(timeObserverChirho) }
        timeObserverChirho = nil
        eventsChirho = nil
    }

    private func itemChangedChirho(_ generationChirho: Int) {
        guard generationChirho == self.generationChirho, let itemChirho = playerChirho.currentItem
        else { return }
        switch itemChirho.status {
        case .failed:
            failChirho(
                TransportFailureChirho.classifyChirho(
                    itemChirho.error, servicesErrorChirho: servicesErrorChirho), generationChirho)
        case .readyToPlay:
            let durationChirho = itemChirho.duration.seconds
            guard !readySentChirho, durationChirho.isFinite, durationChirho > 0 else { return }
            readySentChirho = true
            sendChirho(.readyChirho(durationSecondsChirho: durationChirho), generationChirho)
            placeStartChirho(generationChirho)
        default:
            break
        }
    }

    /// The start that waited for the stream: seek there, then sound if the radio still wants it.
    private func placeStartChirho(_ generationChirho: Int) {
        guard let secondsChirho = intentChirho.readyChirho(generationChirho: generationChirho) else {
            return
        }
        playerChirho.seek(
            to: CMTime(seconds: secondsChirho, preferredTimescale: 600), toleranceBefore: .zero,
            toleranceAfter: .zero
        ) { @Sendable [weak self] _ in
            guard let self else { return }
            Task { @MainActor in self.startAfterSeekChirho(generationChirho) }
        }
    }

    private func startAfterSeekChirho(_ generationChirho: Int) {
        if intentChirho.startPlacedChirho(generationChirho: generationChirho) { playerChirho.play() }
    }

    private func timeControlChangedChirho(_ generationChirho: Int) {
        guard generationChirho == self.generationChirho, let itemChirho = playerChirho.currentItem
        else { return }
        switch playerChirho.timeControlStatus {
        case .playing:
            sendChirho(.playingChirho, generationChirho)
        case .waitingToPlayAtSpecifiedRate:
            sendChirho(.waitingChirho, generationChirho)
        case .paused:
            // A pause the radio did not ask for came from the platform. A failure and the end of a
            // chapter report themselves, so neither is mistaken for one.
            let durationChirho = itemChirho.duration.seconds
            let atEndChirho =
                durationChirho.isFinite && itemChirho.currentTime().seconds >= durationChirho - 0.5
            guard
                intentChirho.pausedChirho(
                    generationChirho: generationChirho, failedChirho: itemChirho.status == .failed,
                    atEndChirho: atEndChirho)
            else { return }
            loggerChirho.info("platform pause reported")
            sendChirho(.stoppedBySystemChirho, generationChirho)
        @unknown default:
            break
        }
    }

    private func progressChirho(_ secondsChirho: Double, _ generationChirho: Int) {
        guard secondsChirho.isFinite else { return }
        sendChirho(.progressChirho(secondsChirho: secondsChirho), generationChirho)
    }

    private func failChirho(_ failureChirho: TransportFailureChirho, _ generationChirho: Int) {
        guard !failedSentChirho, generationChirho == self.generationChirho else { return }
        failedSentChirho = true
        sendChirho(.failedChirho(failureChirho), generationChirho)
    }

    private func sendChirho(_ eventChirho: TransportEventChirho, _ generationChirho: Int) {
        guard generationChirho == self.generationChirho else { return }
        eventsChirho?(eventChirho)
    }
}
