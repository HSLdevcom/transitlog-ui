#!/bin/bash
set -e

if [ -z "$CYPRESS_RECORD_KEY" ]; then
  yarn run cypress run
else
  yarn run cypress run --record
fi
