#!/bin/bash

# Set the new author information
export GIT_AUTHOR_NAME="wave745"
export GIT_AUTHOR_EMAIL="shazarno1@gmail.com"
export GIT_COMMITTER_NAME="wave745"
export GIT_COMMITTER_EMAIL="shazarno1@gmail.com"

# Rewrite all commits to have "alas" as the message
git filter-branch --env-filter '
    export GIT_AUTHOR_NAME="wave745"
    export GIT_AUTHOR_EMAIL="shazarno1@gmail.com"
    export GIT_COMMITTER_NAME="wave745"
    export GIT_COMMITTER_EMAIL="shazarno1@gmail.com"
' --msg-filter 'echo "alas"' -- --all

echo "Git history rewritten successfully!"
