// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// One AVPlayer that streams a chapter straight from its publisher's host and tells the radio what
// actually happened. Each load starts a new generation and removes the older item's observers, and
// every report is checked against the generation it came from, so the radio never hears from a
// stream it replaced. Part of
// spec-chirho/workflows-chirho/experience-chirho/native_players_workflow_chirho.md.

import AVFoundation
import Foundation
import RadioCoreChirho

@MainActor
public final class PlayerTransportChirho: RadioTransportChirho {
    private let playerChirho = AVPlayer()
    private var generationChirho = 0
    private var eventsChirho: (@MainActor (TransportEventChirho) -> Void)?
    private var observationsChirho: [NSKeyValueObservation] = []
    private var notificationsChirho: [any NSObjectProtocol] = []
    private var timeObserverChirho: Any?
    private var readySentChirho = false
    private var failedSentChirho = false
    /// Where to start once the stream is ready; a seek is placed then, never before.
    private var startSecondsChirho: Double?
    /// The radio asked for sound, so a pause it did not ask for came from the platform.
    private var expectingPlayChirho = false

    public init() {
        playerChirho.automaticallyWaitsToMinimizeStalling = true
        playerChirho.actionAtItemEnd = .pause
    }

    public func loadChirho(
        _ urlChirho: URL, startSecondsChirho: Double?, playChirho: Bool,
        eventsChirho: @escaping @MainActor (TransportEventChirho) -> Void
    ) {
        detachChirho()
        generationChirho += 1
        self.eventsChirho = eventsChirho
        readySentChirho = false
        failedSentChirho = false
        self.startSecondsChirho = startSecondsChirho.flatMap { $0 > 0 ? $0 : nil }
        expectingPlayChirho = playChirho
        let itemChirho = AVPlayerItem(url: urlChirho)
        observeChirho(itemChirho, generationChirho)
        playerChirho.replaceCurrentItem(with: itemChirho)
        // With a later start, sound waits for the seek once the stream is ready.
        if playChirho, self.startSecondsChirho == nil { playerChirho.play() }
    }

    public func playChirho() {
        expectingPlayChirho = true
        guard startSecondsChirho == nil else { return }
        playerChirho.play()
    }

    public func pauseChirho() {
        expectingPlayChirho = false
        playerChirho.pause()
    }

    public func seekChirho(toSecondsChirho secondsChirho: Double) {
        guard secondsChirho.isFinite else { return }
        startSecondsChirho = nil
        playerChirho.seek(
            to: CMTime(seconds: max(0, secondsChirho), preferredTimescale: 600),
            toleranceBefore: .zero, toleranceAfter: .zero)
    }

    public func clearChirho() {
        detachChirho()
        generationChirho += 1
        expectingPlayChirho = false
        startSecondsChirho = nil
        playerChirho.pause()
        playerChirho.replaceCurrentItem(with: nil)
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
                        as? any Error)
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
            failChirho(TransportFailureChirho.classifyChirho(itemChirho.error), generationChirho)
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
        guard generationChirho == self.generationChirho, let secondsChirho = startSecondsChirho else {
            return
        }
        startSecondsChirho = nil
        playerChirho.seek(
            to: CMTime(seconds: secondsChirho, preferredTimescale: 600), toleranceBefore: .zero,
            toleranceAfter: .zero
        ) { @Sendable [weak self] _ in
            guard let self else { return }
            Task { @MainActor in self.startAfterSeekChirho(generationChirho) }
        }
    }

    private func startAfterSeekChirho(_ generationChirho: Int) {
        guard generationChirho == self.generationChirho, expectingPlayChirho else { return }
        playerChirho.play()
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
            guard expectingPlayChirho, itemChirho.status != .failed, !atEndChirho else { return }
            expectingPlayChirho = false
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
