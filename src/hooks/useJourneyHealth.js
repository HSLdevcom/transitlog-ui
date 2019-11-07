export const useJourneyHealth = (journey) => {
  if (!journey) {
    return null;
  }

  console.log(journey);

  let stopsHealth = 0;
  let eventsHealth = 0;
  let positionsHealth = 0;
  let generalHealth = 0;

  const messages = [];

  const stopEventTypes = ["DEP", "PDE", "ARR", "ARS"];

  const {stopEvents, events} = journey.events.reduce(
    (categories, event) => {
      if (stopEventTypes.includes(event.type)) {
        categories.stopEvents.push(event);
      } else {
        categories.events.push(event);
      }

      return categories;
    },
    {stopEvents: [], events: []}
  );

  return {};
};
