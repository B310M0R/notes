import requests
import sys

url = "https://randomuser.me/api/"

r = requests.get("https://raw.githubusercontent.com/danielmiessler/SecLists/master/Fuzzing/fuzz-Bo0oM.txt")
with open("api_wordlist.txt", "wb") as f:
    f.write(r.content)

f = open("api_wordlist.txt", "r")
lines = f.readlines()

for l in lines:
    r = requests.get(f"{url}{l}")
    print(f"Requested URL is {r.url}\n")
    print("Response:")
    print(r)