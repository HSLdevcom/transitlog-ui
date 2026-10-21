
FROM debian:bookworm-slim

ENV NODE_OPTIONS=--openssl-legacy-provider

ARG APP_NODE_VERSION=22.23.4

# Temporary workaround until the official Node image publishes platform manifests for this release.
RUN set -eux; \
    apt-get update; \
    apt-get install -y --no-install-recommends ca-certificates curl xz-utils; \
    rm -rf /var/lib/apt/lists/*; \
    case "$(dpkg --print-architecture)" in \
      amd64) NODE_ARCH=x64 ;; \
      arm64) NODE_ARCH=arm64 ;; \
      armhf) NODE_ARCH=armv7l ;; \
      ppc64el) NODE_ARCH=ppc64le ;; \
      s390x) NODE_ARCH=s390x ;; \
      *) echo "Unsupported architecture: $(dpkg --print-architecture)" >&2; exit 1 ;; \
    esac; \
    NODE_TARBALL="node-v${APP_NODE_VERSION}-linux-${NODE_ARCH}.tar.xz"; \
    curl -fsSLO "https://nodejs.org/dist/v${APP_NODE_VERSION}/${NODE_TARBALL}"; \
    curl -fsSLO "https://nodejs.org/dist/v${APP_NODE_VERSION}/SHASUMS256.txt"; \
    grep " ${NODE_TARBALL}$" SHASUMS256.txt | sha256sum -c -; \
    tar -xJf "$NODE_TARBALL" -C /usr/local --strip-components=1 --no-same-owner; \
    test "$(node --version)" = "v${APP_NODE_VERSION}"; \
    npm install --global yarn@1.22.22; \
    test "$(yarn --version)" = "1.22.22"; \
    rm "$NODE_TARBALL" SHASUMS256.txt

ENV WORK /opt/transitlog

RUN mkdir -p ${WORK}
WORKDIR ${WORK}

# Install app dependencies
COPY yarn.lock ${WORK}
COPY package.json ${WORK}
RUN yarn

COPY . ${WORK}

ARG BUILD_ENV=production
COPY .env.${BUILD_ENV} ${WORK}/.env.production

# RUN yarn run test:ci
RUN yarn run build

CMD yarn run production
