import React from "react";

const testElement = <div data-testid="compound-stop-marker-mock" />;

const compoundStopMarkerMock = jest.fn();
compoundStopMarkerMock.mockReturnValue(testElement);

module.exports = compoundStopMarkerMock;
