# Transitlog UI changelog

## Version 1.4.1, deployed 2019-11-07 @ 07:00

- Improve route options order.
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
