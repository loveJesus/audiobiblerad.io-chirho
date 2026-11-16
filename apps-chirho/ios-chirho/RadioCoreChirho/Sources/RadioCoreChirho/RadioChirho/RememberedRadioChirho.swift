// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// What the radio keeps on the device between visits, and nothing more: the station, the passage,
// the position, the place the listener is following, whether their last word was Off, and the
// Sound switch. No account and no history. What is read back is untrusted: it is checked against
// the catalogue field by field, as src/lib/player-chirho/player_preferences_chirho.ts does, and a
// damaged value means a first run rather than a failure to play. Part of
// spec-chirho/workflows-chirho/experience-chirho/native_players_workflow_chirho.md.

import Foundation

/// The place a listener is following: the station, passage and position they last chose or
/// naturally reached. It is kept apart from the place being played, so that turning the dial
/// across a station that lacks the passage does not carry every later station away with it.
public struct FollowedPlaceChirho: Sendable, Equatable {
    public var stationIdChirho: String
    public var refChirho: ChapterRefChirho
    public var positionChirho: PositionChirho

    public init(stationIdChirho: String, refChirho: ChapterRefChirho, positionChirho: PositionChirho) {
        self.stationIdChirho = stationIdChirho
        self.refChirho = refChirho
        self.positionChirho = positionChirho
    }
}

public struct RememberedRadioChirho: Sendable, Equatable {
    public var stationIdChirho: String
    public var refChirho: ChapterRefChirho
    public var secondsChirho: Double
    public var followedChirho: FollowedPlaceChirho?
    /// The listener's last word was Off, so opening the app again stays quiet.
    public var explicitOffChirho: Bool
    public var soundsEnabledChirho: Bool

    /// A remembered radio is a few short fields. Anything larger is not read.
    public static let largestBytesChirho = 2048
    /// A day: longer than any chapter, and a bound on what a damaged value can claim.
    static let largestSecondsChirho = 86_400.0
    /// Far above the longest chapter's verse count, and a bound all the same.
    static let largestVerseChirho = 1_000

    public init(
        stationIdChirho: String, refChirho: ChapterRefChirho, secondsChirho: Double,
        followedChirho: FollowedPlaceChirho?, explicitOffChirho: Bool, soundsEnabledChirho: Bool
    ) {
        self.stationIdChirho = stationIdChirho
        self.refChirho = refChirho
        self.secondsChirho = secondsChirho
        self.followedChirho = followedChirho
        self.explicitOffChirho = explicitOffChirho
        self.soundsEnabledChirho = soundsEnabledChirho
    }

    private struct FollowedFileChirho: Codable {
        var stationIdChirho: String
        var bookIdChirho: String
        var chapterChirho: Int
        var secondsChirho: Double
        var durationChirho: Double
        var verseChirho: Int?
        var verseFractionChirho: Double
        enum CodingKeys: String, CodingKey {
            case stationIdChirho = "station_id_chirho"
            case bookIdChirho = "book_id_chirho"
            case chapterChirho = "chapter_chirho"
            case secondsChirho = "seconds_chirho"
            case durationChirho = "duration_chirho"
            case verseChirho = "verse_chirho"
            case verseFractionChirho = "verse_fraction_chirho"
        }
    }

    /// The followed place stands or falls on its own: a damaged one is simply absent.
    private struct LossyFollowedChirho: Codable {
        var fileChirho: FollowedFileChirho?
        init(fileChirho: FollowedFileChirho?) { self.fileChirho = fileChirho }
        init(from decoderChirho: any Decoder) throws {
            fileChirho = try? FollowedFileChirho(from: decoderChirho)
        }
        func encode(to encoderChirho: any Encoder) throws { try fileChirho?.encode(to: encoderChirho) }
    }

    private struct FileChirho: Codable {
        var stationIdChirho: String
        var bookIdChirho: String
        var chapterChirho: Int
        var secondsChirho: Double
        var explicitOffChirho: Bool?
        var soundsEnabledChirho: Bool?
        var followedPlaceChirho: LossyFollowedChirho?
        enum CodingKeys: String, CodingKey {
            case stationIdChirho = "station_id_chirho"
            case bookIdChirho = "book_id_chirho"
            case chapterChirho = "chapter_chirho"
            case secondsChirho = "seconds_chirho"
            case explicitOffChirho = "explicit_off_chirho"
            case soundsEnabledChirho = "sounds_enabled_chirho"
            case followedPlaceChirho = "followed_place_chirho"
        }
    }

    public func encodedChirho() -> Data {
        let followedChirho = followedChirho.map {
            FollowedFileChirho(
                stationIdChirho: $0.stationIdChirho, bookIdChirho: $0.refChirho.bookIdChirho,
                chapterChirho: $0.refChirho.chapterChirho,
                secondsChirho: $0.positionChirho.secondsChirho,
                durationChirho: $0.positionChirho.durationChirho,
                verseChirho: $0.positionChirho.verseChirho,
                verseFractionChirho: $0.positionChirho.verseFractionChirho)
        }
        let fileChirho = FileChirho(
            stationIdChirho: stationIdChirho, bookIdChirho: refChirho.bookIdChirho,
            chapterChirho: refChirho.chapterChirho, secondsChirho: secondsChirho,
            explicitOffChirho: explicitOffChirho, soundsEnabledChirho: soundsEnabledChirho,
            followedPlaceChirho: followedChirho.map { LossyFollowedChirho(fileChirho: $0) })
        return (try? JSONEncoder().encode(fileChirho)) ?? Data()
    }

    /// The remembered radio, or nothing when what was stored is missing, too large, damaged or
    /// names a station or passage this catalogue does not have.
    public static func readChirho(_ dataChirho: Data, catalogueChirho: CatalogueChirho)
        -> RememberedRadioChirho?
    {
        guard !dataChirho.isEmpty, dataChirho.count <= largestBytesChirho,
            let fileChirho = try? JSONDecoder().decode(FileChirho.self, from: dataChirho),
            catalogueChirho.stationChirho(fileChirho.stationIdChirho) != nil,
            let refChirho = validRefChirho(
                fileChirho.bookIdChirho, fileChirho.chapterChirho, catalogueChirho),
            isTimeChirho(fileChirho.secondsChirho)
        else { return nil }
        return RememberedRadioChirho(
            stationIdChirho: fileChirho.stationIdChirho, refChirho: refChirho,
            secondsChirho: fileChirho.secondsChirho,
            followedChirho: fileChirho.followedPlaceChirho?.fileChirho.flatMap {
                validFollowedChirho($0, catalogueChirho)
            },
            explicitOffChirho: fileChirho.explicitOffChirho ?? false,
            soundsEnabledChirho: fileChirho.soundsEnabledChirho ?? true)
    }

    private static func validFollowedChirho(
        _ fileChirho: FollowedFileChirho, _ catalogueChirho: CatalogueChirho
    ) -> FollowedPlaceChirho? {
        guard catalogueChirho.stationChirho(fileChirho.stationIdChirho) != nil,
            let refChirho = validRefChirho(
                fileChirho.bookIdChirho, fileChirho.chapterChirho, catalogueChirho),
            isTimeChirho(fileChirho.secondsChirho), isTimeChirho(fileChirho.durationChirho),
            fileChirho.verseChirho.map({ (1...largestVerseChirho).contains($0) }) ?? true,
            fileChirho.verseFractionChirho.isFinite,
            (0...1).contains(fileChirho.verseFractionChirho)
        else { return nil }
        return FollowedPlaceChirho(
            stationIdChirho: fileChirho.stationIdChirho, refChirho: refChirho,
            positionChirho: PositionChirho(
                secondsChirho: fileChirho.secondsChirho, durationChirho: fileChirho.durationChirho,
                verseChirho: fileChirho.verseChirho,
                verseFractionChirho: fileChirho.verseFractionChirho))
    }

    private static func validRefChirho(
        _ bookIdChirho: String, _ chapterChirho: Int, _ catalogueChirho: CatalogueChirho
    ) -> ChapterRefChirho? {
        guard let bookChirho = catalogueChirho.bookChirho(bookIdChirho),
            (1...bookChirho.chaptersChirho).contains(chapterChirho)
        else { return nil }
        return ChapterRefChirho(bookIdChirho: bookChirho.idChirho, chapterChirho: chapterChirho)
    }

    private static func isTimeChirho(_ valueChirho: Double) -> Bool {
        valueChirho.isFinite && (0...largestSecondsChirho).contains(valueChirho)
    }
}

/// Where the remembered radio is kept. Reading and writing never throw: storage that is missing,
/// full or refused must not stop the radio from playing.
@MainActor
public protocol PreferenceStoreChirho: AnyObject {
    func readChirho() -> Data?
    func writeChirho(_ dataChirho: Data)
}

/// The device's own defaults, under one key.
@MainActor
public final class DefaultsStoreChirho: PreferenceStoreChirho {
    public static let keyChirho = "audio-bible-radio-preferences-chirho"
    private let defaultsChirho: UserDefaults

    public init(defaultsChirho: UserDefaults = .standard) { self.defaultsChirho = defaultsChirho }

    public func readChirho() -> Data? { defaultsChirho.data(forKey: Self.keyChirho) }

    public func writeChirho(_ dataChirho: Data) {
        guard !dataChirho.isEmpty, dataChirho.count <= RememberedRadioChirho.largestBytesChirho
        else { return }
        defaultsChirho.set(dataChirho, forKey: Self.keyChirho)
    }
}
