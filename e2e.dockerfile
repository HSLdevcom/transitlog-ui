FROM cypress/base:12.14.0

ENV WORK /opt/transitlog

RUN mkdir -p ${WORK}
WORKDIR ${WORK}

# Install Cypress and dependencies
COPY e2e.package.json ${WORK}/package.json
RUN yarn

COPY ./cypress/ ${WORK}/cypress/

COPY run_cypress.sh ${WORK}
COPY cypress.json ${WORK}

ARG BUILD_ENV=production
ENV TEST_ENV=${BUILD_ENV}

COPY cypress.${BUILD_ENV}.json ${WORK}

CMD yarn start
