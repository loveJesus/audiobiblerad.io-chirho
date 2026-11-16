// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

plugins { id("com.android.application") version "9.5.1" apply false }

val buildRootChirho = providers.environmentVariable("RADIO_NATIVE_BUILD_ROOT_CHIRHO")
if (buildRootChirho.isPresent) {
    layout.buildDirectory.set(file("${buildRootChirho.get()}/root-chirho"))
    subprojects { layout.buildDirectory.set(file("${buildRootChirho.get()}/${name}")) }
}
