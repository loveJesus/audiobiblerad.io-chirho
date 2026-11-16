// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// The tuned recording's credit and licence, as its licence asks them to be shown, and where it
// comes from. Every station shows its own.

import RadioCoreChirho
import SwiftUI

struct RecordingNoticeViewChirho: View {
    let stationChirho: StationChirho

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("This recording").font(.caption.weight(.semibold)).foregroundStyle(.secondary)
            Text(stationChirho.creditChirho).font(.footnote)
            linkChirho(stationChirho.licenceNameChirho, stationChirho.licenceUrlChirho)
            linkChirho(stationChirho.sourceNameChirho, stationChirho.sourceUrlChirho)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(RoundedRectangle(cornerRadius: 12).fill(Color.secondary.opacity(0.08)))
    }

    @ViewBuilder
    private func linkChirho(_ titleChirho: String, _ addressChirho: String) -> some View {
        if let urlChirho = URL(string: addressChirho), urlChirho.scheme == "https" {
            Link(titleChirho, destination: urlChirho).font(.footnote)
        } else {
            Text(titleChirho).font(.footnote)
        }
    }
}
