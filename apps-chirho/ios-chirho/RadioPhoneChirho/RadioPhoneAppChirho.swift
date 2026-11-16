// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// The iPhone radio. It opens on the bundled catalogue and plays at once, unless the listener's last
// word was Off. Part of spec-chirho/workflows-chirho/experience-chirho/native_players_workflow_chirho.md.

import RadioPlaybackChirho
import SwiftUI

@main
struct RadioPhoneAppChirho: App {
    @State private var modelChirho = RadioModelChirho.bundledChirho()
    @Environment(\.scenePhase) private var scenePhaseChirho

    var body: some Scene {
        WindowGroup {
            if let modelChirho {
                PhoneRadioViewChirho(modelChirho: modelChirho)
                    .task { await modelChirho.launchChirho() }
            } else {
                ContentUnavailableView(
                    "The station list could not be read", systemImage: "antenna.radiowaves.left.and.right.slash",
                    description: Text("Reinstall Audio Bible Radio to restore it."))
            }
        }
        .onChange(of: scenePhaseChirho) { _, phaseChirho in
            if phaseChirho != .active { modelChirho?.saveChirho() }
        }
    }
}
