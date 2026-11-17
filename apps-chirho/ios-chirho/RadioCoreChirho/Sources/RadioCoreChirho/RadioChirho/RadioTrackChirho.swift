// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// Loading a chapter into the transport and acting on what it reports: placing the start, the first
// sound, buffering, the end of a chapter, and recovery from a file that will not play. Every event
// carries the number of the load it belongs to, so nothing from a replaced stream can move a newer
// one. Part of spec-chirho/workflows-chirho/experience-chirho/native_players_workflow_chirho.md.

import Foundation

/// The chapter the transport holds, and what the radio still means to do with it.
struct TrackChirho {
    let tokenChirho: Int
    let refChirho: ChapterRefChirho
    let audioChirho: ChapterAudioChirho
    /// The listener wants sound from it. Off clears this, and nothing late sets it again.
    var wantsPlayChirho: Bool
    /// The start has been placed.
    var positionedChirho: Bool
    /// The place to carry in once the length is known, when no exact second was given.
    var pendingPositionChirho: PositionChirho
    var pendingSecondsChirho: Double?
    var durationChirho: Double = 0
    var soundedChirho = false
}

/// Where the listener was when a recovery began. It is restored if no replacement plays.
struct RecoveryOriginChirho {
    let refChirho: ChapterRefChirho
    let secondsChirho: Double
    let followedChirho: FollowedPlaceChirho
}

extension RadioControllerChirho {
    /// Starts the chapter in the state on this station, or the next one it has.
    func beginTrackChirho(playChirho: Bool, positionChirho: PositionChirho, secondsChirho: Double?) {
        cancelTimeoutChirho()
        guard
            let landingChirho = catalogueChirho.chapterAtOrAfterChirho(
                stationChirho, bookIdChirho: stateChirho.refChirho.bookIdChirho,
                chapterChirho: stateChirho.refChirho.chapterChirho)
        else {
            failChirho(RadioMessagesChirho.noChaptersChirho)
            return
        }
        let movedChirho = landingChirho != stateChirho.refChirho
        stateChirho.refChirho = landingChirho
        stateChirho.secondsChirho = movedChirho ? 0 : (secondsChirho ?? 0)
        stateChirho.durationChirho = 0
        stateChirho.verseChirho = nil
        stateChirho.phaseChirho = playChirho ? .loadingChirho : .offChirho
        stateChirho.messageChirho =
            movedChirho
            ? RadioMessagesChirho.movedChirho
            : recoveriesChirho > 0 ? RadioMessagesChirho.recoveringChirho : ""
        guard
            let audioChirho = catalogueChirho.resolveChapterChirho(
                stationChirho, bookIdChirho: landingChirho.bookIdChirho,
                chapterChirho: landingChirho.chapterChirho)
        else {
            failChirho(RadioMessagesChirho.unavailableChirho)
            return
        }
        tokenChirho += 1
        let mineChirho = tokenChirho
        let exactChirho = movedChirho ? 0 : secondsChirho
        trackChirho = TrackChirho(
            tokenChirho: mineChirho, refChirho: landingChirho, audioChirho: audioChirho,
            wantsPlayChirho: playChirho, positionedChirho: exactChirho != nil,
            pendingPositionChirho: movedChirho ? .zeroChirho : positionChirho,
            pendingSecondsChirho: exactChirho)
        if let timingsUrlChirho = audioChirho.timingsUrlChirho { prefetchTimingsChirho(timingsUrlChirho) }
        transportChirho.loadChirho(
            audioChirho.urlChirho, startSecondsChirho: exactChirho,
            playChirho: playChirho && exactChirho != nil
        ) { [weak self] eventChirho in
            self?.receiveChirho(eventChirho, tokenChirho: mineChirho)
        }
        if playChirho { armTimeoutChirho() }
    }

    func receiveChirho(_ eventChirho: TransportEventChirho, tokenChirho eventTokenChirho: Int) {
        // Anything from a stream that has since been replaced or released changes nothing.
        guard eventTokenChirho == tokenChirho, var trackChirho, trackChirho.tokenChirho == eventTokenChirho
        else { return }
        switch eventChirho {
        case .readyChirho(let durationSecondsChirho):
            guard durationSecondsChirho.isFinite, durationSecondsChirho > 0 else { return }
            trackChirho.durationChirho = durationSecondsChirho
            self.trackChirho = trackChirho
            stateChirho.durationChirho = durationSecondsChirho
            if !trackChirho.positionedChirho {
                positionWhenReadyChirho(trackChirho)
            } else if stateChirho.secondsChirho > durationSecondsChirho - 0.1 {
                let lastChirho = max(0, durationSecondsChirho - 0.1)
                transportChirho.seekChirho(toSecondsChirho: lastChirho)
                stateChirho.secondsChirho = lastChirho
            }
        case .playingChirho:
            guard trackChirho.wantsPlayChirho else {
                // Off arrived first, so it stays off.
                transportChirho.pauseChirho()
                return
            }
            soundedChirho(trackChirho)
        case .waitingChirho:
            guard trackChirho.wantsPlayChirho, stateChirho.phaseChirho == .playingChirho else { return }
            stateChirho.phaseChirho = .loadingChirho
            armTimeoutChirho()
        case .progressChirho(let secondsChirho):
            guard trackChirho.positionedChirho, secondsChirho.isFinite else { return }
            stateChirho.secondsChirho = max(0, secondsChirho)
            stateChirho.verseChirho =
                PositionChirho.captureChirho(
                    secondsChirho: secondsChirho, durationChirho: trackChirho.durationChirho,
                    timingsChirho: timingsChirho(for: trackChirho)
                ).verseChirho
            updateFollowedPositionChirho()
            if clockChirho() - lastSaveChirho >= optionsChirho.saveIntervalSecondsChirho * 1000 {
                saveChirho()
            }
        case .endedChirho:
            guard trackChirho.wantsPlayChirho else { return }
            advanceChirho(fromChirho: trackChirho.refChirho)
        case .failedChirho(let failureChirho):
            failedChirho(failureChirho, trackChirho)
        case .stoppedBySystemChirho:
            guard trackChirho.wantsPlayChirho else { return }
            pausedBySystemChirho = true
            platformPausedChirho = true
            silenceChirho()
            saveChirho()
        }
    }

    /// Sound is coming out. A replacement found by recovery becomes the listener's place only now.
    func soundedChirho(_ playedChirho: TrackChirho) {
        var trackChirho = playedChirho
        cancelTimeoutChirho()
        let elapsedChirho = max(0, Int((clockChirho() - requestedAtChirho).rounded()))
        if stateChirho.firstSoundMsChirho == nil { stateChirho.firstSoundMsChirho = elapsedChirho }
        if switchingChirho, !trackChirho.soundedChirho { stateChirho.switchMsChirho = elapsedChirho }
        switchingChirho = false
        trackChirho.soundedChirho = true
        self.trackChirho = trackChirho
        stateChirho.phaseChirho = .playingChirho
        if let originChirho = recoveryOriginChirho {
            if originChirho.refChirho == followedChirho.refChirho {
                followedChirho = FollowedPlaceChirho(
                    stationIdChirho: stationChirho.idChirho, refChirho: trackChirho.refChirho,
                    positionChirho: PositionChirho.captureChirho(
                        secondsChirho: stateChirho.secondsChirho,
                        durationChirho: trackChirho.durationChirho,
                        timingsChirho: timingsChirho(for: trackChirho)))
            }
            recoveryOriginChirho = nil
        }
        recoveriesChirho = 0
        servicesStartMadeChirho = false
        saveChirho()
    }

    /// The chapter ended: on to the next one this station has.
    func advanceChirho(fromChirho refChirho: ChapterRefChirho) {
        guard
            let nextChirho = catalogueChirho.nextChapterChirho(
                stationChirho, bookIdChirho: refChirho.bookIdChirho,
                chapterChirho: refChirho.chapterChirho)
        else {
            silenceChirho()
            saveChirho()
            return
        }
        selectChapterChirho(nextChirho)
    }

    /// A missing or unplayable file that never sounded skips to the next chapter, at most a few
    /// times. A network failure never skips: the place is kept for the next On.
    func failedChirho(_ failureChirho: TransportFailureChirho, _ trackChirho: TrackChirho) {
        // The platform's services went away under the stream: not the file, so never another chapter.
        guard failureChirho != .servicesChirho else {
            servicesLostChirho()
            return
        }
        guard trackChirho.wantsPlayChirho else {
            // Off during loading or recovery stays off. The stream is let go and On asks afresh.
            restoreOriginChirho()
            releaseTrackChirho()
            saveChirho()
            return
        }
        if failureChirho == .unplayableChirho, !trackChirho.soundedChirho,
            recoveriesChirho < optionsChirho.recoveryLimitChirho,
            let nextChirho = catalogueChirho.nextChapterChirho(
                stationChirho, bookIdChirho: trackChirho.refChirho.bookIdChirho,
                chapterChirho: trackChirho.refChirho.chapterChirho)
        {
            if recoveryOriginChirho == nil {
                recoveryOriginChirho = RecoveryOriginChirho(
                    refChirho: trackChirho.refChirho, secondsChirho: stateChirho.secondsChirho,
                    followedChirho: followedChirho)
            }
            recoveriesChirho += 1
            stateChirho.refChirho = nextChirho
            beginTrackChirho(playChirho: true, positionChirho: .zeroChirho, secondsChirho: 0)
            return
        }
        failChirho(
            failureChirho == .networkChirho
                ? RadioMessagesChirho.networkChirho : RadioMessagesChirho.unplayableChirho)
    }

    func failChirho(_ messageChirho: String) {
        updateFollowedPositionChirho()
        restoreOriginChirho()
        releaseTrackChirho()
        stateChirho.durationChirho = 0
        stateChirho.verseChirho = nil
        stateChirho.phaseChirho = .errorChirho
        stateChirho.messageChirho = messageChirho
        saveChirho()
    }

    /// No replacement played: the listener's place is where it was before the recovery began.
    func restoreOriginChirho() {
        if let originChirho = recoveryOriginChirho {
            followedChirho = originChirho.followedChirho
            stateChirho.refChirho = originChirho.refChirho
            stateChirho.secondsChirho = originChirho.secondsChirho
        }
        recoveryOriginChirho = nil
        recoveriesChirho = 0
    }

    /// Stops the sound but keeps the stream loaded, so On resumes at once.
    func silenceChirho() {
        cancelTimeoutChirho()
        if var trackChirho {
            updateFollowedPositionChirho()
            trackChirho.wantsPlayChirho = false
            self.trackChirho = trackChirho
            transportChirho.pauseChirho()
        }
        stateChirho.phaseChirho = .offChirho
    }

    /// Lets go of the stream entirely, and with it any pause the platform made of it.
    func releaseTrackChirho() {
        cancelTimeoutChirho()
        tokenChirho += 1
        platformPausedChirho = false
        if trackChirho != nil {
            trackChirho = nil
            transportChirho.clearChirho()
        }
    }

    /// A passage the listener chose, or reached at the end of the last one.
    func selectChapterChirho(_ refChirho: ChapterRefChirho) {
        guard let bookChirho = catalogueChirho.bookChirho(refChirho.bookIdChirho),
            (1...bookChirho.chaptersChirho).contains(refChirho.chapterChirho)
        else { return }
        let playChirho = wantsSoundChirho
        recoveryOriginChirho = nil
        recoveriesChirho = 0
        followedChirho = FollowedPlaceChirho(
            stationIdChirho: stationChirho.idChirho, refChirho: refChirho, positionChirho: .zeroChirho)
        stateChirho.refChirho = refChirho
        stateChirho.secondsChirho = 0
        stateChirho.durationChirho = 0
        stateChirho.verseChirho = nil
        if playChirho {
            beginTrackChirho(playChirho: true, positionChirho: .zeroChirho, secondsChirho: 0)
        } else {
            releaseTrackChirho()
            landQuietlyChirho()
        }
        saveChirho()
    }

    /// Shows where On will land on this station, without loading anything.
    func landQuietlyChirho() {
        guard
            let landingChirho = catalogueChirho.chapterAtOrAfterChirho(
                stationChirho, bookIdChirho: followedChirho.refChirho.bookIdChirho,
                chapterChirho: followedChirho.refChirho.chapterChirho)
        else { return }
        let sameChirho = landingChirho == followedChirho.refChirho
        stateChirho.refChirho = landingChirho
        stateChirho.secondsChirho = sameChirho ? followedChirho.positionChirho.secondsChirho : 0
        stateChirho.durationChirho = 0
        stateChirho.verseChirho = nil
        stateChirho.messageChirho = sameChirho ? "" : RadioMessagesChirho.movedChirho
        if stateChirho.phaseChirho == .errorChirho { stateChirho.phaseChirho = .offChirho }
    }

    /// Keeps the followed place's position current while its own passage plays.
    func updateFollowedPositionChirho() {
        guard recoveryOriginChirho == nil, let trackChirho, trackChirho.positionedChirho,
            trackChirho.durationChirho > 0, trackChirho.refChirho == followedChirho.refChirho,
            stateChirho.refChirho == trackChirho.refChirho
        else { return }
        followedChirho.stationIdChirho = stationChirho.idChirho
        followedChirho.positionChirho = PositionChirho.captureChirho(
            secondsChirho: stateChirho.secondsChirho, durationChirho: trackChirho.durationChirho,
            timingsChirho: timingsChirho(for: trackChirho))
    }

    // MARK: Placing the start

    /// Once the length is known: the same verse when both recordings have timings, otherwise the
    /// same fraction. Waits a moment for this chapter's timings when a verse is to be carried.
    func positionWhenReadyChirho(_ trackChirho: TrackChirho) {
        if trackChirho.pendingSecondsChirho == nil,
            trackChirho.pendingPositionChirho.verseChirho != nil,
            let urlChirho = trackChirho.audioChirho.timingsUrlChirho,
            timingsCacheChirho[urlChirho] == nil, timingsTasksChirho[urlChirho] != nil
        {
            let mineChirho = trackChirho.tokenChirho
            let waitChirho = optionsChirho.timingsWaitSecondsChirho
            Task { [weak self] in
                try? await Task.sleep(nanoseconds: UInt64(waitChirho * 1_000_000_000))
                self?.applyPositionChirho(mineChirho)
            }
            return
        }
        applyPositionChirho(trackChirho.tokenChirho)
    }

    func applyPositionChirho(_ mineChirho: Int) {
        guard mineChirho == tokenChirho, var trackChirho, trackChirho.tokenChirho == mineChirho,
            !trackChirho.positionedChirho, trackChirho.durationChirho > 0
        else { return }
        let lastChirho = max(0, trackChirho.durationChirho - 0.1)
        let secondsChirho =
            trackChirho.pendingSecondsChirho.map { min(max(0, $0), lastChirho) }
            ?? trackChirho.pendingPositionChirho.mappedChirho(
                durationChirho: trackChirho.durationChirho,
                timingsChirho: timingsChirho(for: trackChirho)
            ).secondsChirho
        trackChirho.positionedChirho = true
        self.trackChirho = trackChirho
        transportChirho.seekChirho(toSecondsChirho: secondsChirho)
        stateChirho.secondsChirho = secondsChirho
        if trackChirho.wantsPlayChirho { transportChirho.playChirho() }
    }

    // MARK: Verse timings

    func prefetchTimingsChirho(_ urlChirho: URL) {
        guard timingsCacheChirho[urlChirho] == nil, timingsTasksChirho[urlChirho] == nil else { return }
        let loaderChirho = timingsLoaderChirho
        timingsTasksChirho[urlChirho] = Task { [weak self] in
            let dataChirho = await loaderChirho.loadTimingsChirho(urlChirho)
            self?.timingsArrivedChirho(
                urlChirho, dataChirho.flatMap(VerseTimingsChirho.parseChirho) ?? [])
        }
    }

    /// Kept even when empty, so a chapter without timings is asked for once, not on every turn.
    func timingsArrivedChirho(_ urlChirho: URL, _ startsChirho: [Double]) {
        timingsTasksChirho[urlChirho] = nil
        timingsCacheChirho[urlChirho] = startsChirho
        timingsOrderChirho.append(urlChirho)
        while timingsOrderChirho.count > optionsChirho.timingsCacheLimitChirho {
            timingsCacheChirho[timingsOrderChirho.removeFirst()] = nil
        }
        if let trackChirho, trackChirho.audioChirho.timingsUrlChirho == urlChirho,
            !trackChirho.positionedChirho, trackChirho.durationChirho > 0
        {
            applyPositionChirho(trackChirho.tokenChirho)
        }
    }

    func timingsChirho(for trackChirho: TrackChirho) -> [Double]? {
        guard let urlChirho = trackChirho.audioChirho.timingsUrlChirho,
            let startsChirho = timingsCacheChirho[urlChirho], !startsChirho.isEmpty
        else { return nil }
        return startsChirho
    }

    // MARK: Waiting

    func armTimeoutChirho() {
        timeoutChirho?.cancel()
        let mineChirho = tokenChirho
        let secondsChirho = optionsChirho.loadTimeoutSecondsChirho
        timeoutChirho = Task { [weak self] in
            try? await Task.sleep(nanoseconds: UInt64(secondsChirho * 1_000_000_000))
            guard !Task.isCancelled else { return }
            self?.timedOutChirho(mineChirho)
        }
    }

    func cancelTimeoutChirho() {
        timeoutChirho?.cancel()
        timeoutChirho = nil
    }

    func timedOutChirho(_ mineChirho: Int) {
        guard mineChirho == tokenChirho, stateChirho.phaseChirho == .loadingChirho,
            trackChirho?.wantsPlayChirho == true
        else { return }
        failChirho(RadioMessagesChirho.slowChirho)
    }
}
