// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

package io.audiobiblerad.radiochirho.corechirho

// Stand-ins for the platform, and a small catalogue: three books, a full station, a station
// that has only John, and an indexed station without John. Addresses are never fetched.

fun testCatalogueChirho(): CatalogueChirho {
    val booksChirho = listOf(
        BookChirho("GEN", "Genesis", 3, 1),
        BookChirho("JHN", "John", 4, 2),
        BookChirho("REV", "Revelation", 2, 3)
    )
    fun stationChirho(idChirho: String, languageChirho: String, coverageChirho: Map<String, List<IntRange>>, locatorChirho: LocatorChirho) =
        StationChirho(
            idChirho, languageChirho, languageChirho, "Version $idChirho", "Reader $idChirho", "Source $idChirho",
            "https://source.example.org/$idChirho", "Licence $idChirho", "https://licence.example.org/$idChirho",
            "Credit $idChirho", coverageChirho, locatorChirho
        )
    val everyChirho = mapOf("GEN" to listOf(1..3), "JHN" to listOf(1..4), "REV" to listOf(1..2))
    return CatalogueChirho(
        booksChirho,
        listOf(
            stationChirho("alpha-chirho", "en", everyChirho,
                LocatorChirho.PatternChirho("https://audio.example.org/alpha/{book_upper_chirho}/{chapter_pad2_chirho}.mp3", null, emptyMap())),
            stationChirho("beta-chirho", "en", mapOf("JHN" to listOf(1..4)),
                LocatorChirho.PatternChirho("https://audio.example.org/beta/{book_lower_chirho}_{chapter_chirho}.mp3", null, emptyMap())),
            stationChirho("gamma-chirho", "es", mapOf("GEN" to listOf(1..3), "REV" to listOf(1..2)),
                LocatorChirho.IndexChirho(mapOf(
                    "GEN" to listOf("https://audio.example.org/gamma/g1.mp3", "https://audio.example.org/gamma/g2.mp3", "https://audio.example.org/gamma/g3.mp3"),
                    "REV" to listOf("https://audio.example.org/gamma/r1.mp3", "https://audio.example.org/gamma/r2.mp3")
                )))
        )
    )
}

/**
 * Records what the controller asks of the player. A test may make the player answer at once,
 * from inside load() or play(), as a real transport can.
 */
class FakeAudioChirho : AudioPortChirho {
    data class LoadChirho(val generationChirho: Int, val placeChirho: PlaceChirho, val urlChirho: String, val startMsChirho: Long, val playChirho: Boolean)

    val loadsChirho = mutableListOf<LoadChirho>()
    val callsChirho = mutableListOf<String>()
    var clockMsChirho = 0L
    var lengthMsChirho: Long? = null
    var onLoadHookChirho: ((LoadChirho) -> Unit)? = null
    var onPlayHookChirho: (() -> Unit)? = null
    val lastChirho: LoadChirho get() = loadsChirho.last()

    override fun loadChirho(generationChirho: Int, trackChirho: TrackChirho, startMsChirho: Long, playChirho: Boolean) {
        val loadChirho = LoadChirho(generationChirho, trackChirho.placeChirho, trackChirho.urlChirho, startMsChirho, playChirho)
        loadsChirho += loadChirho
        clockMsChirho = startMsChirho
        lengthMsChirho = null
        onLoadHookChirho?.invoke(loadChirho)
    }

    override fun playChirho() {
        callsChirho += "play"
        onPlayHookChirho?.invoke()
    }

    override fun pauseChirho() {
        callsChirho += "pause"
    }

    override fun seekChirho(positionMsChirho: Long) {
        callsChirho += "seek:$positionMsChirho"
        clockMsChirho = positionMsChirho
    }

    override fun unloadChirho() {
        callsChirho += "unload"
    }

    override fun positionMsChirho(): Long = clockMsChirho

    override fun durationMsChirho(): Long? = lengthMsChirho
}

class FakeEffectsChirho : EffectsPortChirho {
    val callsChirho = mutableListOf<String>()
    override fun setEnabledChirho(enabledChirho: Boolean) {
        callsChirho += "enabled:$enabledChirho"
    }
    override fun tuningChirho() {
        callsChirho += "tuning"
    }
    override fun stopTuningChirho() {
        callsChirho += "stop-tuning"
    }
    override fun clickChirho() {
        callsChirho += "click"
    }
    override fun knobChirho() {
        callsChirho += "knob"
    }
    override fun silenceChirho() {
        callsChirho += "silence"
    }
    override fun disposeChirho() {
        callsChirho += "dispose"
    }
}

/** A clock that moves only when told, running each task at its due time, in order. */
class FakeClockChirho : ClockPortChirho {
    private class TaskChirho(val dueMsChirho: Long, val idChirho: Int, val runChirho: () -> Unit)

    private val tasksChirho = mutableListOf<TaskChirho>()
    private var nextIdChirho = 0
    var nowChirho = 0L
        private set
    val pendingChirho: Int get() = tasksChirho.size

    override fun nowMsChirho(): Long = nowChirho

    override fun scheduleChirho(delayMsChirho: Long, taskChirho: () -> Unit): () -> Unit {
        val idChirho = nextIdChirho++
        tasksChirho += TaskChirho(nowChirho + delayMsChirho, idChirho, taskChirho)
        return { tasksChirho.removeAll { scheduledChirho -> scheduledChirho.idChirho == idChirho } }
    }

    fun advanceChirho(msChirho: Long) {
        val targetChirho = nowChirho + msChirho
        while (true) {
            val dueChirho = tasksChirho.filter { scheduledChirho -> scheduledChirho.dueMsChirho <= targetChirho }
                .minByOrNull { scheduledChirho -> scheduledChirho.dueMsChirho } ?: break
            tasksChirho.remove(dueChirho)
            nowChirho = dueChirho.dueMsChirho
            dueChirho.runChirho()
        }
        nowChirho = targetChirho
    }
}

class FakeStoreChirho : StorePortChirho {
    val valuesChirho = mutableMapOf<String, String>()
    /** Every key written, in order, so a test can count the saves of one key. */
    val writtenKeysChirho = mutableListOf<String>()

    override fun readChirho(keyChirho: String): String? = valuesChirho[keyChirho]

    override fun writeChirho(keyChirho: String, valueChirho: String) {
        valuesChirho[keyChirho] = valueChirho
        writtenKeysChirho += keyChirho
    }
}
