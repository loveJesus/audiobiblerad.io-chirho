// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// The radio's decisions, with no platform in them: what On, Off, the dial and the chapter controls
// do, where a station lands, how the listener's place is carried across stations, and how a failed
// stream is recovered. A transport plays and reports; nothing here imports a media framework, so
// every decision is tested on a Mac with a fake one. It follows the web player,
// src/lib/player-chirho/radio_player_chirho.ts. Part of
// spec-chirho/workflows-chirho/experience-chirho/native_players_workflow_chirho.md and the web's
// spec-chirho/workflows-chirho/tune_in_workflow_chirho.md.

import Foundation

@MainActor
public final class RadioControllerChirho {
    public let catalogueChirho: CatalogueChirho
    public internal(set) var stationChirho: StationChirho
    public internal(set) var stateChirho: RadioStateChirho {
        didSet { if stateChirho != oldValue { onChangeChirho?(stateChirho) } }
    }
    /// Told of every change.
    public var onChangeChirho: ((RadioStateChirho) -> Void)?

    let transportChirho: any RadioTransportChirho
    let routeChirho: any AudioRouteChirho
    let storeChirho: any PreferenceStoreChirho
    let timingsLoaderChirho: any TimingsLoaderChirho
    let optionsChirho: RadioOptionsChirho
    /// Milliseconds on any steady clock.
    let clockChirho: () -> Double

    /// The place the listener is following, apart from the place being played.
    public internal(set) var followedChirho: FollowedPlaceChirho
    var explicitOffChirho: Bool
    /// What the transport holds now, if anything.
    var trackChirho: TrackChirho?
    /// Raised by every load and every release, so nothing late from an older stream can act.
    var tokenChirho = 0
    /// Raised by every On and Off, so an output chosen late cannot start a radio turned Off, and
    /// is given back unless a newer On is waiting for it.
    var activationChirho = 0
    var recoveriesChirho = 0
    var recoveryOriginChirho: RecoveryOriginChirho?
    var timeoutChirho: Task<Void, Never>?
    var timingsCacheChirho: [URL: [Double]] = [:]
    var timingsOrderChirho: [URL] = []
    var timingsTasksChirho: [URL: Task<Void, Never>] = [:]
    var requestedAtChirho = 0.0
    var switchingChirho = false
    var lastSaveChirho = 0.0
    var pausedBySystemChirho = false
    var launchedChirho = false
    /// The platform's audio services went away while the radio was sounding or about to, so one
    /// start of its own is owed when they return. The listener's On or Off, and a lost output,
    /// settle it.
    var resumeAfterServicesChirho = false
    /// That start has been made and nothing has sounded since, so a further loss waits for the
    /// listener: at most one start of its own between two moments of actual sound.
    var servicesStartMadeChirho = false
    /// The platform paused the stream with no interruption or lost output announced to explain it.
    /// If its audio services go away next, the pause was theirs and the radio counts as sounding.
    var platformPausedChirho = false

    public init(
        catalogueChirho: CatalogueChirho, transportChirho: any RadioTransportChirho,
        routeChirho: any AudioRouteChirho, storeChirho: any PreferenceStoreChirho,
        timingsLoaderChirho: any TimingsLoaderChirho, preferredLanguagesChirho: [String],
        optionsChirho: RadioOptionsChirho = RadioOptionsChirho(),
        clockChirho: @escaping () -> Double,
        randomChirho: () -> Double = { Double.random(in: 0..<1) }
    ) {
        let rememberedChirho = storeChirho.readChirho().flatMap {
            RememberedRadioChirho.readChirho($0, catalogueChirho: catalogueChirho)
        }
        let stationChirho =
            rememberedChirho.flatMap { catalogueChirho.stationChirho($0.stationIdChirho) }
            ?? InitialStationChirho.chooseChirho(
                catalogueChirho: catalogueChirho,
                preferredLanguagesChirho: preferredLanguagesChirho, randomChirho: randomChirho)
        var refChirho = rememberedChirho?.refChirho ?? InitialStationChirho.startingRefChirho
        var secondsChirho = rememberedChirho?.secondsChirho ?? 0
        let followedChirho =
            rememberedChirho?.followedChirho
            ?? FollowedPlaceChirho(
                stationIdChirho: stationChirho.idChirho, refChirho: refChirho,
                positionChirho: PositionChirho(
                    secondsChirho: secondsChirho, durationChirho: 0, verseChirho: nil,
                    verseFractionChirho: 0))
        // Show where On will land, as the web does when a station lacks the passage.
        if let landingChirho = catalogueChirho.chapterAtOrAfterChirho(
            stationChirho, bookIdChirho: refChirho.bookIdChirho, chapterChirho: refChirho.chapterChirho),
            landingChirho != refChirho
        {
            refChirho = landingChirho
            secondsChirho = 0
        }
        var stateChirho = RadioStateChirho(stationIdChirho: stationChirho.idChirho, refChirho: refChirho)
        stateChirho.secondsChirho = secondsChirho
        stateChirho.soundsEnabledChirho = rememberedChirho?.soundsEnabledChirho ?? true

        self.catalogueChirho = catalogueChirho
        self.stationChirho = stationChirho
        self.stateChirho = stateChirho
        self.transportChirho = transportChirho
        self.routeChirho = routeChirho
        self.storeChirho = storeChirho
        self.timingsLoaderChirho = timingsLoaderChirho
        self.optionsChirho = optionsChirho
        self.clockChirho = clockChirho
        self.followedChirho = followedChirho
        self.explicitOffChirho = rememberedChirho?.explicitOffChirho ?? false
    }

    /// The dial's stations, in the catalogue's order.
    public var stationsChirho: [StationChirho] { catalogueChirho.stationsChirho }

    public var stationIndexChirho: Int {
        stationsChirho.firstIndex { $0.idChirho == stationChirho.idChirho } ?? 0
    }

    /// Whether the listener's last word was Off.
    public var isExplicitlyOffChirho: Bool { explicitOffChirho }

    /// Loading, playing, or failed: a new choice should sound. Off and choosing an output should not.
    var wantsSoundChirho: Bool {
        stateChirho.phaseChirho == .loadingChirho || stateChirho.phaseChirho == .playingChirho
            || stateChirho.phaseChirho == .errorChirho
    }

    // MARK: Power

    /// Opening the app plays at once, unless the listener's last word was Off.
    public func launchChirho() async {
        guard !launchedChirho else { return }
        launchedChirho = true
        if !explicitOffChirho { await onChirho() }
    }

    /// Asks for an audio output, then plays the passage being followed.
    public func onChirho() async {
        explicitOffChirho = false
        pausedBySystemChirho = false
        resumeAfterServicesChirho = false
        platformPausedChirho = false
        guard !stateChirho.isOnChirho else { return }
        activationChirho += 1
        let mineChirho = activationChirho
        requestedAtChirho = clockChirho()
        stateChirho.phaseChirho = .startingChirho
        stateChirho.messageChirho = ""
        let resultChirho = await routeChirho.activateChirho()
        // Off, or another On, while the output was being chosen has the last word. An output that
        // arrives after Off is given back at once; one that a newer On is waiting for is left to it.
        guard mineChirho == activationChirho, stateChirho.phaseChirho == .startingChirho else {
            if resultChirho == .activeChirho, !stateChirho.isOnChirho { routeChirho.releaseChirho() }
            return
        }
        guard resultChirho == .activeChirho else {
            stateChirho.phaseChirho = .offChirho
            stateChirho.messageChirho = RadioMessagesChirho.noOutputChirho
            saveChirho()
            return
        }
        if var trackChirho {
            trackChirho.wantsPlayChirho = true
            self.trackChirho = trackChirho
            stateChirho.phaseChirho = .loadingChirho
            armTimeoutChirho()
            if trackChirho.positionedChirho { transportChirho.playChirho() }
        } else {
            let followsChirho = stateChirho.refChirho == followedChirho.refChirho
            let sameStationChirho = followedChirho.stationIdChirho == stationChirho.idChirho
            beginTrackChirho(
                playChirho: true,
                positionChirho: followsChirho ? followedChirho.positionChirho : .zeroChirho,
                secondsChirho: followsChirho
                    ? (sameStationChirho ? followedChirho.positionChirho.secondsChirho : nil)
                    : stateChirho.secondsChirho)
        }
        saveChirho()
    }

    /// Silences the radio and remembers that the listener chose it.
    public func offChirho() {
        explicitOffChirho = true
        pausedBySystemChirho = false
        resumeAfterServicesChirho = false
        platformPausedChirho = false
        activationChirho += 1
        silenceChirho()
        routeChirho.releaseChirho()
        saveChirho()
    }

    public func toggleChirho() async {
        if stateChirho.isOnChirho { offChirho() } else { await onChirho() }
    }

    // MARK: The dial

    /// Turns the dial to a station. It plays the followed passage when it has it, at the same verse
    /// or fraction; otherwise the next passage it has, keeping the followed one for later stations.
    public func tuneChirho(toStationIdChirho idChirho: String) {
        guard let nextChirho = catalogueChirho.stationChirho(idChirho),
            nextChirho.idChirho != stationChirho.idChirho
        else { return }
        let playChirho = wantsSoundChirho
        updateFollowedPositionChirho()
        recoveryOriginChirho = nil
        recoveriesChirho = 0
        stationChirho = nextChirho
        stateChirho.stationIdChirho = nextChirho.idChirho
        stateChirho.refChirho = followedChirho.refChirho
        stateChirho.secondsChirho = followedChirho.positionChirho.secondsChirho
        if playChirho {
            switchingChirho = true
            requestedAtChirho = clockChirho()
            beginTrackChirho(
                playChirho: true, positionChirho: followedChirho.positionChirho, secondsChirho: nil)
        } else {
            releaseTrackChirho()
            landQuietlyChirho()
        }
        saveChirho()
    }

    /// Turns the dial by whole stations, wrapping round at either end.
    public func tuneChirho(byStepsChirho stepsChirho: Int) {
        let countChirho = stationsChirho.count
        guard countChirho > 1, stepsChirho != 0 else { return }
        let indexChirho = ((stationIndexChirho + stepsChirho) % countChirho + countChirho) % countChirho
        tuneChirho(toStationIdChirho: stationsChirho[indexChirho].idChirho)
    }

    // MARK: Passage

    /// The first chapter of a book on this station.
    public func chooseBookChirho(_ bookIdChirho: String) {
        guard
            let firstChirho = catalogueChirho.offeredChaptersChirho(
                stationChirho, bookIdChirho: bookIdChirho
            ).first
        else {
            if catalogueChirho.bookChirho(bookIdChirho) != nil {
                stateChirho.messageChirho = RadioMessagesChirho.bookMissingChirho
            }
            return
        }
        selectChapterChirho(ChapterRefChirho(bookIdChirho: bookIdChirho, chapterChirho: firstChirho))
    }

    /// A book and chapter chosen together, as a Watch's book list and chapter grid give them.
    public func choosePassageChirho(_ refChirho: ChapterRefChirho) { selectChapterChirho(refChirho) }

    public func chooseChapterChirho(_ chapterChirho: Int) {
        selectChapterChirho(
            ChapterRefChirho(bookIdChirho: stateChirho.refChirho.bookIdChirho, chapterChirho: chapterChirho))
    }

    public func nextChapterChirho() {
        guard
            let nextChirho = catalogueChirho.nextChapterChirho(
                stationChirho, bookIdChirho: stateChirho.refChirho.bookIdChirho,
                chapterChirho: stateChirho.refChirho.chapterChirho)
        else { return }
        selectChapterChirho(nextChirho)
    }

    public func previousChapterChirho() {
        guard
            let previousChirho = catalogueChirho.previousChapterChirho(
                stationChirho, bookIdChirho: stateChirho.refChirho.bookIdChirho,
                chapterChirho: stateChirho.refChirho.chapterChirho)
        else { return }
        selectChapterChirho(previousChirho)
    }

    /// Moves inside the chapter being played. Ignored until its length is known.
    public func seekChirho(toSecondsChirho secondsChirho: Double) {
        guard secondsChirho.isFinite, var trackChirho, trackChirho.durationChirho > 0 else { return }
        let targetChirho = min(max(0, secondsChirho), max(0, trackChirho.durationChirho - 0.1))
        if trackChirho.positionedChirho {
            transportChirho.seekChirho(toSecondsChirho: targetChirho)
        } else {
            trackChirho.pendingSecondsChirho = targetChirho
            self.trackChirho = trackChirho
        }
        stateChirho.secondsChirho = targetChirho
        updateFollowedPositionChirho()
        saveChirho()
    }

    // MARK: The platform

    /// Another app or a call took the audio. The radio waits, and resumes if the platform says so.
    public func interruptionBeganChirho() {
        // An announced interruption explains any pause the platform reported just before it.
        platformPausedChirho = false
        guard trackChirho?.wantsPlayChirho == true else { return }
        pausedBySystemChirho = true
        silenceChirho()
        saveChirho()
    }

    public func interruptionEndedChirho(shouldResumeChirho: Bool) async {
        guard pausedBySystemChirho else { return }
        pausedBySystemChirho = false
        if shouldResumeChirho, !explicitOffChirho { await onChirho() }
    }

    /// Headphones came out: stop, and do not start again by ourselves. An output still being chosen
    /// goes with them, so a start waiting for it, ordinary or owed, does not go ahead either.
    public func outputLostChirho() {
        pausedBySystemChirho = false
        resumeAfterServicesChirho = false
        platformPausedChirho = false
        if stateChirho.phaseChirho == .startingChirho {
            activationChirho += 1
            stateChirho.phaseChirho = .offChirho
            saveChirho()
            return
        }
        guard trackChirho?.wantsPlayChirho == true else { return }
        silenceChirho()
        saveChirho()
    }

    /// The platform's audio services went away, or a stream failed because they did. That is
    /// neither a bad file nor the listener's word: the radio stops quietly, keeps its station,
    /// passage, second and followed place, never moves to another chapter, and owes one start of
    /// its own if it was sounding or about to, including when the platform paused it unannounced
    /// a moment before.
    public func servicesLostChirho() {
        let soundingChirho =
            trackChirho?.wantsPlayChirho == true || stateChirho.phaseChirho == .startingChirho
            || platformPausedChirho
        if soundingChirho, !explicitOffChirho { resumeAfterServicesChirho = true }
        // An output being chosen now belongs to the services that went away.
        activationChirho += 1
        updateFollowedPositionChirho()
        restoreOriginChirho()
        releaseTrackChirho()
        stateChirho.durationChirho = 0
        stateChirho.verseChirho = nil
        if soundingChirho {
            stateChirho.phaseChirho = .offChirho
            stateChirho.messageChirho = RadioMessagesChirho.servicesChirho
        }
        saveChirho()
    }

    /// The platform's audio services are back. Nothing made before them still works, so the
    /// transport starts afresh, and the start owed since they went away is made once, at the place
    /// kept. Off at any moment cancels it, and a further loss before any sound waits for On.
    public func servicesResetChirho() async {
        servicesLostChirho()
        transportChirho.rebuildChirho()
        let owedChirho = resumeAfterServicesChirho && !explicitOffChirho && !servicesStartMadeChirho
        resumeAfterServicesChirho = false
        guard owedChirho else { return }
        servicesStartMadeChirho = true
        await onChirho()
    }

    public func setSoundsChirho(_ enabledChirho: Bool) {
        stateChirho.soundsEnabledChirho = enabledChirho
        saveChirho()
    }

    // MARK: Memory

    /// What is remembered. During a recovery it is the place before the recovery, until a
    /// replacement actually plays.
    public var rememberedChirho: RememberedRadioChirho {
        let originChirho = recoveryOriginChirho
        return RememberedRadioChirho(
            stationIdChirho: stationChirho.idChirho,
            refChirho: originChirho?.refChirho ?? stateChirho.refChirho,
            secondsChirho: originChirho?.secondsChirho ?? stateChirho.secondsChirho,
            followedChirho: originChirho?.followedChirho ?? followedChirho,
            explicitOffChirho: explicitOffChirho,
            soundsEnabledChirho: stateChirho.soundsEnabledChirho)
    }

    /// Writes the remembered radio now: on leaving the app, and every few seconds while playing.
    public func saveChirho() {
        lastSaveChirho = clockChirho()
        storeChirho.writeChirho(rememberedChirho.encodedChirho())
    }
}
