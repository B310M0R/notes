# Anchored
Install app, connect to Burp, get error while trying to intercept traffic  

## Decompile
```
java -jar apktool_2.5.0.jar d Anchored.apk
cat ./Anchored/AndroidManifest.xml
```
Manifest includes configuration of network security: `android:networkSecurityConfig="@xml/network_security_config`  
We can see that file `Anchored/res/xml/network_security_config.xml` checks the certificate for anchored.com application from `@raw/certificate`  
This path is `project_name/res/raw/certificate`  
In order to intercept the request and get the value of the parameter in plain text, we could issue a new certificate using Burp, add it in the user's Trasted credentials of the device, and finally include `<certificates src="user" />` in the `network_security_config.xml`  
`network_security_config.xml` must be like this:
```
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="false">
        <domain includeSubdomains="true">anchored.com</domain>
        <trust-anchors>
            <certificates src="system" />
            <certificates src="user" />
        </trust-anchors>
    </domain-config>
</network-security-config>
```
## Compile
```
java -jar apktool_2.5.0.jar b Anchored
```
Generate key and sign it:
```
cd Anchored/dist/
keytool -genkey -keystore john.keystore -validity 1000 -alias john
jarsigner -keystore john.keystore -verbose Anchored.apk john
```

## final
export der cert in Burp, name it with .crt extension and use `adb push cert-der.crt /sdcard/Download` to place it in device  
Navigate to `Settings -> Security -> Encryption & credentials` , and tap on the `Install from SD card`  
Intercept request and it's done!