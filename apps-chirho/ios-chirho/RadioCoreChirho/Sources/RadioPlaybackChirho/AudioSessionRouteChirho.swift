// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// The platform's audio output for long listening. On a Watch, long-form audio needs a usable
// output: Bluetooth headphones, or the built-in speaker on supported models from watchOS 11, and
// never while charging. The Watch asks with activate(options:), which can show the system's output
// picker; when no output is chosen the radio stays off and says so, never claiming playback.
// Apple: https://developer.apple.com/documentation/watchkit/playing-background-audio and
// https://developer.apple.com/documentation/avfaudio/avaudiosession/activate(options:completionhandler:)
// Part of spec-chirho/workflows-chirho/experience-chirho/native_players_workflow_chirho.md.

import AVFoundation
import Foundation
import RadioCoreChirho

@MainActor
public final class AudioSessionRouteChirho: AudioRouteChirho {
    /// Another app or a call took the audio (true), or gave it back (false), and whether the
    /// platform says listening may resume.
    public var onInterruptionChirho: ((_ beganChirho: Bool, _ shouldResumeChirho: Bool) -> Void)?
    /// The output in use went away, such as headphones coming out.
    public var onOutputLostChirho: (() -> Void)?
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
                    guard let typeChirho else { return }
                    let beganChirho = typeChirho == .began
                    let resumeChirho = optionsChirho.contains(.shouldResume)
                    guard let self else { return }
                    Task { @MainActor in self.onInterruptionChirho?(beganChirho, resumeChirho) }
                },
                centerChirho.addObserver(
                    forName: AVAudioSession.routeChangeNotification, object: nil, queue: .main
                ) { @Sendable [weak self] notificationChirho in
                    let reasonChirho = (notificationChirho.userInfo?[AVAudioSessionRouteChangeReasonKey]
                        as? UInt).flatMap(AVAudioSession.RouteChangeReason.init(rawValue:))
                    guard reasonChirho == .oldDeviceUnavailable else { return }
                    guard let self else { return }
                    Task { @MainActor in self.onOutputLostChirho?() }
                }
            ]
        #endif
    }

    public func activateChirho() async -> RouteActivationChirho {
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

    /// Gives the output back after Off, so other audio may continue.
    public func releaseChirho() {
        #if os(iOS) || os(watchOS)
            try? AVAudioSession.sharedInstance().setActive(false, options: .notifyOthersOnDeactivation)
        #endif
    }
}
