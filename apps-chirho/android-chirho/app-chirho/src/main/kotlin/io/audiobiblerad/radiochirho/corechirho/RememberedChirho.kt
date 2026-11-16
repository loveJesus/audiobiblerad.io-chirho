// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

package io.audiobiblerad.radiochirho.corechirho

import org.json.JSONObject

// Device memory: the place being played, the place being followed and the Sound switch, under
// one key capped at 2,048 characters and checked like the web's player_preferences_chirho.ts.
// What is stored is untrusted. A field out of range drops the whole position it belongs to, so a
// damaged value behaves like a first run, and nothing but these fields is ever read back.

data class PositionChirho(
    val stationIdChirho: String,
    val placeChirho: PlaceChirho,
    val secondsChirho: Double,
    val durationChirho: Double
) {
    /** How far through the chapter, from 0 to 1; 0 while its length is unknown. */
    val fractionChirho: Double
        get() = if (durationChirho > 0) (secondsChirho / durationChirho).coerceIn(0.0, 1.0) else 0.0
}

data class RememberedChirho(
    val currentChirho: PositionChirho?,
    val followedChirho: PositionChirho?,
    val soundsEnabledChirho: Boolean
)

object RememberedCodecChirho {
    const val MAX_LENGTH_CHIRHO = 2048
    /** A day: longer than any chapter, and a bound on what a damaged value can claim. */
    const val MAX_SECONDS_CHIRHO = 86_400.0

    fun readChirho(textChirho: String?, catalogueChirho: CatalogueChirho): RememberedChirho? {
        if (textChirho == null || textChirho.length > MAX_LENGTH_CHIRHO) return null
        val valueChirho = runCatching { JSONObject(textChirho) }.getOrNull() ?: return null
        return RememberedChirho(
            positionChirho(valueChirho.optJSONObject("current_chirho"), catalogueChirho),
            positionChirho(valueChirho.optJSONObject("followed_chirho"), catalogueChirho),
            valueChirho.opt("sounds_enabled_chirho") as? Boolean ?: true
        )
    }

    fun writeChirho(rememberedChirho: RememberedChirho): String {
        val valueChirho = JSONObject().put("sounds_enabled_chirho", rememberedChirho.soundsEnabledChirho)
        rememberedChirho.currentChirho?.let { currentPositionChirho -> valueChirho.put("current_chirho", encodeChirho(currentPositionChirho)) }
        rememberedChirho.followedChirho?.let { followedPositionChirho -> valueChirho.put("followed_chirho", encodeChirho(followedPositionChirho)) }
        return valueChirho.toString()
    }

    private fun positionChirho(valueChirho: JSONObject?, catalogueChirho: CatalogueChirho): PositionChirho? {
        if (valueChirho == null) return null
        val stationIdChirho = valueChirho.opt("station_id_chirho") as? String ?: return null
        if (stationIdChirho !in catalogueChirho.stationsByIdChirho) return null
        val bookChirho = (valueChirho.opt("book_id_chirho") as? String)
            ?.let { bookIdChirho -> catalogueChirho.booksByIdChirho[bookIdChirho] } ?: return null
        val chapterChirho = wholeChirho(valueChirho.opt("chapter_chirho"), bookChirho.chaptersChirho) ?: return null
        val secondsChirho = numberChirho(valueChirho.opt("seconds_chirho")) ?: return null
        val durationChirho = numberChirho(valueChirho.opt("duration_chirho")) ?: return null
        return PositionChirho(stationIdChirho, PlaceChirho(bookChirho.idChirho, chapterChirho), secondsChirho, durationChirho)
    }

    /** A finite JSON number from 0 to a day; a string, boolean or anything else is refused. */
    private fun numberChirho(valueChirho: Any?): Double? =
        (valueChirho as? Number)?.toDouble()?.takeIf { secondsChirho -> secondsChirho.isFinite() && secondsChirho in 0.0..MAX_SECONDS_CHIRHO }

    /** A whole JSON number from 1 to [highestChirho]: 3.7 or "3" is refused, as the web refuses it. */
    private fun wholeChirho(valueChirho: Any?, highestChirho: Int): Int? {
        val numberChirho = (valueChirho as? Number)?.toDouble() ?: return null
        if (!numberChirho.isFinite() || numberChirho < 1 || numberChirho > highestChirho) return null
        return numberChirho.toInt().takeIf { chapterChirho -> chapterChirho.toDouble() == numberChirho }
    }

    private fun encodeChirho(positionChirho: PositionChirho): JSONObject = JSONObject()
        .put("station_id_chirho", positionChirho.stationIdChirho)
        .put("book_id_chirho", positionChirho.placeChirho.bookIdChirho)
        .put("chapter_chirho", positionChirho.placeChirho.chapterChirho)
        .put("seconds_chirho", boundedChirho(positionChirho.secondsChirho))
        .put("duration_chirho", boundedChirho(positionChirho.durationChirho))

    private fun boundedChirho(secondsChirho: Double): Double =
        if (secondsChirho.isFinite()) secondsChirho.coerceIn(0.0, MAX_SECONDS_CHIRHO) else 0.0
}
