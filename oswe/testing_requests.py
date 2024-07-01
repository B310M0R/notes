import requests

# url = "https://api.github.com/events"
# r = requests.get("https://api.github.com/events")
# here r is a response object

# r = requests.post('https://httpbin.org/post', data={'key': 'value'})
# r = requests.put('https://httpbin.org/put', data={'key': 'value'})
# r = requests.delete('https://httpbin.org/delete')
# r = requests.head('https://httpbin.org/get')
# r = requests.options('https://httpbin.org/get')

# passing url parameters:
payload = {'key1': 'value1', 'key2': 'value2'}
r = requests.get('https://httpbin.org/get', params=payload)
print(r.url)
print(r.text)

# to open response as bytes, we can use r.content, which is automatiacally decoded for us
# if we want to get some binary, we can use code like this:
# from PIL import Image
# from io import BytesIO

# i = Image.open(BytesIO(r.content))

# json decoder:
print(r.json())

#check response status:
print(r.status_code)

#also we can check status code with built-in status code checker:
if r.status_code == requests.codes.ok:
    print("it's okay!")

#also we can raise status codes as errors:
# bad_r = requests.get('https://httpbin.org/status/404')
# print(bad_r.status_code)
# bad_r.raise_for_status()
    
#custom headers:
url = 'https://api.github.com/some/endpoint'
headers = {'user-agent': 'my-app/0.0.1'}

r = requests.get(url, headers=headers)
print(r.text)

# post request with paylaod:
payload = {'key1': 'value1', 'key2': 'value2'}

r = requests.post('https://httpbin.org/post', data=payload)
print(r.text)

# post a file:
url = 'https://httpbin.org/post'
files = {'file': open('notes.md', 'rb')}

r = requests.post(url, files=files)
print(r.text)

# response headers:
print(r.headers)

# request headers:
print(r.request.headers)

# response cookies:
# r.cookies['cookie_name']

# send own cookies:
url = 'https://httpbin.org/cookies'
cookies = dict(cookies_are='working')

r = requests.get(url, cookies=cookies)
print(r.text)

# redirection history
r = requests.get('http://github.com/')
print(r.status_code)
print(r.history)

# we can forbid redirections with:
r = requests.get('http://github.com/', allow_redirects=False)

print(r.status_code)
print(r.history)

# timeout:
r = requests.get('http://github.com/', timeout=1)

#Sessions
#sessions are persistent objects which could be used to continuously modify requests
s = requests.Session()
s.auth = ('user', 'pass')
s.headers.update({'x-test': 'true'})

# both 'x-test' and 'x-test2' are sent
r = s.get('https://httpbin.org/headers', headers={'x-test2': 'true'})
print(r.text)

# Sessions can also be used as context managers:
with requests.Session() as s:
    r = s.get('https://httpbin.org/cookies/set/sessioncookie/123456789')
    print(r.text)