# Android pentest

## APK structure
APK is archive which could be unpacked with `unzip` command

- METTA-INF: verification info for application signment
- MANIFEST.MF: list of names/hashes for all files in APK
- CERT.SF: Contains a list of names/hashes of the corresponding lines in the MANIFEST.MF file
- CERT.RSA: public key and signature of CERT.SF
- Assets: images, videos, documents, databases etc
- lib: native libraries with compiled code for different device architectures
- res: predefined app resources, such as XML with list of colors, fonts, layout etc
- AndroidManifest.xml - manifest file which describes application's package name, activities, resources, versions etc
- classes.dex - all java files in dex file format, to be executed by Android runtime
- resources.arsc - precompiled resources. Holds information that will link the code to resources

## OWASP Mobile Top 10 (2016)

### 1. Improper platform usage
This category covers misuse of platform features such as Android intents, platform permissions, TouchID, Keychain, or failure to use platform security controls of the mobile operating system. In order for this vulnerability to be exploited, the organization must expose a web service or API call that is consumed by the mobile app.  

### 2. Insecure data storage
Storing unencrypted data in the device's local storage is a bad practice, as there are malicious apps that may attempt to retrieve sensitive information from it. Attackers can  also retrieve data from a stolen device directly.  

### 3. Insecure communication
In this type of attack, malicious actors exploit vulnerabilities to intercept sensitive data in a compromised network (e.g. monitoring the network traffic of a company). Targeted attacks are easier to perform.  

### 4. Insecure authentication
Attackers usually use available or custom automated tools to exploit this vulnerability. They try to log in using default credentials or by bypassing authentication protocols with poor implementation.  

### 5. Insufficient cryptography
Data that has been improperly encrypted, can be reverted by attackers with physical access, or through malware applications.

### 6. Insecure authorization
Attackers usually use available or custom automated tools to log in to an application as a legitimate user. After logging in, they can perform binary attacks against the mobile app and try to execute privileged functionality that should only be executable with a user of higher privilege while the mobile app is in "offline" mode.

### 7. Poor code quality
In this case, an attacker can pass untrusted inputs to method calls that are made within the mobile code. Poor code-quality issues are typically exploited via malware or phishing scams. Typical types of attacks will exploit memory leaks and buffer overflows.

### 8. Code tampering
Attackers can create malicious apps by modifying the source code of existing apps and hosting them in third-party app stores. Attackers can also deliver these modified malicious apps to the victim by using phishing techniques.

### 9. Reverse engineering
Attackers will download an app from the app store in order to perform reverse engineering and static analysis techniques, using available tools. This allows them to understand the functionality of the app, change the code, and recompile it.

### 10. Extraneous functionality
Attackers will try to understand how the app works, in order to discover the functionality of the back-end system. Then, they try to exploit the back-end system directly.

## Tools
* Android Debug Bridge - A versatile command-line tool that lets you communicate with a device.
* Dex2jar - Converts .dex files to .class files, zipped as a jar file.
* JD-GUI - A standalone graphical utility that displays Java sources from CLASS files.
* JADX - Command line and GUI tools for producing Java source code from Android Dex and APK files.
* APKTOOL - A tool for reverse engineering 3rd party, closed, binary Android apps.
* Burp Suite
* Frida - A dynamic instrumentation toolkit for developers, reverse engineers, and security researchers
* Objection - A runtime mobile exploration toolkit, powered by Frida, built to help you assess the security posture of your mobile applications, without needing a jailbreak.
* Ghidra - A software reverse engineering (SRE) suite of tools developed by NSA's Research Directorate in support of the Cybersecurity mission.
* Drozer - drozer (formerly Mercury) is the leading security testing framework for Android.
* MobSF - Mobile Security Framework (MobSF) is an automated, all-in-one mobile application (Android/iOS/Windows) pen-testing, malware analysis and security assessment framework capable of performing static and dynamic analysis.

## Environment for pentest
Emulator - Android Studio IDE + AVD (Android Virtual Device)  
Corellium and Genymotion are goot alternatives for Android Studio, because they are cloud-based and emulate real ARM processor, which gives possibility to perform kernel exploit  

## Pentest techiques

### 1. Local Storage enum
Instal ADB with `sudo apt install adb`  
Conenction between adb and virtual device must be established automatically, but we can do it manually  

#### manual connection:  
First, we enable the USB Debugging option on the device. To do so, we tap on Settings, then About Device or About Phone, depending on the device, and then we scroll down and tap on the Build Number seven times until the message "You are now a developer!" pops up.  
Next, tap the back button one time and navigate to Developer Options.  
Then scroll down to the Debugging section until we find and enable the USB Debugging option.  
Then we get IP address of device via Wi-Fi options  
And then:  

```
adb connect 192.168.232.2:5555
```

This command will also start an adb server locally, waiting for new connections. According to the official ADB documentation, port 5555 is used by the adb server, and it is the first port in a sequence that the emulator will attempt to connect to. Once the connection is established, we can type `adb devices` to list the connected devices.  

#### Importan directories to enumerate:
* /data/data: Contains all the applications that are installed by the user.
* /data/user/0: Contains data that only the app can access.
* /data/app: Contains the APKs of the applications that are installed by the user.
* /system/app: Contains the pre-installed applications of the device.
* /system/bin: Contains binary files.
* /data/local/tmp: A world-writable directory.
* /data/system: Contains system configuration files.
* /etc/apns-conf.xml: Contains the default Access Point Name (APN) configurations. APN is used in order for the device to connect with our current carrier’s network.
* /data/misc/wifi: Contains WiFi configuration files.
* /data/misc/user/0/cacerts-added: User certificate store. It contains certificates added by the user.
* /etc/security/cacerts/: System certificate store. Permission to non-root users is not permitted.
* /sdcard: Contains a symbolic link to the directories DCIM, Downloads, Music, Pictures, etc.

#### Enumerating
We are interest in `/data/data` directory, where possibly some databases could be stored  
Once we identify application database (for example `/data/data/com.example.demo/databases/`), we can use sqlite3 tool from inside adb  
Also we can search for sensitive information in `/data/data/com.example.demo/shared_prefs` directory  



