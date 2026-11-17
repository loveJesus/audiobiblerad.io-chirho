// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// The tuned recording's credit and licence on the Watch, as its licence asks them to be shown, the
// Sound switch, then privacy in brief with help and the full policy on the project's site. A web
// page is hard to read on a wrist, so the brief says what matters here.

import RadioCoreChirho
import RadioPlaybackChirho
import SwiftUI

struct WatchNoticeViewChirho: View {
    /// What the Watch keeps and whom it asks for recordings, as RememberedRadioChirho and the
    /// catalogue's hosts have it.
    private static let privacyChirho =
        "No account is needed. Your station, place and settings are saved on this watch. "
        + "Recordings and verse timings stream from their publishers, whose servers receive your "
        + "IP address and the requested passage."

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
                Text("Privacy").font(.footnote.weight(.semibold)).padding(.top, 6)
                Text(Self.privacyChirho).font(.footnote).foregroundStyle(.secondary)
                Link("Privacy policy", destination: SupportLinksChirho.privacyChirho).font(.footnote)
                Link("Help", destination: SupportLinksChirho.helpChirho).font(.footnote)
            }
        }
    }
}
