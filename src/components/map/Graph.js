import React, {useMemo, useState, useEffect} from "react";
import {observer} from "mobx-react-lite";
import styled from "styled-components";
import "react-vis/dist/style.css";
import {
  XYPlot,
  VerticalGridLines,
  HorizontalGridLines,
  XAxis,
  YAxis,
  AreaSeries,
  MarkSeries,
  Crosshair,
  LineSeries,
} from "react-vis";
import {inject} from "../../helpers/inject";
import flow from "lodash/flow";
import {secondsToTime} from "../../helpers/time";
import {getJourneyStopDiffs} from "../../helpers/getJourneyStopDiffs";
import {getJourneySpeeds} from "../../helpers/getJourneySpeeds";
import {Text} from "../../helpers/text";

const GraphTooltip = styled.div`
  font-weight: 500;
  white-space: nowrap;
  background: #ffffff;
  color: #007ac9;
  font-size: 0.75rem;
  border-radius: 5px;
  padding: 3px;
  border-style: solid;
  border-width: 1px;
  min-width: 240px;
  transform: translateY(0);
  transition: transform 0.2s ease-out;
  pointer-events: none;
`;

const GraphPlot = styled(XYPlot)`
  &:hover {
    ${GraphTooltip} {
      transform: translateY(calc(-100% - 0.25rem));
    }
  }
`;

const ColoredBackgroundSlot = styled.div`
  font-family: "Courier New", Courier, monospace;
  border-radius: 4px;
  background: ${({backgroundColor}) => backgroundColor};
  color: white;
  font-size: 0.875rem;
  padding: 4px;
`;

const FlexColumn = styled.div`
  display: flex;
  flex-direction: column;
`;

const FlexRow = styled.div`
  display: flex;
  flex-direction: row;
`;

const Title = styled.div`
  padding: 5px;
`;

const decorate = flow(
  observer,
  inject("Filters", "UI")
);

const Graph = decorate((props) => {
  const {events, vehiclePositions, graphExpanded, UI, Filters, width} = props;

  const diffs = useMemo(() => getJourneyStopDiffs(events), [events]);
  const speeds = useMemo(() => getJourneySpeeds(vehiclePositions, diffs.length - 1), [
    events,
  ]);

  const [highlight, setHighlight] = useState({x: 0, y: 0});
  const [speed, setSpeed] = useState({x: 0, y: 0});

  const mapDiffs = useMemo(
    () =>
      diffs.map((o) => {
        return o.y;
      }),
    [diffs]
  );

  const {max, min} = useMemo(() => {
    const max = Math.max.apply(Math, mapDiffs);
    const min = Math.min.apply(Math, mapDiffs);
    return {max, min};
  }, [mapDiffs]);

  const coloredBackgroundSlotColor = useMemo(() => {
    return highlight.departureColor ? highlight.departureColor : "var(--light-grey)";
  }, [highlight]);

  const time = useMemo(() => secondsToTime(highlight.y), [highlight]);

  useEffect(() => {
    if (diffs.length !== 0 && highlight.x === 0 && highlight.y === 0) {
      setHighlight(diffs[0]);
    }

    if (speeds.length !== 0 && speed.x === 0 && speed.y === 0) {
      const data = speeds[0];
      const graphPoint = {x: data.x, y: data.y};
      setSpeed(graphPoint);
    }
  }, [diffs, speeds]);

  return (
    <div>
      {graphExpanded && width && (
        <GraphPlot
          height={200}
          width={width}
          onClick={() => Filters.setStop(highlight.stopId)}
          yDomain={[min < -200 ? min : -200, max > 200 ? max : 200]}>
          <VerticalGridLines />
          <HorizontalGridLines />
          <YAxis
            title="sec, km/h"
            tickSize={5}
            style={{
              text: {
                fill: "#6b6b76",
                fontWeight: 600,
                transform: "translateX(-10px)",
                width: "4rem",
              },
            }}
            tickFormat={(value) => secondsToTime(value).slice(3)}
          />
          <XAxis hideTicks />
          <Crosshair values={[highlight]}>
            <GraphTooltip>
              <FlexColumn>
                <FlexColumn>
                  <FlexRow>
                    <Title>
                      Pysäkki: {highlight.stopId} {highlight.stopName}
                    </Title>
                  </FlexRow>
                  <FlexRow>
                    <Title>
                      <Text>map.stops.depart</Text>
                    </Title>
                    <ColoredBackgroundSlot backgroundColor={coloredBackgroundSlotColor}>
                      {time}
                    </ColoredBackgroundSlot>
                  </FlexRow>
                </FlexColumn>
                <Title>Nopeus: {speed.y} km/h</Title>
              </FlexColumn>
            </GraphTooltip>
          </Crosshair>
          <AreaSeries
            data={diffs}
            curve="curveNatural"
            onNearestX={(d) => {
              UI.highlightStop(d.stopId);
              setHighlight(d);
            }}
          />
          <LineSeries
            data={speeds}
            color={"red"}
            onNearestX={(d) => {
              const graphPoint = {x: d.x, y: d.y};
              setSpeed(graphPoint);
            }}
          />
          <MarkSeries
            colorType="literal"
            getColor={(d) => d.departureColor}
            data={[highlight]}
          />
          <MarkSeries data={[speed]} />
        </GraphPlot>
      )}
    </div>
  );
});

export default Graph;
