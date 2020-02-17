#!/bin/bash
set -e

# Builds and deploys all images for the Azure environments

ORG=${ORG:-hsldevcom}

for TAG in dev stage; do
  DOCKER_IMAGE=${ORG}/transitlog-ui:${TAG}
  docker build --build-arg BUILD_ENV=${TAG} -t ${DOCKER_IMAGE} .
  docker push ${DOCKER_IMAGE}
done
