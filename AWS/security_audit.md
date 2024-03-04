# AWS Security audit
[audit tool](https://github.com/nccgroup/ScoutSuite)  
Audit infra via aws security best practices  
Requirements:
* Read-only user with programmatic access
* SecurityAudit AWS permissions
* csv file with keys

## CloudGoat
### Vulnerable lambda
'whoami':
```
aws --profile bilbo --region us-east-1 sts get-caller-identity
```

policies:
```
aws iam list-user-policies --user-name <suername>
```

permissions:
```
aws iam get-user-policy --user-name <username> --policy-name <policy name>
```