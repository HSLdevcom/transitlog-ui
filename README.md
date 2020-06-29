# Transitlog UI

This is the UI of the [Reittiloki](https://reittiloki.hsl.fi) application. The project also includes a server-side component, which can be found at [https://github.com/HSLdevcom/transitlog-server](https://github.com/HSLdevcom/transitlog-server).

## What is it

Reittiloki is an application for viewing recorded historical high-frequency positioning (HFP) data from all of HSL's vehicles in the larger Helsinki region. This includes buses, trams, metro, trains and ferries. It is used to inspect and improve the quality of the capitol region public transport.

All vehicles broadcast their current position (plus other information) over MQTT once per second. This data is stored by the Transitlog project and can be queried for up to 4 months. We are working on making older data available in Reittiloki. This data is combined with and compared against planned schedules and routes to produce the data which is visualized on a map and queryable with Transitlog UI.

Reittiloki is a specialist application that requires a certain level of knowledge of the concepts and data that the application deals with. The user must also know what their objective in using the application is and what they are looking for. While some effort has been made to make the UI intuitive to use, the data-density of the application is unavoidable. The goal of the UI is that you need to learn how things are done, but only once.

Transitlog UI is a desktop-only app and it is not fun to use on mobile. Please use Chrome-based or Firefox-based browsers with Transitlog UI.

## Challenges

These are some challenges that we've solved in Transitlog UI.

### 24h+ time

Each day in Reittiloki is actually around 28 hours long. We call this `24h+ time`. This is because traffic operation does not stop at midnight, but continues into the night until about 4:30 am. The night traffic is still counted as belonging to the previous day in all source data that Transitlog UI uses. After 4:30 there is usually in a brief pause with the traffic picking up again for the current day at around 5 am.

Transitlog UI needs a way to translate between 24h+ times and normal 24h times. Transitlog must also always show all times as Finnish times, so we cannot rely on the native Date object since it will show the current time of the location where the user is. HSL employees will sometimes access Reittiloki from outside Finland which would be a problem.

To solve this, time is represented as seconds from midnight. This is most evident in the time slider above the map. Sliding it will decrease or increase the seconds since midnight. A handful of helper functions can be used to translate the seconds into time strings, either for display or for querying from the server. Time displays will display the 24h+ time (eg. "28:42:00"). For querying, the constant departure time is usually used along with the date.

### Large amounts of data

The app displays a very large amount of data, which is mostly solved server-side. The UI uses a variety of caching methods depending on what the situation calls for.

For example, when you have a departure selected, a marker representing the vehicle will be displayed on the map and it moves according to where the vehicle as at the currently selected time. When dragging the slider, all the HFP data points need to be traversed frequently to get the exact HFP item which corresponds to the current time. The solution is to index each HFP item in a Map by the timestamp, and then the current time can be used to retrieve the HFP item from the Map. The collection of HFP data points are thus only traversed once.

## Tech stack

This is a [Create React App](https://github.com/facebookincubator/create-react-app) project. We use modern React with hooks.

State is handled with [MobX](https://github.com/mobxjs/mobx) and [Mobx-App](https://github.com/danieldunderfelt/mobx-app).

GraphQL is used for communicating with the server and it is managed by [Apollo](https://github.com/apollographql/apollo-client). [Graphql-codegen](https://graphql-code-generator.com) is used to integrate the GraphQL schema with the UI.

There is no router, but we encode all the app's state into the URL on all state changes and use HTML5 history to manipulate the URL without page transitions. This enables very deep linking and state sharing.

The map is powered by [Leaflet](https://leafletjs.com) and [React Leaflet](https://react-leaflet.js.org).

Styling is handled by [styled-components](https://styled-components.com).

[Docker](https://www.docker.com) is used to package the app and run it in production.

Testing is mainly performed with [Cypress.io](https://github.com/cypress-io/cypress), but we also have a few Jest unit and integration tests.

The application is deployed on Azure and runs in a Docker Swarm.

## Data source dependencies

Transitlog UI mainly displays data from the Transitlog Server, but there are also a few other integrations. The dependencies are:

- Transitlog Server
- Finnish Meteorological Institute weather API (metolib)
- Mapillary
- HSL ID service

## Install

Run `yarn` once to install dependencies.

## Useful commands

In the project directory, you can run:

#### `yarn start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.

#### `yarn run build`

Builds the app for production to the `build` folder. It correctly bundles React in production mode and optimizes the build for the best performance.

#### `yarn run codegen`

If you update the schema in transitlog-server, be sure to tun Codegen to bring the updated schema to the UI.

#### `./deploy-env.sh`

A custom build script that builds a Docker image for a specific environment. When asked, press the number for the environment you want to build for.

Before running the script, ensure that you are logged in to Docker hub through Docker as the script will try to push the image.

#### `./deploy-all.sh`

Builds and tags Docker images for all environments.

## Environments

Each environment has its own set of environment variables. Since this is a frontend app, no secrets should be included in any env files.

When building for an environment, the corresponding .env file will be included as `.env.production`, which CRA uses as the de facto env file of the build. The env file that is included in the build is determined by the Docker `BUILD_END` ARG, which should be either `dev`, `stage`, `production`, or match any other of the available env file endings. Just use the deploy scripts and it will work.

## Development

The following section outlines the architecture and how the application should be developed. If you are unfamiliar with any of the main libraries listed in the Tech Stack section, please familiarise yourself with those as how they work is not in the scope of this documentation. This includes Create React App and React apps in general.

### Structure

The source files are divided into directories based on what they do. The main directories are:

#### src

The container directory for all source files. The root contains central bootstrap files.

#### src/components

Contains all visible view components. There may be _React_ components elsewhere too, but most of the visible stuff is in here. The root level contains common components, and the components belonging to the main sections of the app are divided into subdirectories.

#### src/auth

The authentication interface is contained here in the auth directory.

#### src/helpers

This directory contains all helper functions. These are primarily shorter functions used in multiple places throughout the app.

#### src/hooks

Custom React Hooks are separated from the helper functions into this directory.

#### src/icons

The HSL app icon library is contained here.

#### src/languages

This directory contains the translations for all text in the UI. The texts are subdivided into alerts, help and ui. Alerts contains only translations of the alert and cancellations categories and types, help contains tooltip texts and UI contains shorter UI strings.

#### src/queries

Contains most of the GraphQL queries used throughout the app as higher-order components which can be used to wrap the component you want to provide data for. Note that some components use locally-defined queries too.

#### src/stores

Contains the state of the app, divided into different _stores_ based on the area of the state they handle. It also contains store update actions as well as the UrlManager which is essentially a store.

#### cypress

Contains the Cypress test suite.

