import requests 
from bs4 import BeautifulSoup
def scrape_blog(url):
    try:
        r = requests.get(url)
        r.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f"Failed to retrieve the page: {e}")
        return
    
    soup = BeautifulSoup(r.text, 'html.parser')
    articles = soup.find_all('a', {"class": "mr-2"})

    if articles:
        for article in articles:
            print(article.get_text())
    else:
        print("No article titles found on the page.")

if __name__ == "__main__":
    url = input("Enter the URL: ")
    scrape_blog(url)
