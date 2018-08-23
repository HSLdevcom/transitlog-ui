import React, {Component} from "react";
import {Polyline} from "react-leaflet";
import {latLng} from "leaflet";
import get from "lodash/get";
import last from "lodash/last";
import moment from "moment";
import getDelayType from "../../helpers/getDelayType";
import {observer, inject} from "mobx-react";
import {app} from "mobx-app";
import getJourneyId from "../../helpers/getJourneyId";

@inject(app("state"))
@observer
class HfpLayer extends Component {
  mouseOver = false;

  getLine() {
    const {selectedJourney, positions} = this.props;
    const journeyId = getJourneyId(selectedJourney);

    // Get only the positions from the same journey and create latNg items for Leaflet.
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

  findHfpItem = (chunk = [], latlng) => {
    const hfpItem = get(chunk, "positions", []).find((hfp) =>
      latlng.equals(latLng(hfp.lat, hfp.long), 0.0001)
    );

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
      return;
    }

    const hfpItem = this.findHfpItem(positions, event.latlng);

    if (hfpItem) {
      const line = event.target;
      const tooltipContent = `${moment(hfpItem.receivedAt).format("HH:mm:ss")}<br />
${hfpItem.uniqueVehicleId}<br />
Speed: ${Math.round((hfpItem.spd * 18) / 5)} km/h<br />
Delay: ${hfpItem.dl} sek.`;

      const lineTooltip = line.getTooltip();

      if (lineTooltip) {
        lineTooltip.setContent(tooltipContent);
      } else {
        line.bindTooltip(tooltipContent, {sticky: true}).openTooltip();
      }
    }
  };

  render() {
    const {name} = this.props;
    const positions = this.getLine();

    return (
      <React.Fragment>
        {positions.map((delayChunk, index) => {
          const chunkDelayType = get(delayChunk, "delayType", "on-time");
          const chunkPositions = get(delayChunk, "positions", []);

          // Render each chunk with a color that matches the delay.
          return (
            <Polyline
              key={`hfp_polyline_${name}_chunk_${index}`}
              onMousemove={this.onMousemove(delayChunk)}
              onMouseover={this.onHover}
              onMouseout={this.onMouseout}
              pane="hfp-lines"
              weight={3}
              color={
                chunkDelayType === "early"
                  ? "red"
                  : chunkDelayType === "late"
                    ? "yellow"
                    : "green"
              }
              positions={chunkPositions.map((pos) => [pos.lat, pos.long])}
            />
          );
        })}
      </React.Fragment>
    );
  }
}

export default HfpLayer;
