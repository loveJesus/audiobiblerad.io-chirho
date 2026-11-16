// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// Choosing a passage on the Watch: the tuned station's books, then its chapters of that book.

import RadioCoreChirho
import RadioPlaybackChirho
import SwiftUI

struct WatchPassageViewChirho: View {
    let modelChirho: RadioModelChirho
    /// Closes the chooser once a chapter is picked.
    let doneChirho: () -> Void

    var body: some View {
        List(modelChirho.offeredBooksChirho, id: \.idChirho) { bookChirho in
            NavigationLink(bookChirho.nameChirho) {
                WatchChaptersViewChirho(modelChirho: modelChirho, bookChirho: bookChirho, doneChirho: doneChirho)
            }
        }
        .navigationTitle("Books")
    }
}

struct WatchChaptersViewChirho: View {
    let modelChirho: RadioModelChirho
    let bookChirho: BookChirho
    let doneChirho: () -> Void

    private let columnsChirho = Array(repeating: GridItem(.flexible(), spacing: 4), count: 4)

    var body: some View {
        ScrollView {
            LazyVGrid(columns: columnsChirho, spacing: 4) {
                ForEach(modelChirho.offeredChaptersChirho(inBookChirho: bookChirho.idChirho), id: \.self) {
                    chapterChirho in
                    Button("\(chapterChirho)") {
                        modelChirho.choosePassageChirho(
                            bookIdChirho: bookChirho.idChirho, chapterChirho: chapterChirho)
                        doneChirho()
                    }
                    .accessibilityLabel("\(bookChirho.nameChirho) \(chapterChirho)")
                }
            }
        }
        .navigationTitle(bookChirho.nameChirho)
    }
}
