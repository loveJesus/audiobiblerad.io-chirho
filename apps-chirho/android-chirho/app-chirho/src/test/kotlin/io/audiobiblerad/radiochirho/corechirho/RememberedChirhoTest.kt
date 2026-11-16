// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

package io.audiobiblerad.radiochirho.corechirho

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

// Remembered values are untrusted: only whole, in-range positions on real stations come back.
class RememberedChirhoTest {
    private val catalogueChirho = testCatalogueChirho()

    private fun positionChirho(chapterChirho: String = "2", secondsChirho: String = "30", durationChirho: String = "300", stationChirho: String = "\"alpha-chirho\"", bookChirho: String = "\"JHN\"") =
        """{"station_id_chirho":$stationChirho,"book_id_chirho":$bookChirho,"chapter_chirho":$chapterChirho,"seconds_chirho":$secondsChirho,"duration_chirho":$durationChirho}"""

    private fun currentChirho(textChirho: String): PositionChirho? =
        RememberedCodecChirho.readChirho("""{"current_chirho":$textChirho,"sounds_enabled_chirho":false}""", catalogueChirho)?.currentChirho

    @Test
    fun aSavedPlaceComesBackExactlyChirho() {
        val placeChirho = PositionChirho("beta-chirho", PlaceChirho("JHN", 3), 12.5, 240.25)
        val rememberedChirho = RememberedChirho(placeChirho, placeChirho.copy(secondsChirho = 0.0), false)
        assertEquals(rememberedChirho, RememberedCodecChirho.readChirho(RememberedCodecChirho.writeChirho(rememberedChirho), catalogueChirho))
    }

    @Test
    fun chaptersMustBeWholeNumbersInsideTheirBookChirho() {
        assertEquals(PlaceChirho("JHN", 2), currentChirho(positionChirho())?.placeChirho)
        assertEquals("2.0 is the whole number 2", PlaceChirho("JHN", 2), currentChirho(positionChirho(chapterChirho = "2.0"))?.placeChirho)
        for (badChirho in listOf("3.7", "\"3\"", "0", "-1", "5", "true", "null", "1e9"))
            assertNull("chapter $badChirho", currentChirho(positionChirho(chapterChirho = badChirho)))
    }

    @Test
    fun secondsAndLengthsMustBeFiniteAndWithinADayChirho() {
        for (badChirho in listOf("-1", "86400.5", "1e300", "\"30\"", "null", "false"))
            assertNull("seconds $badChirho", currentChirho(positionChirho(secondsChirho = badChirho)))
        for (badChirho in listOf("-0.5", "86401", "\"300\""))
            assertNull("duration $badChirho", currentChirho(positionChirho(durationChirho = badChirho)))
        assertEquals(86_400.0, currentChirho(positionChirho(secondsChirho = "86400", durationChirho = "86400"))!!.secondsChirho, 0.0)
    }

    @Test
    fun stationsAndBooksMustExistChirho() {
        assertNull(currentChirho(positionChirho(stationChirho = "\"retired-station-chirho\"")))
        assertNull(currentChirho(positionChirho(stationChirho = "7")))
        assertNull(currentChirho(positionChirho(bookChirho = "\"XYZ\"")))
        assertNull(currentChirho(positionChirho(bookChirho = "\"jhn\"")))
    }

    @Test
    fun aDamagedFollowedPlaceIsDroppedAloneAndTheSwitchDefaultsOnChirho() {
        val rememberedChirho = RememberedCodecChirho.readChirho(
            """{"current_chirho":${positionChirho()},"followed_chirho":${positionChirho(chapterChirho = "99")},"sounds_enabled_chirho":"no"}""",
            catalogueChirho
        )!!
        assertEquals(PlaceChirho("JHN", 2), rememberedChirho.currentChirho?.placeChirho)
        assertNull(rememberedChirho.followedChirho)
        assertTrue(rememberedChirho.soundsEnabledChirho)
    }

    @Test
    fun oversizedOrBrokenMemoryIsIgnoredWholeChirho() {
        val paddingChirho = "x".repeat(RememberedCodecChirho.MAX_LENGTH_CHIRHO)
        assertNull(RememberedCodecChirho.readChirho("""{"current_chirho":${positionChirho()},"pad_chirho":"$paddingChirho"}""", catalogueChirho))
        assertNull(RememberedCodecChirho.readChirho("{not json", catalogueChirho))
        assertNull(RememberedCodecChirho.readChirho(null, catalogueChirho))
    }

    @Test
    fun writingNeverStoresANumberOutsideItsBoundsChirho() {
        val placeChirho = PositionChirho("alpha-chirho", PlaceChirho("GEN", 1), Double.NaN, 1e12)
        val backChirho = RememberedCodecChirho.readChirho(
            RememberedCodecChirho.writeChirho(RememberedChirho(placeChirho, null, true)), catalogueChirho
        )!!.currentChirho!!
        assertEquals(0.0, backChirho.secondsChirho, 0.0)
        assertEquals(RememberedCodecChirho.MAX_SECONDS_CHIRHO, backChirho.durationChirho, 0.0)
    }
}
