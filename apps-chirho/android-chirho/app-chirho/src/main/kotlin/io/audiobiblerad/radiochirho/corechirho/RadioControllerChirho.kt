// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

package io.audiobiblerad.radiochirho.corechirho

// The Android radio's one controller: power, tuning, chapters, recovery and memory. It follows
// the web player (src/lib/player-chirho/radio_player_chirho.ts) as described in
// spec-chirho/workflows-chirho/tune_in_workflow_chirho.md, for chapters played from one file:
// - The followed place changes only by an explicit passage choice or by chapter progression. A
//   station turn lands from it, keeps its fraction, and never overwrites it.
// - An unavailable chapter gets at most three quiet attempts on the chapters after it. Saved
//   progress keeps the place from before them until a replacement plays; exhausted attempts, any
//   other failure, a stall and Off all return to that place.
// - A load that does not start within 15 s, or a stream stuck that long, stops for a retry.
// - Progress is saved at most every 5 s while playing, and at every meaningful change.
// - Nothing loads while Off, so a pending start (seconds or fraction) waits for the next On.
// - System commands are quiet. On-screen commands may play a click, a knob tick or a tuning cue.
class RadioControllerChirho(
    private val catalogueChirho: CatalogueChirho,
    private val audioChirho: AudioPortChirho,
    private val effectsChirho: EffectsPortChirho,
    private val clockChirho: ClockPortChirho,
    private val storeChirho: StorePortChirho,
    languageChirho: String,
    private val onChangeChirho: (RadioStateChirho) -> Unit
) : AudioEventsChirho {
    private sealed interface StartChirho {
        data class SecondsChirho(val secondsChirho: Double) : StartChirho
        data class FractionChirho(val fractionChirho: Double) : StartChirho
    }

    /** The place saved progress returns to when recovery fails: where it was before the first attempt. */
    private data class CheckpointChirho(
        val stationChirho: StationChirho,
        val currentChirho: PositionChirho,
        val followedChirho: PositionChirho
    )

    private var stationChirho: StationChirho
    private var placeChirho: PlaceChirho
    private var secondsChirho = 0.0
    private var durationChirho = 0.0
    private var followedChirho: PositionChirho
    private var soundsEnabledChirho: Boolean
    private var pendingStartChirho: StartChirho? = null
    private var loadStartMsChirho = 0L
    private var poweredChirho = false
    private var phaseChirho = PhaseChirho.READY_CHIRHO
    private var problemChirho = ProblemChirho.NONE_CHIRHO
    private var loadedChirho = false
    private var generationChirho = 0
    private var checkpointChirho: CheckpointChirho? = null
    private var attemptsChirho = 0
    private var timeoutCancelChirho: (() -> Unit)? = null
    private var saveCancelChirho: (() -> Unit)? = null
    private var autoplayUsedChirho = false
    private var disposedChirho = false

    init {
        val rememberedChirho = RememberedCodecChirho.readChirho(readChirho(PLACE_KEY_CHIRHO), catalogueChirho)
        val currentChirho = rememberedChirho?.currentChirho
        stationChirho = currentChirho?.let { savedChirho -> catalogueChirho.stationsByIdChirho[savedChirho.stationIdChirho] }
            ?: catalogueChirho.initialStationChirho(languageChirho)
        val wantedChirho = currentChirho?.placeChirho ?: DEFAULT_PLACE_CHIRHO
        placeChirho = catalogueChirho.atOrAfterChirho(stationChirho, wantedChirho)
            ?: error("a built-in station offers no chapter")
        val followedSavedChirho = rememberedChirho?.followedChirho
        if (currentChirho != null && placeChirho == wantedChirho) {
            secondsChirho = currentChirho.secondsChirho
            durationChirho = currentChirho.durationChirho
            // A narration chosen while Off and never played (the followed chapter on another
            // station, with neither seconds nor a length of its own yet) starts at the followed
            // fraction, as it would have before the restart. Anything with a place of its own, and
            // older memory, resumes at its own seconds.
            val unplayedChirho = followedSavedChirho != null &&
                followedSavedChirho.placeChirho == placeChirho &&
                followedSavedChirho.stationIdChirho != currentChirho.stationIdChirho &&
                followedSavedChirho.durationChirho > 0 &&
                currentChirho.secondsChirho == 0.0 &&
                currentChirho.durationChirho == 0.0
            pendingStartChirho = if (unplayedChirho)
                StartChirho.FractionChirho(followedSavedChirho.fractionChirho)
            else StartChirho.SecondsChirho(secondsChirho)
        }
        followedChirho = followedSavedChirho ?: currentPositionChirho()
        soundsEnabledChirho = rememberedChirho?.soundsEnabledChirho ?: true
        effectsChirho.setEnabledChirho(soundsEnabledChirho)
    }

    val stateChirho: RadioStateChirho
        get() = RadioStateChirho(
            stationChirho.idChirho, placeChirho, phaseChirho, poweredChirho, problemChirho,
            soundsEnabledChirho, checkpointChirho != null
        )

    // Commands. On-screen controls pass their feedback; system controls pass NONE.

    fun onChirho(feedbackChirho: FeedbackChirho) {
        if (disposedChirho) return
        writeChirho(POWER_KEY_CHIRHO, "on")
        if (feedbackChirho != FeedbackChirho.NONE_CHIRHO) effectsChirho.clickChirho()
        if (poweredChirho) return
        poweredChirho = true
        problemChirho = ProblemChirho.NONE_CHIRHO
        if (loadedChirho && phaseChirho == PhaseChirho.PAUSED_CHIRHO) {
            // Waiting comes first: a player that resumes inside play() reports playing at once,
            // and that report must be the last word, with no failure timer left behind it.
            phaseChirho = PhaseChirho.LOADING_CHIRHO
            armTimeoutChirho()
            // A start still waiting for the track's length plays once the length arrives.
            if (pendingStartChirho == null) audioChirho.playChirho()
        } else {
            loadChirho(tuningChirho = feedbackChirho != FeedbackChirho.NONE_CHIRHO)
        }
        emitChirho()
    }

    fun offChirho(feedbackChirho: FeedbackChirho) {
        if (disposedChirho) return
        writeChirho(POWER_KEY_CHIRHO, "off")
        sampleChirho()
        poweredChirho = false
        cancelTimersChirho()
        if (checkpointChirho != null) {
            // Off during recovery lets the attempt go and returns to the place before it.
            releaseTrackChirho()
            restoreCheckpointChirho()
        } else if (loadedChirho) {
            audioChirho.pauseChirho()
        }
        phaseChirho = if (loadedChirho) PhaseChirho.PAUSED_CHIRHO else PhaseChirho.READY_CHIRHO
        problemChirho = ProblemChirho.NONE_CHIRHO
        effectsChirho.stopTuningChirho()
        if (feedbackChirho != FeedbackChirho.NONE_CHIRHO) effectsChirho.clickChirho() else effectsChirho.silenceChirho()
        saveChirho()
        emitChirho()
    }

    fun chooseStationChirho(stationIdChirho: String, feedbackChirho: FeedbackChirho) {
        if (disposedChirho) return
        val nextChirho = catalogueChirho.stationsByIdChirho[stationIdChirho] ?: return
        if (nextChirho.idChirho == stationChirho.idChirho) return
        val landingChirho = catalogueChirho.atOrAfterChirho(nextChirho, followedChirho.placeChirho) ?: return
        sampleChirho()
        // A failed attempt never moved the followed place, so dropping recovery loses nothing.
        clearRecoveryChirho()
        stationChirho = nextChirho
        placeChirho = landingChirho
        secondsChirho = 0.0
        durationChirho = 0.0
        pendingStartChirho = if (landingChirho == followedChirho.placeChirho && followedChirho.durationChirho > 0)
            StartChirho.FractionChirho(followedChirho.fractionChirho) else null
        changePlaceChirho(feedbackChirho)
    }

    fun chooseChapterChirho(placeChirho: PlaceChirho, feedbackChirho: FeedbackChirho) {
        if (disposedChirho || catalogueChirho.resolveChirho(stationChirho, placeChirho) == null) return
        sampleChirho()
        clearRecoveryChirho()
        this.placeChirho = placeChirho
        secondsChirho = 0.0
        durationChirho = 0.0
        pendingStartChirho = null
        followedChirho = currentPositionChirho()
        changePlaceChirho(feedbackChirho)
    }

    fun nextChirho(feedbackChirho: FeedbackChirho) {
        catalogueChirho.nextChirho(stationChirho, placeChirho)?.let { nextPlaceChirho -> chooseChapterChirho(nextPlaceChirho, feedbackChirho) }
    }

    fun previousChirho(feedbackChirho: FeedbackChirho) {
        catalogueChirho.previousChirho(stationChirho, placeChirho)?.let { previousPlaceChirho -> chooseChapterChirho(previousPlaceChirho, feedbackChirho) }
    }

    /** Moves within the current chapter. Seeking on a detour station leaves the followed place alone. */
    fun seekChirho(targetSecondsChirho: Double) {
        if (disposedChirho || !targetSecondsChirho.isFinite()) return
        val knownMsChirho = if (loadedChirho) audioChirho.durationMsChirho() else null
        val lengthChirho = knownMsChirho?.takeIf { msChirho -> msChirho > 0 }?.div(1000.0)
            ?: durationChirho.takeIf { knownSecondsChirho -> knownSecondsChirho > 0 } ?: return
        val clampedChirho = targetSecondsChirho.coerceIn(0.0, maxOf(0.0, lengthChirho - 0.1))
        if (loadedChirho && pendingStartChirho == null) audioChirho.seekChirho((clampedChirho * 1000).toLong())
        else pendingStartChirho = StartChirho.SecondsChirho(clampedChirho)
        secondsChirho = clampedChirho
        if (placeChirho == followedChirho.placeChirho) followedChirho = currentPositionChirho()
        saveChirho()
        emitChirho()
    }

    fun setSoundsChirho(enabledChirho: Boolean) {
        if (disposedChirho) return
        soundsEnabledChirho = enabledChirho
        effectsChirho.setEnabledChirho(enabledChirho)
        if (enabledChirho) effectsChirho.clickChirho()
        saveChirho()
        emitChirho()
    }

    /** Opening the screen starts listening, as the web does where it may, unless the last choice was Off. */
    fun autoplayChirho() {
        if (disposedChirho || autoplayUsedChirho) return
        autoplayUsedChirho = true
        if (poweredChirho || readChirho(POWER_KEY_CHIRHO) == "off") return
        onChirho(FeedbackChirho.NONE_CHIRHO)
    }

    /** Remembers the last measured place; during recovery, the place from before it. */
    fun saveChirho() {
        if (disposedChirho) return
        sampleChirho()
        val checkpointChirho = checkpointChirho
        val rememberedChirho = if (checkpointChirho != null)
            RememberedChirho(checkpointChirho.currentChirho, checkpointChirho.followedChirho, soundsEnabledChirho)
        else RememberedChirho(currentPositionChirho(), followedChirho, soundsEnabledChirho)
        writeChirho(PLACE_KEY_CHIRHO, RememberedCodecChirho.writeChirho(rememberedChirho))
    }

    fun disposeChirho() {
        if (disposedChirho) return
        saveChirho()
        disposedChirho = true
        generationChirho += 1
        cancelTimersChirho()
        effectsChirho.disposeChirho()
    }

    // Audio events. Anything about an older track is ignored.

    override fun onReadyChirho(generationChirho: Int) {
        if (staleChirho(generationChirho)) return
        val lengthMsChirho = audioChirho.durationMsChirho()?.takeIf { msChirho -> msChirho > 0 }
        lengthMsChirho?.let { msChirho -> durationChirho = msChirho / 1000.0 }
        val startChirho = pendingStartChirho ?: return
        pendingStartChirho = null
        val targetMsChirho = when (startChirho) {
            is StartChirho.FractionChirho -> lengthMsChirho?.let { msChirho -> (startChirho.fractionChirho * msChirho).toLong() } ?: 0L
            is StartChirho.SecondsChirho -> (startChirho.secondsChirho * 1000).toLong()
        }
        val boundedMsChirho = lengthMsChirho?.let { msChirho -> targetMsChirho.coerceIn(0L, maxOf(0L, msChirho - 100)) } ?: targetMsChirho
        if (boundedMsChirho != loadStartMsChirho) audioChirho.seekChirho(boundedMsChirho)
        secondsChirho = boundedMsChirho / 1000.0
        if (poweredChirho) audioChirho.playChirho()
    }

    override fun onPlayingChirho(generationChirho: Int) {
        if (staleChirho(generationChirho)) return
        cancelTimeoutChirho()
        if (!poweredChirho) {
            audioChirho.pauseChirho()
            return
        }
        phaseChirho = PhaseChirho.PLAYING_CHIRHO
        problemChirho = ProblemChirho.NONE_CHIRHO
        effectsChirho.stopTuningChirho()
        if (checkpointChirho != null) {
            // The recovered chapter is committed only now that it plays: progression moves the followed place.
            checkpointChirho = null
            attemptsChirho = 0
            followedChirho = currentPositionChirho()
        }
        saveChirho()
        armSaveChirho()
        emitChirho()
    }

    override fun onBufferingChirho(generationChirho: Int) {
        if (staleChirho(generationChirho) || !poweredChirho || phaseChirho != PhaseChirho.PLAYING_CHIRHO) return
        sampleChirho()
        phaseChirho = PhaseChirho.LOADING_CHIRHO
        cancelSaveChirho()
        armTimeoutChirho()
        emitChirho()
    }

    override fun onEndedChirho(generationChirho: Int) {
        if (staleChirho(generationChirho)) return
        cancelTimersChirho()
        val nextChirho = catalogueChirho.nextChirho(stationChirho, placeChirho)
        if (!poweredChirho || nextChirho == null) {
            phaseChirho = PhaseChirho.PAUSED_CHIRHO
            emitChirho()
            return
        }
        // Chapter progression: quiet, keeps the power on, and moves the followed place.
        placeChirho = nextChirho
        secondsChirho = 0.0
        durationChirho = 0.0
        pendingStartChirho = null
        followedChirho = currentPositionChirho()
        saveChirho()
        loadChirho(tuningChirho = false)
        emitChirho()
    }

    override fun onFailedChirho(generationChirho: Int, failureChirho: FailureChirho) {
        if (staleChirho(generationChirho)) return
        cancelTimersChirho()
        sampleChirho()
        val nextChirho = catalogueChirho.nextChirho(stationChirho, placeChirho)
        if (failureChirho == FailureChirho.MISSING_CHIRHO && poweredChirho && attemptsChirho < RECOVERY_LIMIT_CHIRHO &&
            nextChirho != null && nextChirho != placeChirho
        ) {
            if (checkpointChirho == null)
                checkpointChirho = CheckpointChirho(stationChirho, currentPositionChirho(), followedChirho)
            attemptsChirho += 1
            placeChirho = nextChirho
            secondsChirho = 0.0
            durationChirho = 0.0
            pendingStartChirho = null
            loadChirho(tuningChirho = false)
            emitChirho()
            return
        }
        stopChirho(ProblemChirho.SIGNAL_CHIRHO)
    }

    override fun onSystemPausedChirho(generationChirho: Int) {
        if (staleChirho(generationChirho) || !poweredChirho) return
        offChirho(FeedbackChirho.NONE_CHIRHO)
    }

    // Internals.

    private fun staleChirho(generationChirho: Int): Boolean =
        disposedChirho || generationChirho != this.generationChirho

    /** Starts the current place from its pending start. Only while powered. */
    private fun loadChirho(tuningChirho: Boolean) {
        val urlChirho = catalogueChirho.resolveChirho(stationChirho, placeChirho)
        if (urlChirho == null) {
            stopChirho(ProblemChirho.SIGNAL_CHIRHO)
            return
        }
        generationChirho += 1
        cancelTimersChirho()
        problemChirho = ProblemChirho.NONE_CHIRHO
        phaseChirho = PhaseChirho.LOADING_CHIRHO
        loadedChirho = true
        if (tuningChirho) effectsChirho.tuningChirho()
        val startChirho = pendingStartChirho
        loadStartMsChirho = if (startChirho is StartChirho.SecondsChirho) (startChirho.secondsChirho * 1000).toLong() else 0L
        val bookChirho = catalogueChirho.booksByIdChirho.getValue(placeChirho.bookIdChirho)
        // The failure timer starts before the player is asked, so a player that is ready and
        // playing before load() returns cancels it like any other.
        armTimeoutChirho()
        audioChirho.loadChirho(
            generationChirho,
            TrackChirho(stationChirho, placeChirho, urlChirho, "${bookChirho.nameChirho} ${placeChirho.chapterChirho}"),
            loadStartMsChirho,
            // A fraction needs the track's length first, so that load starts paused and plays once placed.
            playChirho = startChirho !is StartChirho.FractionChirho
        )
    }

    /** After a station or passage change: load it while powered, otherwise let go of the old track. */
    private fun changePlaceChirho(feedbackChirho: FeedbackChirho) {
        when (feedbackChirho) {
            FeedbackChirho.KNOB_CHIRHO -> effectsChirho.knobChirho()
            FeedbackChirho.CLICK_CHIRHO -> effectsChirho.clickChirho()
            FeedbackChirho.NONE_CHIRHO -> Unit
        }
        if (poweredChirho) {
            loadChirho(tuningChirho = feedbackChirho != FeedbackChirho.NONE_CHIRHO)
        } else {
            releaseTrackChirho()
            phaseChirho = PhaseChirho.READY_CHIRHO
            problemChirho = ProblemChirho.NONE_CHIRHO
        }
        saveChirho()
        emitChirho()
    }

    /** Stops for a retry: unloads, returns from any recovery, and keeps the place to resume from. */
    private fun stopChirho(problemChirho: ProblemChirho) {
        sampleChirho()
        releaseTrackChirho()
        effectsChirho.stopTuningChirho()
        restoreCheckpointChirho()
        pendingStartChirho = StartChirho.SecondsChirho(secondsChirho)
        poweredChirho = false
        phaseChirho = PhaseChirho.ERROR_CHIRHO
        this.problemChirho = problemChirho
        saveChirho()
        emitChirho()
    }

    /** Lets go of the loaded track and fences every event still on its way from it. */
    private fun releaseTrackChirho() {
        generationChirho += 1
        cancelTimersChirho()
        if (loadedChirho) audioChirho.unloadChirho()
        loadedChirho = false
    }

    private fun restoreCheckpointChirho() {
        val checkpointChirho = checkpointChirho ?: return
        clearRecoveryChirho()
        stationChirho = checkpointChirho.stationChirho
        placeChirho = checkpointChirho.currentChirho.placeChirho
        secondsChirho = checkpointChirho.currentChirho.secondsChirho
        durationChirho = checkpointChirho.currentChirho.durationChirho
        followedChirho = checkpointChirho.followedChirho
        pendingStartChirho = StartChirho.SecondsChirho(secondsChirho)
    }

    private fun clearRecoveryChirho() {
        checkpointChirho = null
        attemptsChirho = 0
    }

    /** Reads the audio clock only once a track has started from its start, never while it loads. */
    private fun sampleChirho() {
        if (!loadedChirho || pendingStartChirho != null) return
        if (phaseChirho != PhaseChirho.PLAYING_CHIRHO && phaseChirho != PhaseChirho.PAUSED_CHIRHO) return
        audioChirho.durationMsChirho()?.takeIf { msChirho -> msChirho > 0 }?.let { msChirho -> durationChirho = msChirho / 1000.0 }
        secondsChirho = (audioChirho.positionMsChirho() / 1000.0).coerceAtLeast(0.0)
        if (checkpointChirho == null && placeChirho == followedChirho.placeChirho) followedChirho = currentPositionChirho()
    }

    private fun currentPositionChirho(): PositionChirho =
        PositionChirho(stationChirho.idChirho, placeChirho, secondsChirho, durationChirho)

    private fun armTimeoutChirho() {
        cancelTimeoutChirho()
        val armedChirho = generationChirho
        timeoutCancelChirho = clockChirho.scheduleChirho(LOAD_TIMEOUT_MS_CHIRHO) {
            timeoutCancelChirho = null
            if (!staleChirho(armedChirho)) stopChirho(ProblemChirho.STALLED_CHIRHO)
        }
    }

    private fun armSaveChirho() {
        cancelSaveChirho()
        val armedChirho = generationChirho
        saveCancelChirho = clockChirho.scheduleChirho(SAVE_EVERY_MS_CHIRHO) {
            saveCancelChirho = null
            if (!staleChirho(armedChirho) && phaseChirho == PhaseChirho.PLAYING_CHIRHO) {
                saveChirho()
                armSaveChirho()
            }
        }
    }

    private fun cancelTimeoutChirho() {
        timeoutCancelChirho?.invoke()
        timeoutCancelChirho = null
    }

    private fun cancelSaveChirho() {
        saveCancelChirho?.invoke()
        saveCancelChirho = null
    }

    private fun cancelTimersChirho() {
        cancelTimeoutChirho()
        cancelSaveChirho()
    }

    private fun readChirho(keyChirho: String): String? = runCatching { storeChirho.readChirho(keyChirho) }.getOrNull()

    private fun writeChirho(keyChirho: String, valueChirho: String) {
        runCatching { storeChirho.writeChirho(keyChirho, valueChirho) }
    }

    private fun emitChirho() {
        if (!disposedChirho) onChangeChirho(stateChirho)
    }

    companion object {
        const val LOAD_TIMEOUT_MS_CHIRHO = 15_000L
        const val SAVE_EVERY_MS_CHIRHO = 5_000L
        const val RECOVERY_LIMIT_CHIRHO = 3
        const val PLACE_KEY_CHIRHO = "radio_place_chirho"
        const val POWER_KEY_CHIRHO = "radio_power_chirho"
        val DEFAULT_PLACE_CHIRHO = PlaceChirho("JHN", 1)
    }
}
