import React from "react";
import "jest-dom/extend-expect";
import "jest-styled-components";
import {cleanup, waitForElement} from "react-testing-library";

import Equipment from "./Equipment";
import {MockedProvider} from "react-apollo/test-utils";
import {vehicleTypeQuery} from "../../../queries/EquipmentQuery";
import {renderComponent} from "../../../__tests__/util/renderComponent";

const equipmentProps = {
  age: 1,
  multiAxle: 1,
  class: "A",
  registryNr: "123",
  vehicleId: "100",
  emissionClass: "01",
  emissionDesc: "EEV",
};

describe("Equipment", () => {
  const mocks = [
    {
      request: {
        query: vehicleTypeQuery,
        variables: {
          vehicleId: "100",
          operatorId: "0001",
        },
      },
      result: {
        data: {
          allEquipment: {
            nodes: [
              {
                ...equipmentProps,
                type: "C",
                exteriorColor: "HSL-orans",
                operatorId: "0001",
              },
            ],
          },
        },
      },
    },
    {
      request: {
        query: vehicleTypeQuery,
        variables: {
          vehicleId: "100",
          operatorId: "0002",
        },
      },
      result: {
        data: {
          allEquipment: {
            nodes: [
              {
                ...equipmentProps,
                type: "A1",
                exteriorColor: "HSL-sin",
                operatorId: "0002",
              },
            ],
          },
        },
      },
    },
  ];

  const {render, onBeforeEach} = renderComponent((props) => (
    <MockedProvider mocks={mocks} addTypename={false}>
      <Equipment {...props} />
    </MockedProvider>
  ));

  beforeEach(onBeforeEach);
  afterEach(cleanup);

  test("Compiles a list of used equipment and compares it to the requirements", async () => {
    const event = {
      owner_operator_id: 1,
      vehicle_number: 100,
    };
    const departure = {
      trunkColorRequired: true, // exteriorColor must be "HSL-orans"
      equipmentRequired: 1, // The prescribed equipment is a hard requirement
      equipmentType: "0", // 0 corresponds to type C.
    };

    // The test will wait for the mock element to exist, so mount it only when the data finished loading.
    const cb = jest.fn(({loading}) =>
      loading ? null : <div data-testid="equipment" />
    );

    const {getByTestId} = render({
      journey: event,
      departure,
      children: cb,
    });

    // Await the mock element created above.
    await waitForElement(() => getByTestId("equipment"));

    const expectEquipment = {
      loading: false,
      equipment: [
        {name: "type", observed: "C", required: "C", color: "var(--light-green)"},
        {
          name: "exteriorColor",
          observed: "HSL-orans",
          required: "HSL-orans",
          color: "var(--light-green)",
        },
        {
          name: "emissionClass",
          observed: "EEV (01)",
          required: false,
          color: "var(--lighter-grey)",
        },
      ],
    };

    expect(cb).toHaveBeenCalledTimes(3);
    return expect(cb.mock.calls[2][0]).toMatchObject(expectEquipment);
  });

  test("Highlights mismatching equipment", async () => {
    const event = {
      owner_operator_id: 2, // Fetch the second mock equipment
      vehicle_number: 100,
    };
    const departure = {
      trunkColorRequired: true, // exteriorColor must be "HSL-orans"
      equipmentRequired: 1, // The prescribed equipment is a hard requirement
      equipmentType: "0", // 0 corresponds to type C. The equipment will have type A1 so it's an error.
    };

    const cb = jest.fn(({loading}) =>
      loading ? null : <div data-testid="equipment" />
    );

    const {getByTestId} = render({
      journey: event,
      departure,
      children: cb,
    });

    await waitForElement(() => getByTestId("equipment"));

    expect(cb.mock.calls[2][0].equipment[0]).toMatchObject({
      name: "type",
      required: "C",
      observed: "A1",
      color: "var(--red)",
    });

    expect(cb.mock.calls[2][0].equipment[1]).toMatchObject({
      name: "exteriorColor",
      required: "HSL-orans",
      observed: "HSL-sin",
      color: "var(--red)",
    });
  });

  test("No highlight if the requirement is not hard", async () => {
    const event = {
      owner_operator_id: 2, // Fetch the second mock equipment
      vehicle_number: 100,
    };
    const departure = {
      trunkColorRequired: false, // exteriorColor can be whatever
      equipmentRequired: 0, // The prescribed equipment is NOT a hard requirement
      equipmentType: "0", // 0 corresponds to type C, but it's not a hard requirement in this case.
    };

    const cb = jest.fn(({loading}) =>
      loading ? null : <div data-testid="equipment" />
    );

    const {getByTestId} = render({
      journey: event,
      departure,
      children: cb,
    });

    await waitForElement(() => getByTestId("equipment"));

    expect(cb.mock.calls[2][0].equipment[0]).toMatchObject({
      name: "type",
      required: false,
      observed: "A1",
      color: "var(--lighter-grey)",
    });

    expect(cb.mock.calls[2][0].equipment[1]).toMatchObject({
      name: "exteriorColor",
      required: false,
      observed: "HSL-sin",
      color: "var(--lighter-grey)",
    });
  });
});
