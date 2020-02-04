#!/bin/bash
set -e

# Builds and deploys all images for the Azure environments

ORG=${ORG:-hsldevcom}

for TAG in dev stage; do
  DOCKER_IMAGE=${ORG}/transitlog-ui:${TAG}
  DOCKER_IMAGE_E2E=${ORG}/transitlog-ui:${TAG}-testing

  docker build --build-arg BUILD_ENV=${TAG} -t ${DOCKER_IMAGE} .
  docker build -f e2e.dockerfile -t ${DOCKER_IMAGE_E2E} .

  docker push ${DOCKER_IMAGE}
  docker push ${DOCKER_IMAGE_E2E}
done
