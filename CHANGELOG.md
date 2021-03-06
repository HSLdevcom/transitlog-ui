# Transitlog UI changelog

## Version 1.9.3, deployed 2020-08-10 @ 10:00

- Improve route length display based on feedback.

## Version 1.9.2, deployed 2020-06-22 @ 15:00

- De facto stop events change, PDE becomes the stop event.
- Update ODO badge coloring for PDE events.
- Update and fix E2E tests.
- Clearer event type and event stop in events list.
- Update journey health checks.

## Version 1.9.1, deployed 2020-04-16 @ 15:00

- No UI changes.

## Version 1.9.0, deployed 2020-04-15 @ 08:00

- New feedback feature with image upload.
- Fix for route origin stop changes not being reflected in Reittiloki.
- Update language files.
- Fix weekly timetable E2E tests.

## Version 1.8.3, deployed 2020-03-23 @ 10:00

- Show TLP event details in JourneyEvents list and in tooltips on the map.
- Fix a map centering issue.

## Version 1.8.2, deployed 2020-03-06 @ 08:00

- Smaller event grouping area for events on the map.
- Update metadata in HTML.
- Use health check in Docker Swarm.

## Version 1.8.1, deployed 2020-02-20 @ 14:00

- Dependency update, including new and un-ejected Create React App.
- Refactors to improve maintainability.
- Mapillary viewer improvements.
- Add missing received_at field to route journeys.
- Slack notifications for Github action status.
- Include LOC value in journey data health.
- Improve E2E tests.
- Show all journey events on map, including those already shown as stops.
- Include journey event filters in the URL.

## Version 1.8.0, deployed 2020-02-13 @ 08:00

- Building, deployment and testing automatically with Github Actions.
- E2E test improvements for speed and reliability.
- Show terminals on map (with popups and routes) and in stop search.
- Fetch and show terminal timetables.
- Add stops (along with terminals) to map layer selection, show stops in all zoom levels.
- Improve stop view filtering for wide zoom levels.
- Improve stop and terminal popup functionality.
- Refactors for improved and smoother operation.
- Update integration and unit tests.
- Upgrade to Cypress 4.

## Version 1.7.1, deployed 2020-02-04 @ 14:00

- Code improvements for route event and unsigned event display on map.
- Slightly smaller selected vehicle icon.
- Fixed some E2E test cases.
- Check for console errors in Cypress tests.

## Version 1.7.0, deployed 2020-02-03 @ 10:00

- Uses JORE data from Citus
- Cypress test fixes and updates
- Improve weather feature with correct road conditions
- Enable route journeys (route vehicles on map without selecting a departure)
- Update tests
- Clean up and refactor some GraphQL queries

## Version 1.6.1, deployed 2020-01-23 @ 12:00

- Update for route select buttons and stop select buttons in stop popup. Also adds more information and makes the view clearer.
- Added a badge to many views that show which method the HFP event location and time was measured with; GPS or ODO.

## Version 1.6.0, deployed 2020-01-17 @ 10:00

- Show driver events (DA, DOUT) in vehicle journeys list.
- Shows all alerts per day, not limited by time.
- Update weather API url.
- Stricter early checking for timing stops.
- Enable selecting a departure without a time in stop departures list.
- Add transport mode color for ferries.
- Updates for new Citus database (deployed 2020-01-08).

## Version 1.5.5, deployed 2019-12-20 @ 11:00

- Refactor app structure regarding stop fetching
- Remove redundant alert query fields.

## Version 1.5.4, deployed 2019-12-12 @ 09:00

- Update journey positions health check to also check start and end of journey.
- Fixes and improvements for update and live features.
- Fix departure highlight in departure lists.
- Add received_at information to HFP tooltip (vehicle and HFP line).
- Update HFP tooltip styling.
- Analyze data delay of HFP events with the received_at information in journey health.
- Show operating unit (kilpailukohde) of departures for authorized users.
- Fix journey selection in timetable view.
- Update the "no data" message in the route departure list.

## Version 1.5.3, deployed 2019-11-26 @ 13:00

- Refactor queries to use a refetch hook.
- Use the refetch hook for most queries.
- Fix weather request timeout.

## Version 1.5.2, deployed 2019-11-22 @ 12:00

- Fix area journey filter.
- Fix area journey selected journey.
- Fix route stops going invisible in some cases.

## Version 1.5.1, deployed 2019-11-20 @ 09:00

- Fix production env name.

## Version 1.5.0, deployed 2019-11-20 @ 09:00

- Use real HSL fonts.
- Added health scores for journey data.
- Changed update button to not force-select the current time.
- Include HFP events with null lat and long properties.
- Show event type next to clear-text event name.
- Show list of stops in the details sidebar when a route is selected.
- Fix sidebar tab labels and jumping scroll positions.
- Add an icon to the route departures list if the departure is in the future. Change the label of departures without data.
- Better handling of PAS-type events.
- Improve E2E tests.
- Source code refactors and other fixes and updates.

## Version 1.4.2, deployed 2019-11-07 @ 09:00

- Server message links open in a new tab.

## Version 1.4.1, deployed 2019-11-07 @ 07:00

- Improve route options order.
- Markdown implemented for admin bar messages.
- HOTFIX: Remove Typography.com CSS, it was causing trouble due to a config change on dev.hsl.fi which now requires authentication.

## Version 1.4.0, deployed 2019-11-06 @ 10:00

- Smoke tests added.
- New HSL ID environment.
- Fix journey selection in stop departure view.
- Fixed some bugs that surfaced during testing.

## Version 1.3.1, deployed 2019-10-25 @ 09:00

- New GraphQL schema.
- Hide vehicle ID in journey details.

## Version 1.3.0, deployed 2019-10-25 @ 08:00

- Fix and improve stop rendering.
- Exclamation mark indicator on the map where the vehicle has stood still for 5 minutes or more.
- Vehicle search and all vehicle information hidden from unauthenticated users.
- Fixed timing stop icon style when doors didn't open
- Added a "no data" message for when the area search didn't return any results.
- Peristent route and time filtering for departures.
- Better sorting for stop and route search.
- Improved update-button function.
- Fixed and improved alert list to show relevant alerts for the selected time.
- Fixed first day of week in the calendar and added a "today" button.
- Fixed Mapillary current location display by centering the map on the marker.
- Added an "arrival to last stop" toggle for week departures.
- Added hover tooltips for stops on the map.
- Added markers for all journey events to the map.
- Keep the date in the URL for sharing at all times.
- Other various bugfixes and improvements.

## Version 1.2.0, deployed 2019-10-08 @ 07:00

- Added "unauthorized" message for vehicle block view when the list is empty.
- Translation updates.
- Changed style of admin message banner.
- Improved stop rendering.
- Message for when alerts and cancellations lists are empty due to no results
- Hide some sensitive departure and vehicle info from unauthorized users.
- Other smaller fixes and improvements.

## Version 1.1.0, deployed 2019-10-03 @ 06:00

- Update and fix translations for new event features and other text.
- Update and add some help (tooltip) text.
- Use the correct event type for various departure cases (DEP on origin and timing stops, PDE otherwise).
- Fetch unsigned events when a vehicle is selected.
- Display unsigned events on the map with a distinctive style.
- Improve map lines for HFP data to not render long connecting lines.
- Improve map lines hovering with hover marker to indicate which event the hover tooltip refers to. Also make the hover area larger.
- Refactor stop markers to better show door status of timing stops, fix a performance issue and make them slightly smaller.
- Show a loading indicator under the relevant filter input for route events and unsigned vehicle events.
- Fix route stop terminal detection.
- Refactor area search to work more consistently and dependably. Show unsigned events in the area search sidebar.
- Fix journey departure and speed graph.
- Translate browser support alert.
- Other fixes and improvements.
