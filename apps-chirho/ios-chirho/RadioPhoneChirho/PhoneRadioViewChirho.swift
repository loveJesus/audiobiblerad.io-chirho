// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// The iPhone radio's one screen: the station, the dial, the passage, power and chapter controls,
// the place in the chapter, the Sound switch, the recording's credit, then help and privacy.

import RadioCoreChirho
import RadioPlaybackChirho
import SwiftUI

struct PhoneRadioViewChirho: View {
    let modelChirho: RadioModelChirho
    /// The position under the listener's finger while dragging, applied on release.
    @State private var scrubChirho: Double?

    private var stateChirho: RadioStateChirho { modelChirho.stateChirho }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    stationChirho
                    PhoneDialViewChirho(modelChirho: modelChirho)
                    PhonePassageViewChirho(modelChirho: modelChirho)
                    controlsChirho
                    positionChirho
                    Text(statusChirho)
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                        .frame(minHeight: 36)
                    Toggle(
                        "Radio sounds",
                        isOn: Binding(
                            get: { stateChirho.soundsEnabledChirho },
                            set: { modelChirho.setSoundsChirho($0) }))
                    RecordingNoticeViewChirho(stationChirho: modelChirho.stationChirho)
                    supportChirho
                }
                .padding()
            }
            .navigationTitle("Audio Bible Radio")
            .navigationBarTitleDisplayMode(.inline)
        }
    }

    private var stationChirho: some View {
        VStack(spacing: 4) {
            Text(modelChirho.stationChirho.languageNameChirho)
                .font(.title2.weight(.semibold))
            Text(
                "\(modelChirho.stationChirho.versionChirho) · \(RadioModelChirho.voiceTextChirho(modelChirho.stationChirho))"
            )
            .font(.subheadline)
            .foregroundStyle(.secondary)
            .multilineTextAlignment(.center)
        }
        .accessibilityElement(children: .combine)
    }

    /// Help and the privacy policy, on the project's site.
    private var supportChirho: some View {
        HStack(spacing: 28) {
            Link(destination: SupportLinksChirho.helpChirho) {
                Label("Help", systemImage: "questionmark.circle")
            }
            Link(destination: SupportLinksChirho.privacyChirho) {
                Label("Privacy policy", systemImage: "hand.raised")
            }
        }
        .font(.footnote)
    }

    private var controlsChirho: some View {
        HStack(spacing: 36) {
            Button {
                modelChirho.previousChapterChirho()
            } label: {
                Image(systemName: "backward.end.fill").font(.title2)
            }
            .accessibilityLabel("Previous chapter")
            Button {
                Task { await modelChirho.powerChirho() }
            } label: {
                Label(stateChirho.isOnChirho ? "Off" : "On", systemImage: "power")
                    .font(.title3.weight(.semibold))
                    .frame(width: 96, height: 96)
                    .background(
                        Circle().fill(stateChirho.isOnChirho ? Color.red.opacity(0.18) : Color.green.opacity(0.22)))
            }
            .buttonStyle(.plain)
            .accessibilityLabel(stateChirho.isOnChirho ? "Turn the radio off" : "Turn the radio on")
            Button {
                modelChirho.nextChapterChirho()
            } label: {
                Image(systemName: "forward.end.fill").font(.title2)
            }
            .accessibilityLabel("Next chapter")
        }
    }

    @ViewBuilder private var positionChirho: some View {
        let durationChirho = stateChirho.durationChirho
        VStack(spacing: 4) {
            Slider(
                value: Binding(
                    get: { min(scrubChirho ?? stateChirho.secondsChirho, max(durationChirho, 0)) },
                    set: { scrubChirho = $0 }),
                in: 0...max(durationChirho, 1),
                onEditingChanged: { editingChirho in
                    if !editingChirho, let secondsChirho = scrubChirho {
                        modelChirho.seekChirho(toSecondsChirho: secondsChirho)
                        scrubChirho = nil
                    }
                })
            .disabled(durationChirho <= 0)
            .accessibilityLabel("Place in the chapter")
            HStack {
                Text(RadioModelChirho.clockTextChirho(scrubChirho ?? stateChirho.secondsChirho))
                Spacer()
                Text(durationChirho > 0 ? RadioModelChirho.clockTextChirho(durationChirho) : "")
            }
            .font(.caption.monospacedDigit())
            .foregroundStyle(.secondary)
        }
    }

    private var statusChirho: String {
        if !stateChirho.messageChirho.isEmpty { return stateChirho.messageChirho }
        switch stateChirho.phaseChirho {
        case .offChirho: return "Off"
        case .startingChirho, .loadingChirho: return "Tuning in to \(modelChirho.passageChirho)…"
        case .playingChirho: return "Playing \(modelChirho.passageChirho)"
        case .errorChirho: return "Stopped"
        }
    }
}
