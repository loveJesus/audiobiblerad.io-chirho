// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// The Watch radio, which needs no iPhone: it opens on its own bundled catalogue and streams straight
// from each publisher. It stays light: one plain screen, and the crown is the dial. Part of
// spec-chirho/workflows-chirho/experience-chirho/native_players_workflow_chirho.md.

import RadioPlaybackChirho
import SwiftUI

@main
struct RadioWatchAppChirho: App {
    @State private var modelChirho = RadioModelChirho.bundledChirho()
    @Environment(\.scenePhase) private var scenePhaseChirho

    var body: some Scene {
        WindowGroup {
            if let modelChirho {
                WatchRadioViewChirho(modelChirho: modelChirho)
                    .task { await modelChirho.launchChirho() }
            } else {
                Text("The station list could not be read. Reinstall Audio Bible Radio to restore it.")
                    .multilineTextAlignment(.center)
            }
        }
        .onChange(of: scenePhaseChirho) { _, phaseChirho in
            if phaseChirho != .active { modelChirho?.saveChirho() }
        }
    }
}
