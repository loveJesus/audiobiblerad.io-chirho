// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

package io.audiobiblerad.radiochirho.corechirho

import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Test
import java.io.File
import java.security.MessageDigest

// The bundled catalogue, read by the app's own parser, must answer exactly as the web resolver does
// for every station and every chapter. The fixture is written from the web code by
// scripts-chirho/native-chirho/android-chirho/export_parity_chirho.ts.
class CatalogueParityChirhoTest {
    private val catalogueFileChirho = File(System.getProperty("radio_catalogue_chirho") ?: error("the build names the catalogue"))
    private val catalogueChirho = parseCatalogueChirho(catalogueFileChirho.readText())
    private val parityChirho = JSONObject(
        CatalogueParityChirhoTest::class.java.getResource("/catalogue_parity_chirho.json")?.readText()
            ?: error("the parity fixture is missing")
    )

    private fun shaChirho(bytesChirho: ByteArray): String =
        MessageDigest.getInstance("SHA-256").digest(bytesChirho).joinToString("") { byteChirho -> "%02x".format(byteChirho) }

    private fun shaChirho(textChirho: String): String = shaChirho(textChirho.toByteArray(Charsets.UTF_8))

    private fun nameChirho(placeChirho: PlaceChirho?): String =
        placeChirho?.let { shownChirho -> "${shownChirho.bookIdChirho}.${shownChirho.chapterChirho}" } ?: "-"

    @Test
    fun theFixtureDescribesThisVeryCatalogueChirho() {
        assertEquals(parityChirho.getString("catalogue_sha256_chirho"), shaChirho(catalogueFileChirho.readBytes()))
    }

    @Test
    fun everyStationResolvesLandsAndStepsExactlyAsTheWebDoesChirho() {
        val expectedChirho = parityChirho.getJSONArray("stations_chirho")
        assertEquals("no station is skipped", expectedChirho.length(), catalogueChirho.stationsChirho.size)
        catalogueChirho.stationsChirho.forEachIndexed { indexChirho, stationChirho ->
            val wantChirho = expectedChirho.getJSONObject(indexChirho)
            assertEquals(wantChirho.getString("id_chirho"), stationChirho.idChirho)
            val resolvedChirho = StringBuilder()
            val landingChirho = StringBuilder()
            val nextChirho = StringBuilder()
            val previousChirho = StringBuilder()
            var countChirho = 0
            for (bookChirho in catalogueChirho.booksChirho) {
                for (chapterChirho in 1..bookChirho.chaptersChirho) {
                    val placeChirho = PlaceChirho(bookChirho.idChirho, chapterChirho)
                    val labelChirho = nameChirho(placeChirho)
                    catalogueChirho.resolveChirho(stationChirho, placeChirho)?.let { addressChirho ->
                        resolvedChirho.append(labelChirho).append('=').append(addressChirho).append('\n')
                        countChirho += 1
                    }
                    landingChirho.append(labelChirho).append('>').append(nameChirho(catalogueChirho.atOrAfterChirho(stationChirho, placeChirho))).append('\n')
                    nextChirho.append(labelChirho).append('>').append(nameChirho(catalogueChirho.nextChirho(stationChirho, placeChirho))).append('\n')
                    previousChirho.append(labelChirho).append('>').append(nameChirho(catalogueChirho.previousChirho(stationChirho, placeChirho))).append('\n')
                }
            }
            val idChirho = stationChirho.idChirho
            assertEquals("$idChirho count", wantChirho.getInt("resolved_count_chirho"), countChirho)
            assertEquals("$idChirho addresses", wantChirho.getString("resolved_sha256_chirho"), shaChirho(resolvedChirho.toString()))
            assertEquals("$idChirho landings", wantChirho.getString("landing_sha256_chirho"), shaChirho(landingChirho.toString()))
            assertEquals("$idChirho next chapters", wantChirho.getString("next_sha256_chirho"), shaChirho(nextChirho.toString()))
            assertEquals("$idChirho previous chapters", wantChirho.getString("previous_sha256_chirho"), shaChirho(previousChirho.toString()))
        }
    }
}
