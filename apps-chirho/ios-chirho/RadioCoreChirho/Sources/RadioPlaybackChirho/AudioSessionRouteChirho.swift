// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// The platform's audio output for long listening. On a Watch, long-form audio needs a usable
// output: Bluetooth headphones, or the built-in speaker on supported models from watchOS 11, and
// never while charging. The Watch asks with activate(options:), which can show the system's output
// picker; when no output is chosen the radio stays off and says so, never claiming playback.
// Whether an output is in place is known only from an activation that completed, never from the
// request. Apple requires running audio to stop before a session is deactivated, so Off gives the
// output back only once the press's own click has finished, and never after a newer On has asked
// again. When the platform's media services go away or come back, the session it held is gone: the
// output is no longer in place, a release waiting on a click is dropped, and the radio is told so it
// can hold and rebuild. An interruption that begins because the route disconnected is the output
// going away, not another app's turn. Apple:
// https://developer.apple.com/documentation/watchkit/playing-background-audio,
// https://developer.apple.com/documentation/avfaudio/avaudiosession/activate(options:completionhandler:),
// https://developer.apple.com/documentation/avfaudio/avaudiosession/setactive(_:options:)
// and https://developer.apple.com/documentation/avfaudio/avaudiosession/mediaserviceswereresetnotification
// Part of spec-chirho/workflows-chirho/experience-chirho/native_players_workflow_chirho.md.

import AVFoundation
import Foundation
import RadioCoreChirho

@MainActor
public final class AudioSessionRouteChirho: AudioRouteChirho {
    /// The longest Off waits for a sound under way before giving the output back.
    static let longestLingerSecondsChirho: TimeInterval = 1

    /// Another app or a call took the audio (true), or gave it back (false), and whether the
    /// platform says listening may resume.
    public var onInterruptionChirho: ((_ beganChirho: Bool, _ shouldResumeChirho: Bool) -> Void)?
    /// The output in use went away, such as headphones coming out or the route disconnecting.
    public var onOutputLostChirho: (() -> Void)?
    /// The platform's media services went away; everything made with them no longer works.
    public var onServicesLostChirho: (() -> Void)?
    /// The platform's media services came back; players made before them must be made again.
    public var onServicesResetChirho: (() -> Void)?
    /// What is left, in seconds, of a sound under way that Off should not cut.
    public var lingerSecondsChirho: (@MainActor () -> TimeInterval)?
    /// The output is in place: set only when an activation completes, and cleared by Off, by an
    /// interruption, by the output going away and by the media services going away or coming back.
    /// Asking for an output is not having one.
    public private(set) var outputReadyChirho = false
    /// Raised by every activation and every release, so a release that waited cannot undo a
    /// newer On.
    private var epochChirho = 0
    private var lingerTaskChirho: Task<Void, Never>?
    private var notificationsChirho: [any NSObjectProtocol] = []

    public init() {
        #if os(iOS) || os(watchOS)
            let centerChirho = NotificationCenter.default
            notificationsChirho = [
                centerChirho.addObserver(
                    forName: AVAudioSession.interruptionNotification, object: nil, queue: .main
                ) { @Sendable [weak self] notificationChirho in
                    let infoChirho = notificationChirho.userInfo
                    let typeChirho = (infoChirho?[AVAudioSessionInterruptionTypeKey] as? UInt)
                        .flatMap(AVAudioSession.InterruptionType.init(rawValue:))
                    let optionsChirho = AVAudioSession.InterruptionOptions(
                        rawValue: infoChirho?[AVAudioSessionInterruptionOptionKey] as? UInt ?? 0)
                    let reasonChirho = (infoChirho?[AVAudioSessionInterruptionReasonKey] as? UInt)
                        .flatMap(AVAudioSession.InterruptionReason.init(rawValue:))
                    guard let typeChirho else { return }
                    let beganChirho = typeChirho == .began
                    let resumeChirho = optionsChirho.contains(.shouldResume)
                    // A route that disconnected is the output going away: never resumed by itself.
                    let disconnectedChirho = beganChirho && reasonChirho == .routeDisconnected
                    guard let self else { return }
                    Task { @MainActor in
                        if disconnectedChirho {
                            self.lostOutputChirho()
                        } else {
                            self.interruptedChirho(beganChirho: beganChirho, resumeChirho: resumeChirho)
                        }
                    }
                },
                centerChirho.addObserver(
                    forName: AVAudioSession.routeChangeNotification, object: nil, queue: .main
                ) { @Sendable [weak self] notificationChirho in
                    let reasonChirho = (notificationChirho.userInfo?[AVAudioSessionRouteChangeReasonKey]
                        as? UInt).flatMap(AVAudioSession.RouteChangeReason.init(rawValue:))
                    guard reasonChirho == .oldDeviceUnavailable else { return }
                    guard let self else { return }
                    Task { @MainActor in self.lostOutputChirho() }
                },
                centerChirho.addObserver(
                    forName: AVAudioSession.mediaServicesWereLostNotification, object: nil, queue: .main
                ) { @Sendable [weak self] _ in
                    guard let self else { return }
                    Task { @MainActor in self.servicesChangedChirho(lostChirho: true) }
                },
                centerChirho.addObserver(
                    forName: AVAudioSession.mediaServicesWereResetNotification, object: nil, queue: .main
                ) { @Sendable [weak self] _ in
                    guard let self else { return }
                    Task { @MainActor in self.servicesChangedChirho(lostChirho: false) }
                }
            ]
        #endif
    }

    public func activateChirho() async -> RouteActivationChirho {
        epochChirho += 1
        let mineChirho = epochChirho
        lingerTaskChirho?.cancel()
        lingerTaskChirho = nil
        let resultChirho = await requestOutputChirho()
        if resultChirho == .activeChirho {
            // Whatever was asked meanwhile, the session is active now. The radio decides whether
            // to keep it.
            outputReadyChirho = true
        } else if mineChirho == epochChirho {
            // A radio left without an output holds nothing, not even a session that an Off had yet
            // to give back.
            deactivateChirho()
        }
        return resultChirho
    }

    /// Gives the output back after Off, so other audio may continue: at once, or as soon as a
    /// click already under way has finished, at most a second later.
    public func releaseChirho() {
        epochChirho += 1
        let mineChirho = epochChirho
        outputReadyChirho = false
        lingerTaskChirho?.cancel()
        lingerTaskChirho = nil
        let leftChirho = lingerSecondsChirho?() ?? 0
        guard leftChirho > 0 else {
            deactivateChirho()
            return
        }
        let waitChirho = min(leftChirho + outputLatencyChirho, Self.longestLingerSecondsChirho)
        lingerTaskChirho = Task { [weak self] in
            try? await Task.sleep(nanoseconds: UInt64(waitChirho * 1_000_000_000))
            guard let self, mineChirho == self.epochChirho else { return }
            self.lingerTaskChirho = nil
            self.deactivateChirho()
        }
    }

    private func requestOutputChirho() async -> RouteActivationChirho {
        #if os(watchOS)
            let sessionChirho = AVAudioSession.sharedInstance()
            do {
                try sessionChirho.setCategory(.playback, mode: .default, policy: .longFormAudio, options: [])
                return try await sessionChirho.activate(options: []) ? .activeChirho : .unavailableChirho
            } catch {
                return .unavailableChirho
            }
        #elseif os(iOS)
            let sessionChirho = AVAudioSession.sharedInstance()
            do {
                try sessionChirho.setCategory(
                    .playback, mode: .spokenAudio, policy: .longFormAudio, options: [])
                try sessionChirho.setActive(true)
                return .activeChirho
            } catch {
                return .unavailableChirho
            }
        #else
            return .activeChirho
        #endif
    }

    /// How far behind the output runs, such as over Bluetooth, so a lingering click is heard to
    /// its end.
    private var outputLatencyChirho: TimeInterval {
        #if os(iOS) || os(watchOS)
            let latencyChirho = AVAudioSession.sharedInstance().outputLatency
            return latencyChirho.isFinite ? max(0, latencyChirho) : 0
        #else
            return 0
        #endif
    }

    private func deactivateChirho() {
        #if os(iOS) || os(watchOS)
            try? AVAudioSession.sharedInstance().setActive(false, options: .notifyOthersOnDeactivation)
        #endif
    }

    private func interruptedChirho(beganChirho: Bool, resumeChirho: Bool) {
        // The system has already taken the output.
        if beganChirho { outputReadyChirho = false }
        onInterruptionChirho?(beganChirho, resumeChirho)
    }

    private func lostOutputChirho() {
        outputReadyChirho = false
        onOutputLostChirho?()
    }

    /// The services that held the session went away or came back. Either way the output is not in
    /// place, and a release still waiting on a click has no session left to give back.
    private func servicesChangedChirho(lostChirho: Bool) {
        epochChirho += 1
        outputReadyChirho = false
        lingerTaskChirho?.cancel()
        lingerTaskChirho = nil
        if lostChirho { onServicesLostChirho?() } else { onServicesResetChirho?() }
    }
}
