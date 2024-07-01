# APKrypt
Download and install apk, time to reverse
## Reverse
install dex2jar. With it we can create jar file from apk  
Install jd-gui, with it we can read source code of apk file  
```
d2j-dex2jar APKrypt.apk
```
And then open createrd jar file with jd-gui  
Read source code in `MainActivity.class`  
Here we detect that some string is decrypted with AES and secret string if we pass wvip code  
We can decrypt this string with this code:
```
package com.example.myapplication;
import androidx.appcompat.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Base64;
import android.util.Log;
import java.security.Key;
import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
public class MainActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        try {
            decrypt();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    public static void decrypt() throws Exception {
        Key key = generateKey();
        Cipher cipher = Cipher.getInstance("AES");
        cipher.init(Cipher.DECRYPT_MODE, key);
        byte[] decryptedValue64 = Base64.decode("k+RLD5J86JRYnluaZLF3Zs/yJrVdVfGo1CQy5k0+tCZDJZTozBWPn2lExQYDHH1l", Base64.DEFAULT);
        byte [] decryptedByteValue = cipher.doFinal(decryptedValue64);
        String decryptedValue = new String(decryptedByteValue,"utf-8");
        Log.d("The flag is: ", decryptedValue);
    }
    private static Key generateKey() throws Exception {
        Key key = new SecretKeySpec("Dgu8Trf6Ge4Ki9Lb".getBytes(),
            "AES");
        return key;
    }
}
```
OR we can simply decrypt it online:)  
