// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

package io.audiobiblerad.radiochirho.platformchirho

import android.app.PendingIntent
import android.os.Bundle
import android.os.Process
import androidx.annotation.OptIn
import androidx.media3.common.AudioAttributes
import androidx.media3.common.C
import androidx.media3.common.Player
import androidx.media3.common.util.UnstableApi
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.session.MediaSession
import androidx.media3.session.MediaSessionService
import androidx.media3.session.SessionCommand
import androidx.media3.session.SessionError
import androidx.media3.session.SessionResult
import com.google.common.util.concurrent.Futures
import com.google.common.util.concurrent.ListenableFuture
import io.audiobiblerad.radiochirho.corechirho.PlaceChirho
import io.audiobiblerad.radiochirho.corechirho.RadioControllerChirho
import io.audiobiblerad.radiochirho.corechirho.RadioStateChirho
import java.util.Locale

// The one owner of Scripture audio on Android: a Media3 session service holding ExoPlayer and the
// radio's controller. The screen, the notification, headsets and the lock screen are all views
// and remotes of this one player. Only this app may send the radio's own commands; besides it, only
// controllers the system trusts may connect. See
// spec-chirho/workflows-chirho/experience-chirho/native_players_workflow_chirho.md.
@OptIn(UnstableApi::class)
class RadioServiceChirho : MediaSessionService() {
    private var sessionChirho: MediaSession? = null
    private var playerChirho: ExoPlayer? = null
    private var audioChirho: ExoAudioPortChirho? = null
    private var radioChirho: RadioControllerChirho? = null

    override fun onCreate() {
        super.onCreate()
        // Without its built-in catalogue the radio has nothing to play; no session means the
        // screen's connection fails and it says the recording list could not open.
        val catalogueChirho = runCatching { readBundledCatalogueChirho(assets) }.getOrNull() ?: return
        val playerChirho = ExoPlayer.Builder(this)
            .setAudioAttributes(
                AudioAttributes.Builder().setUsage(C.USAGE_MEDIA).setContentType(C.AUDIO_CONTENT_TYPE_SPEECH).build(),
                true
            )
            .setHandleAudioBecomingNoisy(true)
            .setWakeMode(C.WAKE_MODE_NETWORK)
            .build()
        val clockChirho = HandlerClockChirho()
        val audioChirho = ExoAudioPortChirho(playerChirho) { radioChirho }
        radioChirho = RadioControllerChirho(
            catalogueChirho,
            audioChirho,
            SoundPoolEffectsChirho(assets, clockChirho),
            clockChirho,
            PreferencesStoreChirho(getSharedPreferences(PREFERENCES_NAME_CHIRHO, MODE_PRIVATE)),
            Locale.getDefault().language
        ) { stateChirho -> publishChirho(stateChirho) }
        this.playerChirho = playerChirho
        this.audioChirho = audioChirho
        val builderChirho = MediaSession.Builder(this, RadioFacadeChirho(playerChirho) { radioChirho })
            .setCallback(callbackChirho)
        screenIntentChirho()?.let { intentChirho -> builderChirho.setSessionActivity(intentChirho) }
        sessionChirho = builderChirho.build()
        radioChirho?.let { createdChirho -> publishChirho(createdChirho.stateChirho) }
    }

    /**
     * Tapping the notification, the lock-screen player or the system media controls opens the
     * radio's screen, as its launcher icon does. Without it the session's launch intent is null.
     */
    private fun screenIntentChirho(): PendingIntent? =
        packageManager.getLaunchIntentForPackage(packageName)?.let { launchChirho ->
            PendingIntent.getActivity(this, 0, launchChirho, PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)
        }

    private fun publishChirho(stateChirho: RadioStateChirho) {
        sessionChirho?.setSessionExtras(RadioCommandsChirho.stateBundleChirho(stateChirho))
    }

    private val callbackChirho = object : MediaSession.Callback {
        override fun onConnect(session: MediaSession, controller: MediaSession.ControllerInfo): MediaSession.ConnectionResult {
            val ownChirho = controller.uid == Process.myUid()
            if (!ownChirho && !controller.isTrusted) return MediaSession.ConnectionResult.reject()
            val sessionCommandsChirho = MediaSession.ConnectionResult.DEFAULT_SESSION_COMMANDS.buildUpon()
            if (ownChirho)
                for (actionChirho in RadioCommandsChirho.ALL_CHIRHO) sessionCommandsChirho.add(SessionCommand(actionChirho, Bundle.EMPTY))
            val playerCommandsChirho = MediaSession.ConnectionResult.DEFAULT_PLAYER_COMMANDS.buildUpon()
                .remove(Player.COMMAND_SET_MEDIA_ITEM)
                .remove(Player.COMMAND_CHANGE_MEDIA_ITEMS)
                .build()
            return MediaSession.ConnectionResult.AcceptedResultBuilder(session, controller)
                .setAvailableSessionCommands(sessionCommandsChirho.build())
                .setAvailablePlayerCommands(playerCommandsChirho)
                .build()
        }

        override fun onCustomCommand(
            session: MediaSession,
            controller: MediaSession.ControllerInfo,
            customCommand: SessionCommand,
            args: Bundle
        ): ListenableFuture<SessionResult> {
            val radioChirho = radioChirho
            if (controller.uid != Process.myUid() || radioChirho == null)
                return Futures.immediateFuture(SessionResult(SessionError.ERROR_PERMISSION_DENIED))
            val feedbackChirho = RadioCommandsChirho.feedbackChirho(args)
            when (customCommand.customAction) {
                RadioCommandsChirho.POWER_CHIRHO ->
                    if (args.getBoolean(RadioCommandsChirho.ON_KEY_CHIRHO)) radioChirho.onChirho(feedbackChirho)
                    else radioChirho.offChirho(feedbackChirho)
                RadioCommandsChirho.STATION_CHIRHO ->
                    args.getString(RadioCommandsChirho.STATION_KEY_CHIRHO)?.let { stationIdChirho -> radioChirho.chooseStationChirho(stationIdChirho, feedbackChirho) }
                RadioCommandsChirho.CHAPTER_CHIRHO ->
                    args.getString(RadioCommandsChirho.BOOK_KEY_CHIRHO)?.let { bookIdChirho ->
                        radioChirho.chooseChapterChirho(PlaceChirho(bookIdChirho, args.getInt(RadioCommandsChirho.CHAPTER_KEY_CHIRHO)), feedbackChirho)
                    }
                RadioCommandsChirho.STEP_CHIRHO ->
                    if (args.getBoolean(RadioCommandsChirho.NEXT_KEY_CHIRHO)) radioChirho.nextChirho(feedbackChirho)
                    else radioChirho.previousChirho(feedbackChirho)
                RadioCommandsChirho.SOUND_CHIRHO -> radioChirho.setSoundsChirho(args.getBoolean(RadioCommandsChirho.ENABLED_KEY_CHIRHO))
                RadioCommandsChirho.SAVE_CHIRHO -> radioChirho.saveChirho()
                RadioCommandsChirho.AUTOPLAY_CHIRHO -> radioChirho.autoplayChirho()
                RadioCommandsChirho.STATE_CHIRHO -> Unit
                else -> return Futures.immediateFuture(SessionResult(SessionError.ERROR_NOT_SUPPORTED))
            }
            // Every answer carries the controller's state, so a screen never guesses it.
            return Futures.immediateFuture(
                SessionResult(SessionResult.RESULT_SUCCESS, RadioCommandsChirho.stateBundleChirho(radioChirho.stateChirho))
            )
        }
    }

    override fun onGetSession(controllerInfo: MediaSession.ControllerInfo): MediaSession? =
        sessionChirho.takeIf { controllerInfo.uid == Process.myUid() || controllerInfo.isTrusted }

    override fun onDestroy() {
        radioChirho?.disposeChirho()
        audioChirho?.releaseChirho()
        sessionChirho?.release()
        playerChirho?.release()
        radioChirho = null
        audioChirho = null
        sessionChirho = null
        playerChirho = null
        super.onDestroy()
    }

    companion object {
        const val PREFERENCES_NAME_CHIRHO = "audio_bible_radio_chirho"
    }
}
