// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// The book and chapter, as two captioned menus listing only what the tuned station has.

import RadioCoreChirho
import RadioPlaybackChirho
import SwiftUI

struct PhonePassageViewChirho: View {
    let modelChirho: RadioModelChirho

    var body: some View {
        HStack(spacing: 12) {
            Menu {
                ForEach(modelChirho.offeredBooksChirho, id: \.idChirho) { bookChirho in
                    Button(bookChirho.nameChirho) { modelChirho.chooseBookChirho(bookChirho.idChirho) }
                }
            } label: {
                captionedChirho("Book", modelChirho.bookNameChirho)
            }
            .accessibilityLabel("Book, \(modelChirho.bookNameChirho)")
            Menu {
                ForEach(modelChirho.offeredChaptersChirho, id: \.self) { chapterChirho in
                    Button("Chapter \(chapterChirho)") { modelChirho.chooseChapterChirho(chapterChirho) }
                }
            } label: {
                captionedChirho("Chapter", "\(modelChirho.stateChirho.refChirho.chapterChirho)")
            }
            .accessibilityLabel("Chapter \(modelChirho.stateChirho.refChirho.chapterChirho)")
        }
    }

    private func captionedChirho(_ captionChirho: String, _ valueChirho: String) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(captionChirho).font(.caption2).foregroundStyle(.secondary)
            HStack {
                Text(valueChirho).font(.body.weight(.medium)).lineLimit(1)
                Spacer(minLength: 4)
                Image(systemName: "chevron.up.chevron.down").font(.caption)
            }
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(RoundedRectangle(cornerRadius: 10).fill(Color.secondary.opacity(0.12)))
    }
}
