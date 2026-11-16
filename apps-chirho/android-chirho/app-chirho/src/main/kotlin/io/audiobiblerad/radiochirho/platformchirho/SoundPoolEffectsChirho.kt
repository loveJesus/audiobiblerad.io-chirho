// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

package io.audiobiblerad.radiochirho.platformchirho

import android.content.res.AssetManager
import android.media.AudioAttributes
import android.media.SoundPool
import io.audiobiblerad.radiochirho.corechirho.ClockPortChirho
import io.audiobiblerad.radiochirho.corechirho.EffectsPortChirho
import io.audiobiblerad.radiochirho.corechirho.InterfaceGateChirho
import org.json.JSONObject
import java.nio.ByteBuffer
import java.nio.ByteOrder
import kotlin.random.Random

// The prepared radio effects, from apps-chirho/shared-chirho/native-assets-chirho/sounds-chirho/,
// which scripts-chirho/native-chirho/prepare_native_sounds_chirho.ts stages: the owner's purchased
// cuts where the private folder holds them, the open set otherwise. Never Scripture, never an
// original recording. Every clip plays from its start, so nothing seeks. All eleven load as soon
// as the sounds are on, so the first tuning cue can sound. One tuning stream and one stream shared
// by click and knob: nothing stacks. See spec-chirho/workflows-chirho/radio_sounds_workflow_chirho.md.
class SoundPoolEffectsChirho(
    private val assetsChirho: AssetManager,
    private val clockChirho: ClockPortChirho
) : EffectsPortChirho {
    private class ClipChirho(val pathChirho: String, val lengthMsChirho: Long)

    private var poolChirho: SoundPool? = null
    private var enabledChirho = false
    private var clipsChirho: Map<String, List<ClipChirho>> = emptyMap()
    private val idsChirho = mutableMapOf<String, Int>()
    private val readyChirho = mutableSetOf<Int>()
    private val gateChirho = InterfaceGateChirho()
    private var interfaceStreamChirho = 0
    private var tuningStreamChirho = 0
    private var lastTuningChirho = -1
    private var tuningCeilingChirho: (() -> Unit)? = null

    override fun setEnabledChirho(enabledChirho: Boolean) {
        if (this.enabledChirho == enabledChirho) return
        this.enabledChirho = enabledChirho
        if (!enabledChirho) {
            releasePoolChirho()
            return
        }
        runCatching {
            clipsChirho = readProfileChirho()
            val poolChirho = SoundPool.Builder()
                .setMaxStreams(2)
                .setAudioAttributes(
                    // Media usage: the effects follow the same volume as Scripture.
                    AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_MEDIA)
                        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                        .build()
                )
                .build()
            poolChirho.setOnLoadCompleteListener { _, idChirho, statusChirho ->
                if (statusChirho == 0) readyChirho.add(idChirho)
            }
            this.poolChirho = poolChirho
            for (clipChirho in clipsChirho.values.flatten())
                idsChirho[clipChirho.pathChirho] = assetsChirho.openFd(clipChirho.pathChirho).use { descriptorChirho -> poolChirho.load(descriptorChirho, 1) }
        }.onFailure { releasePoolChirho() }
    }

    override fun tuningChirho() {
        stopTuningChirho()
        val poolChirho = poolChirho ?: return
        val cuesChirho = clipsChirho[TUNING_CHIRHO].orEmpty()
        if (!enabledChirho || cuesChirho.isEmpty()) return
        // Never the same cue twice in a row.
        val indexChirho = if (cuesChirho.size < 2 || lastTuningChirho !in cuesChirho.indices) Random.nextInt(cuesChirho.size)
        else (lastTuningChirho + 1 + Random.nextInt(cuesChirho.size - 1)) % cuesChirho.size
        lastTuningChirho = indexChirho
        val idChirho = idsChirho[cuesChirho[indexChirho].pathChirho]?.takeIf { soundIdChirho -> soundIdChirho in readyChirho } ?: return
        tuningStreamChirho = poolChirho.play(idChirho, 1f, 1f, 1, 0, 1f)
        tuningCeilingChirho = clockChirho.scheduleChirho(TUNING_CEILING_MS_CHIRHO) {
            tuningCeilingChirho = null
            stopTuningChirho()
        }
    }

    override fun stopTuningChirho() {
        tuningCeilingChirho?.invoke()
        tuningCeilingChirho = null
        if (tuningStreamChirho != 0) poolChirho?.stop(tuningStreamChirho)
        tuningStreamChirho = 0
    }

    override fun clickChirho() = interfaceChirho(CLICK_CHIRHO)

    override fun knobChirho() = interfaceChirho(KNOB_CHIRHO)

    private fun interfaceChirho(roleChirho: String) {
        val poolChirho = poolChirho ?: return
        if (!enabledChirho) return
        val clipChirho = clipsChirho[roleChirho].orEmpty().randomOrNull() ?: return
        val idChirho = idsChirho[clipChirho.pathChirho]?.takeIf { soundIdChirho -> soundIdChirho in readyChirho } ?: return
        val nowChirho = clockChirho.nowMsChirho()
        val allowedChirho = if (roleChirho == KNOB_CHIRHO) gateChirho.knobChirho(nowChirho, clipChirho.lengthMsChirho)
        else gateChirho.clickChirho(nowChirho, clipChirho.lengthMsChirho)
        if (!allowedChirho) return
        if (interfaceStreamChirho != 0) poolChirho.stop(interfaceStreamChirho)
        interfaceStreamChirho = poolChirho.play(idChirho, 1f, 1f, 1, 0, 1f)
    }

    override fun silenceChirho() {
        stopTuningChirho()
        if (interfaceStreamChirho != 0) poolChirho?.stop(interfaceStreamChirho)
        interfaceStreamChirho = 0
        gateChirho.clearChirho()
    }

    override fun disposeChirho() {
        enabledChirho = false
        releasePoolChirho()
    }

    private fun releasePoolChirho() {
        silenceChirho()
        poolChirho?.release()
        poolChirho = null
        idsChirho.clear()
        readyChirho.clear()
    }

    /** The staged profile, checked as the page checks it: plain paths under /sounds-chirho/, no offsets. */
    private fun readProfileChirho(): Map<String, List<ClipChirho>> {
        val bytesChirho = assetsChirho.open(PROFILE_PATH_CHIRHO).use { streamChirho -> streamChirho.readBytes() }
        require(bytesChirho.size <= PROFILE_MAX_BYTES_CHIRHO) { "the sound profile is larger than its bound" }
        val profileChirho = JSONObject(bytesChirho.toString(Charsets.UTF_8))
        require(profileChirho.getString("schema_chirho") == "radio-sounds-profile-v1-chirho")
        require(profileChirho.getString("source_chirho") in setOf("licensed", "open"))
        return listOf(TUNING_CHIRHO, CLICK_CHIRHO, KNOB_CHIRHO).associateWith { roleChirho ->
            val entriesChirho = profileChirho.getJSONArray(roleChirho)
            require(entriesChirho.length() in if (roleChirho == TUNING_CHIRHO) 1..16 else 0..4)
            (0 until entriesChirho.length()).map { indexChirho ->
                val entryChirho = entriesChirho.getJSONObject(indexChirho)
                val urlChirho = entryChirho.getString("url_chirho")
                require(CLIP_PATH_CHIRHO.matches(urlChirho)) { "an effect path is out of bounds" }
                require(entryChirho.isNull("start_seconds_chirho")) { "prepared effects play from their start" }
                val pathChirho = "native-assets-chirho$urlChirho"
                ClipChirho(pathChirho, wavLengthMsChirho(pathChirho))
            }
        }
    }

    /** The length of a PCM WAV clip from its header, bounded to the controls' 2 s ceiling. */
    private fun wavLengthMsChirho(pathChirho: String): Long {
        val bytesChirho = assetsChirho.open(pathChirho).use { streamChirho -> streamChirho.readBytes() }
        require(bytesChirho.size in 45..CLIP_MAX_BYTES_CHIRHO) { "an effect clip has no believable size" }
        val bufferChirho = ByteBuffer.wrap(bytesChirho).order(ByteOrder.LITTLE_ENDIAN)
        var byteRateChirho = 0
        var dataBytesChirho = 0
        var offsetChirho = 12
        while (offsetChirho + 8 <= bytesChirho.size) {
            val nameChirho = String(bytesChirho, offsetChirho, 4, Charsets.US_ASCII)
            val lengthChirho = bufferChirho.getInt(offsetChirho + 4)
            require(lengthChirho >= 0 && lengthChirho <= bytesChirho.size - offsetChirho - 8) { "a WAV chunk overruns its file" }
            if (nameChirho == "fmt " && lengthChirho >= 16) byteRateChirho = bufferChirho.getInt(offsetChirho + 16)
            if (nameChirho == "data") dataBytesChirho = lengthChirho
            offsetChirho += 8 + lengthChirho + lengthChirho % 2
        }
        require(byteRateChirho > 0 && dataBytesChirho > 0) { "an effect clip is not PCM WAV" }
        return (1000L * dataBytesChirho / byteRateChirho).coerceIn(1L, 2000L)
    }

    companion object {
        private const val PROFILE_PATH_CHIRHO = "native-assets-chirho/sounds-chirho/profile_chirho.json"
        private const val PROFILE_MAX_BYTES_CHIRHO = 8192
        private const val CLIP_MAX_BYTES_CHIRHO = 2 * 1024 * 1024
        private const val TUNING_CEILING_MS_CHIRHO = 1500L
        private const val TUNING_CHIRHO = "tuning_chirho"
        private const val CLICK_CHIRHO = "click_chirho"
        private const val KNOB_CHIRHO = "knob_chirho"
        private val CLIP_PATH_CHIRHO = Regex("^/sounds-chirho/(?:[a-z0-9_-]+/){0,3}[a-z0-9_-]+\\.wav$")
    }
}
