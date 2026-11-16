// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// Verse timings: a source's own timings file turned into one plain list, so that two stations can
// be held on the same verse when the dial turns. A port of
// src/lib/catalogue-chirho/locate-chirho/timings_chirho.ts. Part of
// spec-chirho/workflows-chirho/experience-chirho/native_players_workflow_chirho.md.

import Foundation

public enum VerseTimingsChirho {
    /// A timings file is a short list of numbers. Anything larger is not read.
    public static let largestBytesChirho = 64_000

    private struct FileChirho: Decodable {
        let versesChirho: [Double]
        // The publisher's own field name.
        enum CodingKeys: String, CodingKey { case versesChirho = "verses" }
    }

    /// Each verse's start in seconds, verse 1 first. Nothing when the file is too large, is not an
    /// object with a non-empty `verses` list, or holds anything that is not a time from 0 upwards
    /// in order. The caller then carries the position by fraction instead.
    public static func parseChirho(_ dataChirho: Data) -> [Double]? {
        guard dataChirho.count <= largestBytesChirho,
            let fileChirho = try? JSONDecoder().decode(FileChirho.self, from: dataChirho),
            !fileChirho.versesChirho.isEmpty
        else { return nil }
        var previousChirho = 0.0
        for startChirho in fileChirho.versesChirho {
            guard startChirho.isFinite, startChirho >= 0, startChirho >= previousChirho else {
                return nil
            }
            previousChirho = startChirho
        }
        return fileChirho.versesChirho
    }
}
