// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

package io.audiobiblerad.radiochirho.platformchirho

import androidx.annotation.OptIn
import androidx.media3.common.C
import androidx.media3.common.MediaItem
import androidx.media3.common.MediaMetadata
import androidx.media3.common.PlaybackException
import androidx.media3.common.Player
import androidx.media3.common.util.UnstableApi
import androidx.media3.datasource.HttpDataSource
import androidx.media3.exoplayer.ExoPlayer
import io.audiobiblerad.radiochirho.corechirho.AudioEventsChirho
import io.audiobiblerad.radiochirho.corechirho.AudioPortChirho
import io.audiobiblerad.radiochirho.corechirho.FailureChirho
import io.audiobiblerad.radiochirho.corechirho.TrackChirho

// ExoPlayer behind the controller's audio port, streaming straight from the publisher. One chapter
// is loaded at a time. Each track's media id begins with its generation, so an event is matched to
// the track that is current when it is delivered and nothing from an older track can act.
// See spec-chirho/workflows-chirho/experience-chirho/native_players_workflow_chirho.md.
class ExoAudioPortChirho(
    private val playerChirho: ExoPlayer,
    private val eventsChirho: () -> AudioEventsChirho?
) : AudioPortChirho {
    private val listenerChirho = object : Player.Listener {
        override fun onPlaybackStateChanged(playbackState: Int) {
            val generationChirho = generationChirho() ?: return
            val receiverChirho = eventsChirho() ?: return
            when (playbackState) {
                Player.STATE_READY -> receiverChirho.onReadyChirho(generationChirho)
                Player.STATE_BUFFERING -> receiverChirho.onBufferingChirho(generationChirho)
                Player.STATE_ENDED -> receiverChirho.onEndedChirho(generationChirho)
                else -> Unit
            }
        }

        override fun onIsPlayingChanged(isPlaying: Boolean) {
            if (!isPlaying) return
            val generationChirho = generationChirho() ?: return
            eventsChirho()?.onPlayingChirho(generationChirho)
        }

        override fun onPlayerError(error: PlaybackException) {
            val generationChirho = generationChirho() ?: return
            eventsChirho()?.onFailedChirho(generationChirho, failureOfChirho(error))
        }

        override fun onPlayWhenReadyChanged(playWhenReady: Boolean, reason: Int) {
            // The controller's own pauses are user requests; anything else is the system pausing.
            if (playWhenReady || reason == Player.PLAY_WHEN_READY_CHANGE_REASON_USER_REQUEST) return
            val generationChirho = generationChirho() ?: return
            eventsChirho()?.onSystemPausedChirho(generationChirho)
        }
    }

    init {
        playerChirho.addListener(listenerChirho)
    }

    private fun generationChirho(): Int? =
        playerChirho.currentMediaItem?.mediaId?.substringBefore(':')?.toIntOrNull()

    override fun loadChirho(generationChirho: Int, trackChirho: TrackChirho, startMsChirho: Long, playChirho: Boolean) {
        val stationChirho = trackChirho.stationChirho
        val placeChirho = trackChirho.placeChirho
        val itemChirho = MediaItem.Builder()
            .setMediaId("$generationChirho:${stationChirho.idChirho}/${placeChirho.bookIdChirho}/${placeChirho.chapterChirho}")
            .setUri(trackChirho.urlChirho)
            .setMediaMetadata(
                MediaMetadata.Builder()
                    .setTitle(trackChirho.titleChirho)
                    .setArtist(stationChirho.voiceChirho.ifBlank { stationChirho.versionChirho })
                    .setAlbumTitle(stationChirho.labelChirho)
                    .build()
            )
            .build()
        playerChirho.setMediaItem(itemChirho, startMsChirho)
        playerChirho.playWhenReady = playChirho
        playerChirho.prepare()
    }

    override fun playChirho() = playerChirho.play()

    override fun pauseChirho() = playerChirho.pause()

    override fun seekChirho(positionMsChirho: Long) = playerChirho.seekTo(positionMsChirho)

    override fun unloadChirho() {
        playerChirho.stop()
        playerChirho.clearMediaItems()
    }

    override fun positionMsChirho(): Long = playerChirho.currentPosition

    override fun durationMsChirho(): Long? = playerChirho.duration.takeIf { msChirho -> msChirho != C.TIME_UNSET && msChirho > 0 }

    fun releaseChirho() = playerChirho.removeListener(listenerChirho)

    companion object {
        private val MISSING_STATUS_CHIRHO = setOf(404, 410)
        private val UNREADABLE_CHIRHO = setOf(
            PlaybackException.ERROR_CODE_IO_FILE_NOT_FOUND,
            PlaybackException.ERROR_CODE_PARSING_CONTAINER_MALFORMED,
            PlaybackException.ERROR_CODE_PARSING_CONTAINER_UNSUPPORTED,
            PlaybackException.ERROR_CODE_DECODING_FAILED,
            PlaybackException.ERROR_CODE_DECODING_FORMAT_UNSUPPORTED
        )

        /**
         * A chapter file that is gone or unreadable may be skipped. A failing signal (no network,
         * a timeout, a server error) keeps the place for a retry instead of skipping chapters.
         */
        @OptIn(UnstableApi::class)
        fun failureOfChirho(errorChirho: PlaybackException): FailureChirho {
            val goneChirho = generateSequence<Throwable>(errorChirho) { causeChirho -> causeChirho.cause }.any { causeChirho ->
                causeChirho is HttpDataSource.InvalidResponseCodeException && causeChirho.responseCode in MISSING_STATUS_CHIRHO
            }
            return if (goneChirho || errorChirho.errorCode in UNREADABLE_CHIRHO) FailureChirho.MISSING_CHIRHO
            else FailureChirho.SIGNAL_CHIRHO
        }
    }
}
