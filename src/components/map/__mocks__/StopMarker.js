import React from "react";

const testElement = <div data-testid="stop-marker-mock" />;

const stopMarkerMock = jest.fn();
stopMarkerMock.mockReturnValue(testElement);

module.exports = stopMarkerMock;
