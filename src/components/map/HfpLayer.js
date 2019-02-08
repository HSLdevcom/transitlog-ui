import React, {Component} from "react";
import {Polyline} from "react-leaflet";
import {latLng} from "leaflet";
import get from "lodash/get";
import last from "lodash/last";
import orderBy from "lodash/orderBy";
import getDelayType from "../../helpers/getDelayType";
import {observer, inject, Observer} from "mobx-react";
import {app} from "mobx-app";
import getJourneyId from "../../helpers/getJourneyId";
import {getTimelinessColor} from "../../helpers/timelinessColor";
import {observable, action} from "mobx";
import HfpTooltip from "./HfpTooltip";

export function getLineChunksByDelay(positions, journeyId) {
  // Get only the positions from the same journey and create latLng items for Leaflet.
  // Additional data can be passed as the third array element which Leaflet won't touch.
  return positions
    .filter((pos) => getJourneyId(pos) === journeyId)
    .reduce((allChunks, position) => {
      const positionDelay = get(position, "dl", 0);
      const delayType = getDelayType(positionDelay); // "early", "late" or "on-time"

      // If this is the first position, allChunks will be empty.
      // Add it as a new chunk to kick things off.
      if (allChunks.length === 0) {
        allChunks.push({delayType, positions: [position]});
        return allChunks;
      }

      // Check the previous chunk to determine if we want to push
      // `position` onto the previous chunk or start a new chunk for it.
      const previousChunk = last(allChunks);
      const previousDelayType = get(previousChunk, "delayType", "on-time");

      // If the delay types are the same, add the position to the last chunk.
      if (delayType === previousDelayType) {
        previousChunk.positions.push(position);
      } else {
        // Otherwise start a new chunk. Include the last element from the
        // previous chunk to eliminate gaps in the line.
        allChunks.push({
          delayType,
          positions: [last(previousChunk.positions), position],
        });
      }

      return allChunks;
    }, []);
}

@inject(app("state"))
@observer
class HfpLayer extends Component {
  @observable.ref
  hoverPosition = null;

  mouseOver = false;

  setHoverPosition = action((position) => {
    this.hoverPosition = position;
  });

  findHfpItem = (positions = [], latlng) => {
    const hfpItem = orderBy(
      positions,
      (hfp) => latlng.distanceTo(latLng(hfp.lat, hfp.long)),
      "ASC"
    )[0];

    return hfpItem || null;
  };

  onMouseout = (event) => {
    const line = event.target;
    line.setStyle({weight: 3});
    this.mouseOver = false;
  };

  onHover = (event) => {
    this.mouseOver = true;
    const line = event.target;
    line.setStyle({weight: 10});
  };

  onMousemove = (positions) => (event) => {
    if (!this.mouseOver) {
      this.setHoverPosition(null);
      return;
    }

    const hfpItem = this.findHfpItem(positions, event.latlng);

    if (hfpItem) {
      this.setHoverPosition(hfpItem);
    }
  };

  render() {
    const {name, selectedJourney, positions: hfpPositions} = this.props;

    const positions = getLineChunksByDelay(
      hfpPositions,
      getJourneyId(selectedJourney)
    );

    return (
      <React.Fragment>
        {positions.map((delayChunk, index) => {
          const chunkDelayType = get(delayChunk, "delayType", "on-time");
          const chunkPositions = get(delayChunk, "positions", []);
          const points = chunkPositions.map((pos) => [pos.lat, pos.long]);

          return (
            <Observer key={`hfp_polyline_${name}_chunk_${index}`}>
              {() => (
                <Polyline
                  onMousemove={this.onMousemove(chunkPositions)}
                  onMouseover={this.onHover}
                  onMouseout={this.onMouseout}
                  pane="hfp-lines"
                  weight={3}
                  color={getTimelinessColor(chunkDelayType, "var(--light-green)")}
                  positions={points}>
                  <HfpTooltip position={this.hoverPosition} />
                </Polyline>
              )}
            </Observer>
          );
        })}
      </React.Fragment>
    );
  }
}

export default HfpLayer;
