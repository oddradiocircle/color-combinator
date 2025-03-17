#!/bin/bash
# Version diff utility for Coolors URL feature
SNAPSHOT_COMMIT="cc0be8e"
CURRENT_BRANCH=$(git branch --show-current)

git diff --color=always \
    --unified=4 \
    ${SNAPSHOT_COMMIT}..${CURRENT_BRANCH} \
    -- js/services/url-service.js \
       css/styles.css \
       ARCHITECTURE.md \
       package.json