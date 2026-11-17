// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// The platform's audio services going away and coming back, over a fake transport and route. The
// radio holds its place and never moves to another chapter for it, rebuilds only once the services
// return, and makes at most one start of its own, which Off always overrides. These are decisions:
// an actual reset is a device check. Part of
// spec-chirho/workflows-chirho/experience-chirho/native_players_workflow_chirho.md.

import Foundation
import Testing

@testable import RadioCoreChirho

@MainActor
@Suite("Audio services lost and reset", .serialized)
struct ServicesResetTestsChirho {
    let johnThreeChirho = FixturesChirho.refChirho("JHN", 3)

    private func rigChirho(secondsChirho: Double = 0, explicitOffChirho: Bool = false) -> RadioRigChirho {
        RadioRigChirho(
            catalogueChirho: FixturesChirho.radioChirho,
            rememberedChirho: RadioRigChirho.rememberedChirho(
                "full-a", johnThreeChirho, secondsChirho: secondsChirho,
                explicitOffChirho: explicitOffChirho))
    }

    /// Opens the app at John 3, `secondsChirho` in, and lets it sound.
    private func playingRigChirho(secondsChirho: Double = 0) async -> RadioRigChirho {
        let rigChirho = rigChirho(secondsChirho: secondsChirho)
        await rigChirho.controllerChirho.launchChirho()
        rigChirho.transportChirho.sendChirho(.readyChirho(durationSecondsChirho: 600))
        rigChirho.transportChirho.sendChirho(.playingChirho)
        return rigChirho
    }

    @Test("The platform's services error is neither a bad file nor the connection")
    func servicesErrorIsItsOwnKindChirho() {
        let servicesChirho = (domainChirho: "AVFoundationErrorDomain", codeChirho: -11819)
        let directChirho = NSError(domain: "AVFoundationErrorDomain", code: -11819)
        let wrappedChirho = NSError(
            domain: "AVFoundationErrorDomain", code: -11800,
            userInfo: [NSUnderlyingErrorKey: directChirho])
        #expect(
            TransportFailureChirho.classifyChirho(directChirho, servicesErrorChirho: servicesChirho)
                == .servicesChirho)
        #expect(
            TransportFailureChirho.classifyChirho(wrappedChirho, servicesErrorChirho: servicesChirho)
                == .servicesChirho)
        // The same code from another domain, or with no services error named, is still a bad file.
        let elsewhereChirho = NSError(domain: "ElsewhereDomainChirho", code: -11819)
        #expect(
            TransportFailureChirho.classifyChirho(elsewhereChirho, servicesErrorChirho: servicesChirho)
                == .unplayableChirho)
        #expect(TransportFailureChirho.classifyChirho(directChirho) == .unplayableChirho)
        let timedOutChirho = NSError(domain: NSURLErrorDomain, code: NSURLErrorTimedOut)
        #expect(
            TransportFailureChirho.classifyChirho(timedOutChirho, servicesErrorChirho: servicesChirho)
                == .networkChirho)
    }

    @Test("A stream lost with the services keeps its place and never skips to another chapter")
    func servicesFailureHoldsPlaceChirho() async throws {
        let rigChirho = rigChirho(secondsChirho: 120)
        let controllerChirho = rigChirho.controllerChirho
        await controllerChirho.launchChirho()
        rigChirho.transportChirho.sendChirho(.readyChirho(durationSecondsChirho: 600))
        // It fails before any sound, where an unplayable file would move on to John 4.
        rigChirho.transportChirho.sendChirho(.failedChirho(.servicesChirho))
        #expect(rigChirho.transportChirho.loadsChirho.count == 1)
        #expect(controllerChirho.stateChirho.refChirho == johnThreeChirho)
        #expect(controllerChirho.stateChirho.secondsChirho == 120)
        #expect(controllerChirho.stateChirho.phaseChirho == .offChirho)
        #expect(controllerChirho.stateChirho.messageChirho == RadioMessagesChirho.servicesChirho)
        #expect(rigChirho.transportChirho.logChirho.last == "clear")
        let storedChirho = try #require(rigChirho.storedChirho())
        #expect(storedChirho.refChirho == johnThreeChirho)
        #expect(storedChirho.secondsChirho == 120)
        #expect(!storedChirho.explicitOffChirho)
        // Nothing waits on the dead stream: its load bound cannot turn the hold into a failure.
        try await settleChirho(0.4)
        #expect(controllerChirho.stateChirho.phaseChirho == .offChirho)
    }

    @Test("When the services return the player is rebuilt and the radio plays once more at its place")
    func servicesReturnResumesOnceChirho() async throws {
        let rigChirho = await playingRigChirho()
        let controllerChirho = rigChirho.controllerChirho
        rigChirho.transportChirho.sendChirho(.progressChirho(secondsChirho: 300))
        rigChirho.transportChirho.sendChirho(.failedChirho(.servicesChirho))
        // Nothing is rebuilt while the services are away.
        #expect(!rigChirho.transportChirho.logChirho.contains("rebuild"))
        rigChirho.transportChirho.clearLogChirho()
        await controllerChirho.servicesResetChirho()
        #expect(rigChirho.transportChirho.logChirho == ["rebuild", "load"])
        #expect(rigChirho.transportChirho.loadsChirho.count == 2)
        let loadChirho = try #require(rigChirho.transportChirho.loadsChirho.last)
        #expect(loadChirho.urlChirho.absoluteString == "https://a.example/JHN/3.mp3")
        #expect(loadChirho.startSecondsChirho == 300)
        #expect(loadChirho.playChirho)
        #expect(controllerChirho.stateChirho.phaseChirho == .loadingChirho)
        #expect(controllerChirho.stateChirho.messageChirho.isEmpty)
        // The dead stream's late word changes nothing.
        let stateChirho = controllerChirho.stateChirho
        rigChirho.transportChirho.sendChirho(.failedChirho(.unplayableChirho), loadIndexChirho: 0)
        #expect(controllerChirho.stateChirho == stateChirho)
        rigChirho.transportChirho.sendChirho(.readyChirho(durationSecondsChirho: 600))
        rigChirho.transportChirho.sendChirho(.playingChirho)
        #expect(controllerChirho.stateChirho.phaseChirho == .playingChirho)
    }

    @Test("Services that go away without a failing stream are held and resumed the same way")
    func servicesLostThenResetChirho() async throws {
        // The platform says the services went away, then that they are back.
        let lostChirho = await playingRigChirho(secondsChirho: 45)
        lostChirho.transportChirho.clearLogChirho()
        lostChirho.controllerChirho.servicesLostChirho()
        #expect(lostChirho.transportChirho.logChirho == ["clear"])
        #expect(lostChirho.controllerChirho.stateChirho.phaseChirho == .offChirho)
        await lostChirho.controllerChirho.servicesResetChirho()
        #expect(lostChirho.transportChirho.logChirho == ["clear", "rebuild", "load"])
        #expect(lostChirho.transportChirho.loadsChirho.last?.startSecondsChirho == 45)

        // It says only that they are back.
        let resetChirho = await playingRigChirho(secondsChirho: 45)
        resetChirho.transportChirho.clearLogChirho()
        await resetChirho.controllerChirho.servicesResetChirho()
        #expect(resetChirho.transportChirho.logChirho == ["clear", "rebuild", "load"])
        #expect(resetChirho.transportChirho.loadsChirho.last?.startSecondsChirho == 45)
    }

    @Test("A pause the platform reported just before the loss still owes the one start")
    func pauseBeforeLossStillResumesChirho() async throws {
        let rigChirho = await playingRigChirho(secondsChirho: 75)
        rigChirho.transportChirho.sendChirho(.stoppedBySystemChirho)
        rigChirho.transportChirho.sendChirho(.failedChirho(.servicesChirho))
        #expect(rigChirho.controllerChirho.stateChirho.messageChirho == RadioMessagesChirho.servicesChirho)
        await rigChirho.controllerChirho.servicesResetChirho()
        #expect(rigChirho.transportChirho.loadsChirho.count == 2)
        #expect(rigChirho.transportChirho.loadsChirho.last?.startSecondsChirho == 75)
    }

    @Test("An announced interruption keeps its own resume: the services' return makes no start")
    func interruptionKeepsItsOwnResumeChirho() async throws {
        let rigChirho = await playingRigChirho(secondsChirho: 15)
        let controllerChirho = rigChirho.controllerChirho
        controllerChirho.interruptionBeganChirho()
        await controllerChirho.servicesResetChirho()
        #expect(rigChirho.transportChirho.logChirho.contains("rebuild"))
        #expect(rigChirho.transportChirho.loadsChirho.count == 1)
        #expect(controllerChirho.stateChirho.phaseChirho == .offChirho)
        // The interruption's own end, with the platform's word, plays the kept place on the new player.
        await controllerChirho.interruptionEndedChirho(shouldResumeChirho: true)
        #expect(rigChirho.transportChirho.loadsChirho.count == 2)
        #expect(rigChirho.transportChirho.loadsChirho.last?.startSecondsChirho == 15)
    }

    @Test("Off while the services are away, or while the one start chooses an output, stays Off")
    func offWinsOverRecoveryChirho() async throws {
        // Off during the hold: the services return to a radio the listener turned off.
        let heldChirho = await playingRigChirho(secondsChirho: 60)
        heldChirho.transportChirho.sendChirho(.failedChirho(.servicesChirho))
        heldChirho.controllerChirho.offChirho()
        await heldChirho.controllerChirho.servicesResetChirho()
        #expect(heldChirho.transportChirho.logChirho.contains("rebuild"))
        #expect(heldChirho.transportChirho.loadsChirho.count == 1)
        #expect(heldChirho.controllerChirho.stateChirho.phaseChirho == .offChirho)
        #expect(heldChirho.storedChirho()?.explicitOffChirho == true)

        // Off while the one start is still choosing its output.
        let choosingChirho = await playingRigChirho(secondsChirho: 60)
        choosingChirho.transportChirho.sendChirho(.failedChirho(.servicesChirho))
        choosingChirho.routeChirho.holdChirho = true
        let recoveryChirho = Task { await choosingChirho.controllerChirho.servicesResetChirho() }
        #expect(try await untilChirho { choosingChirho.routeChirho.isWaitingChirho })
        choosingChirho.controllerChirho.offChirho()
        choosingChirho.routeChirho.finishChirho(.activeChirho)
        await recoveryChirho.value
        #expect(choosingChirho.transportChirho.loadsChirho.count == 1)
        #expect(choosingChirho.controllerChirho.stateChirho.phaseChirho == .offChirho)
        #expect(!choosingChirho.routeChirho.activeChirho)
        #expect(choosingChirho.storedChirho()?.explicitOffChirho == true)
    }

    @Test("An output lost while the one start chooses its output cancels that start")
    func outputLostCancelsOwedStartChirho() async throws {
        let rigChirho = await playingRigChirho(secondsChirho: 50)
        let controllerChirho = rigChirho.controllerChirho
        rigChirho.transportChirho.sendChirho(.failedChirho(.servicesChirho))
        rigChirho.routeChirho.holdChirho = true
        let recoveryChirho = Task { await controllerChirho.servicesResetChirho() }
        #expect(try await untilChirho { rigChirho.routeChirho.isWaitingChirho })
        controllerChirho.outputLostChirho()
        #expect(controllerChirho.stateChirho.phaseChirho == .offChirho)
        rigChirho.routeChirho.finishChirho(.activeChirho)
        await recoveryChirho.value
        #expect(rigChirho.transportChirho.loadsChirho.count == 1)
        #expect(controllerChirho.stateChirho.phaseChirho == .offChirho)
        #expect(!rigChirho.routeChirho.activeChirho)
        let storedChirho = try #require(rigChirho.storedChirho())
        #expect(!storedChirho.explicitOffChirho)
        #expect(storedChirho.refChirho == johnThreeChirho)
        #expect(storedChirho.secondsChirho == 50)
        // A lost output is not resumed by an interruption's end either.
        await controllerChirho.interruptionEndedChirho(shouldResumeChirho: true)
        #expect(rigChirho.transportChirho.loadsChirho.count == 1)
    }

    @Test("A radio that was off stays off when the services return")
    func offRadioStaysOffChirho() async throws {
        let rigChirho = rigChirho(secondsChirho: 30, explicitOffChirho: true)
        await rigChirho.controllerChirho.launchChirho()
        await rigChirho.controllerChirho.servicesResetChirho()
        #expect(rigChirho.transportChirho.logChirho == ["rebuild"])
        #expect(rigChirho.controllerChirho.stateChirho.phaseChirho == .offChirho)
        #expect(rigChirho.controllerChirho.stateChirho.messageChirho.isEmpty)
        #expect(rigChirho.storedChirho()?.explicitOffChirho == true)
    }

    @Test("One start of its own: a second loss before any sound waits for the listener")
    func recoveryIsBoundedChirho() async throws {
        let rigChirho = await playingRigChirho(secondsChirho: 90)
        let controllerChirho = rigChirho.controllerChirho
        rigChirho.transportChirho.sendChirho(.failedChirho(.servicesChirho))
        await controllerChirho.servicesResetChirho()
        #expect(rigChirho.transportChirho.loadsChirho.count == 2)
        // The restarted stream is lost too before it sounds: no second start of its own.
        rigChirho.transportChirho.sendChirho(.failedChirho(.servicesChirho))
        await controllerChirho.servicesResetChirho()
        #expect(rigChirho.transportChirho.loadsChirho.count == 2)
        #expect(controllerChirho.stateChirho.phaseChirho == .offChirho)
        #expect(controllerChirho.stateChirho.messageChirho == RadioMessagesChirho.servicesChirho)
        // The listener's On plays; once it has sounded, a later loss is recovered once more.
        await controllerChirho.onChirho()
        #expect(rigChirho.transportChirho.loadsChirho.count == 3)
        rigChirho.transportChirho.sendChirho(.readyChirho(durationSecondsChirho: 600))
        rigChirho.transportChirho.sendChirho(.playingChirho)
        rigChirho.transportChirho.sendChirho(.failedChirho(.servicesChirho))
        await controllerChirho.servicesResetChirho()
        #expect(rigChirho.transportChirho.loadsChirho.count == 4)
        #expect(rigChirho.transportChirho.loadsChirho.last?.startSecondsChirho == 90)
    }
}
