# Bizness machine writeup
## Enum
```
rustscan -a <IP> --ulimit 5000
```

80 & 443 detected, add amchine's IP to /etc/hosts

```
dirsearch -u <url> --exclude-status 400,404,403,500,502
```
In output see /control/login and page powered by Apache OfBiz, we need to exploit it.  
Look for `Apache OFBiz CVE` on Google  
CVE-2023-51467 leads to RCE  
[test for vuln](https://github.com/K3ysTr0K3R/CVE-2023-51467-EXPLOIT)
```
python3 CVE-2023-51467.py --url https://bizness.htb
```
Note that if we will put `/` at the end of URL it won't work  
[exploit](https://github.com/jakabakos/Apache-OFBiz-Authentication-Bypass)  
