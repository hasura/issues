import requests

res = requests.get('http://app.default/save_snapshot');
print (res.text)
