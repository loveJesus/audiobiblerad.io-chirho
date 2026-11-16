// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// The radio's decisions over a fake transport: power, the dial, recovery and the four invariants
// the native vertical must keep. These are decisions and framework-free events, not proof that a
// device plays sound.

import Foundation
import Testing

@testable import RadioCoreChirho

@MainActor
@Suite("The radio controller", .serialized)
struct ControllerTestsChirho {
    let catalogueChirho: CatalogueChirho
    let johnThreeChirho = FixturesChirho.refChirho("JHN", 3)

    init() { catalogueChirho = FixturesChirho.radioChirho }

    private func rigChirho(
        at stationIdChirho: String = "full-a", secondsChirho: Double = 0,
        explicitOffChirho: Bool = false, timingsChirho: FakeTimingsChirho = FakeTimingsChirho()
    ) -> RadioRigChirho {
        RadioRigChirho(
            catalogueChirho: catalogueChirho,
            rememberedChirho: RadioRigChirho.rememberedChirho(
                stationIdChirho, johnThreeChirho, secondsChirho: secondsChirho,
                explicitOffChirho: explicitOffChirho),
            timingsChirho: timingsChirho)
    }

    /// Opens the app and lets the first chapter sound.
    private func playingRigChirho(secondsChirho: Double = 0) async -> RadioRigChirho {
        let rigChirho = rigChirho(secondsChirho: secondsChirho)
        await rigChirho.controllerChirho.launchChirho()
        rigChirho.transportChirho.sendChirho(.readyChirho(durationSecondsChirho: 600))
        rigChirho.transportChirho.sendChirho(.playingChirho)
        return rigChirho
    }

    // MARK: Power

    @Test("Opening the app plays the remembered place at its exact second")
    func launchResumesChirho() async throws {
        let rigChirho = rigChirho(secondsChirho: 120)
        await rigChirho.controllerChirho.launchChirho()
        let loadChirho = try #require(rigChirho.transportChirho.loadsChirho.last)
        #expect(loadChirho.urlChirho.absoluteString == "https://a.example/JHN/3.mp3")
        #expect(loadChirho.startSecondsChirho == 120)
        #expect(loadChirho.playChirho)
        #expect(rigChirho.controllerChirho.stateChirho.phaseChirho == .loadingChirho)
        rigChirho.transportChirho.sendChirho(.readyChirho(durationSecondsChirho: 600))
        rigChirho.clockChirho.nowChirho += 850
        rigChirho.transportChirho.sendChirho(.playingChirho)
        #expect(rigChirho.controllerChirho.stateChirho.phaseChirho == .playingChirho)
        #expect(rigChirho.controllerChirho.stateChirho.firstSoundMsChirho == 850)
    }

    @Test("A remembered Off keeps the radio quiet on opening, until On")
    func explicitOffIsKeptChirho() async throws {
        let rigChirho = rigChirho(explicitOffChirho: true)
        await rigChirho.controllerChirho.launchChirho()
        #expect(rigChirho.transportChirho.loadsChirho.isEmpty)
        #expect(rigChirho.controllerChirho.stateChirho.phaseChirho == .offChirho)
        await rigChirho.controllerChirho.onChirho()
        #expect(rigChirho.transportChirho.loadsChirho.count == 1)
        #expect(rigChirho.storedChirho()?.explicitOffChirho == false)
    }

    @Test("No output means no playback claim: the radio stays off and says why")
    func missingOutputIsVisibleChirho() async throws {
        let rigChirho = rigChirho()
        rigChirho.routeChirho.resultChirho = .unavailableChirho
        await rigChirho.controllerChirho.launchChirho()
        #expect(rigChirho.transportChirho.loadsChirho.isEmpty)
        #expect(rigChirho.controllerChirho.stateChirho.phaseChirho == .offChirho)
        #expect(rigChirho.controllerChirho.stateChirho.messageChirho == RadioMessagesChirho.noOutputChirho)
    }

    @Test("Off then On resumes the loaded chapter without loading it again")
    func offThenOnResumesChirho() async throws {
        let rigChirho = await playingRigChirho()
        rigChirho.controllerChirho.offChirho()
        #expect(rigChirho.transportChirho.logChirho.last == "pause")
        #expect(rigChirho.routeChirho.releasesChirho == 1)
        #expect(rigChirho.storedChirho()?.explicitOffChirho == true)
        await rigChirho.controllerChirho.onChirho()
        #expect(rigChirho.transportChirho.loadsChirho.count == 1)
        #expect(rigChirho.transportChirho.logChirho.last == "play")
        #expect(rigChirho.controllerChirho.stateChirho.phaseChirho == .loadingChirho)
    }

    // MARK: Invariant: a detour keeps the followed passage

    @Test("A detour on a partial station keeps the followed passage for the next station")
    func detourKeepsFollowedPassageChirho() async throws {
        let rigChirho = await playingRigChirho()
        let controllerChirho = rigChirho.controllerChirho
        rigChirho.transportChirho.sendChirho(.progressChirho(secondsChirho: 300))

        controllerChirho.tuneChirho(toStationIdChirho: "partial-b")
        #expect(controllerChirho.stateChirho.refChirho == FixturesChirho.refChirho("MAT", 1))
        #expect(controllerChirho.stateChirho.messageChirho == RadioMessagesChirho.movedChirho)
        #expect(rigChirho.transportChirho.lastUrlChirho == "https://b.example/MAT/1.mp3")
        rigChirho.transportChirho.sendChirho(.readyChirho(durationSecondsChirho: 400))
        rigChirho.transportChirho.sendChirho(.playingChirho)
        rigChirho.transportChirho.sendChirho(.progressChirho(secondsChirho: 200))

        #expect(controllerChirho.followedChirho.refChirho == johnThreeChirho)
        #expect(controllerChirho.followedChirho.stationIdChirho == "full-a")
        #expect(controllerChirho.followedChirho.positionChirho.secondsChirho == 300)
        #expect(rigChirho.storedChirho()?.followedChirho?.refChirho == johnThreeChirho)

        controllerChirho.tuneChirho(toStationIdChirho: "full-c")
        #expect(rigChirho.transportChirho.lastUrlChirho == "https://c.example/JHN/3.mp3")
        #expect(rigChirho.transportChirho.loadsChirho.last?.playChirho == false)
        rigChirho.transportChirho.clearLogChirho()
        rigChirho.transportChirho.sendChirho(.readyChirho(durationSecondsChirho: 1200))
        // Half way through John 3 on the first station is half way through it here.
        #expect(rigChirho.transportChirho.seeksChirho.last == 600)
        #expect(rigChirho.transportChirho.logChirho == ["seek", "play"])
    }

    // MARK: Invariant: recovery keeps the remembered place until a replacement plays

    @Test("An unplayable file skips ahead, but the remembered place moves only once one plays")
    func recoveryKeepsPlaceUntilReplacementPlaysChirho() async throws {
        let rigChirho = rigChirho(secondsChirho: 120)
        let controllerChirho = rigChirho.controllerChirho
        await controllerChirho.launchChirho()
        rigChirho.transportChirho.sendChirho(.readyChirho(durationSecondsChirho: 600))
        rigChirho.transportChirho.sendChirho(.failedChirho(.unplayableChirho))

        #expect(rigChirho.transportChirho.lastUrlChirho == "https://a.example/JHN/4.mp3")
        #expect(controllerChirho.stateChirho.messageChirho == RadioMessagesChirho.recoveringChirho)
        // Leaving the app now must remember John 3, not the chapter being tried.
        controllerChirho.saveChirho()
        #expect(rigChirho.storedChirho()?.refChirho == johnThreeChirho)
        #expect(rigChirho.storedChirho()?.secondsChirho == 120)

        rigChirho.transportChirho.sendChirho(.failedChirho(.unplayableChirho))
        #expect(rigChirho.transportChirho.lastUrlChirho == "https://a.example/JHN/5.mp3")
        controllerChirho.saveChirho()
        #expect(rigChirho.storedChirho()?.refChirho == johnThreeChirho)
        #expect(rigChirho.storedChirho()?.followedChirho?.refChirho == johnThreeChirho)

        rigChirho.transportChirho.sendChirho(.readyChirho(durationSecondsChirho: 500))
        rigChirho.transportChirho.sendChirho(.playingChirho)
        #expect(rigChirho.storedChirho()?.refChirho == FixturesChirho.refChirho("JHN", 5))
        #expect(controllerChirho.followedChirho.refChirho == FixturesChirho.refChirho("JHN", 5))
    }

    @Test("A network failure never skips a chapter and keeps the exact place for the next On")
    func networkFailureKeepsPlaceChirho() async throws {
        let rigChirho = rigChirho(secondsChirho: 120)
        let controllerChirho = rigChirho.controllerChirho
        await controllerChirho.launchChirho()
        rigChirho.transportChirho.sendChirho(.readyChirho(durationSecondsChirho: 600))
        rigChirho.transportChirho.sendChirho(.failedChirho(.networkChirho))

        #expect(rigChirho.transportChirho.loadsChirho.count == 1)
        #expect(controllerChirho.stateChirho.phaseChirho == .errorChirho)
        #expect(controllerChirho.stateChirho.messageChirho == RadioMessagesChirho.networkChirho)
        #expect(rigChirho.storedChirho()?.refChirho == johnThreeChirho)
        #expect(rigChirho.storedChirho()?.secondsChirho == 120)

        await controllerChirho.onChirho()
        #expect(rigChirho.transportChirho.lastUrlChirho == "https://a.example/JHN/3.mp3")
        #expect(rigChirho.transportChirho.loadsChirho.last?.startSecondsChirho == 120)
    }

    @Test("When no replacement plays, recovery gives up and restores the place it started from")
    func exhaustedRecoveryRestoresPlaceChirho() async throws {
        let rigChirho = rigChirho(secondsChirho: 120)
        let controllerChirho = rigChirho.controllerChirho
        await controllerChirho.launchChirho()
        for _ in 0...RadioOptionsChirho().recoveryLimitChirho {
            rigChirho.transportChirho.sendChirho(.failedChirho(.unplayableChirho))
        }
        #expect(rigChirho.transportChirho.loadsChirho.count == 1 + RadioOptionsChirho().recoveryLimitChirho)
        #expect(controllerChirho.stateChirho.phaseChirho == .errorChirho)
        #expect(controllerChirho.stateChirho.refChirho == johnThreeChirho)
        #expect(controllerChirho.stateChirho.secondsChirho == 120)
        #expect(rigChirho.storedChirho()?.refChirho == johnThreeChirho)
        #expect(rigChirho.transportChirho.logChirho.last == "clear")
    }

    // MARK: Invariant: Off during loading or recovery stays off

    @Test("Off while a stream loads stays off, whatever the stream reports later")
    func offDuringLoadStaysOffChirho() async throws {
        let rigChirho = rigChirho()
        let controllerChirho = rigChirho.controllerChirho
        await controllerChirho.launchChirho()
        controllerChirho.offChirho()
        rigChirho.transportChirho.clearLogChirho()
        rigChirho.transportChirho.sendChirho(.readyChirho(durationSecondsChirho: 600))
        rigChirho.transportChirho.sendChirho(.playingChirho)
        #expect(controllerChirho.stateChirho.phaseChirho == .offChirho)
        #expect(!rigChirho.transportChirho.logChirho.contains("play"))
        #expect(rigChirho.transportChirho.logChirho.last == "pause")
    }

    @Test("Off during a recovery stays off and keeps the place from before the recovery")
    func offDuringRecoveryStaysOffChirho() async throws {
        let rigChirho = rigChirho(secondsChirho: 120)
        let controllerChirho = rigChirho.controllerChirho
        await controllerChirho.launchChirho()
        rigChirho.transportChirho.sendChirho(.failedChirho(.unplayableChirho))
        #expect(rigChirho.transportChirho.loadsChirho.count == 2)
        controllerChirho.offChirho()
        rigChirho.transportChirho.sendChirho(.failedChirho(.unplayableChirho))

        #expect(rigChirho.transportChirho.loadsChirho.count == 2)
        #expect(controllerChirho.stateChirho.phaseChirho == .offChirho)
        #expect(controllerChirho.stateChirho.refChirho == johnThreeChirho)
        #expect(rigChirho.storedChirho()?.refChirho == johnThreeChirho)
        #expect(rigChirho.storedChirho()?.secondsChirho == 120)
        #expect(!rigChirho.transportChirho.logChirho.contains("play"))
        #expect(rigChirho.transportChirho.logChirho.last == "clear")
    }

    @Test("Off while a carried place waits for its length stays off once it is placed")
    func offDuringCarriedStartStaysOffChirho() async throws {
        let rigChirho = await playingRigChirho()
        let controllerChirho = rigChirho.controllerChirho
        rigChirho.transportChirho.sendChirho(.progressChirho(secondsChirho: 300))
        controllerChirho.tuneChirho(toStationIdChirho: "full-c")
        controllerChirho.offChirho()
        rigChirho.transportChirho.clearLogChirho()
        rigChirho.transportChirho.sendChirho(.readyChirho(durationSecondsChirho: 1200))
        #expect(rigChirho.transportChirho.logChirho == ["seek"])
        #expect(controllerChirho.stateChirho.phaseChirho == .offChirho)
    }

    @Test("Off while the output is being chosen wins over the output arriving, which is given back")
    func offDuringActivationStaysOffChirho() async throws {
        let rigChirho = rigChirho()
        let controllerChirho = rigChirho.controllerChirho
        rigChirho.routeChirho.holdChirho = true
        let launchChirho = Task { await controllerChirho.launchChirho() }
        while !rigChirho.routeChirho.isWaitingChirho { await Task.yield() }
        #expect(controllerChirho.stateChirho.phaseChirho == .startingChirho)
        controllerChirho.offChirho()
        // Off's release came before the output existed, so the output still arrives after it.
        rigChirho.routeChirho.finishChirho(.activeChirho)
        await launchChirho.value
        #expect(rigChirho.transportChirho.loadsChirho.isEmpty)
        #expect(controllerChirho.stateChirho.phaseChirho == .offChirho)
        #expect(!rigChirho.routeChirho.activeChirho, "a radio turned Off holds no output")
    }

    @Test("An output that arrives late for an earlier On is left to the newer On waiting for it")
    func lateOutputIsLeftToNewerOnChirho() async throws {
        let rigChirho = rigChirho()
        let controllerChirho = rigChirho.controllerChirho
        rigChirho.routeChirho.holdChirho = true
        let firstChirho = Task { await controllerChirho.launchChirho() }
        try #require(try await untilChirho { rigChirho.routeChirho.waitingCountChirho == 1 })
        controllerChirho.offChirho()
        let secondChirho = Task { await controllerChirho.onChirho() }
        try #require(try await untilChirho { rigChirho.routeChirho.waitingCountChirho == 2 })

        rigChirho.routeChirho.finishChirho(.activeChirho)
        await firstChirho.value
        #expect(rigChirho.routeChirho.activeChirho, "the newer On's output is not given back")
        #expect(controllerChirho.stateChirho.phaseChirho == .startingChirho)

        rigChirho.routeChirho.finishChirho(.activeChirho)
        await secondChirho.value
        #expect(controllerChirho.stateChirho.phaseChirho == .loadingChirho)
        #expect(rigChirho.transportChirho.loadsChirho.count == 1)
        #expect(rigChirho.routeChirho.activeChirho)
    }

    // MARK: Invariant: stale events cannot move a newer track

    @Test("Events from a replaced stream change nothing")
    func staleEventsAreIgnoredChirho() async throws {
        let rigChirho = await playingRigChirho()
        let controllerChirho = rigChirho.controllerChirho
        rigChirho.transportChirho.sendChirho(.progressChirho(secondsChirho: 100))
        controllerChirho.tuneChirho(toStationIdChirho: "partial-b")
        let stateChirho = controllerChirho.stateChirho
        let followedChirho = controllerChirho.followedChirho
        for eventChirho: TransportEventChirho in [
            .endedChirho, .failedChirho(.unplayableChirho), .failedChirho(.networkChirho),
            .playingChirho, .progressChirho(secondsChirho: 500),
            .readyChirho(durationSecondsChirho: 10), .waitingChirho, .stoppedBySystemChirho
        ] {
            rigChirho.transportChirho.sendChirho(eventChirho, loadIndexChirho: 0)
        }
        #expect(controllerChirho.stateChirho == stateChirho)
        #expect(controllerChirho.followedChirho == followedChirho)
        #expect(rigChirho.transportChirho.loadsChirho.count == 2)
    }

    @Test("An older stream's timeout cannot fail the stream that replaced it")
    func staleTimeoutIsIgnoredChirho() async throws {
        let rigChirho = rigChirho()
        let controllerChirho = rigChirho.controllerChirho
        await controllerChirho.launchChirho()
        controllerChirho.tuneChirho(toStationIdChirho: "full-c")
        rigChirho.transportChirho.sendChirho(.readyChirho(durationSecondsChirho: 600))
        rigChirho.transportChirho.sendChirho(.playingChirho)
        try await settleChirho(0.4)
        #expect(controllerChirho.stateChirho.phaseChirho == .playingChirho)
    }

    @Test("A stream that never sounds fails within the bound and lets go")
    func silentStreamTimesOutChirho() async throws {
        let rigChirho = rigChirho()
        await rigChirho.controllerChirho.launchChirho()
        #expect(try await untilChirho { rigChirho.controllerChirho.stateChirho.phaseChirho == .errorChirho })
        #expect(rigChirho.controllerChirho.stateChirho.messageChirho == RadioMessagesChirho.slowChirho)
        #expect(rigChirho.transportChirho.logChirho.last == "clear")
    }

    // MARK: Listening on

    @Test("The end of a chapter plays the next one and the listener follows it")
    func chapterEndAdvancesChirho() async throws {
        let rigChirho = await playingRigChirho()
        rigChirho.transportChirho.sendChirho(.endedChirho)
        #expect(rigChirho.transportChirho.lastUrlChirho == "https://a.example/JHN/4.mp3")
        #expect(rigChirho.transportChirho.loadsChirho.last?.playChirho == true)
        #expect(rigChirho.controllerChirho.followedChirho.refChirho == FixturesChirho.refChirho("JHN", 4))
    }

    @Test("The same verse is carried between two timed recordings")
    func verseIsCarriedChirho() async throws {
        let timingsChirho = FakeTimingsChirho(filesChirho: [
            URL(string: "https://a.example/JHN/3.json")!: Data(#"{"verses":[0,10,20,30]}"#.utf8),
            URL(string: "https://c.example/JHN/3.json")!: Data(#"{"verses":[0,15,30,45]}"#.utf8)
        ])
        let rigChirho = rigChirho(timingsChirho: timingsChirho)
        let controllerChirho = rigChirho.controllerChirho
        await controllerChirho.launchChirho()
        let firstTimingsChirho = try #require(URL(string: "https://a.example/JHN/3.json"))
        #expect(try await untilChirho { controllerChirho.timingsCacheChirho[firstTimingsChirho] != nil })
        rigChirho.transportChirho.sendChirho(.readyChirho(durationSecondsChirho: 40))
        rigChirho.transportChirho.sendChirho(.playingChirho)
        rigChirho.transportChirho.sendChirho(.progressChirho(secondsChirho: 25))
        #expect(controllerChirho.stateChirho.verseChirho == 3)

        controllerChirho.tuneChirho(toStationIdChirho: "full-c")
        rigChirho.transportChirho.sendChirho(.readyChirho(durationSecondsChirho: 60))
        #expect(try await untilChirho { !rigChirho.transportChirho.seeksChirho.isEmpty })
        // Half way through verse 3 there is half way through verse 3 here: 30 + (15 - 0.1) / 2.
        let seekChirho = try #require(rigChirho.transportChirho.seeksChirho.last)
        #expect(abs(seekChirho - 37.45) < 0.001)
        #expect(rigChirho.transportChirho.logChirho.last == "play")
    }

    @Test("An interruption pauses, and the platform's word resumes the same stream")
    func interruptionResumesChirho() async throws {
        let rigChirho = await playingRigChirho()
        rigChirho.controllerChirho.interruptionBeganChirho()
        #expect(rigChirho.controllerChirho.stateChirho.phaseChirho == .offChirho)
        await rigChirho.controllerChirho.interruptionEndedChirho(shouldResumeChirho: true)
        #expect(rigChirho.transportChirho.loadsChirho.count == 1)
        #expect(rigChirho.transportChirho.logChirho.last == "play")
    }

    @Test("Headphones coming out stop the radio for good")
    func lostOutputDoesNotResumeChirho() async throws {
        let rigChirho = await playingRigChirho()
        rigChirho.controllerChirho.outputLostChirho()
        await rigChirho.controllerChirho.interruptionEndedChirho(shouldResumeChirho: true)
        #expect(rigChirho.controllerChirho.stateChirho.phaseChirho == .offChirho)
        #expect(rigChirho.transportChirho.logChirho.last == "pause")
    }

    @Test("Previous and next chapter wrap round the canon")
    func chaptersWrapChirho() async throws {
        let rigChirho = RadioRigChirho(
            catalogueChirho: catalogueChirho,
            rememberedChirho: RadioRigChirho.rememberedChirho("full-a", FixturesChirho.refChirho("GEN", 1)))
        rigChirho.controllerChirho.previousChapterChirho()
        #expect(rigChirho.controllerChirho.stateChirho.refChirho == FixturesChirho.refChirho("REV", 22))
        rigChirho.controllerChirho.nextChapterChirho()
        #expect(rigChirho.controllerChirho.stateChirho.refChirho == FixturesChirho.refChirho("GEN", 1))
        #expect(rigChirho.transportChirho.loadsChirho.isEmpty)
    }

    @Test("A book the station lacks is not chosen")
    func missingBookIsRefusedChirho() async throws {
        let rigChirho = RadioRigChirho(
            catalogueChirho: catalogueChirho,
            rememberedChirho: RadioRigChirho.rememberedChirho("partial-b", FixturesChirho.refChirho("MAT", 2)))
        rigChirho.controllerChirho.chooseBookChirho("JHN")
        #expect(rigChirho.controllerChirho.stateChirho.refChirho == FixturesChirho.refChirho("MAT", 2))
        #expect(rigChirho.controllerChirho.stateChirho.messageChirho == RadioMessagesChirho.bookMissingChirho)
    }
}
