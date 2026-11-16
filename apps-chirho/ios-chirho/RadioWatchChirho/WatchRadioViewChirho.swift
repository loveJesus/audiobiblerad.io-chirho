// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// The Watch radio's screen. Turning the crown moves the dial one station per detent, with a knob
// sound once the output is on, and the crown's own detent haptics before then; the radio tunes when
// the crown comes to rest, so a fast spin does not load every station on the way.

import RadioCoreChirho
import RadioPlaybackChirho
import SwiftUI

struct WatchRadioViewChirho: View {
    let modelChirho: RadioModelChirho
    /// Where the crown has the dial, which can run ahead of the tuned station while it turns.
    @State private var dialChirho = 0.0
    @State private var lastDetentChirho = 0
    @State private var passageShownChirho = false
    @State private var noticeShownChirho = false

    private var stateChirho: RadioStateChirho { modelChirho.stateChirho }
    private var countChirho: Int { modelChirho.stationsChirho.count }

    private var dialIndexChirho: Int {
        let roundedChirho = Int(dialChirho.rounded())
        return ((roundedChirho % countChirho) + countChirho) % countChirho
    }

    var body: some View {
        NavigationStack {
            VStack(spacing: 4) {
                let shownChirho = modelChirho.stationsChirho[dialIndexChirho]
                Text(shownChirho.versionCodeChirho).font(.headline)
                Text(shownChirho.languageNameChirho)
                    .font(.caption2)
                    .foregroundStyle(.secondary)
                    .lineLimit(1)
                Text(modelChirho.passageChirho).font(.footnote).lineLimit(1)
                HStack(spacing: 6) {
                    Button {
                        modelChirho.previousChapterChirho()
                    } label: {
                        Image(systemName: "backward.end.fill")
                    }
                    .accessibilityLabel("Previous chapter")
                    Button {
                        Task { await modelChirho.powerChirho() }
                    } label: {
                        Image(systemName: "power").font(.title3)
                    }
                    .tint(stateChirho.isOnChirho ? .red : .green)
                    .accessibilityLabel(stateChirho.isOnChirho ? "Turn the radio off" : "Turn the radio on")
                    Button {
                        modelChirho.nextChapterChirho()
                    } label: {
                        Image(systemName: "forward.end.fill")
                    }
                    .accessibilityLabel("Next chapter")
                }
                Text(statusChirho)
                    .font(.caption2)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
                    .lineLimit(2)
            }
            .focusable()
            .digitalCrownRotation(
                detent: $dialChirho, from: 0, through: Double(max(countChirho - 1, 0)), by: 1,
                sensitivity: .low, isContinuous: true, isHapticFeedbackEnabled: true,
                onChange: { _ in stepChirho() }, onIdle: { landChirho() }
            )
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button {
                        passageShownChirho = true
                    } label: {
                        Image(systemName: "book")
                    }
                    .accessibilityLabel("Book and chapter")
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        noticeShownChirho = true
                    } label: {
                        Image(systemName: "info.circle")
                    }
                    .accessibilityLabel("About this recording")
                }
            }
            .sheet(isPresented: $passageShownChirho) {
                NavigationStack {
                    WatchPassageViewChirho(modelChirho: modelChirho) { passageShownChirho = false }
                }
            }
            .sheet(isPresented: $noticeShownChirho) {
                WatchNoticeViewChirho(modelChirho: modelChirho)
            }
        }
        .onAppear { followTunedChirho() }
        .onChange(of: modelChirho.stationChirho.idChirho) { _, _ in followTunedChirho() }
    }

    /// The crown moved: a knob sound for each new detent, and only for the crown.
    private func stepChirho() {
        let detentChirho = dialIndexChirho
        guard detentChirho != lastDetentChirho else { return }
        lastDetentChirho = detentChirho
        modelChirho.dialStepChirho()
    }

    /// The crown came to rest: tune to the station it is on.
    private func landChirho() {
        modelChirho.tuneChirho(toStationIdChirho: modelChirho.stationsChirho[dialIndexChirho].idChirho)
    }

    /// The dial shows the tuned station whenever it changes some other way.
    private func followTunedChirho() {
        dialChirho = Double(modelChirho.stationIndexChirho)
        lastDetentChirho = modelChirho.stationIndexChirho
    }

    private var statusChirho: String {
        if !stateChirho.messageChirho.isEmpty { return stateChirho.messageChirho }
        switch stateChirho.phaseChirho {
        case .offChirho: return "Off"
        case .startingChirho: return "Choosing an output…"
        case .loadingChirho: return "Tuning in…"
        case .playingChirho: return "Playing"
        case .errorChirho: return "Stopped"
        }
    }
}
