// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// How the player transport reads its player's reports. The first two are the iPhone Simulator red
// of 2026-11-16: reopened at a remembered second, the radio went silently Off because a pause
// reported while the start still waited was taken for the platform's. These are decisions over
// plain values, not proof that a device plays sound.

import Foundation
import Testing

@testable import RadioCoreChirho

@Suite("The player intent")
struct PlayerIntentTestsChirho {
    private let rememberedSecondsChirho = 32.5

    /// A plain pause report from the player, neither failed nor at the chapter's end.
    private func pauseReportChirho(_ intentChirho: inout PlayerIntentChirho, _ generationChirho: Int) -> Bool {
        intentChirho.pausedChirho(generationChirho: generationChirho, failedChirho: false, atEndChirho: false)
    }

    @Test("A pause reported while a remembered start waits for its stream is the transport's own hold")
    func pauseBeforeReadyChirho() {
        var intentChirho = PlayerIntentChirho()
        let playNowChirho = intentChirho.loadChirho(startSecondsChirho: rememberedSecondsChirho, playChirho: true)
        let generationChirho = intentChirho.generationChirho
        let platformChirho = pauseReportChirho(&intentChirho, generationChirho)
        let seekChirho = intentChirho.readyChirho(generationChirho: generationChirho)
        let soundsChirho = intentChirho.startPlacedChirho(generationChirho: generationChirho)
        #expect(!playNowChirho)
        #expect(!platformChirho)
        #expect(seekChirho == rememberedSecondsChirho)
        #expect(soundsChirho)
        #expect(intentChirho.playerToldChirho)
    }

    @Test("A pause reported while the remembered start's seek is under way is the transport's own hold")
    func pauseDuringSeekChirho() {
        var intentChirho = PlayerIntentChirho()
        _ = intentChirho.loadChirho(startSecondsChirho: rememberedSecondsChirho, playChirho: true)
        let generationChirho = intentChirho.generationChirho
        let seekChirho = intentChirho.readyChirho(generationChirho: generationChirho)
        let platformChirho = pauseReportChirho(&intentChirho, generationChirho)
        let soundsChirho = intentChirho.startPlacedChirho(generationChirho: generationChirho)
        #expect(seekChirho == rememberedSecondsChirho)
        #expect(!platformChirho)
        #expect(soundsChirho)
    }

    @Test("Off then On while the remembered start's seek is under way sounds only once that seek reports back")
    func onWhileSeekingChirho() {
        var intentChirho = PlayerIntentChirho()
        _ = intentChirho.loadChirho(startSecondsChirho: rememberedSecondsChirho, playChirho: true)
        let generationChirho = intentChirho.generationChirho
        _ = intentChirho.readyChirho(generationChirho: generationChirho)
        intentChirho.pauseChirho()
        let onNowChirho = intentChirho.playChirho()
        let platformChirho = pauseReportChirho(&intentChirho, generationChirho)
        let soundsChirho = intentChirho.startPlacedChirho(generationChirho: generationChirho)
        #expect(!onNowChirho)
        #expect(!platformChirho)
        #expect(soundsChirho)
        #expect(intentChirho.playerToldChirho)
    }

    @Test("On while a remembered start still waits for its stream sounds only once the start is placed")
    func onWhileWaitingForStreamChirho() {
        var intentChirho = PlayerIntentChirho()
        let playNowChirho = intentChirho.loadChirho(startSecondsChirho: rememberedSecondsChirho, playChirho: false)
        let generationChirho = intentChirho.generationChirho
        let onNowChirho = intentChirho.playChirho()
        let seekChirho = intentChirho.readyChirho(generationChirho: generationChirho)
        let soundsChirho = intentChirho.startPlacedChirho(generationChirho: generationChirho)
        #expect(!playNowChirho)
        #expect(!onNowChirho)
        #expect(seekChirho == rememberedSecondsChirho)
        #expect(soundsChirho)
    }

    @Test("Once the player was told to play, a pause it did not ask for is the platform's, reported once")
    func genuinePauseChirho() {
        var intentChirho = PlayerIntentChirho()
        let playNowChirho = intentChirho.loadChirho(startSecondsChirho: nil, playChirho: true)
        let firstChirho = intentChirho.generationChirho
        let reportedChirho = pauseReportChirho(&intentChirho, firstChirho)
        let againChirho = pauseReportChirho(&intentChirho, firstChirho)
        #expect(playNowChirho)
        #expect(reportedChirho)
        #expect(!againChirho)

        _ = intentChirho.loadChirho(startSecondsChirho: rememberedSecondsChirho, playChirho: true)
        let secondChirho = intentChirho.generationChirho
        _ = intentChirho.readyChirho(generationChirho: secondChirho)
        let soundsChirho = intentChirho.startPlacedChirho(generationChirho: secondChirho)
        let laterChirho = pauseReportChirho(&intentChirho, secondChirho)
        #expect(soundsChirho)
        #expect(laterChirho)
    }

    @Test("Off or an interruption while the remembered start waits wins, and the placed start stays silent")
    func quietDuringStartChirho() {
        // Off and an interruption both reach the transport as the radio's own pause.
        var beforeReadyChirho = PlayerIntentChirho()
        _ = beforeReadyChirho.loadChirho(startSecondsChirho: rememberedSecondsChirho, playChirho: true)
        let firstChirho = beforeReadyChirho.generationChirho
        beforeReadyChirho.pauseChirho()
        let seekChirho = beforeReadyChirho.readyChirho(generationChirho: firstChirho)
        let soundsChirho = beforeReadyChirho.startPlacedChirho(generationChirho: firstChirho)
        let platformChirho = pauseReportChirho(&beforeReadyChirho, firstChirho)
        // On afterwards sounds from the start that was placed.
        let onChirho = beforeReadyChirho.playChirho()
        #expect(seekChirho == rememberedSecondsChirho)
        #expect(!soundsChirho)
        #expect(!platformChirho)
        #expect(onChirho)

        var duringSeekChirho = PlayerIntentChirho()
        _ = duringSeekChirho.loadChirho(startSecondsChirho: rememberedSecondsChirho, playChirho: true)
        let secondChirho = duringSeekChirho.generationChirho
        _ = duringSeekChirho.readyChirho(generationChirho: secondChirho)
        duringSeekChirho.pauseChirho()
        let lateSoundChirho = duringSeekChirho.startPlacedChirho(generationChirho: secondChirho)
        #expect(!lateSoundChirho)
        #expect(!duringSeekChirho.playerToldChirho)
    }

    @Test("The radio's own seek during the start's seek does not strand the start")
    func radioSeekDuringPlacementChirho() {
        // The player cancels the start's seek for the newer one and still reports it back.
        var intentChirho = PlayerIntentChirho()
        _ = intentChirho.loadChirho(startSecondsChirho: rememberedSecondsChirho, playChirho: true)
        let generationChirho = intentChirho.generationChirho
        _ = intentChirho.readyChirho(generationChirho: generationChirho)
        intentChirho.seekChirho()
        let soundsChirho = intentChirho.startPlacedChirho(generationChirho: generationChirho)
        #expect(soundsChirho)
        #expect(intentChirho.playerToldChirho)
    }

    @Test("A replaced or released stream's readiness and finished seek cannot sound or hold what came after")
    func staleStartChirho() {
        var intentChirho = PlayerIntentChirho()
        _ = intentChirho.loadChirho(startSecondsChirho: 10, playChirho: true)
        let olderChirho = intentChirho.generationChirho
        let olderSeekChirho = intentChirho.readyChirho(generationChirho: olderChirho)
        let playNowChirho = intentChirho.loadChirho(startSecondsChirho: 20, playChirho: true)
        let newerChirho = intentChirho.generationChirho
        let lateSoundChirho = intentChirho.startPlacedChirho(generationChirho: olderChirho)
        let lateSeekChirho = intentChirho.readyChirho(generationChirho: olderChirho)
        let latePauseChirho = pauseReportChirho(&intentChirho, olderChirho)
        #expect(olderSeekChirho == 10)
        #expect(!playNowChirho)
        #expect(!lateSoundChirho)
        #expect(lateSeekChirho == nil)
        #expect(!latePauseChirho)
        #expect(!intentChirho.playerToldChirho)
        let newerSeekChirho = intentChirho.readyChirho(generationChirho: newerChirho)
        #expect(newerSeekChirho == 20)

        // A placement cut short by a release holds nothing back from the next stream.
        intentChirho.clearChirho()
        let releasedSoundChirho = intentChirho.startPlacedChirho(generationChirho: newerChirho)
        _ = intentChirho.loadChirho(startSecondsChirho: nil, playChirho: false)
        let onNowChirho = intentChirho.playChirho()
        #expect(!releasedSoundChirho)
        #expect(onNowChirho)
        #expect(intentChirho.playerToldChirho)
    }
}
