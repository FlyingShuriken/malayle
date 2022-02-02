import requests
import datetime

words = requests.get('https://random-word-api.herokuapp.com/word?number=8888').json()
fiveLetterWords = [i for i in words if len(i) == 5]
print(len(fiveLetterWords))
today = datetime.datetime.now()
words = {}
count = 0
for word in fiveLetterWords:
    words[str((today+datetime.timedelta(count)).strftime('%Y%m%d'))] = word
    count += 1
print(words, len(words))
