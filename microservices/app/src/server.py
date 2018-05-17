import os
from src import app
from flask import request, Response
# from flask import jsonify
import requests, json
import time, datetime

ORG=os.getenv('GITHUB_ORG')
TOKEN=os.getenv('GITHUB_TOKEN')
headers = {'Authorization': 'token ' + TOKEN}
#hasura_headers = {'Authorization': 'Bearer ' + os.getenv('HASURA_IO_TOKEN')}

@app.route('/')
def stream():
    i = 1000
    def generate(i):
        while i:
            i -= 1
            time.sleep(0.01)
            yield str(i) + '\n'
    return Response(generate(i), mimetype='text/plain')

@app.route("/webhook", methods=['POST'])
def hook():
    # If event is based on an issue, update the issue
    issue = json.loads(request.get_data()).get('issue')
    if issue:
        hasura_issue = issue_from_github(issue)
        url = 'http://data.hasura/v1/query'
        body = {
            'type': 'insert',
            'args': {
                'table': 'issue',
                'on_conflict': {
                    'action': 'update',
                    'constraint_on': ['id']
                },
                'objects': [
                ]
            }
        }

        body['args']['objects'].append(hasura_issue)
        res = requests.post(url, data=json.dumps(body))
        print (res.text)

        return 'handled-the-issue'

    return 'not-an-issue'

@app.route("/add_org_repos", methods=['GET'])
def add_org_repos():
    url = 'https://api.github.com/orgs/'+ORG+'/repos'

    def generate(url):
        i = 0
        while url:
            response = requests.get(url, headers=headers)
            repos = json.loads(response.text)

            #Upsert these repos in the database
            url = 'http://data.hasura/v1/query'
            body = {
                'type': 'insert',
                'args': {
                    'table': 'repo',
                    'on_conflict': {
                        'action': 'update',
                        'constraint_on': ['id']
                    },
                    'objects': [
                        ]
                    }
                }

            for r in repos:
                i += 1
                body['args']['objects'].append({'id': r['id'], 'name': r['name']})
            res = requests.post(url, data=json.dumps(body))
            print (res.text)
            url = get_next_page_url(response)

            yield ('Inserted: ' + str(i) + '\n')

    return Response(generate(url), mimetype='text/plain')

@app.route("/add_org_members", methods=['GET'])
def add_org_members():
    url = 'https://api.github.com/orgs/'+ORG+'/members'

    def generate(url):
        i = 0
        while url:
            response = requests.get(url, headers=headers)
            repos = json.loads(response.text)

            #Upsert these repos in the database
            url = 'http://data.hasura/v1/query'
            body = {
                'type': 'insert',
                'args': {
                    'table': 'member',
                    'on_conflict': {
                        'action': 'update',
                        'constraint_on': ['login']
                    },
                    'objects': [
                        ]
                    }
                }
            for r in repos:
                i += 1
                body['args']['objects'].append({'login': r['login']})
            res = requests.post(url, data=json.dumps(body))
            print (res.text)

            url = get_next_page_url(response)

            yield ('Inserted: ' + str(i) + '\n')

    return Response(generate(url), mimetype='text/plain')

@app.route("/<repo>/sync_issues", methods=['GET'])
def sync_issues(repo):
    # Load all the issues from this repo and upsert into the database
    url = fetch_last_page(repo, 'last_issues_page')
    if not(url):
        url = 'https://api.github.com/repos/'+ORG+'/' + repo + '/issues?state=all'

    def generate(url):
        i = 0
        while url:
            print ('Fetching from: ' + url)
            save_last_page(repo, 'last_issues_page', url)

            response = requests.get(url, headers=headers)
            issues = json.loads(response.text)

            #Upsert these repos in the database
            url = 'http://data.hasura/v1/query'
            body = {
                'type': 'insert',
                'args': {
                    'table': 'issue',
                    'on_conflict': {
                        'action': 'update',
                        'constraint_on': ['id']
                    },
                    'objects': [
                        ]
                    }
                }

            for r in issues:
                i += 1
                body['args']['objects'].append(issue_from_github(r))

            res = requests.post(url, data=json.dumps(body))
            print (res.text)

            # Now check if there's a next url
            url = get_next_page_url(response)
            yield ('Inserted: ' + str(i) + '\n')

    return Response(generate(url), mimetype='text/plain')

@app.route('/save_snapshot')
def save_pulse():
    # Get metrics at exactly this point
    unassigned_issues = 0
    open_issues = 0
    open_bugs = 0

    # Fetch this data
    data = fetch_current_metrics()
    if not(data):
        return 'could-not-fetch'

    unassigned_issues = data[0]['count']
    open_issues = data[1]['count']
    open_bugs = data[2]['count']
    url = 'http://data.hasura/v1/query'
    body = {
        "type": "insert",
        "args": {
            "table": "metrics_snapshots",
            "objects": [
                {
                    "type": "unassigned_issues",
                    "value": unassigned_issues
                },
                {
                    "type": "open_issues",
                    "value": open_issues
                },
                {
                    "type": "open_bugs",
                    "value": open_bugs
                }
            ]
        }
    }
    res = requests.post(url, data=json.dumps(body))
    print (res.text)

    if res.status_code == 200:
        return 'inserted'
    else:
        return 'failure-to-insert'

@app.route('/save_hub_pulls_snapshot/<date>')
def save_hub_pulse(date):
    # List important tags
    important_tags = ['react', 'react-native', 'python', 'nodejs', 'php', 'java', 'chatbot', 'jupyter', 'data science']

    # Fetch all tags from Hasura
    # print('Fetching all tags', flush=True)
    # url = 'https://data.hasura.io/v1/query'
    # body = {'args': {'columns': ['name'], 'table': 'hub_tags'}, 'type': 'select'}
    # res = requests.post(url, data=json.dumps(body))
    # if not(res.status_code == 200):
    #     print (res.text, flush=True)
    #     return 'could-not-fetch-tags'
    # tags = [t['name'] for t in json.loads(res.text)]

    # Fetch all pulls per tag
    if date == 'today':
        date = datetime.datetime.now().strftime('%Y-%m-%d')
    print('Fetching all pulls per tag for ' + date, flush=True)
    url = 'https://data.hasura.io/v1/query'
    body = {
        'args': {
            'columns': ['*'],
            'table': 'hub_tag_pulls',
            'where': {
                'date': {'$eq': date}
            }
        },
        'type': 'select'
    }
    res = requests.post(url, data=json.dumps(body))
    if not(res.status_code == 200):
        print (res.text, flush=True)
        return 'could-not-fetch-tag-pulls'
    objects = [{'tag': t['name'], 'at': t['date'], 'pulls': t['pulls']} for t in json.loads(res.text)]

    # Insert this data!
    print('Inserting snapshot data', flush=True)
    url = 'http://data.hasura/v1/query'
    body = {
        'args':
            {'objects': objects,
                'table': 'hub_pulls',
                'on_conflict':  {
                    "action": "update",
                    "constraint_on": ["tag", "at"]
                }
            },
        'type': 'insert'
    }
    res = requests.post(url, data=json.dumps(body))
    if not(res.status_code == 200):
        print (res.text, flush=True)
        return 'could-not-insert-hub-pulls'

    return 'inserted-hub-pulls'


############################ HELPERS ###################################

def is_bug(issue):
    is_bug = False
    for l in issue['labels']:
        if ('bug' in l['name']):
            is_bug = True
            break
    return is_bug

def is_longterm(issue):
    is_longterm = False
    for l in issue['labels']:
        if ('longterm' in l['name']):
            is_longterm = True
            break
    return is_longterm

def issue_from_github(issue):
    return {
        'id': issue['id'],
        'title': issue['title'],
        'created': issue['created_at'],
        'repo': issue['repository_url'].split('/')[-1],
        'issue_no': issue['number'],
        'is_bug': is_bug(issue),
        'is_longterm': is_longterm(issue),
        'assigned_members': [m['login'] for m in issue['assignees']],
        'closed': not(not(issue['closed_at'])),
        'closed_at': issue['closed_at']
    }

def get_next_page_url(response):
    next_url = None
    if response.headers.get('Link'):
        urls = requests.utils.parse_header_links(response.headers.get('Link'))
        for u in urls:
            if u['rel'] == 'next':
                next_url = u['url']
                break
    return next_url

def fetch_last_page(repo, thing):
    last_page = None

    url = 'http://data.hasura/v1/query'
    body = {
        'type': 'select',
        'args': {
            'table': 'repo',
            'columns': [thing],
            'where': {
                'name': repo
            }
        }
    }

    res = requests.post(url, data=json.dumps(body))
    if res.status_code == 200:
        last_page = json.loads(res.text)[0][thing]

    print ('Loaded: ' + thing + ' ' + str(last_page));
    return last_page

def save_last_page(repo, thing, thing_url):
    url = 'http://data.hasura/v1/query'
    body = {
        'type': 'update',
        'args': {
            'table': 'repo',
            '$set': {},
            'where': { 'name': repo }
        }
    }

    body['args']['$set'][thing] = thing_url
    res = requests.post(url, data=json.dumps(body))
    print ('Updated: ' + repo + ' ' + thing + ' ' + thing_url + ' ' + res.text)

def fetch_current_metrics():
    url = "http://data.hasura/v1/query"

    # This is the json payload for the query
    requestPayload = {
        "type": "bulk",
        "args": [
            {
                "type": "count",
                "args": {
                    "table": "unassigned_issues",
                    "where": {
                        "closed": {
                            "$ne": "true"
                        }
                    }
                }
            },
            {
                "type": "count",
                "args": {
                    "table": "member_issues",
                    "where": {
                        "closed": {
                            "$ne": "true"
                        }
                    }
                }
            },
            {
                "type": "count",
                "args": {
                    "table": "member_issues",
                    "where": {
                        "$and": [
                            {
                                "closed": {
                                    "$ne": "true"
                                }
                            },
                            {
                                "is_bug": {
                                    "$eq": "true"
                                }
                            }
                        ]
                    }
                }
            }
        ]
    }

    # Make the query and store response in resp
    resp = requests.request("POST", url, data=json.dumps(requestPayload))

    # resp.content contains the json response.
    if resp.status_code == 200:
        return json.loads(resp.text)
    else:
        print (resp.text)
        return None
