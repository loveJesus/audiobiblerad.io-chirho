<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->

# Code, sounds and audio licenses

Copyright 2026 L.J. (Love Jesus).

Audio Bible Radio's original application, catalogue and tooling code is free software under the GNU General Public License, version 3 or, at your option, any later version. The full GPLv3 text is in the root LICENSE. The corresponding source is published at https://github.com/loveJesus/audiobiblerad.io-chirho.

## Additional permission for app stores

Additional permission under GNU GPL version 3 section 7: if you convey this program, or a work based on it, through an application store or similar distribution service whose terms impose usage rules, digital rights management or other restrictions on recipients beyond those of the GPL, you are permitted to do so, provided that the Corresponding Source of the work as conveyed is also made available to every recipient, at no charge, under the terms of the GPL together with this permission. This permission covers only those restrictions of the distribution service; every other term of the GPL still applies. Anyone who modifies this program may extend this permission to their version, but is not required to.

## Radio sounds

To the extent possible under law, L.J. (Love Jesus) dedicates all copyright and related rights held by the project in the radio's sounds to the public domain under CC0 1.0 Universal: https://creativecommons.org/publicdomain/zero/1.0/. These are the eleven original sounds the project synthesises from fixed numbers, with no recorded, supplied or downloaded audio: the nine tuning and dial sounds written by `scripts-chirho/generate_radio_sounds_chirho.ts`, and the click and knob sounds written by `scripts-chirho/sounds-chirho/generate_interface_sounds_chirho.ts` to `static/sounds-chirho/interface-chirho/`. You may copy, modify and redistribute them, including commercially, without permission or required attribution. The full legal text is in CC0-1.0-chirho.txt.

## Licensed sound effects in the published radio

The radio published at https://audiobiblerad.io may also play a few short tuning, click and knob effects cut from sound samples licensed to the project from Splice. Those effects and the samples they come from are not in this repository and are not covered by the GPL or the CC0 dedication above. They are used under Splice's licence as sound effects within this app. No right in them is granted to anyone else: they may not be extracted, reused or redistributed, on their own or as samples. A copy built from this repository plays the original CC0 sounds above in their place.

## Radio artwork

The pictures of the radio itself, under `static/images-chirho/radios-chirho/`, were made for this project on 2026-11-14 with AI image generation (OpenAI's GPT Image 2.6) from text descriptions alone: no reference image, no third-party picture and nothing downloaded. The project then cropped, adjusted and encoded them. They are machine-made pictures, not photographs of real objects or places. They are shared under the same GPL-3.0-or-later terms as the code, to the extent the project holds any rights in them. No exclusive copyright in AI-generated material is claimed.

## Listening-room scene

The detailed listening room and cassette stereo under `static/scenes-chirho/listening-room-chirho/` are project-created procedural geometry and materials. The preferred editable construction source is under `artwork-chirho/listening-room-chirho/`: two Python recipes, their normalized export baseline, and two original text-only AI-generated image inputs (the distant city and framed Psalm 46:10 poster). The managed image-generation tool did not report an exact model identifier. No downloaded stock mesh, reference photograph, third-party album cover or font file is included. Cassette handwriting uses original hand-plotted strokes; other modeled lettering uses Blender's built-in font. The source README records provenance, hashes and reproduction instructions.

These scene assets and construction sources share the project's GPL-3.0-or-later terms and section 7 permission above, to the extent the project holds rights in them. No exclusive copyright in AI-generated material is claimed. The scene contains no Scripture recording or purchased sound sample. Runtime effects retain their separate licences.

## Scripture audio is not covered

No Scripture audio is in this repository. The radio streams each recording from its publisher's own host, and each recording stays under its publisher's own terms. Neither the GPL above nor the CC0 dedication grants any right in it. Some of those terms forbid commercial use: Davar Audio Bibles' recordings "may not be sold or used for any commercial purpose", and their copyright notices must be shown when shared.

The catalogue records, for every station, its publisher, licence, the page where the licence was read and the credit the licence asks for. The radio shows that credit to listeners. The records are in `spec-chirho/sources-chirho/`: the sources page, `station_register_chirho.md` for the built-in stations and `davar_station_register_chirho.md` for the stations loaded by language. Anyone reusing this code to play these recordings is responsible for following each publisher's terms.

## Packages

Runtime and development packages keep their own upstream licenses. They are not relicensed by this grant.
