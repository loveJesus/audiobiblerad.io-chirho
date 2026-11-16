// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

package io.audiobiblerad.radiochirho.corechirho

import java.net.URI
import java.util.Locale

// The built-in stations and how to find a chapter on one. A port of the web resolver in
// src/lib/catalogue-chirho/locate-chirho/locate_chirho.ts; CatalogueParityChirhoTest proves every
// station resolves, lands and advances exactly as the web does. Chapters a recording splits
// across several files are outside coverage, so this player never offers them.
// See spec-chirho/workflows-chirho/experience-chirho/native_players_workflow_chirho.md.

data class BookChirho(
    val idChirho: String,
    val nameChirho: String,
    val chaptersChirho: Int,
    val orderChirho: Int
)

data class PlaceChirho(val bookIdChirho: String, val chapterChirho: Int)

sealed interface LocatorChirho {
    data class PatternChirho(
        val templateChirho: String,
        /** The source's own book codes in canon order, or null when it names none or an unknown list. */
        val bookCodesChirho: List<String>?,
        val overridesChirho: Map<PlaceChirho, String>
    ) : LocatorChirho

    data class IndexChirho(val filesChirho: Map<String, List<String?>>) : LocatorChirho
}

data class StationChirho(
    val idChirho: String,
    val languageCodeChirho: String,
    val languageNameChirho: String,
    val versionChirho: String,
    val voiceChirho: String,
    val sourceNameChirho: String,
    val sourceUrlChirho: String,
    val licenceNameChirho: String,
    val licenceUrlChirho: String,
    val creditChirho: String,
    val coverageChirho: Map<String, List<IntRange>>,
    val locatorChirho: LocatorChirho
) {
    val labelChirho: String
        get() = listOf(languageNameChirho, versionChirho, voiceChirho)
            .filter { partChirho -> partChirho.isNotBlank() }
            .joinToString(" · ")
}

class CatalogueChirho(booksChirho: List<BookChirho>, val stationsChirho: List<StationChirho>) {
    /** Canon order, Genesis first. */
    val booksChirho: List<BookChirho> = booksChirho.sortedBy { bookChirho -> bookChirho.orderChirho }
    val booksByIdChirho: Map<String, BookChirho> = this.booksChirho.associateBy { bookChirho -> bookChirho.idChirho }
    val stationsByIdChirho: Map<String, StationChirho> = stationsChirho.associateBy { stationChirho -> stationChirho.idChirho }

    /** The lowest chapter of a book the coverage holds, at or after [fromChirho]. */
    private fun firstCoveredChirho(stationChirho: StationChirho, bookChirho: BookChirho, fromChirho: Int): Int? {
        var foundChirho: Int? = null
        for (rangeChirho in stationChirho.coverageChirho[bookChirho.idChirho].orEmpty()) {
            if (rangeChirho.last < fromChirho) continue
            val candidateChirho = maxOf(rangeChirho.first, fromChirho)
            if (foundChirho == null || candidateChirho < foundChirho) foundChirho = candidateChirho
        }
        return foundChirho
    }

    /** True when the station was verified to have this chapter. */
    fun hasChapterChirho(stationChirho: StationChirho, placeChirho: PlaceChirho): Boolean {
        val bookChirho = booksByIdChirho[placeChirho.bookIdChirho] ?: return false
        if (placeChirho.chapterChirho < 1) return false
        return firstCoveredChirho(stationChirho, bookChirho, placeChirho.chapterChirho) == placeChirho.chapterChirho
    }

    /** The audio address for a verified chapter: an https address with a host and nothing hidden in it. */
    fun resolveChirho(stationChirho: StationChirho, placeChirho: PlaceChirho): String? {
        if (!hasChapterChirho(stationChirho, placeChirho)) return null
        val bookChirho = booksByIdChirho.getValue(placeChirho.bookIdChirho)
        val addressChirho = when (val locatorChirho = stationChirho.locatorChirho) {
            is LocatorChirho.IndexChirho ->
                locatorChirho.filesChirho[bookChirho.idChirho]?.getOrNull(placeChirho.chapterChirho - 1)
            is LocatorChirho.PatternChirho ->
                locatorChirho.overridesChirho[placeChirho]
                    ?: expandChirho(locatorChirho, bookChirho, placeChirho.chapterChirho)
        } ?: return null
        val uriChirho = runCatching { URI(addressChirho) }.getOrNull() ?: return null
        val safeChirho = uriChirho.scheme == "https" && !uriChirho.host.isNullOrEmpty() &&
            uriChirho.rawUserInfo == null && uriChirho.rawFragment == null
        return addressChirho.takeIf { safeChirho }
    }

    /** Fills a template, or answers null when it asks for anything unknown. */
    private fun expandChirho(locatorChirho: LocatorChirho.PatternChirho, bookChirho: BookChirho, chapterChirho: Int): String? {
        val chapterTextChirho = chapterChirho.toString()
        val valuesChirho = mapOf(
            "book_upper_chirho" to bookChirho.idChirho,
            "book_lower_chirho" to bookChirho.idChirho.lowercase(Locale.ROOT),
            "book_code_chirho" to locatorChirho.bookCodesChirho?.getOrNull(bookChirho.orderChirho - 1),
            "book_order_pad2_chirho" to bookChirho.orderChirho.toString().padStart(2, '0'),
            "chapter_chirho" to chapterTextChirho,
            "chapter_pad2_chirho" to chapterTextChirho.padStart(2, '0'),
            "chapter_pad3_chirho" to chapterTextChirho.padStart(3, '0'),
            "chapter_pad_book_chirho" to chapterTextChirho.padStart(maxOf(2, bookChirho.chaptersChirho.toString().length), '0')
        )
        var completeChirho = true
        val expandedChirho = PLACEHOLDER_CHIRHO.replace(locatorChirho.templateChirho) { matchChirho ->
            valuesChirho[matchChirho.groupValues[1]] ?: "".also { completeChirho = false }
        }
        return expandedChirho.takeIf { completeChirho }
    }

    /**
     * The same chapter when the station has it, otherwise the next one it has in canon order,
     * wrapping from Revelation to Genesis: the dial landing on a station that lacks a chapter.
     */
    fun atOrAfterChirho(stationChirho: StationChirho, placeChirho: PlaceChirho): PlaceChirho? {
        val startChirho = booksByIdChirho[placeChirho.bookIdChirho] ?: return null
        if (placeChirho.chapterChirho < 1) return null
        val startIndexChirho = startChirho.orderChirho - 1
        for (stepChirho in 0..booksChirho.size) {
            val bookChirho = booksChirho[(startIndexChirho + stepChirho) % booksChirho.size]
            val fromChirho = if (stepChirho == 0) placeChirho.chapterChirho else 1
            firstCoveredChirho(stationChirho, bookChirho, fromChirho)?.let { chapterChirho -> return PlaceChirho(bookChirho.idChirho, chapterChirho) }
        }
        return null
    }

    /** The chapter after this one on the station, wrapping at the end of the Bible. */
    fun nextChirho(stationChirho: StationChirho, placeChirho: PlaceChirho): PlaceChirho? =
        if (placeChirho.chapterChirho < 1) null
        else atOrAfterChirho(stationChirho, placeChirho.copy(chapterChirho = placeChirho.chapterChirho + 1))

    /** The playable chapter before this one, wrapping at Genesis, as the web player steps back. */
    fun previousChirho(stationChirho: StationChirho, placeChirho: PlaceChirho): PlaceChirho? {
        var indexChirho = booksChirho.indexOfFirst { bookChirho -> bookChirho.idChirho == placeChirho.bookIdChirho }
        if (indexChirho < 0) return null
        var chapterChirho = placeChirho.chapterChirho
        repeat(TOTAL_CHAPTERS_CHIRHO) {
            chapterChirho -= 1
            if (chapterChirho < 1) {
                indexChirho = (indexChirho + booksChirho.size - 1) % booksChirho.size
                chapterChirho = booksChirho[indexChirho].chaptersChirho
            }
            val candidateChirho = PlaceChirho(booksChirho[indexChirho].idChirho, chapterChirho)
            if (resolveChirho(stationChirho, candidateChirho) != null) return candidateChirho
        }
        return null
    }

    /** Books with at least one playable chapter on the station, in canon order. */
    fun offeredBooksChirho(stationChirho: StationChirho): List<BookChirho> =
        booksChirho.filter { bookChirho -> offeredChaptersChirho(stationChirho, bookChirho).isNotEmpty() }

    fun offeredChaptersChirho(stationChirho: StationChirho, bookChirho: BookChirho): List<Int> =
        (1..bookChirho.chaptersChirho).filter { chapterChirho -> resolveChirho(stationChirho, PlaceChirho(bookChirho.idChirho, chapterChirho)) != null }

    /** The first station in the device's language, or the first station of all. */
    fun initialStationChirho(languageChirho: String): StationChirho {
        val wantedChirho = languageChirho.substringBefore('-').lowercase(Locale.ROOT)
        return stationsChirho.firstOrNull { stationChirho -> stationChirho.languageCodeChirho.substringBefore('-').lowercase(Locale.ROOT) == wantedChirho }
            ?: stationsChirho.first()
    }

    companion object {
        const val TOTAL_CHAPTERS_CHIRHO = 1189
        private val PLACEHOLDER_CHIRHO = Regex("\\{([a-z0-9_]+)\\}")
    }
}
