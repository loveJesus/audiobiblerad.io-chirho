// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// The station contract that the web catalogue publishes in src/lib/catalogue-chirho/contract_chirho.ts,
// as the iPhone and Watch radios read it. Both apps bundle the generated copy at
// apps-chirho/shared-chirho/catalogue_chirho.json, so the first On never waits for the network.
// Part of spec-chirho/workflows-chirho/experience-chirho/native_players_workflow_chirho.md.

import Foundation

/// One of the 66 books, in canon order.
public struct BookChirho: Sendable, Hashable, Decodable {
    /// The USFM code, upper case: `GEN` … `REV`.
    public let idChirho: String
    /// Place in the canon, 1 for Genesis to 66 for Revelation.
    public let orderChirho: Int
    /// The book's name in English.
    public let nameChirho: String
    public let chaptersChirho: Int

    enum CodingKeys: String, CodingKey {
        case idChirho = "id_chirho"
        case orderChirho = "order_chirho"
        case nameChirho = "name_chirho"
        case chaptersChirho = "chapters_chirho"
    }
}

/// An inclusive run of chapter numbers, written in the catalogue as `[first, last]`.
public struct ChapterRangeChirho: Sendable, Hashable, Decodable {
    public let firstChirho: Int
    public let lastChirho: Int

    public init(firstChirho: Int, lastChirho: Int) {
        self.firstChirho = firstChirho
        self.lastChirho = lastChirho
    }

    public init(from decoderChirho: any Decoder) throws {
        var listChirho = try decoderChirho.unkeyedContainer()
        let firstChirho = try listChirho.decode(Int.self)
        let lastChirho = try listChirho.decode(Int.self)
        guard listChirho.isAtEnd, firstChirho >= 1, lastChirho >= firstChirho else {
            throw DecodingError.dataCorruptedError(
                in: listChirho, debugDescription: "A chapter range is [first, last], from 1 up.")
        }
        self.init(firstChirho: firstChirho, lastChirho: lastChirho)
    }
}

/// How a station finds the audio for a chapter. A kind this player does not know is never guessed
/// at: the station that uses it is skipped.
public enum LocatorChirho: Sendable, Hashable {
    /// The address is built from the book and chapter. An override gives a chapter's whole address,
    /// by book and then by chapter number written as text, when its file is named out of pattern.
    case patternChirho(
        templateChirho: String, bookCodesChirho: String?, overridesChirho: [String: [String: String]])
    /// Every chapter's address is listed, by book, chapter 1 first; nil marks a chapter with no file.
    case indexChirho(filesChirho: [String: [String?]])

    /// The book-code scheme a pattern names, which a timings template may also use.
    public var bookCodesChirho: String? {
        if case .patternChirho(_, let bookCodesChirho, _) = self { return bookCodesChirho }
        return nil
    }
}

/// Why a station in the file is not offered.
enum StationSkipChirho: Error {
    case unknownLocatorKindChirho
    case unknownTimingsFormatChirho
    case badIdentifierChirho
    case missingCreditChirho
}

/// One language, version and voice from one source, with its licence and the credit it asks for.
public struct StationChirho: Sendable, Hashable, Identifiable, Decodable {
    /// Stable for the life of the station; safe to remember on the device.
    public let idChirho: String
    public let sourceIdChirho: String
    /// BCP 47 language tag: `en`, `hi`, `ida-x-tiriki`.
    public let languageCodeChirho: String
    /// The language's name written in that language.
    public let languageNameChirho: String
    public let languageEnglishChirho: String
    public let versionChirho: String
    /// Short enough for a dial: `BSB`.
    public let versionCodeChirho: String
    /// The reader's name; empty when the maker names no reader.
    public let voiceChirho: String
    /// `human`, `synthetic` or `unknown`, as the maker says.
    public let voiceKindChirho: String
    public let sourceNameChirho: String
    public let sourceUrlChirho: String
    public let licenceIdChirho: String
    public let licenceNameChirho: String
    public let licenceUrlChirho: String
    /// The credit to show listeners, as the licence asks for it.
    public let creditChirho: String
    public let licenceEvidenceUrlChirho: String
    public let licenceReadOnChirho: String
    public let locatorChirho: LocatorChirho
    /// The verse-timings address template, with the same placeholders as a pattern, when it has one.
    public let timingsTemplateChirho: String?
    /// The chapters verified at the source, by book. Nothing outside it is ever resolved.
    public let coverageChirho: [String: [ChapterRangeChirho]]
    public let coverageCheckedOnChirho: String
    public let chapterCountChirho: Int

    /// The name `Identifiable` requires.
    public var id: String { idChirho }

    /// The only timings format the contract defines so far.
    public static let verseStartsFormatChirho = "verse-starts-list-chirho"

    private enum KeysChirho: String, CodingKey {
        case idChirho = "id_chirho"
        case sourceIdChirho = "source_id_chirho"
        case languageCodeChirho = "language_code_chirho"
        case languageNameChirho = "language_name_chirho"
        case languageEnglishChirho = "language_english_chirho"
        case versionChirho = "version_chirho"
        case versionCodeChirho = "version_code_chirho"
        case voiceChirho = "voice_chirho"
        case voiceKindChirho = "voice_kind_chirho"
        case sourceNameChirho = "source_name_chirho"
        case sourceUrlChirho = "source_url_chirho"
        case licenceIdChirho = "licence_id_chirho"
        case licenceNameChirho = "licence_name_chirho"
        case licenceUrlChirho = "licence_url_chirho"
        case creditChirho = "credit_chirho"
        case licenceEvidenceUrlChirho = "licence_evidence_url_chirho"
        case licenceReadOnChirho = "licence_read_on_chirho"
        case locatorChirho = "locator_chirho"
        case timingsChirho = "timings_chirho"
        case coverageChirho = "coverage_chirho"
        case coverageCheckedOnChirho = "coverage_checked_on_chirho"
        case chapterCountChirho = "chapter_count_chirho"
    }

    private enum LocatorKeysChirho: String, CodingKey {
        case kindChirho = "kind_chirho"
        case templateChirho = "template_chirho"
        case bookCodesChirho = "book_codes_chirho"
        case overridesChirho = "overrides_chirho"
        case filesChirho = "files_chirho"
    }

    private enum TimingsKeysChirho: String, CodingKey {
        case templateChirho = "template_chirho"
        case formatChirho = "format_chirho"
    }

    public init(from decoderChirho: any Decoder) throws {
        let fieldsChirho = try decoderChirho.container(keyedBy: KeysChirho.self)
        func textChirho(_ keyChirho: KeysChirho) throws -> String {
            try fieldsChirho.decode(String.self, forKey: keyChirho)
        }
        idChirho = try textChirho(.idChirho)
        sourceIdChirho = try textChirho(.sourceIdChirho)
        languageCodeChirho = try textChirho(.languageCodeChirho)
        languageNameChirho = try textChirho(.languageNameChirho)
        languageEnglishChirho = try textChirho(.languageEnglishChirho)
        versionChirho = try textChirho(.versionChirho)
        versionCodeChirho = try textChirho(.versionCodeChirho)
        voiceChirho = try textChirho(.voiceChirho)
        voiceKindChirho = try textChirho(.voiceKindChirho)
        sourceNameChirho = try textChirho(.sourceNameChirho)
        sourceUrlChirho = try textChirho(.sourceUrlChirho)
        licenceIdChirho = try textChirho(.licenceIdChirho)
        licenceNameChirho = try textChirho(.licenceNameChirho)
        licenceUrlChirho = try textChirho(.licenceUrlChirho)
        creditChirho = try textChirho(.creditChirho)
        licenceEvidenceUrlChirho = try textChirho(.licenceEvidenceUrlChirho)
        licenceReadOnChirho = try textChirho(.licenceReadOnChirho)
        coverageCheckedOnChirho = try textChirho(.coverageCheckedOnChirho)
        coverageChirho = try fieldsChirho.decode(
            [String: [ChapterRangeChirho]].self, forKey: .coverageChirho)
        chapterCountChirho = try fieldsChirho.decode(Int.self, forKey: .chapterCountChirho)

        let locatorFieldsChirho = try fieldsChirho.nestedContainer(
            keyedBy: LocatorKeysChirho.self, forKey: .locatorChirho)
        switch try locatorFieldsChirho.decode(String.self, forKey: .kindChirho) {
        case "pattern":
            locatorChirho = .patternChirho(
                templateChirho: try locatorFieldsChirho.decode(String.self, forKey: .templateChirho),
                bookCodesChirho: try locatorFieldsChirho.decodeIfPresent(
                    String.self, forKey: .bookCodesChirho),
                overridesChirho: try locatorFieldsChirho.decodeIfPresent(
                    [String: [String: String]].self, forKey: .overridesChirho) ?? [:])
        case "index":
            locatorChirho = .indexChirho(
                filesChirho: try locatorFieldsChirho.decode(
                    [String: [String?]].self, forKey: .filesChirho))
        default:
            throw StationSkipChirho.unknownLocatorKindChirho
        }

        if fieldsChirho.contains(.timingsChirho),
            try fieldsChirho.decodeNil(forKey: .timingsChirho) == false
        {
            let timingsFieldsChirho = try fieldsChirho.nestedContainer(
                keyedBy: TimingsKeysChirho.self, forKey: .timingsChirho)
            guard
                try timingsFieldsChirho.decode(String.self, forKey: .formatChirho)
                    == Self.verseStartsFormatChirho
            else { throw StationSkipChirho.unknownTimingsFormatChirho }
            timingsTemplateChirho = try timingsFieldsChirho.decode(
                String.self, forKey: .templateChirho)
        } else {
            timingsTemplateChirho = nil
        }

        guard Self.isStationIdentifierChirho(idChirho) else {
            throw StationSkipChirho.badIdentifierChirho
        }
        // A station plays only with its required credit and licence shown, so one without them
        // is not offered at all.
        guard !creditChirho.isEmpty, !licenceNameChirho.isEmpty else {
            throw StationSkipChirho.missingCreditChirho
        }
    }

    /// Lower-case words of letters and digits joined by single hyphens, at most 160 characters:
    /// the same shape the web accepts from device storage.
    public static func isStationIdentifierChirho(_ valueChirho: String) -> Bool {
        guard !valueChirho.isEmpty, valueChirho.count <= 160 else { return false }
        return valueChirho.split(separator: "-", omittingEmptySubsequences: false).allSatisfy {
            wordChirho in
            !wordChirho.isEmpty
                && wordChirho.unicodeScalars.allSatisfy {
                    ("a"..."z").contains($0) || ("0"..."9").contains($0)
                }
        }
    }
}
