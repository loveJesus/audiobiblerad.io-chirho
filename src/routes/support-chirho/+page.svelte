<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->

<script lang="ts">
	import { resolve as resolvePathChirho } from '$app/paths';
	import InfoPageChirho from '$lib/site-chirho/InfoPageChirho.svelte';
	import {
		SITE_ISSUES_URL_CHIRHO,
		SITE_SOURCE_URL_CHIRHO
	} from '$lib/site-chirho/site_config_chirho';
</script>

<InfoPageChirho
	title_chirho="Help & support"
	description_chirho="Help with Audio Bible Radio on iPhone, Apple Watch, Android and the web."
>
	<p>
		Turn on the radio and hear Scripture. Choose a recording, a book and a chapter, or let the next
		chapter play automatically.
	</p>
	<h2>Listening and changing recordings</h2>
	<p>
		Use the power control to start or stop. Turning the radio off is remembered, so reopening it
		stays quiet until you turn it on. On the website, your browser may ask for a press before it
		allows audio; use the PRESS HERE cue.
	</p>
	<p>
		The station control chooses a language and narration. When available, the new recording carries
		your place into the same passage. Exact verse matching depends on the recording's timing
		information; otherwise the app uses your approximate position in the chapter.
	</p>
	<h2>Apple Watch</h2>
	<p>
		Choose an audio output the Watch supports for long listening, such as Bluetooth headphones, then
		turn the radio on. If no output is available, the app tells you and stays off. Use the Digital
		Crown to change station and the book control to choose a passage.
	</p>
	<h2>If a recording stops or will not play</h2>
	<ul>
		<li>Check your internet connection and turn the radio on again.</li>
		<li>
			A recording may offer only some books or chapters. Choose another recording if the passage is
			unavailable.
		</li>
		<li>
			The native apps try up to three following chapters when an unreadable file fails before
			playback. A network failure keeps your place for another try.
		</li>
		<li>When headphones disconnect, select an output and turn the radio on again.</li>
	</ul>
	<h2>Radio sounds and appearance</h2>
	<p>
		The Radio sounds control switches the tuning and button effects on or off. On the website,
		choose 2D to use the original radio themes. The listening room's rain and lava motion can be
		switched off and respect your device's reduced-motion setting.
	</p>
	<h2>Credits and privacy</h2>
	<p>
		The selected recording's notice shows its narrator, publisher and licence. See <a
			href={resolvePathChirho('/credits-chirho')}>recording credits</a
		>
		and our <a href={resolvePathChirho('/privacy-chirho')}>privacy policy</a> for more information.
	</p>
	<h2>Contact and report a problem</h2>
	<p>
		You can <a href={SITE_ISSUES_URL_CHIRHO} rel="external noreferrer"
			>report a technical problem on GitHub</a
		>. Include your app version, device, recording and passage so we can reproduce it. Please keep
		personal information out of public reports.
	</p>
	<p>
		Audio Bible Radio is an open-source Love Jesus Software ministry. <a
			href={SITE_SOURCE_URL_CHIRHO}
			rel="external noreferrer">View the source code</a
		>.
	</p>
</InfoPageChirho>
