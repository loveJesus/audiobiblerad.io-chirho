// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// The sound profile is checked as the web checks it, and a clip can never point outside the
// bundled assets folder. When the ignored native assets folder is present, its own profile and
// every clip it names are checked too.

import Foundation
import Testing

@testable import RadioCoreChirho

@Suite("The sound profile")
struct SoundProfileTestsChirho {
    private func profileJsonChirho(
        tuningChirho: String = #"[{"url_chirho":"/sounds-chirho/radio_01_chirho.wav"}]"#,
        knobChirho: String = #"[{"url_chirho":"/sounds-chirho/interface-chirho/knob_chirho.wav"}]"#,
        sourceChirho: String = "open"
    ) -> Data {
        Data(
            """
            {"schema_chirho":"radio-sounds-profile-v1-chirho","source_chirho":"\(sourceChirho)",
            "tuning_chirho":\(tuningChirho),"click_chirho":[],"knob_chirho":\(knobChirho)}
            """.utf8)
    }

    @Test("A well-formed profile reads, with starts defaulting to zero")
    func goodProfileChirho() throws {
        let profileChirho = try #require(SoundProfileChirho.parseChirho(profileJsonChirho()))
        #expect(profileChirho.sourceChirho == "open")
        #expect(profileChirho.clipsChirho[.knobChirho]?.first?.startSecondsChirho == 0)
        #expect(profileChirho.clipsChirho[.clickChirho] == [])
        let legacyChirho = try #require(
            SoundProfileChirho.parseChirho(
                profileJsonChirho(
                    knobChirho: #"[{"url_chirho":"/sounds-chirho/k_chirho.wav","start_seconds_chirho":0.9}]"#)))
        #expect(legacyChirho.clipsChirho[.knobChirho]?.first?.startSecondsChirho == 0.9)
    }

    @Test("Anything out of bounds means no profile at all")
    func badProfilesChirho() {
        let badChirho: [Data] = [
            profileJsonChirho(tuningChirho: "[]"),
            profileJsonChirho(sourceChirho: "stolen"),
            profileJsonChirho(knobChirho: #"[{"url_chirho":"/sounds-chirho/../secret.wav"}]"#),
            profileJsonChirho(knobChirho: #"[{"url_chirho":"https://example.com/sounds-chirho/a.wav"}]"#),
            profileJsonChirho(knobChirho: #"[{"url_chirho":"/sounds-chirho/A.wav"}]"#),
            profileJsonChirho(knobChirho: #"[{"url_chirho":"/sounds-chirho/a/b/c/d/e.wav"}]"#),
            profileJsonChirho(knobChirho: #"[{"url_chirho":"/sounds-chirho/a.mp3"}]"#),
            profileJsonChirho(knobChirho: #"[{"url_chirho":"/sounds-chirho/a.wav","start_seconds_chirho":11}]"#),
            profileJsonChirho(knobChirho: #"[{"url_chirho":"/sounds-chirho/a.wav","start_seconds_chirho":-1}]"#),
            profileJsonChirho(knobChirho: #"[{"url_chirho":"/sounds-chirho/a.wav","start_seconds_chirho":"0.9"}]"#),
            Data(String(repeating: " ", count: SoundProfileChirho.largestBytesChirho + 1).utf8),
            Data("{}".utf8)
        ]
        for dataChirho in badChirho {
            #expect(SoundProfileChirho.parseChirho(dataChirho) == nil, "\(String(decoding: dataChirho, as: UTF8.self))")
        }
    }

    @Test("A clip resolves only inside the assets folder")
    func clipsStayInsideChirho() {
        let folderChirho = URL(fileURLWithPath: "/bundle/native-assets-chirho")
        let clipChirho = SoundClipChirho(pathChirho: "/sounds-chirho/interface-chirho/knob_chirho.wav", startSecondsChirho: 0)
        #expect(
            SoundProfileChirho.fileUrlChirho(clipChirho, inChirho: folderChirho)?.path
                == "/bundle/native-assets-chirho/sounds-chirho/interface-chirho/knob_chirho.wav")
        let escapeChirho = SoundClipChirho(pathChirho: "/sounds-chirho/../../etc.wav", startSecondsChirho: 0)
        #expect(SoundProfileChirho.fileUrlChirho(escapeChirho, inChirho: folderChirho) == nil)
    }

    /// apps-chirho/shared-chirho/native-assets-chirho, which the native sound preparer writes and Git ignores.
    static let assetsFolderChirho = FixturesChirho.sharedCatalogueUrlChirho
        .deletingLastPathComponent().appendingPathComponent("native-assets-chirho")

    @Test(
        "The prepared native profile reads and every clip it names is a short file that exists",
        .enabled(
            if: FileManager.default.fileExists(
                atPath: SoundProfileTestsChirho.assetsFolderChirho.appendingPathComponent("sounds-chirho/profile_chirho.json").path),
            "The ignored native assets folder has not been prepared here."))
    func preparedProfileChirho() throws {
        let folderChirho = Self.assetsFolderChirho
        let profileChirho = try #require(
            SoundProfileChirho.parseChirho(
                try Data(contentsOf: folderChirho.appendingPathComponent("sounds-chirho/profile_chirho.json"))))
        for clipChirho in profileChirho.clipsChirho.values.flatMap({ $0 }) {
            let urlChirho = try #require(SoundProfileChirho.fileUrlChirho(clipChirho, inChirho: folderChirho))
            let sizeChirho = try #require(
                try FileManager.default.attributesOfItem(atPath: urlChirho.path)[.size] as? Int)
            // Short prepared effects, never whole source recordings.
            #expect(sizeChirho > 44 && sizeChirho < 2_000_000, "\(clipChirho.pathChirho) is \(sizeChirho) bytes")
        }
    }
}
