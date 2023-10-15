# Authentication attacks
## Brute-force
Analyze responses and content-length when trying to determine username. We can detect correct username without knowing correct password, which will decrease brute-force attempts  
Also check response messages (with grep in Intruder settings). For example app can throw "Invalid username or password" or just "Invalid password"