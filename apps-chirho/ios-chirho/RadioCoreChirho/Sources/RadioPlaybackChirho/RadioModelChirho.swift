// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// What the iPhone and Watch views hold: the radio's state, the controls a listener uses, and the
// wiring between the controller, AVFoundation, the system's media controls and the interface
// sounds. Interface sounds come only from the listener's own presses here. The system's commands,
// interruptions and a lost output stay quiet and stop any sound still under way; the on-screen
// Off keeps its own click. When the platform's media services go away the radio holds its place;
// when they return the clip players are made again before the controller rebuilds the stream
// player and makes its one start of its own. Part of
// spec-chirho/workflows-chirho/experience-chirho/native_players_workflow_chirho.md.

import Foundation
import Observation
import RadioCoreChirho
import os

@MainActor
@Observable
public final class RadioModelChirho {
    public private(set) var stateChirho: RadioStateChirho
    public private(set) var stationChirho: StationChirho

    public let catalogueChirho: CatalogueChirho
    private let controllerChirho: RadioControllerChirho
    private let routeChirho: AudioSessionRouteChirho
    private let nowPlayingChirho = NowPlayingChirho()
    @ObservationIgnored private var soundsChirho: RadioSoundsChirho?
    private let loggerChirho = Logger(
        subsystem: "io.audiobiblerad.radiochirho", category: "playback-chirho")

    public init(
        catalogueChirho: CatalogueChirho, storeChirho: (any PreferenceStoreChirho)? = nil,
        bundleChirho: Bundle = .main
    ) {
        let routeChirho = AudioSessionRouteChirho()
        let controllerChirho = RadioControllerChirho(
            catalogueChirho: catalogueChirho, transportChirho: PlayerTransportChirho(),
            routeChirho: routeChirho, storeChirho: storeChirho ?? DefaultsStoreChirho(),
            timingsLoaderChirho: TimingsFetcherChirho(),
            preferredLanguagesChirho: Locale.preferredLanguages,
            clockChirho: { ProcessInfo.processInfo.systemUptime * 1000 })
        self.catalogueChirho = catalogueChirho
        self.controllerChirho = controllerChirho
        self.routeChirho = routeChirho
        stateChirho = controllerChirho.stateChirho
        stationChirho = controllerChirho.stationChirho

        #if os(watchOS)
            // A Watch sounds only through the long-form output it was actually given: not while
            // the radio is still asking for it, and not after Off, an interruption or its loss.
            let mayPlayChirho: @MainActor () -> Bool = { [weak routeChirho] in
                routeChirho?.outputReadyChirho ?? false
            }
        #else
            let mayPlayChirho: @MainActor () -> Bool = { true }
        #endif
        let soundsChirho = RadioSoundsChirho(bundleChirho: bundleChirho, mayPlayChirho: mayPlayChirho)
        soundsChirho.enabledChirho = stateChirho.soundsEnabledChirho
        self.soundsChirho = soundsChirho
        // Off gives the output back only once the press's own click has finished.
        routeChirho.lingerSecondsChirho = { [weak soundsChirho] in
            soundsChirho?.feedbackLeftSecondsChirho ?? 0
        }

        controllerChirho.onChangeChirho = { [weak self] in self?.changedChirho($0) }
        routeChirho.onInterruptionChirho = { [weak self] beganChirho, resumeChirho in
            guard let self else { return }
            if beganChirho {
                self.loggerChirho.info("interruption began")
                self.soundsChirho?.silenceChirho()
                self.controllerChirho.interruptionBeganChirho()
            } else {
                self.loggerChirho.info("interruption ended, resume \(resumeChirho, privacy: .public)")
                Task { await self.controllerChirho.interruptionEndedChirho(shouldResumeChirho: resumeChirho) }
            }
        }
        routeChirho.onOutputLostChirho = { [weak self] in
            self?.loggerChirho.info("output lost")
            self?.soundsChirho?.silenceChirho()
            self?.controllerChirho.outputLostChirho()
        }
        routeChirho.onServicesLostChirho = { [weak self] in
            self?.loggerChirho.info("media services lost")
            self?.soundsChirho?.silenceChirho()
            self?.controllerChirho.servicesLostChirho()
        }
        routeChirho.onServicesResetChirho = { [weak self] in
            guard let self else { return }
            self.loggerChirho.info("media services reset")
            self.soundsChirho?.rebuildChirho()
            Task { await self.controllerChirho.servicesResetChirho() }
        }
        nowPlayingChirho.connectChirho(
            NowPlayingActionsChirho(
                onChirho: { [weak controllerChirho] in
                    guard let controllerChirho else { return }
                    Task { await controllerChirho.onChirho() }
                },
                offChirho: { [weak self] in self?.quietOffChirho() },
                toggleChirho: { [weak self] in self?.quietToggleChirho() },
                nextChirho: { [weak controllerChirho] in controllerChirho?.nextChapterChirho() },
                previousChirho: { [weak controllerChirho] in controllerChirho?.previousChapterChirho() },
                seekChirho: { [weak controllerChirho] secondsChirho in
                    controllerChirho?.seekChirho(toSecondsChirho: secondsChirho)
                }))
    }

    /// The radio over the catalogue the app ships with; nothing when that resource is missing or
    /// damaged, so the app can say so instead of crashing.
    public static func bundledChirho() -> RadioModelChirho? {
        guard let catalogueChirho = try? CatalogueChirho.bundledChirho() else { return nil }
        return RadioModelChirho(catalogueChirho: catalogueChirho)
    }

    // MARK: What the views show

    public var stationsChirho: [StationChirho] { catalogueChirho.stationsChirho }

    public var stationIndexChirho: Int {
        stationsChirho.firstIndex { $0.idChirho == stationChirho.idChirho } ?? 0
    }

    public var bookNameChirho: String {
        catalogueChirho.bookChirho(stateChirho.refChirho.bookIdChirho)?.nameChirho
            ?? stateChirho.refChirho.bookIdChirho
    }

    /// "John 3".
    public var passageChirho: String { "\(bookNameChirho) \(stateChirho.refChirho.chapterChirho)" }

    public var offeredBooksChirho: [BookChirho] { catalogueChirho.offeredBooksChirho(stationChirho) }

    public var offeredChaptersChirho: [Int] {
        catalogueChirho.offeredChaptersChirho(
            stationChirho, bookIdChirho: stateChirho.refChirho.bookIdChirho)
    }

    /// The reader, or the version when the maker names no reader.
    public static func voiceTextChirho(_ stationChirho: StationChirho) -> String {
        stationChirho.voiceChirho.isEmpty ? stationChirho.versionChirho : stationChirho.voiceChirho
    }

    /// `m:ss`, or `h:mm:ss` for an hour or more.
    public static func clockTextChirho(_ secondsChirho: Double) -> String {
        let wholeChirho = secondsChirho.isFinite ? max(0, Int(secondsChirho.rounded(.down))) : 0
        let hoursChirho = wholeChirho / 3600
        let minutesChirho = wholeChirho / 60 % 60
        let restChirho = wholeChirho % 60
        return hoursChirho > 0
            ? String(format: "%d:%02d:%02d", hoursChirho, minutesChirho, restChirho)
            : String(format: "%d:%02d", minutesChirho, restChirho)
    }

    // MARK: What the listener does

    /// Opening the app: it plays at once unless the listener's last word was Off.
    public func launchChirho() async { await controllerChirho.launchChirho() }

    /// The on-screen power control. Its click sounds through Off too: the output is given back
    /// once the click has finished.
    public func powerChirho() async {
        soundsChirho?.clickChirho()
        if stateChirho.isOnChirho {
            soundsChirho?.stopTuningChirho()
            controllerChirho.offChirho()
        } else {
            await controllerChirho.onChirho()
        }
    }

    /// One step of the dial under the listener's hand: a knob sound, nothing more.
    public func dialStepChirho() { soundsChirho?.knobChirho() }

    /// Lands the dial on a station; static plays while it loads if the radio is on.
    public func tuneChirho(toStationIdChirho idChirho: String) {
        guard idChirho != stationChirho.idChirho else { return }
        if stateChirho.isOnChirho || stateChirho.phaseChirho == .errorChirho {
            soundsChirho?.startTuningChirho()
        }
        controllerChirho.tuneChirho(toStationIdChirho: idChirho)
    }

    /// A step and a landing together, for a dial that moves one station at a time.
    public func tuneChirho(byStepsChirho stepsChirho: Int) {
        let countChirho = stationsChirho.count
        guard countChirho > 1, stepsChirho != 0 else { return }
        dialStepChirho()
        let indexChirho = ((stationIndexChirho + stepsChirho) % countChirho + countChirho) % countChirho
        tuneChirho(toStationIdChirho: stationsChirho[indexChirho].idChirho)
    }

    public func chooseBookChirho(_ bookIdChirho: String) {
        soundsChirho?.clickChirho()
        controllerChirho.chooseBookChirho(bookIdChirho)
    }

    public func chooseChapterChirho(_ chapterChirho: Int) {
        soundsChirho?.clickChirho()
        controllerChirho.chooseChapterChirho(chapterChirho)
    }

    public func choosePassageChirho(bookIdChirho: String, chapterChirho: Int) {
        soundsChirho?.clickChirho()
        controllerChirho.choosePassageChirho(
            ChapterRefChirho(bookIdChirho: bookIdChirho, chapterChirho: chapterChirho))
    }

    public func offeredChaptersChirho(inBookChirho bookIdChirho: String) -> [Int] {
        catalogueChirho.offeredChaptersChirho(stationChirho, bookIdChirho: bookIdChirho)
    }

    public func nextChapterChirho() {
        soundsChirho?.clickChirho()
        controllerChirho.nextChapterChirho()
    }

    public func previousChapterChirho() {
        soundsChirho?.clickChirho()
        controllerChirho.previousChapterChirho()
    }

    public func seekChirho(toSecondsChirho secondsChirho: Double) {
        controllerChirho.seekChirho(toSecondsChirho: secondsChirho)
    }

    public func setSoundsChirho(_ enabledChirho: Bool) {
        controllerChirho.setSoundsChirho(enabledChirho)
        soundsChirho?.enabledChirho = enabledChirho
        if enabledChirho { soundsChirho?.clickChirho() }
    }

    /// Remembers the place now, as the app leaves the foreground.
    public func saveChirho() { controllerChirho.saveChirho() }

    // MARK: The system's controls

    /// Off from the lock screen, Control Center, headphones or the Watch's Now Playing: no click,
    /// and any click or static still sounding stops with the radio.
    private func quietOffChirho() {
        loggerChirho.info("system control Off")
        soundsChirho?.silenceChirho()
        controllerChirho.offChirho()
    }

    private func quietToggleChirho() {
        if controllerChirho.stateChirho.isOnChirho {
            quietOffChirho()
        } else {
            Task { await controllerChirho.onChirho() }
        }
    }

    // MARK: Changes

    private func changedChirho(_ newStateChirho: RadioStateChirho) {
        let oldStateChirho = stateChirho
        stateChirho = newStateChirho
        if stationChirho.idChirho != controllerChirho.stationChirho.idChirho {
            stationChirho = controllerChirho.stationChirho
        }
        // The static lasts exactly as long as the wait.
        if newStateChirho.phaseChirho != .loadingChirho, newStateChirho.phaseChirho != .startingChirho {
            soundsChirho?.stopTuningChirho()
        }
        if let firstChirho = newStateChirho.firstSoundMsChirho, oldStateChirho.firstSoundMsChirho == nil {
            loggerChirho.info("first sound \(firstChirho, privacy: .public) ms")
        }
        if let switchChirho = newStateChirho.switchMsChirho, switchChirho != oldStateChirho.switchMsChirho {
            loggerChirho.info("dial switch \(switchChirho, privacy: .public) ms")
        }
        nowPlayingChirho.showChirho(
            titleChirho: passageChirho,
            artistChirho: "\(stationChirho.versionChirho) · \(Self.voiceTextChirho(stationChirho))",
            albumChirho: stationChirho.languageNameChirho, stateChirho: newStateChirho,
            nowSecondsChirho: ProcessInfo.processInfo.systemUptime)
    }
}
