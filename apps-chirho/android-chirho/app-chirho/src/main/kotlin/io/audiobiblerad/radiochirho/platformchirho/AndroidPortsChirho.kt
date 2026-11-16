// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

package io.audiobiblerad.radiochirho.platformchirho

import android.content.SharedPreferences
import android.os.Handler
import android.os.Looper
import android.os.SystemClock
import io.audiobiblerad.radiochirho.corechirho.ClockPortChirho
import io.audiobiblerad.radiochirho.corechirho.StorePortChirho

/** The main thread's clock: every radio decision runs on the main thread, in order. */
class HandlerClockChirho : ClockPortChirho {
    private val handlerChirho = Handler(Looper.getMainLooper())

    override fun nowMsChirho(): Long = SystemClock.elapsedRealtime()

    override fun scheduleChirho(delayMsChirho: Long, taskChirho: () -> Unit): () -> Unit {
        val runnableChirho = Runnable { taskChirho() }
        handlerChirho.postDelayed(runnableChirho, delayMsChirho)
        return { handlerChirho.removeCallbacks(runnableChirho) }
    }
}

/** Private device storage. Nothing here is sent anywhere; a failure only means nothing is remembered. */
class PreferencesStoreChirho(private val preferencesChirho: SharedPreferences) : StorePortChirho {
    override fun readChirho(keyChirho: String): String? =
        runCatching { preferencesChirho.getString(keyChirho, null) }.getOrNull()

    override fun writeChirho(keyChirho: String, valueChirho: String) {
        runCatching { preferencesChirho.edit().putString(keyChirho, valueChirho).apply() }
    }
}
