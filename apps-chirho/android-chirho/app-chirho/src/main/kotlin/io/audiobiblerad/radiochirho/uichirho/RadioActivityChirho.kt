// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

package io.audiobiblerad.radiochirho.uichirho

import android.app.Activity
import android.content.ComponentName
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.text.util.Linkify
import android.view.View
import android.view.WindowInsets
import android.widget.AdapterView
import android.widget.ArrayAdapter
import android.widget.Button
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.SeekBar
import android.widget.Spinner
import android.widget.Switch
import android.widget.TextView
import androidx.media3.common.C
import androidx.media3.common.Player
import androidx.media3.session.MediaController
import androidx.media3.session.SessionCommand
import androidx.media3.session.SessionResult
import androidx.media3.session.SessionToken
import com.google.common.util.concurrent.ListenableFuture
import io.audiobiblerad.radiochirho.R
import io.audiobiblerad.radiochirho.corechirho.BookChirho
import io.audiobiblerad.radiochirho.corechirho.CatalogueChirho
import io.audiobiblerad.radiochirho.corechirho.FeedbackChirho
import io.audiobiblerad.radiochirho.corechirho.PhaseChirho
import io.audiobiblerad.radiochirho.corechirho.PlaceChirho
import io.audiobiblerad.radiochirho.corechirho.ProblemChirho
import io.audiobiblerad.radiochirho.corechirho.RadioStateChirho
import io.audiobiblerad.radiochirho.corechirho.StationChirho
import io.audiobiblerad.radiochirho.platformchirho.RadioCommandsChirho
import io.audiobiblerad.radiochirho.platformchirho.RadioServiceChirho
import io.audiobiblerad.radiochirho.platformchirho.readBundledCatalogueChirho
import java.util.Locale
import java.util.concurrent.Executor

// The radio's screen. It shows the service's state and sends it commands; it never plays audio or
// keeps its own idea of the station, the place, an error or the Sound switch. On-screen controls
// make their click or knob sound; the controller decides the rest.
// See spec-chirho/workflows-chirho/experience-chirho/native_players_workflow_chirho.md.
class RadioActivityChirho : Activity() {
    private var catalogueChirho: CatalogueChirho? = null
    private lateinit var statusChirho: TextView
    private lateinit var stationSelectChirho: Spinner
    private lateinit var bookSelectChirho: Spinner
    private lateinit var chapterSelectChirho: Spinner
    private lateinit var powerChirho: Button
    private lateinit var positionChirho: TextView
    private lateinit var seekChirho: SeekBar
    private lateinit var soundChirho: Switch
    private lateinit var creditsChirho: TextView
    private var controllerChirho: MediaController? = null
    private var controllerFutureChirho: ListenableFuture<MediaController>? = null
    private var stateChirho: RadioStateChirho? = null
    private var booksChirho: List<BookChirho> = emptyList()
    private var chaptersChirho: List<Int> = emptyList()
    private var shownStationChirho = ""
    private var shownBookChirho = ""
    private var renderingChirho = false
    private var draggingChirho = false
    private var autoplayPendingChirho = false
    private val handlerChirho = Handler(Looper.getMainLooper())
    private val mainExecutorChirho = Executor { taskChirho -> handlerChirho.post(taskChirho) }
    private val clockChirho = object : Runnable {
        override fun run() {
            renderPositionChirho()
            handlerChirho.postDelayed(this, 1000)
        }
    }
    private val playerListenerChirho = object : Player.Listener {
        override fun onEvents(player: Player, events: Player.Events) = renderPositionChirho()
    }
    private val sessionListenerChirho = object : MediaController.Listener {
        override fun onExtrasChanged(controller: MediaController, extras: Bundle) {
            RadioCommandsChirho.stateChirho(extras)?.let { publishedChirho -> renderStateChirho(publishedChirho) }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        autoplayPendingChirho = savedInstanceState == null
        val catalogueChirho = runCatching { readBundledCatalogueChirho(assets) }.getOrNull()
        if (catalogueChirho == null) {
            setContentView(TextView(this).apply { setText(R.string.catalogue_error_chirho) })
            return
        }
        this.catalogueChirho = catalogueChirho
        buildScreenChirho(catalogueChirho)
    }

    private fun buildScreenChirho(catalogueChirho: CatalogueChirho) {
        val paddingChirho = resources.getDimensionPixelSize(R.dimen.screen_padding_chirho)
        val bodyChirho = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(paddingChirho, paddingChirho, paddingChirho, paddingChirho)
        }
        fun labelChirho(textChirho: Int) = TextView(this).apply { setText(textChirho) }.also { labelViewChirho -> bodyChirho.addView(labelViewChirho) }
        labelChirho(R.string.app_name_chirho).textSize = 26f
        statusChirho = labelChirho(R.string.connecting_chirho)
        labelChirho(R.string.station_chirho)
        stationSelectChirho = Spinner(this).also { spinnerChirho -> bodyChirho.addView(spinnerChirho) }
        stationSelectChirho.adapter = adapterChirho(catalogueChirho.stationsChirho.map { stationChirho -> stationChirho.labelChirho })
        labelChirho(R.string.book_chirho)
        bookSelectChirho = Spinner(this).also { spinnerChirho -> bodyChirho.addView(spinnerChirho) }
        labelChirho(R.string.chapter_chirho)
        chapterSelectChirho = Spinner(this).also { spinnerChirho -> bodyChirho.addView(spinnerChirho) }
        powerChirho = Button(this).apply {
            setText(R.string.power_off_chirho)
            isEnabled = false
            setOnClickListener {
                val onChirho = stateChirho?.poweredChirho != true
                commandChirho(RadioCommandsChirho.POWER_CHIRHO, FeedbackChirho.CLICK_CHIRHO) { putBoolean(RadioCommandsChirho.ON_KEY_CHIRHO, onChirho) }
            }
        }
        bodyChirho.addView(powerChirho)
        val stepsChirho = LinearLayout(this)
        for ((textChirho, nextChirho) in listOf(R.string.previous_chirho to false, R.string.next_chirho to true))
            stepsChirho.addView(Button(this).apply {
                setText(textChirho)
                setOnClickListener {
                    commandChirho(RadioCommandsChirho.STEP_CHIRHO, FeedbackChirho.CLICK_CHIRHO) { putBoolean(RadioCommandsChirho.NEXT_KEY_CHIRHO, nextChirho) }
                }
            }, LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f))
        bodyChirho.addView(stepsChirho)
        positionChirho = TextView(this).also { textViewChirho -> bodyChirho.addView(textViewChirho) }
        seekChirho = SeekBar(this).apply { max = 1000; contentDescription = getString(R.string.position_chirho) }
        bodyChirho.addView(seekChirho)
        soundChirho = Switch(this).apply { setText(R.string.sound_chirho) }
        bodyChirho.addView(soundChirho)
        labelChirho(R.string.about_chirho)
        creditsChirho = TextView(this).also { textViewChirho -> bodyChirho.addView(textViewChirho) }
        val screenChirho = ScrollView(this).apply { addView(bodyChirho) }
        // From Android 15 the app draws behind the system bars, so the controls keep clear of them.
        screenChirho.setOnApplyWindowInsetsListener { viewChirho, insetsChirho ->
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                val barsChirho = insetsChirho.getInsets(WindowInsets.Type.systemBars() or WindowInsets.Type.displayCutout())
                viewChirho.setPadding(barsChirho.left, barsChirho.top, barsChirho.right, barsChirho.bottom)
            }
            insetsChirho
        }
        setContentView(screenChirho)

        stationSelectChirho.onItemSelectedListener = selectionChirho { indexChirho ->
            val chosenChirho = catalogueChirho.stationsChirho.getOrNull(indexChirho) ?: return@selectionChirho
            if (chosenChirho.idChirho != stateChirho?.stationIdChirho)
                commandChirho(RadioCommandsChirho.STATION_CHIRHO, FeedbackChirho.KNOB_CHIRHO) { putString(RadioCommandsChirho.STATION_KEY_CHIRHO, chosenChirho.idChirho) }
        }
        bookSelectChirho.onItemSelectedListener = selectionChirho { indexChirho ->
            val stateChirho = stateChirho ?: return@selectionChirho
            val bookChirho = booksChirho.getOrNull(indexChirho) ?: return@selectionChirho
            val stationChirho = catalogueChirho.stationsByIdChirho[stateChirho.stationIdChirho] ?: return@selectionChirho
            if (bookChirho.idChirho == stateChirho.placeChirho.bookIdChirho) return@selectionChirho
            val firstChirho = catalogueChirho.offeredChaptersChirho(stationChirho, bookChirho).firstOrNull() ?: return@selectionChirho
            chooseChapterChirho(PlaceChirho(bookChirho.idChirho, firstChirho))
        }
        chapterSelectChirho.onItemSelectedListener = selectionChirho { indexChirho ->
            val stateChirho = stateChirho ?: return@selectionChirho
            val chapterChirho = chaptersChirho.getOrNull(indexChirho) ?: return@selectionChirho
            if (chapterChirho != stateChirho.placeChirho.chapterChirho)
                chooseChapterChirho(PlaceChirho(stateChirho.placeChirho.bookIdChirho, chapterChirho))
        }
        soundChirho.setOnCheckedChangeListener { _, enabledChirho ->
            if (!renderingChirho && enabledChirho != stateChirho?.soundsEnabledChirho)
                commandChirho(RadioCommandsChirho.SOUND_CHIRHO, FeedbackChirho.NONE_CHIRHO) { putBoolean(RadioCommandsChirho.ENABLED_KEY_CHIRHO, enabledChirho) }
        }
        seekChirho.setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
            override fun onProgressChanged(seekBar: SeekBar?, progress: Int, fromUser: Boolean) {
                if (fromUser) renderPositionChirho()
            }

            override fun onStartTrackingTouch(seekBar: SeekBar?) {
                draggingChirho = true
            }

            override fun onStopTrackingTouch(seekBar: SeekBar?) {
                draggingChirho = false
                val controllerChirho = controllerChirho ?: return
                val durationChirho = controllerChirho.duration.takeIf { msChirho -> msChirho > 0 && msChirho != C.TIME_UNSET } ?: return
                controllerChirho.seekTo(durationChirho * seekChirho.progress / 1000)
            }
        })
    }

    override fun onStart() {
        super.onStart()
        if (catalogueChirho == null) return
        val futureChirho = MediaController.Builder(this, SessionToken(this, ComponentName(this, RadioServiceChirho::class.java)))
            .setListener(sessionListenerChirho)
            .buildAsync()
        controllerFutureChirho = futureChirho
        futureChirho.addListener({
            if (controllerFutureChirho !== futureChirho) return@addListener
            runCatching { futureChirho.get() }.onSuccess { controllerChirho ->
                this.controllerChirho = controllerChirho
                controllerChirho.addListener(playerListenerChirho)
                powerChirho.isEnabled = true
                commandChirho(RadioCommandsChirho.STATE_CHIRHO, FeedbackChirho.NONE_CHIRHO) {}
                if (autoplayPendingChirho) {
                    autoplayPendingChirho = false
                    commandChirho(RadioCommandsChirho.AUTOPLAY_CHIRHO, FeedbackChirho.NONE_CHIRHO) {}
                }
                handlerChirho.post(clockChirho)
            }.onFailure { statusChirho.setText(R.string.catalogue_error_chirho) }
        }, mainExecutorChirho)
    }

    override fun onStop() {
        commandChirho(RadioCommandsChirho.SAVE_CHIRHO, FeedbackChirho.NONE_CHIRHO) {}
        handlerChirho.removeCallbacks(clockChirho)
        controllerChirho?.removeListener(playerListenerChirho)
        controllerChirho = null
        controllerFutureChirho?.let { futureChirho -> MediaController.releaseFuture(futureChirho) }
        controllerFutureChirho = null
        super.onStop()
    }

    private fun chooseChapterChirho(placeChirho: PlaceChirho) =
        commandChirho(RadioCommandsChirho.CHAPTER_CHIRHO, FeedbackChirho.CLICK_CHIRHO) {
            putString(RadioCommandsChirho.BOOK_KEY_CHIRHO, placeChirho.bookIdChirho)
            putInt(RadioCommandsChirho.CHAPTER_KEY_CHIRHO, placeChirho.chapterChirho)
        }

    /** Sends one of the radio's commands and shows the state it answers with. */
    private fun commandChirho(actionChirho: String, feedbackChirho: FeedbackChirho, argsChirho: Bundle.() -> Unit) {
        val controllerChirho = controllerChirho ?: return
        val bundleChirho = Bundle().apply {
            putString(RadioCommandsChirho.FEEDBACK_KEY_CHIRHO, feedbackChirho.name)
            argsChirho()
        }
        val resultChirho = controllerChirho.sendCustomCommand(SessionCommand(actionChirho, Bundle.EMPTY), bundleChirho)
        resultChirho.addListener({
            val answerChirho = runCatching { resultChirho.get() }.getOrNull() ?: return@addListener
            if (answerChirho.resultCode == SessionResult.RESULT_SUCCESS)
                RadioCommandsChirho.stateChirho(answerChirho.extras)?.let { answeredChirho -> renderStateChirho(answeredChirho) }
        }, mainExecutorChirho)
    }

    private fun adapterChirho(valuesChirho: List<String>): ArrayAdapter<String> =
        ArrayAdapter(this, android.R.layout.simple_spinner_item, valuesChirho).apply {
            setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        }

    private fun selectionChirho(chosenChirho: (Int) -> Unit) = object : AdapterView.OnItemSelectedListener {
        override fun onItemSelected(parent: AdapterView<*>?, view: View?, position: Int, id: Long) {
            if (!renderingChirho && controllerChirho != null) chosenChirho(position)
        }

        override fun onNothingSelected(parent: AdapterView<*>?) = Unit
    }

    private fun renderStateChirho(stateChirho: RadioStateChirho) {
        val catalogueChirho = catalogueChirho ?: return
        val stationChirho = catalogueChirho.stationsByIdChirho[stateChirho.stationIdChirho] ?: return
        this.stateChirho = stateChirho
        renderingChirho = true
        try {
            if (stationChirho.idChirho != shownStationChirho) {
                shownStationChirho = stationChirho.idChirho
                shownBookChirho = ""
                stationSelectChirho.setSelection(catalogueChirho.stationsChirho.indexOf(stationChirho))
                booksChirho = catalogueChirho.offeredBooksChirho(stationChirho)
                bookSelectChirho.adapter = adapterChirho(booksChirho.map { offeredBookChirho -> offeredBookChirho.nameChirho })
                creditsChirho.text = creditsOfChirho(stationChirho)
                Linkify.addLinks(creditsChirho, Linkify.WEB_URLS)
            }
            if (stateChirho.placeChirho.bookIdChirho != shownBookChirho) {
                shownBookChirho = stateChirho.placeChirho.bookIdChirho
                val bookChirho = catalogueChirho.booksByIdChirho[shownBookChirho]
                bookSelectChirho.setSelection(bookChirho?.let { chosenBookChirho -> booksChirho.indexOf(chosenBookChirho) }?.coerceAtLeast(0) ?: 0)
                chaptersChirho = bookChirho?.let { chosenBookChirho -> catalogueChirho.offeredChaptersChirho(stationChirho, chosenBookChirho) }.orEmpty()
                chapterSelectChirho.adapter = adapterChirho(chaptersChirho.map { chapterChirho -> String.format(Locale.getDefault(), "%d", chapterChirho) })
            }
            chapterSelectChirho.setSelection(chaptersChirho.indexOf(stateChirho.placeChirho.chapterChirho).coerceAtLeast(0))
            // Like the radio on the web, the switch shows its state: ON while the radio is on.
            powerChirho.setText(if (stateChirho.poweredChirho) R.string.power_on_chirho else R.string.power_off_chirho)
            powerChirho.contentDescription = getString(R.string.power_description_chirho, powerChirho.text)
            soundChirho.isChecked = stateChirho.soundsEnabledChirho
            when {
                stateChirho.problemChirho == ProblemChirho.SIGNAL_CHIRHO -> statusChirho.setText(R.string.signal_error_chirho)
                stateChirho.problemChirho == ProblemChirho.STALLED_CHIRHO -> statusChirho.setText(R.string.stalled_error_chirho)
                stateChirho.phaseChirho == PhaseChirho.LOADING_CHIRHO -> statusChirho.setText(R.string.connecting_chirho)
                else -> statusChirho.text = getString(
                    R.string.place_format_chirho,
                    catalogueChirho.booksByIdChirho[stateChirho.placeChirho.bookIdChirho]?.nameChirho.orEmpty(),
                    stateChirho.placeChirho.chapterChirho
                )
            }
        } finally {
            renderingChirho = false
        }
        renderPositionChirho()
    }

    /** The playing recording's credit, licence and source, with their addresses linked. */
    private fun creditsOfChirho(stationChirho: StationChirho): String =
        listOf(
            stationChirho.creditChirho,
            getString(R.string.licence_format_chirho, stationChirho.licenceNameChirho, stationChirho.licenceUrlChirho),
            getString(R.string.source_format_chirho, stationChirho.sourceNameChirho, stationChirho.sourceUrlChirho)
        ).joinToString(separator = System.lineSeparator() + System.lineSeparator())

    private fun renderPositionChirho() {
        val controllerChirho = controllerChirho ?: return
        val durationChirho = controllerChirho.duration.takeIf { msChirho -> msChirho > 0 && msChirho != C.TIME_UNSET } ?: 0L
        val currentChirho = if (draggingChirho) durationChirho * seekChirho.progress / 1000
        else controllerChirho.currentPosition.coerceAtLeast(0L)
        if (!draggingChirho) seekChirho.progress = if (durationChirho > 0) (currentChirho * 1000 / durationChirho).toInt().coerceIn(0, 1000) else 0
        seekChirho.isEnabled = durationChirho > 0
        positionChirho.text = getString(R.string.position_format_chirho, timeChirho(currentChirho), timeChirho(durationChirho))
    }

    private fun timeChirho(millisecondsChirho: Long): String =
        String.format(Locale.getDefault(), "%d:%02d", millisecondsChirho / 60_000, millisecondsChirho / 1000 % 60)
}
