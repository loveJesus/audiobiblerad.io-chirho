#!/usr/bin/env bash
# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
#
# Pure-code checks for the iPhone and Watch radios. No app build, no simulator, no device, no
# download, no signing:
#   1. the shared catalogue snapshot still matches the web contract;
#   2. the web's TypeScript writes its answers for every station and chapter to a temporary file;
#   3. swift test runs the core package's tests on this Mac with that file, in an isolated scratch
#      path from the shared build-cache selector (external drive first, local fallback);
#   4. the playback and app sources are type-checked against the iOS and watchOS SDKs, with an
#      isolated module cache and nothing linked or bundled.
# Usage: scripts-chirho/native-chirho/ios-chirho/check_core_chirho.sh [core|typecheck]
# Part of spec-chirho/workflows-chirho/experience-chirho/native_players_workflow_chirho.md.
set -euo pipefail

ROOT_CHIRHO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
APPS_CHIRHO="$ROOT_CHIRHO/apps-chirho/ios-chirho"
PACKAGE_CHIRHO="$APPS_CHIRHO/RadioCoreChirho"
ONLY_CHIRHO="${1:-all}"
TEMP_CHIRHO="$(mktemp -d "${TMPDIR:-/tmp}/radio-ios-check-chirho.XXXXXX")"
trap 'rm -rf "$TEMP_CHIRHO"' EXIT

swift_files_chirho() {
  find "$@" -name '*.swift' -type f 2>/dev/null | LC_ALL=C sort
}

check_core_chirho() {
  echo "== Shared catalogue snapshot"
  bun "$ROOT_CHIRHO/scripts-chirho/native-chirho/export_catalogue_chirho.ts" --check-chirho
  echo "== Web answers for every station and chapter"
  bun "$ROOT_CHIRHO/scripts-chirho/native-chirho/ios-chirho/write_locator_parity_chirho.ts" \
    "$TEMP_CHIRHO/parity_chirho.json"
  # The project's own selection: external drive first, an isolated local fallback, checked floors.
  local scratch_chirho
  scratch_chirho="$(cd "$ROOT_CHIRHO" && bun -e "
    const { selectCacheChirho } = await import('./scripts-chirho/build-cache-chirho/select_chirho.ts');
    console.log(selectCacheChirho(process.cwd(), 'swiftpm-core-chirho').cache_root_chirho);
  ")"
  echo "== swift test (scratch: $scratch_chirho)"
  RADIO_PARITY_FILE_CHIRHO="$TEMP_CHIRHO/parity_chirho.json" xcrun swift test \
    --package-path "$PACKAGE_CHIRHO" --scratch-path "$scratch_chirho" \
    --manifest-cache local --jobs 2 -Xswiftc -warnings-as-errors
}

# Emits the package's modules for one SDK, then type-checks the app sources against them.
typecheck_chirho() {
  local sdk_name_chirho="$1" target_chirho="$2" app_dir_chirho="$3"
  local sdk_chirho modules_chirho cache_chirho
  sdk_chirho="$(xcrun --sdk "$sdk_name_chirho" --show-sdk-path)"
  modules_chirho="$TEMP_CHIRHO/modules-$sdk_name_chirho"
  cache_chirho="$TEMP_CHIRHO/module-cache-chirho"
  mkdir -p "$modules_chirho"
  local common_chirho=(-sdk "$sdk_chirho" -target "$target_chirho" -swift-version 6
    -module-cache-path "$cache_chirho" -I "$modules_chirho" -parse-as-library -warnings-as-errors -j 2)
  local core_chirho=() playback_chirho=() app_chirho=()
  while IFS= read -r file_chirho; do core_chirho+=("$file_chirho"); done \
    < <(swift_files_chirho "$PACKAGE_CHIRHO/Sources/RadioCoreChirho")
  while IFS= read -r file_chirho; do playback_chirho+=("$file_chirho"); done \
    < <(swift_files_chirho "$PACKAGE_CHIRHO/Sources/RadioPlaybackChirho")
  while IFS= read -r file_chirho; do app_chirho+=("$file_chirho"); done \
    < <(swift_files_chirho "$APPS_CHIRHO/$app_dir_chirho")
  echo "== Type-check for $sdk_name_chirho ($target_chirho)"
  xcrun swiftc "${common_chirho[@]}" -module-name RadioCoreChirho -emit-module \
    -emit-module-path "$modules_chirho/RadioCoreChirho.swiftmodule" "${core_chirho[@]}"
  if ((${#playback_chirho[@]})); then
    xcrun swiftc "${common_chirho[@]}" -module-name RadioPlaybackChirho -emit-module \
      -emit-module-path "$modules_chirho/RadioPlaybackChirho.swiftmodule" "${playback_chirho[@]}"
  fi
  if ((${#app_chirho[@]})); then
    xcrun swiftc "${common_chirho[@]}" -module-name "${app_dir_chirho}" -typecheck "${app_chirho[@]}"
  else
    echo "   no app sources in $app_dir_chirho yet"
  fi
}

case "$ONLY_CHIRHO" in
  core) check_core_chirho ;;
  typecheck)
    typecheck_chirho iphoneos arm64-apple-ios17.0 RadioPhoneChirho
    typecheck_chirho watchos arm64-apple-watchos10.0 RadioWatchChirho
    ;;
  all)
    check_core_chirho
    typecheck_chirho iphoneos arm64-apple-ios17.0 RadioPhoneChirho
    typecheck_chirho watchos arm64-apple-watchos10.0 RadioWatchChirho
    ;;
  *) echo "Usage: $0 [core|typecheck]" >&2; exit 2 ;;
esac
echo "== Pure-code checks passed"
