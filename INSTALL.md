# Installing Syswatch 01

Syswatch 01 is not in an app store. You install it yourself ("sideload") from a computer, over the watch's wireless debugging. It is free and takes about ten minutes the first time.

## What you need

- A Wear OS watch running Wear OS 5 or newer (Android API 34+). Tested on a Samsung Galaxy Watch9 (SM-L350).
- A computer (Windows, macOS or Linux) on the same Wi-Fi network as the watch.
- Google's free Android **platform-tools**, which contain `adb`: <https://developer.android.com/tools/releases/platform-tools>
- The file `io.github.maxontorres.syswatch01.apk` from the [latest release](https://github.com/maxontorres/syswatch-01/releases/latest).

## Steps

1. **Turn on developer options on the watch.** Settings → About watch → Software information → tap **Software version** (on some watches **Build number**) seven times.
2. **Turn on debugging.** Settings → Developer options → turn on **ADB debugging** and **Wireless debugging**. The watch must be on Wi-Fi, not only Bluetooth.
3. **Pair the computer.** In Wireless debugging, tap **Pair new device**. The watch shows a pairing code and an address such as `192.168.1.23:41234`. On the computer:

   ```
   adb pair 192.168.1.23:41234
   ```

   Enter the pairing code when asked.
4. **Connect.** Back on the Wireless debugging screen the watch shows its main address, with a different port, for example `192.168.1.23:37555`:

   ```
   adb connect 192.168.1.23:37555
   adb devices
   ```

   The watch must be listed as `device`.
5. **Install.**

   ```
   adb install io.github.maxontorres.syswatch01.apk
   ```

   It prints `Success`.
6. **Choose the face.** Long-press the current watch face, scroll to **Syswatch 01** and tap it. It is also listed in the Galaxy Wearable (or Wear OS) app on your phone.
7. **Allow permissions.** When asked, allow the face to use heart rate and calendar data, or those modules stay empty.
8. Turn **Wireless debugging** off again when you are done.

## Updating and removing

- Update: install the newer APK the same way. It replaces the old one and keeps your selection.
- Remove: `adb uninstall io.github.maxontorres.syswatch01`, or uninstall it from the watch's app list.

## Check the download (optional)

The SHA-256 checksum of each release's APK is listed in its release notes. On Windows: `certutil -hashfile io.github.maxontorres.syswatch01.apk SHA256`. On macOS or Linux: `shasum -a 256 io.github.maxontorres.syswatch01.apk`.

## Problems

- `adb pair` or `adb connect` times out: watch and computer must be on the same network, and the port changes every time wireless debugging is switched on. Read it again on the watch.
- `device offline`: run `adb reconnect offline`, or turn wireless debugging off and on.
- More: [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md).

Syswatch 01 is provided as-is under the [MIT licence](LICENSE). The bundled Departure Mono font is under the SIL Open Font License; see [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md).
