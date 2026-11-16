// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

package io.audiobiblerad.radiochirho.corechirho

// The few things the radio needs from the platform, so its behaviour runs and is tested without
// Android. The service supplies ExoPlayer, SoundPool, a main-thread clock and SharedPreferences.
// See spec-chirho/workflows-chirho/experience-chirho/native_players_workflow_chirho.md.

/** One chapter to play, with what the system controls show for it. */
data class TrackChirho(
    val stationChirho: StationChirho,
    val placeChirho: PlaceChirho,
    val urlChirho: String,
    val titleChirho: String
)

/** Why a track failed: the file is gone or unreadable, or the signal failed and may come back. */
enum class FailureChirho { MISSING_CHIRHO, SIGNAL_CHIRHO }

interface AudioPortChirho {
    /** Replaces whatever is loaded. Every later event about this track carries [generationChirho]. */
    fun loadChirho(generationChirho: Int, trackChirho: TrackChirho, startMsChirho: Long, playChirho: Boolean)
    fun playChirho()
    fun pauseChirho()
    fun seekChirho(positionMsChirho: Long)
    /** Stops and lets go of the track, so nothing of it can sound or report again. */
    fun unloadChirho()
    fun positionMsChirho(): Long
    /** The track's length, or null while it is unknown. */
    fun durationMsChirho(): Long?
}

/** What the audio port reports, each with the generation of the track it is about. */
interface AudioEventsChirho {
    fun onReadyChirho(generationChirho: Int)
    fun onPlayingChirho(generationChirho: Int)
    fun onBufferingChirho(generationChirho: Int)
    fun onEndedChirho(generationChirho: Int)
    fun onFailedChirho(generationChirho: Int, failureChirho: FailureChirho)
    /** The platform paused by itself: headphones unplugged, or another app took the audio. */
    fun onSystemPausedChirho(generationChirho: Int)
}

interface EffectsPortChirho {
    fun setEnabledChirho(enabledChirho: Boolean)
    fun tuningChirho()
    fun stopTuningChirho()
    fun clickChirho()
    fun knobChirho()
    fun silenceChirho()
    fun disposeChirho()
}

interface ClockPortChirho {
    fun nowMsChirho(): Long
    /** Runs [taskChirho] once after [delayMsChirho]; calling the answer cancels it. */
    fun scheduleChirho(delayMsChirho: Long, taskChirho: () -> Unit): () -> Unit
}

/** Device storage. A read may answer null and a write may fail; neither may stop listening. */
interface StorePortChirho {
    fun readChirho(keyChirho: String): String?
    fun writeChirho(keyChirho: String, valueChirho: String)
}

/** The sound an on-screen control makes. System controls make none. */
enum class FeedbackChirho { NONE_CHIRHO, CLICK_CHIRHO, KNOB_CHIRHO }

enum class PhaseChirho { READY_CHIRHO, LOADING_CHIRHO, PLAYING_CHIRHO, PAUSED_CHIRHO, ERROR_CHIRHO }

enum class ProblemChirho { NONE_CHIRHO, SIGNAL_CHIRHO, STALLED_CHIRHO }

/** What the screen and the system controls show. The controller is its only author. */
data class RadioStateChirho(
    val stationIdChirho: String,
    val placeChirho: PlaceChirho,
    val phaseChirho: PhaseChirho,
    val poweredChirho: Boolean,
    val problemChirho: ProblemChirho,
    val soundsEnabledChirho: Boolean,
    val recoveringChirho: Boolean
)

/**
 * Whether a click or knob tick may sound, as on the web: a click always sounds and replaces a
 * tick; a tick waits while any click or tick is still sounding, and ticks closer than 60 ms share
 * one. One stream at a time, so nothing stacks.
 */
class InterfaceGateChirho {
    private var soundingUntilMsChirho = Long.MIN_VALUE
    private var lastKnobMsChirho = Long.MIN_VALUE / 2

    fun clickChirho(nowMsChirho: Long, lengthMsChirho: Long): Boolean {
        soundingUntilMsChirho = nowMsChirho + lengthMsChirho
        return true
    }

    fun knobChirho(nowMsChirho: Long, lengthMsChirho: Long): Boolean {
        if (nowMsChirho - lastKnobMsChirho < KNOB_SPACING_MS_CHIRHO) return false
        if (nowMsChirho < soundingUntilMsChirho) return false
        lastKnobMsChirho = nowMsChirho
        soundingUntilMsChirho = nowMsChirho + lengthMsChirho
        return true
    }

    /** Everything was stopped, so the next tick need not wait. */
    fun clearChirho() {
        soundingUntilMsChirho = Long.MIN_VALUE
    }

    companion object {
        const val KNOB_SPACING_MS_CHIRHO = 60L
    }
}
