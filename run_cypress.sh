#!/bin/bash
set -e

if [ -z "$CYPRESS_RECORD_KEY" ]; then
  yarn run cypress run --browser chrome --headless
else
  yarn run cypress run --browser chrome --headless --record
fi
