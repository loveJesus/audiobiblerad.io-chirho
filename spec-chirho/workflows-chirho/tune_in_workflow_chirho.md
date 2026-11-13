<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->

# Tune-in workflow

**Planned. No code implements this yet.** When a function becomes part of this flow, name this file
in a comment above it, and correct the diagram when the code proves it wrong.

```mermaid
flowchart TD
    open_chirho[Listener opens the app] --> last_chirho{A remembered station?}
    last_chirho -- yes --> place_chirho[Use its station, book, chapter and position]
    last_chirho -- no --> first_chirho[Use the first-run station and chapter]
    place_chirho --> locate_chirho
    first_chirho --> locate_chirho
    locate_chirho{How does this station find audio?}
    locate_chirho -- pattern --> build_chirho[Build the address from book and chapter]
    locate_chirho -- index --> lookup_chirho[Look the chapter up in the station's index]
    locate_chirho -- resolver --> ask_chirho[Ask our server for a short-lived address]
    build_chirho --> play_chirho
    lookup_chirho --> play_chirho
    ask_chirho --> play_chirho
    play_chirho[Start the stream at the wanted position] --> heard_chirho([Scripture is heard])

    heard_chirho --> dial_chirho[Listener turns the dial]
    dial_chirho --> noise_chirho{Radio sounds on?}
    noise_chirho -- yes --> static_chirho[Play one of nine radio sounds while loading]
    noise_chirho -- no --> quiet_chirho[Load in silence]
    static_chirho --> map_chirho
    quiet_chirho --> map_chirho
    map_chirho[Keep book and chapter; map the position: same verse, else same fraction, else start] --> locate_chirho

    heard_chirho --> end_chirho[Chapter ends]
    end_chirho --> next_chirho[Move to the next chapter; skip one that is missing]
    next_chirho --> locate_chirho
```
