FROM cypress/browsers:node12.14.0-chrome79-ff71

ENV WORK /opt/transitlog

RUN mkdir -p ${WORK}
WORKDIR ${WORK}

# Install Cypress and dependencies
COPY e2e.package.json ${WORK}/package.json
RUN yarn

COPY ./cypress/ ${WORK}/cypress/

COPY run_cypress.sh ${WORK}
COPY cypress.json ${WORK}

CMD ["yarn", "start"]
