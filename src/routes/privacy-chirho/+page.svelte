<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->

<script lang="ts">
	import { resolve as resolvePathChirho } from '$app/paths';
	import InfoPageChirho from '$lib/site-chirho/InfoPageChirho.svelte';
</script>

<InfoPageChirho
	title_chirho="Privacy"
	description_chirho="How Audio Bible Radio handles your saved place, publisher requests and website visits."
>
	<p>
		Audio Bible Radio is made by Love Jesus Software. The apps play recordings directly from their
		publishers and remember your place on your device. No account is needed.
	</p>
	<p>Last updated: November 17, 2026.</p>
	<h2>What stays on your device</h2>
	<p>
		The apps save your station, book, chapter and listening position, along with your power and
		sound preferences. The website also remembers its appearance settings in your browser. We do not
		receive this saved listening history or synchronize it through an account.
	</p>
	<p>
		You can clear the website's saved preferences through your browser's site-data controls.
		Uninstalling a native app removes its local preferences. Apple device backups may include app
		preferences; the Android app disables preference backups and device transfer.
	</p>
	<h2>Requests to recording publishers</h2>
	<p>
		Playing a chapter sends a request directly to its publisher's server. The server receives your
		IP address, the recording's address, the time and normal request headers. The requested address
		identifies the recording and passage. Some recordings also request verse-timing information.
		These connections use HTTPS.
	</p>
	<p>
		The native apps stream from the Internet Archive, Bible in Every Language, the Free Use Bible
		API and Open Bible. The website additionally offers Davar Audio Bibles. The selected recording's
		notice identifies its publisher and terms.
	</p>
	<p>
		These publishers operate their own servers and may keep request logs. Their policies govern that
		processing:
	</p>
	<ul>
		<li>
			<a href="https://archive.org/about/terms" rel="external noreferrer">Internet Archive</a> describes
			logging network addresses and requested pages.
		</li>
		<li>
			<a href="https://bibleineverylanguage.org/privacy-policy/" rel="external noreferrer"
				>Bible in Every Language</a
			> describes collecting IP addresses, files viewed, access times and geographical information.
		</li>
		<li>
			<a href="https://helloao.org/privacy.html" rel="external noreferrer"
				>AO Lab / Free Use Bible API</a
			> describes hosting-provider request records for delivery and abuse protection.
		</li>
		<li>
			<a href="https://openbible.com/audio.htm" rel="external noreferrer">Open Bible's audio page</a
			> does not provide a separate privacy policy.
		</li>
		<li>
			<a href="https://davaraudiobibles.org/audio-bible-library/" rel="external noreferrer"
				>Davar Audio Bibles</a
			> supplies the additional recordings offered on the website.
		</li>
	</ul>
	<p>
		We do not operate those recording servers or receive their logs. We cannot delete records held
		by a publisher; requests about those records should go to that publisher.
	</p>
	<h2>The website</h2>
	<p>
		Cloudflare hosts and protects this website. It processes IP addresses, requested URLs and
		request headers to deliver the pages and handle security. Cloudflare may retain traffic or
		security records under <a
			href="https://www.cloudflare.com/privacypolicy/"
			rel="external noreferrer">its privacy policy</a
		>. Visiting this site is separate from the native apps' direct recording requests.
	</p>
	<h2>Accounts, advertising and tracking</h2>
	<p>
		The apps have no accounts, advertising, analytics SDKs or crash-reporting service. They do not
		request your location, contacts, photos, camera or microphone. We do not sell personal
		information or use cross-app advertising tracking.
	</p>
	<h2>Questions</h2>
	<p>
		Our <a href={resolvePathChirho('/support-chirho')}>help and contact page</a> explains how to reach
		us. If you contact us, we use your message to respond to your request.
	</p>
</InfoPageChirho>
