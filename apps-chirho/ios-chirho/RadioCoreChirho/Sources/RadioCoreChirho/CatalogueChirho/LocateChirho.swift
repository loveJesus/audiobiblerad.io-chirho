// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// Finding a chapter: which chapters a station has, and the address of each. A port of
// src/lib/catalogue-chirho/locate-chirho/locate_chirho.ts; a parity check compares the two for every
// station and chapter. Nothing here touches the network, so an address is ready in the same tap.
// Chapters split across several files (`composite_chapters_chirho`) are not offered here, exactly as
// the contract allows a player that does not read that field. Part of
// spec-chirho/workflows-chirho/experience-chirho/native_players_workflow_chirho.md.

import Foundation

/// A book and a chapter.
public struct ChapterRefChirho: Sendable, Hashable {
    public let bookIdChirho: String
    public let chapterChirho: Int

    public init(bookIdChirho: String, chapterChirho: Int) {
        self.bookIdChirho = bookIdChirho
        self.chapterChirho = chapterChirho
    }
}

/// Where to hear a chapter: always HTTPS, straight from the publisher's own host.
public struct ChapterAudioChirho: Sendable, Hashable {
    public let urlChirho: URL
    /// Present when the station has verse timings. The file may still be missing for a chapter.
    public let timingsUrlChirho: URL?
}

extension CatalogueChirho {
    /// Fills a locator or timings template for one chapter. Nothing when the template asks for
    /// something that is not known, so a bad template never gives a half-built address.
    public func expandTemplateChirho(
        _ templateChirho: String, bookChirho: BookChirho, chapterChirho: Int,
        bookCodesChirho: String?
    ) -> String? {
        let chapterTextChirho = String(chapterChirho)
        func valueChirho(_ nameChirho: Substring) -> String? {
            switch nameChirho {
            case "book_upper_chirho": return bookChirho.idChirho
            case "book_lower_chirho": return bookChirho.idChirho.lowercased()
            case "book_code_chirho":
                guard let schemeNameChirho = bookCodesChirho,
                    let schemeChirho = bookCodeSchemesChirho[schemeNameChirho],
                    schemeChirho.indices.contains(bookChirho.orderChirho - 1)
                else { return nil }
                return schemeChirho[bookChirho.orderChirho - 1]
            case "book_order_pad2_chirho": return paddedChirho(String(bookChirho.orderChirho), 2)
            case "chapter_chirho": return chapterTextChirho
            case "chapter_pad2_chirho": return paddedChirho(chapterTextChirho, 2)
            case "chapter_pad3_chirho": return paddedChirho(chapterTextChirho, 3)
            case "chapter_pad_book_chirho":
                return paddedChirho(
                    chapterTextChirho, max(2, String(bookChirho.chaptersChirho).count))
            default: return nil
            }
        }

        // The same scan as the web's /\{([a-z0-9_]+)\}/g: a brace that does not open a name is text.
        var outputChirho = ""
        var indexChirho = templateChirho.startIndex
        while indexChirho < templateChirho.endIndex {
            let characterChirho = templateChirho[indexChirho]
            let nextChirho = templateChirho.index(after: indexChirho)
            if characterChirho == "{",
                let closeChirho = templateChirho[nextChirho...].firstIndex(of: "}")
            {
                let nameChirho = templateChirho[nextChirho..<closeChirho]
                if !nameChirho.isEmpty, nameChirho.unicodeScalars.allSatisfy(isNameScalarChirho) {
                    guard let filledChirho = valueChirho(nameChirho) else { return nil }
                    outputChirho += filledChirho
                    indexChirho = templateChirho.index(after: closeChirho)
                    continue
                }
            }
            outputChirho.append(characterChirho)
            indexChirho = nextChirho
        }
        return outputChirho
    }

    /// The address a locator gives for a chapter, whether or not the chapter was verified.
    /// Players use `resolveChapterChirho`, which answers only for verified chapters.
    public func locateChapterChirho(
        _ locatorChirho: LocatorChirho, bookChirho: BookChirho, chapterChirho: Int
    ) -> String? {
        guard chapterChirho >= 1 else { return nil }
        switch locatorChirho {
        case .patternChirho(let templateChirho, let bookCodesChirho, let overridesChirho):
            if let overrideChirho = overridesChirho[bookChirho.idChirho]?[String(chapterChirho)] {
                return overrideChirho
            }
            return expandTemplateChirho(
                templateChirho, bookChirho: bookChirho, chapterChirho: chapterChirho,
                bookCodesChirho: bookCodesChirho)
        case .indexChirho(let filesChirho):
            guard let listChirho = filesChirho[bookChirho.idChirho], chapterChirho <= listChirho.count
            else { return nil }
            return listChirho[chapterChirho - 1]
        }
    }

    /// The lowest covered chapter of a book at or after `fromChirho`.
    func firstCoveredChapterChirho(
        _ stationChirho: StationChirho, bookChirho: BookChirho, fromChirho: Int
    ) -> Int? {
        var foundChirho: Int?
        for rangeChirho in stationChirho.coverageChirho[bookChirho.idChirho] ?? [] {
            if rangeChirho.lastChirho < fromChirho { continue }
            let candidateChirho = max(rangeChirho.firstChirho, fromChirho)
            if foundChirho.map({ candidateChirho < $0 }) ?? true { foundChirho = candidateChirho }
        }
        return foundChirho
    }

    /// True when the station was verified to have this chapter. Safe with untrusted values.
    public func stationHasChapterChirho(
        _ stationChirho: StationChirho, bookIdChirho: String, chapterChirho: Int
    ) -> Bool {
        guard let bookChirho = self.bookChirho(bookIdChirho), chapterChirho >= 1 else { return false }
        return firstCoveredChapterChirho(stationChirho, bookChirho: bookChirho, fromChirho: chapterChirho)
            == chapterChirho
    }

    /// The same chapter when the station has it, otherwise the next one it does have, in canon
    /// order, wrapping from Revelation round to the station's first chapter: the dial landing on a
    /// station that lacks the passage. Nothing for an unknown book or a chapter below 1.
    public func chapterAtOrAfterChirho(
        _ stationChirho: StationChirho, bookIdChirho: String, chapterChirho: Int
    ) -> ChapterRefChirho? {
        guard let startChirho = self.bookChirho(bookIdChirho), chapterChirho >= 1 else { return nil }
        let startIndexChirho = startChirho.orderChirho - 1
        // One full turn: to the end of the canon, then from Genesis back to the starting book,
        // this time from its first chapter.
        for stepChirho in 0...booksChirho.count {
            let bookChirho = booksChirho[(startIndexChirho + stepChirho) % booksChirho.count]
            if let foundChirho = firstCoveredChapterChirho(
                stationChirho, bookChirho: bookChirho, fromChirho: stepChirho == 0 ? chapterChirho : 1)
            {
                return ChapterRefChirho(bookIdChirho: bookChirho.idChirho, chapterChirho: foundChirho)
            }
        }
        return nil
    }

    /// The chapter after this one on the station, skipping what it lacks and wrapping round.
    public func nextChapterChirho(
        _ stationChirho: StationChirho, bookIdChirho: String, chapterChirho: Int
    ) -> ChapterRefChirho? {
        guard chapterChirho >= 1 else { return nil }
        return chapterAtOrAfterChirho(
            stationChirho, bookIdChirho: bookIdChirho, chapterChirho: chapterChirho + 1)
    }

    /// The chapter before this one that the station can play, wrapping from Genesis to Revelation:
    /// the same answer as the web radio's chapter-by-chapter walk, found book by book.
    public func previousChapterChirho(
        _ stationChirho: StationChirho, bookIdChirho: String, chapterChirho: Int
    ) -> ChapterRefChirho? {
        guard let startIndexChirho = booksChirho.firstIndex(where: { $0.idChirho == bookIdChirho }),
            chapterChirho >= 1
        else { return nil }
        let countChirho = booksChirho.count
        // One full turn backwards: the starting book below this chapter, every other book from its
        // end, then the starting book again from its end down to this chapter.
        for stepChirho in 0...countChirho {
            let bookChirho = booksChirho[
                ((startIndexChirho - stepChirho) % countChirho + countChirho) % countChirho]
            let highestChirho = stepChirho == 0 ? chapterChirho - 1 : bookChirho.chaptersChirho
            let lowestChirho = stepChirho == countChirho ? chapterChirho : 1
            var candidatesChirho: [Int] = []
            for rangeChirho in stationChirho.coverageChirho[bookChirho.idChirho] ?? [] {
                let topChirho = min(rangeChirho.lastChirho, highestChirho)
                let bottomChirho = max(rangeChirho.firstChirho, lowestChirho)
                if topChirho >= bottomChirho { candidatesChirho.append(contentsOf: bottomChirho...topChirho) }
            }
            for candidateChirho in candidatesChirho.sorted(by: >)
            where resolveChapterChirho(
                stationChirho, bookIdChirho: bookChirho.idChirho, chapterChirho: candidateChirho) != nil
            {
                return ChapterRefChirho(bookIdChirho: bookChirho.idChirho, chapterChirho: candidateChirho)
            }
        }
        return nil
    }

    /// Where to hear a chapter and its verse timings. Nothing for a chapter the station was not
    /// verified to have, or for an address that is not HTTPS on a named host.
    public func resolveChapterChirho(
        _ stationChirho: StationChirho, bookIdChirho: String, chapterChirho: Int
    ) -> ChapterAudioChirho? {
        guard
            stationHasChapterChirho(stationChirho, bookIdChirho: bookIdChirho, chapterChirho: chapterChirho),
            let bookChirho = self.bookChirho(bookIdChirho),
            let addressChirho = locateChapterChirho(
                stationChirho.locatorChirho, bookChirho: bookChirho, chapterChirho: chapterChirho),
            let urlChirho = Self.secureUrlChirho(addressChirho)
        else { return nil }
        let timingsChirho = stationChirho.timingsTemplateChirho.flatMap {
            expandTemplateChirho(
                $0, bookChirho: bookChirho, chapterChirho: chapterChirho,
                bookCodesChirho: stationChirho.locatorChirho.bookCodesChirho)
        }.flatMap(Self.secureUrlChirho)
        return ChapterAudioChirho(urlChirho: urlChirho, timingsUrlChirho: timingsChirho)
    }

    /// The books a station has any chapter of, in canon order.
    public func offeredBooksChirho(_ stationChirho: StationChirho) -> [BookChirho] {
        booksChirho.filter { !(stationChirho.coverageChirho[$0.idChirho] ?? []).isEmpty }
    }

    /// The chapters of a book a station has, in order.
    public func offeredChaptersChirho(_ stationChirho: StationChirho, bookIdChirho: String) -> [Int] {
        guard let bookChirho = self.bookChirho(bookIdChirho) else { return [] }
        let chaptersChirho = (stationChirho.coverageChirho[bookIdChirho] ?? []).flatMap {
            $0.firstChirho...min($0.lastChirho, bookChirho.chaptersChirho)
        }
        return Array(Set(chaptersChirho)).sorted()
    }

    static func secureUrlChirho(_ addressChirho: String) -> URL? {
        guard let urlChirho = URL(string: addressChirho), urlChirho.scheme == "https",
            let hostChirho = urlChirho.host, !hostChirho.isEmpty
        else { return nil }
        return urlChirho
    }
}

private func paddedChirho(_ textChirho: String, _ widthChirho: Int) -> String {
    String(repeating: "0", count: max(0, widthChirho - textChirho.count)) + textChirho
}

private func isNameScalarChirho(_ scalarChirho: Unicode.Scalar) -> Bool {
    ("a"..."z").contains(scalarChirho) || ("0"..."9").contains(scalarChirho) || scalarChirho == "_"
}
