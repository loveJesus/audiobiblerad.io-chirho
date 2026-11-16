// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// The tuned recording's credit and licence on the Watch, as its licence asks them to be shown, and
// the Sound switch.

import RadioCoreChirho
import RadioPlaybackChirho
import SwiftUI

struct WatchNoticeViewChirho: View {
    let modelChirho: RadioModelChirho

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 6) {
                let stationChirho = modelChirho.stationChirho
                Text("\(stationChirho.versionChirho) · \(RadioModelChirho.voiceTextChirho(stationChirho))")
                    .font(.footnote.weight(.semibold))
                Text(stationChirho.creditChirho).font(.footnote)
                Text(stationChirho.licenceNameChirho).font(.footnote).foregroundStyle(.secondary)
                Text(stationChirho.sourceNameChirho).font(.footnote).foregroundStyle(.secondary)
                Toggle(
                    "Radio sounds",
                    isOn: Binding(
                        get: { modelChirho.stateChirho.soundsEnabledChirho },
                        set: { modelChirho.setSoundsChirho($0) }))
            }
        }
    }
}
