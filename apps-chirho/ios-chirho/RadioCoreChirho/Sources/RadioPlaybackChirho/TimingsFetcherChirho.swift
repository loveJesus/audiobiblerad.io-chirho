// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// Fetches a verse-timings file over HTTPS, stopping at its size bound, so a misbehaving host cannot
// turn a small optional lookup into an unbounded download. Any failure means no timings, and the
// radio carries the place by fraction instead. As src/lib/player-chirho/verse_timings_chirho.ts.
// Part of spec-chirho/workflows-chirho/experience-chirho/native_players_workflow_chirho.md.

import Foundation
import RadioCoreChirho

public struct TimingsFetcherChirho: TimingsLoaderChirho {
    public init() {}

    public func loadTimingsChirho(_ urlChirho: URL) async -> Data? {
        guard urlChirho.scheme == "https" else { return nil }
        let limitChirho = VerseTimingsChirho.largestBytesChirho
        var requestChirho = URLRequest(url: urlChirho, timeoutInterval: 5)
        requestChirho.setValue("application/json", forHTTPHeaderField: "Accept")
        do {
            let (bytesChirho, responseChirho) = try await URLSession.shared.bytes(for: requestChirho)
            guard (responseChirho as? HTTPURLResponse)?.statusCode == 200,
                responseChirho.expectedContentLength <= Int64(limitChirho)
            else { return nil }
            var dataChirho = Data()
            for try await byteChirho in bytesChirho {
                dataChirho.append(byteChirho)
                if dataChirho.count > limitChirho { return nil }
            }
            return dataChirho
        } catch {
            return nil
        }
    }
}
