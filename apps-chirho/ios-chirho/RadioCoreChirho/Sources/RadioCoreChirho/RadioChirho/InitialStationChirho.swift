// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// The first station on a first run, from the device's own language list and never a location
// lookup. A port of src/lib/language-chirho/initial_station_chirho.ts. Part of
// spec-chirho/workflows-chirho/experience-chirho/native_players_workflow_chirho.md and the web's
// spec-chirho/workflows-chirho/language_workflow_chirho.md.

import Foundation

public enum InitialStationChirho {
    /// Where a first run starts, as on the web.
    public static let startingRefChirho = ChapterRefChirho(bookIdChirho: "JHN", chapterChirho: 1)
    /// The language a first run falls back to when none of the device's languages is offered.
    public static let fallbackLanguageChirho = "en"

    /// Conservative available-catalogue defaults, not a claim of theological unanimity.
    private static let translationPreferencesChirho: [String: [String]] = [
        "en": ["berean standard", "world english"],
        "es": ["reina.valera"],
        "de": ["luther"],
        "pt": ["almeida"],
        "zh": ["union"],
        "nl": ["statenvertaling"],
        "fr": ["segond", "semeur"],
        "hi": ["contemporary"]
    ]
    /// A published first-person narrator description: https://bobsouer.com/blog/. A positive
    /// default preference only; no unnamed, mixed or female voice is removed.
    private static let documentedMaleNarratorsChirho: Set<String> = ["helloao-bsb-souer"]

    /// The first offered language in the device's own order, trying `zh-hans-cn`, then
    /// `zh-hans`, then `zh`. Only the first eight preferences are read, and none longer than 35.
    public static func matchLanguageChirho(
        preferredChirho: [String], availableChirho: Set<String>
    ) -> String? {
        for preferenceChirho in preferredChirho.prefix(8) where preferenceChirho.count <= 35 {
            var codeChirho = preferenceChirho.replacingOccurrences(of: "_", with: "-").lowercased()
            while !codeChirho.isEmpty {
                if availableChirho.contains(codeChirho) { return codeChirho }
                guard let separatorChirho = codeChirho.lastIndex(of: "-") else { break }
                codeChirho = String(codeChirho[..<separatorChirho])
            }
        }
        return nil
    }

    /// The station a first run plays: in the device's language when one is offered, preferring
    /// its common translation, the fullest recording and a human voice.
    public static func chooseChirho(
        catalogueChirho: CatalogueChirho, preferredLanguagesChirho: [String],
        randomChirho: () -> Double
    ) -> StationChirho {
        let stationsChirho = catalogueChirho.stationsChirho
        let languageChirho =
            matchLanguageChirho(
                preferredChirho: preferredLanguagesChirho,
                availableChirho: Set(stationsChirho.map(\.languageCodeChirho)))
            ?? fallbackLanguageChirho
        let inLanguageChirho = stationsChirho.filter { $0.languageCodeChirho == languageChirho }
        return stationChirho(
            in: inLanguageChirho.isEmpty ? stationsChirho : inLanguageChirho,
            languageCodeChirho: languageChirho, randomChirho: randomChirho)
            ?? stationsChirho[0]
    }

    /// The best of `stationsChirho` for a language, choosing at random among equals.
    public static func stationChirho(
        in stationsChirho: [StationChirho], languageCodeChirho: String, randomChirho: () -> Double
    ) -> StationChirho? {
        guard !stationsChirho.isEmpty else { return nil }
        let baseChirho = String(languageCodeChirho.split(separator: "-").first ?? "")
        let patternsChirho = translationPreferencesChirho[baseChirho] ?? []
        func rankChirho(_ stationChirho: StationChirho) -> Int {
            let preferenceChirho = patternsChirho.firstIndex {
                stationChirho.versionChirho.range(
                    of: $0, options: [.regularExpression, .caseInsensitive]) != nil
            }
            return (preferenceChirho.map { (patternsChirho.count - $0) * 10_000 } ?? 0)
                + min(stationChirho.chapterCountChirho, 1189)
                + (stationChirho.voiceKindChirho == "human" ? 20 : 0)
        }
        // A stable sort keeps the catalogue's order among equals, as the web's sort does.
        let orderedChirho = stationsChirho.enumerated().sorted {
            let leftChirho = rankChirho($0.element)
            let rightChirho = rankChirho($1.element)
            return leftChirho != rightChirho ? leftChirho > rightChirho : $0.offset < $1.offset
        }.map(\.element)
        let firstChirho = orderedChirho[0]
        let sameVersionChirho = orderedChirho.filter {
            $0.versionChirho == firstChirho.versionChirho
                && $0.chapterCountChirho >= firstChirho.chapterCountChirho
        }
        let preferredChirho = sameVersionChirho.filter {
            documentedMaleNarratorsChirho.contains($0.idChirho)
        }
        let choicesChirho = preferredChirho.isEmpty ? sameVersionChirho : preferredChirho
        let indexChirho = min(
            choicesChirho.count - 1,
            max(0, Int((randomChirho() * Double(choicesChirho.count)).rounded(.down))))
        return choicesChirho[indexChirho]
    }
}
