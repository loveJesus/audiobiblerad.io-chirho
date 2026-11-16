// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// The iPhone dial: every station in a row, the one tuned held in the middle, and a step either way.
// A tap is a deliberate turn: a knob sound, then static while the station loads.

import RadioCoreChirho
import RadioPlaybackChirho
import SwiftUI

struct PhoneDialViewChirho: View {
    let modelChirho: RadioModelChirho

    var body: some View {
        HStack(spacing: 6) {
            stepChirho(-1, "chevron.left", "Previous station")
            ScrollViewReader { proxyChirho in
                ScrollView(.horizontal, showsIndicators: false) {
                    LazyHStack(spacing: 8) {
                        ForEach(modelChirho.stationsChirho) { stationChirho in
                            chipChirho(stationChirho)
                        }
                    }
                    .padding(.horizontal, 4)
                }
                .onAppear { proxyChirho.scrollTo(modelChirho.stationChirho.idChirho, anchor: .center) }
                .onChange(of: modelChirho.stationChirho.idChirho) { _, idChirho in
                    withAnimation { proxyChirho.scrollTo(idChirho, anchor: .center) }
                }
            }
            .frame(height: 60)
            stepChirho(1, "chevron.right", "Next station")
        }
    }

    private func chipChirho(_ stationChirho: StationChirho) -> some View {
        let tunedChirho = stationChirho.idChirho == modelChirho.stationChirho.idChirho
        return Button {
            modelChirho.dialStepChirho()
            modelChirho.tuneChirho(toStationIdChirho: stationChirho.idChirho)
        } label: {
            VStack(spacing: 2) {
                Text(stationChirho.versionCodeChirho).font(.headline.monospaced())
                Text(stationChirho.languageNameChirho).font(.caption).lineLimit(1)
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .background(
                Capsule().fill(tunedChirho ? Color.accentColor.opacity(0.25) : Color.secondary.opacity(0.12)))
        }
        .buttonStyle(.plain)
        .id(stationChirho.idChirho)
        .accessibilityLabel(
            "\(stationChirho.languageNameChirho), \(stationChirho.versionChirho), \(RadioModelChirho.voiceTextChirho(stationChirho))"
        )
        .accessibilityAddTraits(tunedChirho ? .isSelected : [])
    }

    private func stepChirho(_ stepsChirho: Int, _ symbolChirho: String, _ labelChirho: String)
        -> some View
    {
        Button {
            modelChirho.tuneChirho(byStepsChirho: stepsChirho)
        } label: {
            Image(systemName: symbolChirho).font(.title3).frame(width: 32, height: 44)
        }
        .accessibilityLabel(labelChirho)
    }
}
