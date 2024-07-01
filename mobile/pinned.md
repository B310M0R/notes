# HTB Pinned Challenge write-up
1. Create device in Android Studio (API 24, without google play)
2. Run it with emulator from `C:\Users\kk745\AppData\Local\Android\Sdk\emulator` with command `./emulator -writable-system -avd Pixel_8_Pro_API_24_2`
3. Connect with adb, modify `/etc/hosts`:
```
adb devices
adb root
adb shell
mount -o rw,remount /system
echo "10.10.10.112 pinned.com" >> /system/etc/hosts
mount -o ro,remount /system
reboot
```
4. Install pinned.apk with `adb install`
5. Connect Burp:  
* set up proxy in advanced settings of emulator
* export Burp cert
* modify burp cert to .pem:
```
openssl x509 -inform DER -in burpcert.der -out burpcert.pem
openssl x509 -inform PEM -subject_hash_old -in burpcert.pem |head -1
mv burpcert.pem <hash>.0
adb push <certificate> /sdcard/
adb shell
mv /sdcard/<certificate file> /system/etc/security/cacerts/
chmod 644 /system/etc/security/cacerts/<certificate>
```
6. Install frida and frida-server
* On host machine:
```
pip install frida-tools
```
* On Android:  
download frida-server from github, unpack it, push inside device to /data/local/tmp and change permissions to 755
7. Check connection by running frida-server from adnroid device typing on host machine `frida-ps -U`
8. When we try to intercept traffic with burp, we see certificate error which means we deal with ssl pinning  

Run frida server on android and run `frida-ps -U -ai` on host to detect package with application (`com.example.pinned`)  
```
wget https://raw.githubusercontent.com/httptoolkit/frida-android-unpinning/main/frida-script.js
frida -U -l ./frida-script.js -f com.example.pinned
```
Then just intercept credentials and pass the flag!
