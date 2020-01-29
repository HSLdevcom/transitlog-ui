#!/bin/bash
set -e

yarn run cypress run --env configFile="${TEST_ENV}" --record --key="${CYPRESS_KEY}"
