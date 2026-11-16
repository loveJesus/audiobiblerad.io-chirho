// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// Which prepared clip the radio plays for each kind of feedback, read from the profile the native
// sound preparer writes into apps-chirho/shared-chirho/native-assets-chirho/sounds-chirho/. Checked
// field by field exactly as src/lib/sounds-chirho/sound_profile_chirho.ts checks the web's: one
// bad field and there is no profile, so the radio stays silent rather than guess. The folder is
// ignored by Git: owner builds hold the purchased effects, a public clone the open set. Part of
// spec-chirho/workflows-chirho/radio_sounds_workflow_chirho.md and
// spec-chirho/workflows-chirho/experience-chirho/native_players_workflow_chirho.md.

import Foundation

public enum SoundRoleChirho: String, CaseIterable, Sendable {
    /// Static while the next station loads.
    case tuningChirho = "tuning_chirho"
    /// A press.
    case clickChirho = "click_chirho"
    /// A step of the dial.
    case knobChirho = "knob_chirho"

    /// The fewest and most clips a profile may name: tuning needs one; the others may be silent.
    var limitsChirho: ClosedRange<Int> {
        switch self {
        case .tuningChirho: 1...16
        case .clickChirho, .knobChirho: 0...4
        }
    }
}

public struct SoundClipChirho: Sendable, Equatable {
    /// A path under /sounds-chirho/, relative to the native assets folder.
    public let pathChirho: String
    /// Where in the recording to begin, for a clip whose useful sound starts late.
    public let startSecondsChirho: Double
}

public struct SoundProfileChirho: Sendable, Equatable {
    public static let schemaChirho = "radio-sounds-profile-v1-chirho"
    /// A profile is a short list of paths. Anything larger is not one.
    public static let largestBytesChirho = 8192
    static let latestStartChirho = 10.0

    /// `licensed` or `open`.
    public let sourceChirho: String
    public let clipsChirho: [SoundRoleChirho: [SoundClipChirho]]

    private struct ClipFileChirho: Decodable {
        let urlChirho: String
        let startSecondsChirho: Double?
        enum CodingKeys: String, CodingKey {
            case urlChirho = "url_chirho"
            case startSecondsChirho = "start_seconds_chirho"
        }
    }

    private struct FileChirho: Decodable {
        let schemaChirho: String
        let sourceChirho: String
        let tuningChirho: [ClipFileChirho]
        let clickChirho: [ClipFileChirho]
        let knobChirho: [ClipFileChirho]
        enum CodingKeys: String, CodingKey {
            case schemaChirho = "schema_chirho"
            case sourceChirho = "source_chirho"
            case tuningChirho = "tuning_chirho"
            case clickChirho = "click_chirho"
            case knobChirho = "knob_chirho"
        }
    }

    /// A profile, or nothing when anything in it is out of bounds.
    public static func parseChirho(_ dataChirho: Data) -> SoundProfileChirho? {
        guard dataChirho.count <= largestBytesChirho,
            let fileChirho = try? JSONDecoder().decode(FileChirho.self, from: dataChirho),
            fileChirho.schemaChirho == schemaChirho,
            fileChirho.sourceChirho == "licensed" || fileChirho.sourceChirho == "open"
        else { return nil }
        var clipsChirho: [SoundRoleChirho: [SoundClipChirho]] = [:]
        let listsChirho: [(SoundRoleChirho, [ClipFileChirho])] = [
            (.tuningChirho, fileChirho.tuningChirho), (.clickChirho, fileChirho.clickChirho),
            (.knobChirho, fileChirho.knobChirho)
        ]
        for (roleChirho, listChirho) in listsChirho {
            guard roleChirho.limitsChirho.contains(listChirho.count) else { return nil }
            var roleClipsChirho: [SoundClipChirho] = []
            for clipChirho in listChirho {
                let startChirho = clipChirho.startSecondsChirho ?? 0
                guard isClipPathChirho(clipChirho.urlChirho), startChirho.isFinite,
                    (0...latestStartChirho).contains(startChirho)
                else { return nil }
                roleClipsChirho.append(
                    SoundClipChirho(pathChirho: clipChirho.urlChirho, startSecondsChirho: startChirho))
            }
            clipsChirho[roleChirho] = roleClipsChirho
        }
        return SoundProfileChirho(sourceChirho: fileChirho.sourceChirho, clipsChirho: clipsChirho)
    }

    /// Lower-case words under /sounds-chirho/, at most three folders deep, ending in .wav: no way
    /// out of the folder, and no host, query or fragment. The web's own pattern, without a regex.
    public static func isClipPathChirho(_ pathChirho: String) -> Bool {
        let prefixChirho = "/sounds-chirho/"
        guard pathChirho.hasPrefix(prefixChirho), pathChirho.hasSuffix(".wav") else { return false }
        let innerChirho = pathChirho.dropFirst(prefixChirho.count).dropLast(".wav".count)
        let segmentsChirho = innerChirho.split(separator: "/", omittingEmptySubsequences: false)
        guard (1...4).contains(segmentsChirho.count) else { return false }
        return segmentsChirho.allSatisfy { segmentChirho in
            !segmentChirho.isEmpty
                && segmentChirho.unicodeScalars.allSatisfy {
                    ("a"..."z").contains($0) || ("0"..."9").contains($0) || $0 == "_" || $0 == "-"
                }
        }
    }

    /// The clip's file inside the assets folder the profile came from.
    public static func fileUrlChirho(_ clipChirho: SoundClipChirho, inChirho folderChirho: URL) -> URL? {
        guard isClipPathChirho(clipChirho.pathChirho) else { return nil }
        return folderChirho.appendingPathComponent(String(clipChirho.pathChirho.dropFirst()))
    }
}
