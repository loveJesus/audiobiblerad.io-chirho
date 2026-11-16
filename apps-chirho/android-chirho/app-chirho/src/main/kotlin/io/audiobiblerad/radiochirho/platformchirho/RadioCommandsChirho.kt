// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

package io.audiobiblerad.radiochirho.platformchirho

import android.content.res.AssetManager
import android.os.Bundle
import io.audiobiblerad.radiochirho.corechirho.CATALOGUE_MAX_BYTES_CHIRHO
import io.audiobiblerad.radiochirho.corechirho.CatalogueChirho
import io.audiobiblerad.radiochirho.corechirho.FeedbackChirho
import io.audiobiblerad.radiochirho.corechirho.PhaseChirho
import io.audiobiblerad.radiochirho.corechirho.PlaceChirho
import io.audiobiblerad.radiochirho.corechirho.ProblemChirho
import io.audiobiblerad.radiochirho.corechirho.RadioStateChirho
import io.audiobiblerad.radiochirho.corechirho.parseCatalogueChirho

// The words the screen and the service share: the app's own commands, accepted only from this
// app, and the radio state the service publishes as session extras for every screen to show.

object RadioCommandsChirho {
    const val POWER_CHIRHO = "radio-power-chirho"
    const val STATION_CHIRHO = "radio-station-chirho"
    const val CHAPTER_CHIRHO = "radio-chapter-chirho"
    const val STEP_CHIRHO = "radio-step-chirho"
    const val SOUND_CHIRHO = "radio-sound-chirho"
    const val SAVE_CHIRHO = "radio-save-chirho"
    const val STATE_CHIRHO = "radio-state-chirho"
    const val AUTOPLAY_CHIRHO = "radio-autoplay-chirho"
    val ALL_CHIRHO = listOf(POWER_CHIRHO, STATION_CHIRHO, CHAPTER_CHIRHO, STEP_CHIRHO, SOUND_CHIRHO, SAVE_CHIRHO, STATE_CHIRHO, AUTOPLAY_CHIRHO)

    const val ON_KEY_CHIRHO = "on_chirho"
    const val STATION_KEY_CHIRHO = "station_id_chirho"
    const val BOOK_KEY_CHIRHO = "book_id_chirho"
    const val CHAPTER_KEY_CHIRHO = "chapter_chirho"
    const val NEXT_KEY_CHIRHO = "next_chirho"
    const val ENABLED_KEY_CHIRHO = "enabled_chirho"
    const val FEEDBACK_KEY_CHIRHO = "feedback_chirho"
    private const val PHASE_KEY_CHIRHO = "phase_chirho"
    private const val POWERED_KEY_CHIRHO = "powered_chirho"
    private const val PROBLEM_KEY_CHIRHO = "problem_chirho"
    private const val SOUNDS_KEY_CHIRHO = "sounds_chirho"
    private const val RECOVERING_KEY_CHIRHO = "recovering_chirho"

    fun feedbackChirho(argsChirho: Bundle): FeedbackChirho =
        FeedbackChirho.entries.firstOrNull { entryChirho -> entryChirho.name == argsChirho.getString(FEEDBACK_KEY_CHIRHO) } ?: FeedbackChirho.NONE_CHIRHO

    fun stateBundleChirho(stateChirho: RadioStateChirho): Bundle = Bundle().apply {
        putString(STATION_KEY_CHIRHO, stateChirho.stationIdChirho)
        putString(BOOK_KEY_CHIRHO, stateChirho.placeChirho.bookIdChirho)
        putInt(CHAPTER_KEY_CHIRHO, stateChirho.placeChirho.chapterChirho)
        putString(PHASE_KEY_CHIRHO, stateChirho.phaseChirho.name)
        putBoolean(POWERED_KEY_CHIRHO, stateChirho.poweredChirho)
        putString(PROBLEM_KEY_CHIRHO, stateChirho.problemChirho.name)
        putBoolean(SOUNDS_KEY_CHIRHO, stateChirho.soundsEnabledChirho)
        putBoolean(RECOVERING_KEY_CHIRHO, stateChirho.recoveringChirho)
    }

    /** The published state, or null for extras that are not a whole state. */
    fun stateChirho(bundleChirho: Bundle): RadioStateChirho? {
        val stationChirho = bundleChirho.getString(STATION_KEY_CHIRHO) ?: return null
        val bookChirho = bundleChirho.getString(BOOK_KEY_CHIRHO) ?: return null
        val phaseChirho = PhaseChirho.entries.firstOrNull { entryChirho -> entryChirho.name == bundleChirho.getString(PHASE_KEY_CHIRHO) } ?: return null
        val problemChirho = ProblemChirho.entries.firstOrNull { entryChirho -> entryChirho.name == bundleChirho.getString(PROBLEM_KEY_CHIRHO) } ?: return null
        return RadioStateChirho(
            stationChirho, PlaceChirho(bookChirho, bundleChirho.getInt(CHAPTER_KEY_CHIRHO)), phaseChirho,
            bundleChirho.getBoolean(POWERED_KEY_CHIRHO), problemChirho,
            bundleChirho.getBoolean(SOUNDS_KEY_CHIRHO), bundleChirho.getBoolean(RECOVERING_KEY_CHIRHO)
        )
    }
}

/** The catalogue bundled with the app, read with its size bound. */
fun readBundledCatalogueChirho(assetsChirho: AssetManager): CatalogueChirho {
    val bytesChirho = assetsChirho.open("catalogue_chirho.json").use { inputChirho ->
        val bufferChirho = ByteArray(CATALOGUE_MAX_BYTES_CHIRHO + 1)
        var countChirho = 0
        while (countChirho < bufferChirho.size) {
            val readChirho = inputChirho.read(bufferChirho, countChirho, bufferChirho.size - countChirho)
            if (readChirho < 0) break
            countChirho += readChirho
        }
        require(countChirho <= CATALOGUE_MAX_BYTES_CHIRHO) { "the catalogue is larger than its bound" }
        bufferChirho.copyOf(countChirho)
    }
    return parseCatalogueChirho(bytesChirho.toString(Charsets.UTF_8))
}
