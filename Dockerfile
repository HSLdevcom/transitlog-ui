FROM hsldevcom/infodevops-docker-base-images:22-node-edge AS build

ENV NODE_OPTIONS=--openssl-legacy-provider

WORKDIR /opt/transitlog

COPY .npmrc package.json package-lock.json ./
RUN npm ci

ARG BUILD_ENV=production
COPY .env.${BUILD_ENV} .env.production
COPY src ./src
COPY public ./public
COPY craco.config.js config-overrides.js ./
RUN npm run build && npm prune --omit=dev

FROM hsldevcom/infodevops-docker-base-images:22-node-edge AS production

ENV NODE_ENV=production NODE_OPTIONS=--openssl-legacy-provider
WORKDIR /opt/transitlog

COPY --from=build /opt/transitlog/node_modules ./node_modules
COPY --from=build /opt/transitlog/build ./build
COPY --from=build /opt/transitlog/package.json ./package.json
COPY scripts/write-runtime-config.js ./scripts/write-runtime-config.js

EXPOSE 3000
CMD ["npm", "run", "production"]
