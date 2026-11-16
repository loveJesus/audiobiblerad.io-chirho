// swift-tools-version: 6.0
// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// The Swift shared by the iPhone and Watch radios. RadioCoreChirho is Foundation only: the
// catalogue contract, chapter addresses, remembered places and the radio's decisions, so its tests
// run on a Mac with no simulator. RadioPlaybackChirho adapts it to AVFoundation and MediaPlayer.

import PackageDescription

let package = Package(
    name: "RadioCoreChirho",
    platforms: [.iOS(.v17), .watchOS(.v10), .macOS(.v14)],
    products: [
        .library(name: "RadioCoreChirho", targets: ["RadioCoreChirho", "RadioPlaybackChirho"])
    ],
    targets: [
        .target(name: "RadioCoreChirho"),
        .target(name: "RadioPlaybackChirho", dependencies: ["RadioCoreChirho"]),
        .testTarget(name: "RadioCoreChirhoTests", dependencies: ["RadioCoreChirho"])
    ]
)
