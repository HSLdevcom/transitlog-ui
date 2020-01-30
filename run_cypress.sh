#!/bin/bash
set -e

yarn run cypress run --browser chrome --env configFile="${TEST_ENV}" # --record --key="${CYPRESS_KEY}"
