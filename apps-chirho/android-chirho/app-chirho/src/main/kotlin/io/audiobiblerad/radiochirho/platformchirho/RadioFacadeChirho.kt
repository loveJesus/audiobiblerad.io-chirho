// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

package io.audiobiblerad.radiochirho.platformchirho

import androidx.annotation.OptIn
import androidx.media3.common.ForwardingPlayer
import androidx.media3.common.Player
import androidx.media3.common.util.UnstableApi
import io.audiobiblerad.radiochirho.corechirho.FeedbackChirho
import io.audiobiblerad.radiochirho.corechirho.RadioControllerChirho

// What the media session shows the system: the one ExoPlayer, with every command a headset, lock
// screen or notification sends routed through the radio's controller, quietly. Play and pause
// are On and Off; next and previous move a chapter; seeking stays within the chapter. Nothing from
// outside can hand the player its own media items. ForwardingPlayer is a Media3 unstable API.
@OptIn(UnstableApi::class)
class RadioFacadeChirho(
    playerChirho: Player,
    private val radioChirho: () -> RadioControllerChirho?
) : ForwardingPlayer(playerChirho) {
    override fun play() {
        radioChirho()?.onChirho(FeedbackChirho.NONE_CHIRHO)
    }

    override fun pause() {
        radioChirho()?.offChirho(FeedbackChirho.NONE_CHIRHO)
    }

    override fun stop() {
        radioChirho()?.offChirho(FeedbackChirho.NONE_CHIRHO)
    }

    override fun setPlayWhenReady(playWhenReady: Boolean) {
        if (playWhenReady) play() else pause()
    }

    /** The controller prepares what it loads; a system play on an idle radio arrives through play(). */
    override fun prepare() = Unit

    override fun seekToNext() {
        radioChirho()?.nextChirho(FeedbackChirho.NONE_CHIRHO)
    }

    override fun seekToNextMediaItem() {
        radioChirho()?.nextChirho(FeedbackChirho.NONE_CHIRHO)
    }

    override fun seekToPrevious() {
        radioChirho()?.previousChirho(FeedbackChirho.NONE_CHIRHO)
    }

    override fun seekToPreviousMediaItem() {
        radioChirho()?.previousChirho(FeedbackChirho.NONE_CHIRHO)
    }

    override fun seekTo(positionMs: Long) {
        radioChirho()?.seekChirho(positionMs / 1000.0)
    }

    override fun seekTo(mediaItemIndex: Int, positionMs: Long) {
        if (mediaItemIndex == currentMediaItemIndex) seekTo(positionMs)
    }

    override fun seekBack() = seekTo(maxOf(0L, currentPosition - seekBackIncrement))

    override fun seekForward() = seekTo(currentPosition + seekForwardIncrement)

    // One chapter is loaded at a time, yet the radio always has a chapter before and after it.
    override fun hasNextMediaItem() = true

    override fun hasPreviousMediaItem() = true

    override fun getAvailableCommands(): Player.Commands =
        super.getAvailableCommands().buildUpon()
            .addAll(
                Player.COMMAND_PLAY_PAUSE,
                Player.COMMAND_SEEK_TO_NEXT,
                Player.COMMAND_SEEK_TO_NEXT_MEDIA_ITEM,
                Player.COMMAND_SEEK_TO_PREVIOUS,
                Player.COMMAND_SEEK_TO_PREVIOUS_MEDIA_ITEM
            )
            .removeAll(Player.COMMAND_SET_MEDIA_ITEM, Player.COMMAND_CHANGE_MEDIA_ITEMS)
            .build()

    override fun isCommandAvailable(command: Int) = availableCommands.contains(command)
}
