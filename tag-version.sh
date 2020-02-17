#!/bin/bash

set -e

ORG=${ORG:-hsldevcom}

read -p "Version: v" TAG

VERSION_TAG=v${TAG}
DOCKER_IMAGE=$ORG/transitlog-ui:${VERSION_TAG}

docker build --build-arg BUILD_ENV=production -t $DOCKER_IMAGE .

docker push $DOCKER_IMAGE
git tag $VERSION_TAG
git push --tags
