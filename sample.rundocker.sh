#!/bin/bash


projects='{"gitlab": ["NAMEPSACE/PROJECT"],"github": ["USER/REPO"]}'
gitlab=''
github=''

docker run --rm -t -i -e PROJECTS="$projects" -e GITHUB=$github -e GITLAB=$gitlab -p 7030:80 \
       -v $(pwd)/app:/app \
       hasura/issues
