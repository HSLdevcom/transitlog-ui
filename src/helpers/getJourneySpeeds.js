export const getJourneySpeeds = (selectedJourneyEvents = [], length) => {
  if (!selectedJourneyEvents || selectedJourneyEvents.length === 0) {
    return [];
  }

  const speeds = [];
  let xTickLength = length / selectedJourneyEvents.length;
  let xTick = 0;

  selectedJourneyEvents.forEach((event, index) => {
    xTick = xTick + xTickLength;
    speeds.push({
      x: xTick,
      y: Math.round((event.velocity * 18) / 5),
    });
  });

  return speeds;
};
