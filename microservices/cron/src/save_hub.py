import requests

res = requests.get('http://app.default/save_hub_pulls_snapshot/today');
print (res.text)
