// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

package io.audiobiblerad.radiochirho.corechirho

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

// The controller's promises, run against stand-ins for the platform: the remembered place, Off,
// recovery, stalls, timers, saving, the Sound switch and quiet system commands.
class RadioControllerChirhoTest {
    private class RigChirho(val storeChirho: FakeStoreChirho = FakeStoreChirho()) {
        val catalogueChirho = testCatalogueChirho()
        val audioChirho = FakeAudioChirho()
        val effectsChirho = FakeEffectsChirho()
        val clockChirho = FakeClockChirho()
        val radioChirho = RadioControllerChirho(catalogueChirho, audioChirho, effectsChirho, clockChirho, storeChirho, "en") {}
        val stateChirho: RadioStateChirho get() = radioChirho.stateChirho
        val generationChirho: Int get() = audioChirho.lastChirho.generationChirho

        fun savedChirho(): RememberedChirho =
            RememberedCodecChirho.readChirho(storeChirho.valuesChirho[RadioControllerChirho.PLACE_KEY_CHIRHO], catalogueChirho)!!

        fun placeSavesChirho(): Int =
            storeChirho.writtenKeysChirho.count { keyChirho -> keyChirho == RadioControllerChirho.PLACE_KEY_CHIRHO }

        /** The latest load gets its length, then is heard. */
        fun hearChirho(lengthMsChirho: Long = 200_000) {
            audioChirho.lengthMsChirho = lengthMsChirho
            radioChirho.onReadyChirho(generationChirho)
            radioChirho.onPlayingChirho(generationChirho)
        }
    }

    private fun rememberingChirho(currentChirho: PositionChirho, followedChirho: PositionChirho?): FakeStoreChirho =
        FakeStoreChirho().apply {
            valuesChirho[RadioControllerChirho.PLACE_KEY_CHIRHO] =
                RememberedCodecChirho.writeChirho(RememberedChirho(currentChirho, followedChirho, true))
        }

    private fun rememberingChirho(placeChirho: PlaceChirho, secondsChirho: Double, durationChirho: Double): FakeStoreChirho {
        val positionChirho = PositionChirho("alpha-chirho", placeChirho, secondsChirho, durationChirho)
        return rememberingChirho(positionChirho, positionChirho)
    }

    @Test
    fun aStationTurnWhileOffKeepsTheFollowedFractionForTheNextOnChirho() {
        val rigChirho = RigChirho()
        rigChirho.radioChirho.onChirho(FeedbackChirho.CLICK_CHIRHO)
        assertEquals(PlaceChirho("JHN", 1), rigChirho.audioChirho.lastChirho.placeChirho)
        rigChirho.hearChirho(200_000)
        rigChirho.audioChirho.clockMsChirho = 50_000
        rigChirho.radioChirho.offChirho(FeedbackChirho.CLICK_CHIRHO)
        val loadsChirho = rigChirho.audioChirho.loadsChirho.size
        rigChirho.radioChirho.chooseStationChirho("beta-chirho", FeedbackChirho.KNOB_CHIRHO)
        assertEquals("nothing loads while Off", loadsChirho, rigChirho.audioChirho.loadsChirho.size)
        rigChirho.radioChirho.onChirho(FeedbackChirho.CLICK_CHIRHO)
        val loadChirho = rigChirho.audioChirho.lastChirho
        assertEquals(PlaceChirho("JHN", 1), loadChirho.placeChirho)
        assertTrue(loadChirho.urlChirho.contains("/beta/"))
        assertFalse("a fraction waits for the new recording's length", loadChirho.playChirho)
        rigChirho.audioChirho.callsChirho.clear()
        rigChirho.audioChirho.lengthMsChirho = 400_000
        rigChirho.radioChirho.onReadyChirho(loadChirho.generationChirho)
        assertEquals(listOf("seek:100000", "play"), rigChirho.audioChirho.callsChirho)
    }

    @Test
    fun aNarrationChosenWhileOffKeepsTheFollowedFractionAcrossARestartChirho() {
        val storeChirho = FakeStoreChirho()
        val firstChirho = RigChirho(storeChirho)
        firstChirho.radioChirho.onChirho(FeedbackChirho.CLICK_CHIRHO)
        firstChirho.hearChirho(200_000)
        firstChirho.audioChirho.clockMsChirho = 50_000
        firstChirho.radioChirho.offChirho(FeedbackChirho.CLICK_CHIRHO)
        firstChirho.radioChirho.chooseStationChirho("beta-chirho", FeedbackChirho.KNOB_CHIRHO)
        firstChirho.radioChirho.disposeChirho()
        val secondChirho = RigChirho(storeChirho)
        secondChirho.radioChirho.onChirho(FeedbackChirho.CLICK_CHIRHO)
        val loadChirho = secondChirho.audioChirho.lastChirho
        assertEquals(PlaceChirho("JHN", 1), loadChirho.placeChirho)
        assertTrue(loadChirho.urlChirho.contains("/beta/"))
        assertFalse("after a restart the fraction still waits for beta's length", loadChirho.playChirho)
        secondChirho.audioChirho.callsChirho.clear()
        secondChirho.audioChirho.lengthMsChirho = 400_000
        secondChirho.radioChirho.onReadyChirho(loadChirho.generationChirho)
        assertEquals(listOf("seek:100000", "play"), secondChirho.audioChirho.callsChirho)
    }

    @Test
    fun anAlreadyPlayedNarrationAndOlderMemoryResumeAtTheirOwnSecondsChirho() {
        val playedChirho = RigChirho(
            rememberingChirho(
                PositionChirho("beta-chirho", PlaceChirho("JHN", 1), 40.0, 400.0),
                PositionChirho("alpha-chirho", PlaceChirho("JHN", 1), 50.0, 200.0)
            )
        )
        playedChirho.radioChirho.onChirho(FeedbackChirho.NONE_CHIRHO)
        assertEquals(40_000L, playedChirho.audioChirho.lastChirho.startMsChirho)
        assertTrue(playedChirho.audioChirho.lastChirho.playChirho)
        val olderChirho = RigChirho(rememberingChirho(PositionChirho("alpha-chirho", PlaceChirho("JHN", 2), 30.0, 300.0), null))
        olderChirho.radioChirho.onChirho(FeedbackChirho.NONE_CHIRHO)
        assertEquals(30_000L, olderChirho.audioChirho.lastChirho.startMsChirho)
        assertTrue(olderChirho.audioChirho.lastChirho.playChirho)
        // Seconds of its own with no length yet is still a place of its own, not an unplayed one.
        val placedChirho = RigChirho(
            rememberingChirho(
                PositionChirho("beta-chirho", PlaceChirho("JHN", 1), 25.0, 0.0),
                PositionChirho("alpha-chirho", PlaceChirho("JHN", 1), 50.0, 200.0)
            )
        )
        placedChirho.radioChirho.onChirho(FeedbackChirho.NONE_CHIRHO)
        assertEquals(25_000L, placedChirho.audioChirho.lastChirho.startMsChirho)
        assertTrue(placedChirho.audioChirho.lastChirho.playChirho)
    }

    @Test
    fun aResumeThatSoundsAtOnceStaysPlayingWithNoLaterStallChirho() {
        val rigChirho = RigChirho()
        rigChirho.radioChirho.onChirho(FeedbackChirho.NONE_CHIRHO)
        rigChirho.hearChirho()
        rigChirho.radioChirho.offChirho(FeedbackChirho.NONE_CHIRHO)
        // The player resumes inside play() and reports it before play() returns.
        rigChirho.audioChirho.onPlayHookChirho = { rigChirho.radioChirho.onPlayingChirho(rigChirho.generationChirho) }
        rigChirho.radioChirho.onChirho(FeedbackChirho.NONE_CHIRHO)
        assertEquals(PhaseChirho.PLAYING_CHIRHO, rigChirho.stateChirho.phaseChirho)
        assertEquals("only the save timer is left", 1, rigChirho.clockChirho.pendingChirho)
        rigChirho.clockChirho.advanceChirho(RadioControllerChirho.LOAD_TIMEOUT_MS_CHIRHO + 1_000)
        assertEquals(PhaseChirho.PLAYING_CHIRHO, rigChirho.stateChirho.phaseChirho)
        assertEquals(ProblemChirho.NONE_CHIRHO, rigChirho.stateChirho.problemChirho)
    }

    @Test
    fun aLoadThatSoundsAtOnceLeavesOnlyTheSaveTimerChirho() {
        val rigChirho = RigChirho()
        // The player is ready and playing before load() returns.
        rigChirho.audioChirho.onLoadHookChirho = { loadChirho ->
            rigChirho.audioChirho.lengthMsChirho = 200_000
            rigChirho.radioChirho.onReadyChirho(loadChirho.generationChirho)
            rigChirho.radioChirho.onPlayingChirho(loadChirho.generationChirho)
        }
        rigChirho.radioChirho.onChirho(FeedbackChirho.NONE_CHIRHO)
        assertEquals(PhaseChirho.PLAYING_CHIRHO, rigChirho.stateChirho.phaseChirho)
        assertEquals("only the save timer is left", 1, rigChirho.clockChirho.pendingChirho)
        rigChirho.clockChirho.advanceChirho(RadioControllerChirho.LOAD_TIMEOUT_MS_CHIRHO + 1_000)
        assertEquals(PhaseChirho.PLAYING_CHIRHO, rigChirho.stateChirho.phaseChirho)
        assertEquals(ProblemChirho.NONE_CHIRHO, rigChirho.stateChirho.problemChirho)
    }

    @Test
    fun recoveryKeepsTheRememberedPlaceUntilAReplacementPlaysChirho() {
        val rigChirho = RigChirho(rememberingChirho(PlaceChirho("JHN", 2), 30.0, 300.0))
        rigChirho.radioChirho.onChirho(FeedbackChirho.CLICK_CHIRHO)
        assertEquals(30_000L, rigChirho.audioChirho.lastChirho.startMsChirho)
        val cuesChirho = rigChirho.effectsChirho.callsChirho.count { callChirho -> callChirho == "tuning" }
        rigChirho.radioChirho.onFailedChirho(rigChirho.generationChirho, FailureChirho.MISSING_CHIRHO)
        assertEquals(PlaceChirho("JHN", 3), rigChirho.audioChirho.lastChirho.placeChirho)
        assertEquals(
            "recovery is quiet", cuesChirho,
            rigChirho.effectsChirho.callsChirho.count { callChirho -> callChirho == "tuning" }
        )
        assertTrue(rigChirho.stateChirho.recoveringChirho)
        rigChirho.radioChirho.saveChirho()
        assertEquals(PositionChirho("alpha-chirho", PlaceChirho("JHN", 2), 30.0, 300.0), rigChirho.savedChirho().currentChirho)
        assertEquals(PlaceChirho("JHN", 2), rigChirho.savedChirho().followedChirho?.placeChirho)
        rigChirho.radioChirho.onFailedChirho(rigChirho.generationChirho, FailureChirho.MISSING_CHIRHO)
        assertEquals(PlaceChirho("JHN", 4), rigChirho.audioChirho.lastChirho.placeChirho)
        rigChirho.hearChirho()
        assertFalse(rigChirho.stateChirho.recoveringChirho)
        assertEquals(PlaceChirho("JHN", 4), rigChirho.savedChirho().currentChirho?.placeChirho)
        assertEquals(PlaceChirho("JHN", 4), rigChirho.savedChirho().followedChirho?.placeChirho)
    }

    @Test
    fun exhaustedRecoveryReturnsToTheRememberedPlaceAndWaitsForARetryChirho() {
        val rigChirho = RigChirho(rememberingChirho(PlaceChirho("JHN", 2), 30.0, 300.0))
        rigChirho.radioChirho.onChirho(FeedbackChirho.CLICK_CHIRHO)
        repeat(RadioControllerChirho.RECOVERY_LIMIT_CHIRHO + 1) {
            rigChirho.radioChirho.onFailedChirho(rigChirho.generationChirho, FailureChirho.MISSING_CHIRHO)
        }
        assertEquals(RadioControllerChirho.RECOVERY_LIMIT_CHIRHO + 1, rigChirho.audioChirho.loadsChirho.size)
        assertEquals(PhaseChirho.ERROR_CHIRHO, rigChirho.stateChirho.phaseChirho)
        assertEquals(ProblemChirho.SIGNAL_CHIRHO, rigChirho.stateChirho.problemChirho)
        assertFalse(rigChirho.stateChirho.poweredChirho)
        assertEquals(PlaceChirho("JHN", 2), rigChirho.stateChirho.placeChirho)
        assertTrue("unload" in rigChirho.audioChirho.callsChirho)
        assertEquals(PositionChirho("alpha-chirho", PlaceChirho("JHN", 2), 30.0, 300.0), rigChirho.savedChirho().currentChirho)
        rigChirho.radioChirho.onChirho(FeedbackChirho.CLICK_CHIRHO)
        assertEquals(PlaceChirho("JHN", 2), rigChirho.audioChirho.lastChirho.placeChirho)
        assertEquals(30_000L, rigChirho.audioChirho.lastChirho.startMsChirho)
    }

    @Test
    fun offDuringRecoveryReturnsToTheRememberedPlaceStaysOffAndIgnoresLateEventsChirho() {
        val rigChirho = RigChirho(rememberingChirho(PlaceChirho("JHN", 2), 30.0, 300.0))
        rigChirho.radioChirho.onChirho(FeedbackChirho.CLICK_CHIRHO)
        rigChirho.radioChirho.onFailedChirho(rigChirho.generationChirho, FailureChirho.MISSING_CHIRHO)
        val attemptChirho = rigChirho.generationChirho
        rigChirho.radioChirho.offChirho(FeedbackChirho.NONE_CHIRHO)
        assertEquals(PlaceChirho("JHN", 2), rigChirho.stateChirho.placeChirho)
        assertEquals(PhaseChirho.READY_CHIRHO, rigChirho.stateChirho.phaseChirho)
        rigChirho.audioChirho.callsChirho.clear()
        rigChirho.radioChirho.onReadyChirho(attemptChirho)
        rigChirho.radioChirho.onPlayingChirho(attemptChirho)
        rigChirho.radioChirho.onEndedChirho(attemptChirho)
        rigChirho.radioChirho.onFailedChirho(attemptChirho, FailureChirho.MISSING_CHIRHO)
        assertEquals(2, rigChirho.audioChirho.loadsChirho.size)
        assertEquals(emptyList<String>(), rigChirho.audioChirho.callsChirho)
        assertFalse(rigChirho.stateChirho.poweredChirho)
        assertEquals(PositionChirho("alpha-chirho", PlaceChirho("JHN", 2), 30.0, 300.0), rigChirho.savedChirho().currentChirho)
        rigChirho.radioChirho.onChirho(FeedbackChirho.CLICK_CHIRHO)
        assertEquals(PlaceChirho("JHN", 2), rigChirho.audioChirho.lastChirho.placeChirho)
        assertEquals(30_000L, rigChirho.audioChirho.lastChirho.startMsChirho)
    }

    @Test
    fun aFailingSignalKeepsThePlaceInsteadOfSkippingChaptersChirho() {
        val rigChirho = RigChirho(rememberingChirho(PlaceChirho("JHN", 2), 30.0, 300.0))
        rigChirho.radioChirho.onChirho(FeedbackChirho.NONE_CHIRHO)
        rigChirho.radioChirho.onFailedChirho(rigChirho.generationChirho, FailureChirho.SIGNAL_CHIRHO)
        assertEquals(1, rigChirho.audioChirho.loadsChirho.size)
        assertEquals(ProblemChirho.SIGNAL_CHIRHO, rigChirho.stateChirho.problemChirho)
        assertEquals(PlaceChirho("JHN", 2), rigChirho.stateChirho.placeChirho)
    }

    @Test
    fun aLoadThatNeverStartsStopsAfterFifteenSecondsAndNoTimerOutlivesItsPurposeChirho() {
        val rigChirho = RigChirho()
        rigChirho.radioChirho.onChirho(FeedbackChirho.NONE_CHIRHO)
        assertEquals(1, rigChirho.clockChirho.pendingChirho)
        rigChirho.clockChirho.advanceChirho(RadioControllerChirho.LOAD_TIMEOUT_MS_CHIRHO - 1)
        assertEquals(PhaseChirho.LOADING_CHIRHO, rigChirho.stateChirho.phaseChirho)
        rigChirho.clockChirho.advanceChirho(1)
        assertEquals(ProblemChirho.STALLED_CHIRHO, rigChirho.stateChirho.problemChirho)
        assertTrue("unload" in rigChirho.audioChirho.callsChirho)
        assertEquals(0, rigChirho.clockChirho.pendingChirho)
        rigChirho.radioChirho.onChirho(FeedbackChirho.NONE_CHIRHO)
        rigChirho.hearChirho()
        rigChirho.clockChirho.advanceChirho(20_000)
        assertEquals(PhaseChirho.PLAYING_CHIRHO, rigChirho.stateChirho.phaseChirho)
        assertEquals("only the save timer runs while playing", 1, rigChirho.clockChirho.pendingChirho)
        rigChirho.radioChirho.onBufferingChirho(rigChirho.generationChirho)
        rigChirho.clockChirho.advanceChirho(RadioControllerChirho.LOAD_TIMEOUT_MS_CHIRHO)
        assertEquals("a stream stuck that long stops too", ProblemChirho.STALLED_CHIRHO, rigChirho.stateChirho.problemChirho)
        assertEquals(0, rigChirho.clockChirho.pendingChirho)
        rigChirho.radioChirho.onChirho(FeedbackChirho.NONE_CHIRHO)
        rigChirho.hearChirho()
        rigChirho.radioChirho.offChirho(FeedbackChirho.NONE_CHIRHO)
        assertEquals(0, rigChirho.clockChirho.pendingChirho)
    }

    @Test
    fun progressIsSavedEveryFiveSecondsWhilePlayingAndNotWhileOffChirho() {
        val rigChirho = RigChirho()
        rigChirho.radioChirho.onChirho(FeedbackChirho.NONE_CHIRHO)
        rigChirho.hearChirho(200_000)
        val startChirho = rigChirho.placeSavesChirho()
        rigChirho.audioChirho.clockMsChirho = 4_000
        rigChirho.clockChirho.advanceChirho(RadioControllerChirho.SAVE_EVERY_MS_CHIRHO - 1)
        assertEquals(startChirho, rigChirho.placeSavesChirho())
        rigChirho.audioChirho.clockMsChirho = 5_000
        rigChirho.clockChirho.advanceChirho(1)
        assertEquals(startChirho + 1, rigChirho.placeSavesChirho())
        assertEquals(5.0, rigChirho.savedChirho().currentChirho!!.secondsChirho, 0.001)
        rigChirho.audioChirho.clockMsChirho = 12_000
        rigChirho.clockChirho.advanceChirho(RadioControllerChirho.SAVE_EVERY_MS_CHIRHO)
        assertEquals(startChirho + 2, rigChirho.placeSavesChirho())
        assertEquals(12.0, rigChirho.savedChirho().followedChirho!!.secondsChirho, 0.001)
        rigChirho.radioChirho.offChirho(FeedbackChirho.NONE_CHIRHO)
        val offChirho = rigChirho.placeSavesChirho()
        rigChirho.clockChirho.advanceChirho(60_000)
        assertEquals(offChirho, rigChirho.placeSavesChirho())
    }

    @Test
    fun theSoundSwitchIsTheControllersAndIsRememberedChirho() {
        val storeChirho = FakeStoreChirho()
        val rigChirho = RigChirho(storeChirho)
        rigChirho.radioChirho.setSoundsChirho(false)
        assertFalse(rigChirho.stateChirho.soundsEnabledChirho)
        assertEquals("enabled:false", rigChirho.effectsChirho.callsChirho.last())
        assertFalse(rigChirho.savedChirho().soundsEnabledChirho)
        val reopenedChirho = RigChirho(storeChirho)
        assertFalse(reopenedChirho.stateChirho.soundsEnabledChirho)
        assertEquals(listOf("enabled:false"), reopenedChirho.effectsChirho.callsChirho)
    }

    @Test
    fun systemCommandsAreQuietAndOnScreenCommandsAreHeardChirho() {
        val rigChirho = RigChirho()
        rigChirho.radioChirho.onChirho(FeedbackChirho.NONE_CHIRHO)
        rigChirho.hearChirho()
        rigChirho.radioChirho.nextChirho(FeedbackChirho.NONE_CHIRHO)
        rigChirho.radioChirho.offChirho(FeedbackChirho.NONE_CHIRHO)
        assertTrue(
            rigChirho.effectsChirho.callsChirho.none { callChirho ->
                callChirho == "tuning" || callChirho == "click" || callChirho == "knob"
            }
        )
        assertTrue("silence" in rigChirho.effectsChirho.callsChirho)
        rigChirho.effectsChirho.callsChirho.clear()
        rigChirho.radioChirho.onChirho(FeedbackChirho.CLICK_CHIRHO)
        assertEquals("resuming a paused chapter is not a new tune", listOf("click"), rigChirho.effectsChirho.callsChirho)
        val freshChirho = RigChirho()
        freshChirho.effectsChirho.callsChirho.clear()
        freshChirho.radioChirho.onChirho(FeedbackChirho.CLICK_CHIRHO)
        assertTrue("click" in freshChirho.effectsChirho.callsChirho && "tuning" in freshChirho.effectsChirho.callsChirho)
    }

    @Test
    fun aChapterEndAdvancesQuietlyMovesTheFollowedPlaceAndWrapsAtTheEndChirho() {
        val rigChirho = RigChirho(rememberingChirho(PlaceChirho("REV", 2), 0.0, 0.0))
        rigChirho.radioChirho.onChirho(FeedbackChirho.NONE_CHIRHO)
        rigChirho.hearChirho()
        rigChirho.effectsChirho.callsChirho.clear()
        rigChirho.radioChirho.onEndedChirho(rigChirho.generationChirho)
        assertEquals(PlaceChirho("GEN", 1), rigChirho.audioChirho.lastChirho.placeChirho)
        assertTrue(rigChirho.audioChirho.lastChirho.playChirho)
        assertFalse("tuning" in rigChirho.effectsChirho.callsChirho)
        assertTrue(rigChirho.stateChirho.poweredChirho)
        assertEquals(PlaceChirho("GEN", 1), rigChirho.savedChirho().followedChirho?.placeChirho)
    }

    @Test
    fun openingTheScreenPlaysOnceUnlessTheLastChoiceWasOffChirho() {
        val offChirho = RigChirho(FakeStoreChirho().apply { valuesChirho[RadioControllerChirho.POWER_KEY_CHIRHO] = "off" })
        offChirho.radioChirho.autoplayChirho()
        assertTrue(offChirho.audioChirho.loadsChirho.isEmpty())
        val rigChirho = RigChirho()
        rigChirho.effectsChirho.callsChirho.clear()
        rigChirho.radioChirho.autoplayChirho()
        rigChirho.radioChirho.autoplayChirho()
        assertEquals(1, rigChirho.audioChirho.loadsChirho.size)
        assertTrue("autoplay never plays a tuning cue", rigChirho.effectsChirho.callsChirho.isEmpty())
    }

    @Test
    fun aSystemPauseTurnsTheRadioOffQuietlyAndIsRememberedChirho() {
        val rigChirho = RigChirho()
        rigChirho.radioChirho.onChirho(FeedbackChirho.NONE_CHIRHO)
        rigChirho.hearChirho()
        rigChirho.radioChirho.onSystemPausedChirho(rigChirho.generationChirho)
        assertFalse(rigChirho.stateChirho.poweredChirho)
        assertEquals("pause", rigChirho.audioChirho.callsChirho.last())
        assertEquals("off", rigChirho.storeChirho.valuesChirho[RadioControllerChirho.POWER_KEY_CHIRHO])
        assertTrue("silence" in rigChirho.effectsChirho.callsChirho)
    }

    @Test
    fun aDetourStationNeverMovesTheFollowedPlaceAndItsOldEventsAreIgnoredChirho() {
        val rigChirho = RigChirho()
        rigChirho.radioChirho.onChirho(FeedbackChirho.NONE_CHIRHO)
        rigChirho.hearChirho(200_000)
        val johnChirho = rigChirho.generationChirho
        rigChirho.audioChirho.clockMsChirho = 50_000
        rigChirho.radioChirho.chooseStationChirho("gamma-chirho", FeedbackChirho.KNOB_CHIRHO)
        assertEquals("a station without John lands on its next chapter", PlaceChirho("REV", 1), rigChirho.stateChirho.placeChirho)
        val loadsChirho = rigChirho.audioChirho.loadsChirho.size
        rigChirho.radioChirho.onEndedChirho(johnChirho)
        rigChirho.radioChirho.onFailedChirho(johnChirho, FailureChirho.MISSING_CHIRHO)
        assertEquals(loadsChirho, rigChirho.audioChirho.loadsChirho.size)
        rigChirho.hearChirho(100_000)
        rigChirho.radioChirho.seekChirho(30.0)
        val followedChirho = rigChirho.savedChirho().followedChirho!!
        assertEquals(PlaceChirho("JHN", 1), followedChirho.placeChirho)
        assertEquals(50.0, followedChirho.secondsChirho, 0.001)
        rigChirho.radioChirho.chooseStationChirho("alpha-chirho", FeedbackChirho.KNOB_CHIRHO)
        assertEquals("turning back returns to the followed passage", PlaceChirho("JHN", 1), rigChirho.stateChirho.placeChirho)
    }

    @Test
    fun clicksAlwaysSoundWhileTicksWaitForQuietAndShareWithinSixtyMillisecondsChirho() {
        val gateChirho = InterfaceGateChirho()
        assertTrue(gateChirho.knobChirho(1_000, 160))
        assertFalse(gateChirho.knobChirho(1_050, 160))
        assertFalse("a tick under way is not restarted", gateChirho.knobChirho(1_100, 160))
        assertTrue(gateChirho.knobChirho(1_160, 160))
        assertTrue(gateChirho.clickChirho(1_200, 280))
        assertFalse("a tick never cuts a click", gateChirho.knobChirho(1_300, 160))
        gateChirho.clearChirho()
        assertTrue(gateChirho.knobChirho(1_301, 160))
    }
}
