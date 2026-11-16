// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

package io.audiobiblerad.radiochirho.corechirho

import org.json.JSONArray
import org.json.JSONObject

// Reads apps-chirho/shared-chirho/catalogue_chirho.json, the snapshot the web exports for native
// players (src/lib/catalogue-chirho/contract_chirho.ts, contract version 1). It is bundled, so the
// first On needs no metadata request. A station whose locator or timings kind is unknown is
// skipped, as the contract requires; any other damage fails the whole read.

const val CATALOGUE_CONTRACT_CHIRHO = 1
const val CATALOGUE_MAX_BYTES_CHIRHO = 512 * 1024
private const val KNOWN_TIMINGS_CHIRHO = "verse-starts-list-chirho"

fun parseCatalogueChirho(textChirho: String): CatalogueChirho {
    require(textChirho.length <= CATALOGUE_MAX_BYTES_CHIRHO) { "the catalogue is larger than its bound" }
    val documentChirho = JSONObject(textChirho)
    require(documentChirho.getInt("contract_version_chirho") == CATALOGUE_CONTRACT_CHIRHO) { "unknown catalogue contract" }
    val booksChirho = documentChirho.getJSONArray("books_chirho").objectsChirho().map { bookChirho ->
        BookChirho(
            bookChirho.getString("id_chirho"),
            bookChirho.getString("name_chirho"),
            bookChirho.getInt("chapters_chirho"),
            bookChirho.getInt("order_chirho")
        )
    }
    require(booksChirho.map { bookChirho -> bookChirho.orderChirho }.sorted() == (1..66).toList()) { "the catalogue does not hold the 66 books" }
    require(booksChirho.sumOf { bookChirho -> bookChirho.chaptersChirho } == CatalogueChirho.TOTAL_CHAPTERS_CHIRHO) { "the books do not hold 1189 chapters" }
    val schemesChirho = documentChirho.getJSONObject("book_code_schemes_chirho")
    val stationValuesChirho = documentChirho.getJSONArray("stations_chirho")
    require(stationValuesChirho.length() in 1..128) { "the catalogue holds no believable station list" }
    val stationsChirho = stationValuesChirho.objectsChirho().mapNotNull { stationChirho ->
        val timingsChirho = stationChirho.optJSONObject("timings_chirho")
        if (timingsChirho != null && timingsChirho.opt("format_chirho") != KNOWN_TIMINGS_CHIRHO) return@mapNotNull null
        val locatorChirho = readLocatorChirho(stationChirho.getJSONObject("locator_chirho"), booksChirho, schemesChirho)
            ?: return@mapNotNull null
        StationChirho(
            idChirho = stationChirho.getString("id_chirho"),
            languageCodeChirho = stationChirho.getString("language_code_chirho"),
            languageNameChirho = stationChirho.getString("language_name_chirho"),
            versionChirho = stationChirho.getString("version_chirho"),
            voiceChirho = stationChirho.getString("voice_chirho"),
            sourceNameChirho = stationChirho.getString("source_name_chirho"),
            sourceUrlChirho = stationChirho.getString("source_url_chirho"),
            licenceNameChirho = stationChirho.getString("licence_name_chirho"),
            licenceUrlChirho = stationChirho.getString("licence_url_chirho"),
            creditChirho = stationChirho.getString("credit_chirho"),
            coverageChirho = readCoverageChirho(stationChirho.getJSONObject("coverage_chirho"), booksChirho),
            locatorChirho = locatorChirho
        )
    }
    require(stationsChirho.isNotEmpty()) { "no station in the catalogue can be played" }
    require(stationsChirho.distinctBy { stationChirho -> stationChirho.idChirho }.size == stationsChirho.size) { "a station id is repeated" }
    return CatalogueChirho(booksChirho, stationsChirho)
}

private fun readCoverageChirho(coverageChirho: JSONObject, booksChirho: List<BookChirho>): Map<String, List<IntRange>> =
    booksChirho.mapNotNull { bookChirho ->
        val rangesChirho = coverageChirho.optJSONArray(bookChirho.idChirho) ?: return@mapNotNull null
        bookChirho.idChirho to (0 until rangesChirho.length()).map { indexChirho ->
            val rangeChirho = rangesChirho.getJSONArray(indexChirho)
            val firstChirho = rangeChirho.getInt(0)
            val lastChirho = rangeChirho.getInt(1)
            require(firstChirho in 1..lastChirho && lastChirho <= bookChirho.chaptersChirho) {
                "coverage of ${bookChirho.idChirho} is out of range"
            }
            firstChirho..lastChirho
        }
    }.toMap()

private fun readLocatorChirho(locatorChirho: JSONObject, booksChirho: List<BookChirho>, schemesChirho: JSONObject): LocatorChirho? =
    when (locatorChirho.getString("kind_chirho")) {
        "pattern" -> {
            val overridesValueChirho = locatorChirho.optJSONObject("overrides_chirho")
            val overridesChirho = buildMap {
                for (bookChirho in booksChirho) {
                    val chaptersChirho = overridesValueChirho?.optJSONObject(bookChirho.idChirho) ?: continue
                    for (chapterChirho in chaptersChirho.keys())
                        chapterChirho.toIntOrNull()?.let { numberChirho -> put(PlaceChirho(bookChirho.idChirho, numberChirho), chaptersChirho.getString(chapterChirho)) }
                }
            }
            // An unknown list leaves the codes unknown, so a template that needs one resolves to nothing.
            // Android's optString answers "null" for a JSON null, so absence is checked first.
            val codesChirho = locatorChirho.takeUnless { patternChirho -> patternChirho.isNull("book_codes_chirho") }
                ?.let { patternChirho -> schemesChirho.optJSONArray(patternChirho.getString("book_codes_chirho")) }
                ?.let { listChirho -> (0 until listChirho.length()).map { indexChirho -> listChirho.getString(indexChirho) } }
            LocatorChirho.PatternChirho(locatorChirho.getString("template_chirho"), codesChirho, overridesChirho)
        }
        "index" -> {
            val filesValueChirho = locatorChirho.getJSONObject("files_chirho")
            LocatorChirho.IndexChirho(booksChirho.mapNotNull { bookChirho ->
                val filesChirho = filesValueChirho.optJSONArray(bookChirho.idChirho) ?: return@mapNotNull null
                bookChirho.idChirho to (0 until filesChirho.length()).map { indexChirho ->
                    if (filesChirho.isNull(indexChirho)) null else filesChirho.getString(indexChirho)
                }
            }.toMap())
        }
        else -> null
    }

private fun JSONArray.objectsChirho(): List<JSONObject> = (0 until length()).map { indexChirho -> getJSONObject(indexChirho) }
