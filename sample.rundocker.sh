#!/bin/bash

# gitlab issue API allows fetch by milestone name
# github issue API needs milestone id. That means milestone-id that corresponds to milestone-name needs to be configured 
# for EVERY GITHUB PROJECT
projects='{"gitlab": ["NAMESPACE/PROJECT"],
"github": [{"name": "USER/REPO", "milestones":{"MILESTONE": GITHUB_MILESTONE_ID}]}'
gitlab='<insert-token-here>'
github='<insert-token-here>'
deadlines='{"MILESTONE": {"start": "2016-06-24", "end": "2016-07-08"}}'

#Users often have differnt usernames on github & gitlab. Create a map to track users by a single name (REALUSERNAME)
users='{"githubUsername1": "REALUSERNAME_1", "gitlabUsername1": "REALUSERNAME_1", "gitlabUsername2": "REALUSERNAME_2"}'

docker run --rm -t -i -e PROJECTS="$projects" -e DEADLINES="$deadlines" -e USERS="$users" -e GITHUB=$github -e GITLAB=$gitlab -p 7030:80 \
       -v $(pwd)/app:/app \
       hasura/issues
