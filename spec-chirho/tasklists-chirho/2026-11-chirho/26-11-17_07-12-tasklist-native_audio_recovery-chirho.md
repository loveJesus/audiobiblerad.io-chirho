<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->

# Native Apple audio-services recovery

The confirmed gap is in iPhone and Watch: a media-services reset leaves the existing AVPlayer/effect players invalid, leaves route readiness stale, and can classify AVError -11819 as an unplayable chapter. A route-disconnected interruption reason also needs the existing output-lost behavior. The goal is bounded recovery of the same followed place, without chapter skipping, replaying effects or reviving explicit Off.

Placement: retain the Foundation-only controller/intent tests in RadioCoreChirho. AVFoundation notifications, player replacement and effect-cache invalidation belong in the existing RadioPlaybackChirho route/transport/model/sounds files. The existing transport protocol carries the needed decisions; do not add another playback owner, dependency or app target. Claude2 owns those source paths; root owns progress and the serialized compile/runtime slots.

- [x] Define the lost/reset/disconnected event contract and one-time recovery boundary, including explicit Off and stale-event behavior.
- [ ] Add failing core/fake behavior tests before the correction; keep the original failing output.
- [ ] Rebuild invalidated transport/effect objects after services return, clear stale readiness and keep reset errors out of chapter-skip recovery.
- [ ] Map a route-disconnected interruption to the quiet output-lost path, with no self-restart.
- [ ] Run the full core/parity and strict iOS/watchOS type checks in the next free compiler slot, then build both purchased-set simulator apps.
- [ ] Review the final diff and reconcile package inventories; repeat the applicable simulator vertical on the new candidate.
- [ ] Preserve physical Reset Media Services, output-route, background and crown checks as device gates; do not claim them from fake tests.

Review before the compiler slot found one additional cancellation case: output loss during the pending initial or reset-recovery activation must fence that activation before a late active result can start playback. The Apple writer is extending the red-first suite and the frozen correction; the original nine-test freeze is preserved.
