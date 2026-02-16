export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  BBox: { input: any; output: any; }
  Date: { input: any; output: any; }
  DateTime: { input: any; output: any; }
  Direction: { input: any; output: any; }
  PreciseBBox: { input: any; output: any; }
  Time: { input: any; output: any; }
  Upload: { input: any; output: any; }
  VehicleId: { input: any; output: any; }
};

export type Alert = {
  __typename?: 'Alert';
  affectedId: Scalars['String']['output'];
  bulletinId: Scalars['String']['output'];
  category: AlertCategory;
  description: Scalars['String']['output'];
  distribution: AlertDistribution;
  endDateTime: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  impact: AlertImpact;
  lastModifiedDateTime: Scalars['DateTime']['output'];
  level: AlertLevel;
  startDateTime: Scalars['DateTime']['output'];
  title: Scalars['String']['output'];
  url?: Maybe<Scalars['String']['output']>;
};

export enum AlertCategory {
  Accident = 'ACCIDENT',
  Assault = 'ASSAULT',
  ChargingService = 'CHARGING_SERVICE',
  Disturbance = 'DISTURBANCE',
  EarlierDisruption = 'EARLIER_DISRUPTION',
  Hidden = 'HIDDEN',
  ItsSystemError = 'ITS_SYSTEM_ERROR',
  MedicalIncident = 'MEDICAL_INCIDENT',
  MisparkedVehicle = 'MISPARKED_VEHICLE',
  NoDriver = 'NO_DRIVER',
  NoTrafficDisruption = 'NO_TRAFFIC_DISRUPTION',
  Other = 'OTHER',
  OtherDriverError = 'OTHER_DRIVER_ERROR',
  PowerFailure = 'POWER_FAILURE',
  PublicEvent = 'PUBLIC_EVENT',
  RoadClosed = 'ROAD_CLOSED',
  RoadMaintenance = 'ROAD_MAINTENANCE',
  RoadTrench = 'ROAD_TRENCH',
  Seizure = 'SEIZURE',
  StaffDeficit = 'STAFF_DEFICIT',
  StateVisit = 'STATE_VISIT',
  Strike = 'STRIKE',
  SwitchFailure = 'SWITCH_FAILURE',
  TechnicalFailure = 'TECHNICAL_FAILURE',
  Test = 'TEST',
  TooManyPassengers = 'TOO_MANY_PASSENGERS',
  TrackBlocked = 'TRACK_BLOCKED',
  TrackMaintenance = 'TRACK_MAINTENANCE',
  TrafficAccident = 'TRAFFIC_ACCIDENT',
  TrafficJam = 'TRAFFIC_JAM',
  VehicleBreakdown = 'VEHICLE_BREAKDOWN',
  VehicleDeficit = 'VEHICLE_DEFICIT',
  VehicleOffTheRoad = 'VEHICLE_OFF_THE_ROAD',
  Weather = 'WEATHER',
  WeatherConditions = 'WEATHER_CONDITIONS'
}

export enum AlertDistribution {
  AllRoutes = 'ALL_ROUTES',
  AllStops = 'ALL_STOPS',
  Network = 'NETWORK',
  Route = 'ROUTE',
  Stop = 'STOP'
}

export enum AlertImpact {
  BicycleStationOutOfOrder = 'BICYCLE_STATION_OUT_OF_ORDER',
  BicycleSystemOutOfOrder = 'BICYCLE_SYSTEM_OUT_OF_ORDER',
  Cancelled = 'CANCELLED',
  Delayed = 'DELAYED',
  DeviatingSchedule = 'DEVIATING_SCHEDULE',
  DisruptionRoute = 'DISRUPTION_ROUTE',
  IrregularDepartures = 'IRREGULAR_DEPARTURES',
  IrregularDeparturesMax_15 = 'IRREGULAR_DEPARTURES_MAX_15',
  IrregularDeparturesMax_30 = 'IRREGULAR_DEPARTURES_MAX_30',
  NoTrafficImpact = 'NO_TRAFFIC_IMPACT',
  Other = 'OTHER',
  PossibleDeviations = 'POSSIBLE_DEVIATIONS',
  PossiblyDelayed = 'POSSIBLY_DELAYED',
  ReducedBicycleParkCapacity = 'REDUCED_BICYCLE_PARK_CAPACITY',
  ReducedTransport = 'REDUCED_TRANSPORT',
  ReturningToNormal = 'RETURNING_TO_NORMAL',
  Unknown = 'UNKNOWN',
  VendingMachineOutOfOrder = 'VENDING_MACHINE_OUT_OF_ORDER'
}

export enum AlertLevel {
  Info = 'INFO',
  Severe = 'SEVERE',
  Warning = 'WARNING'
}

export type AlertSearchInput = {
  all?: InputMaybe<Scalars['Boolean']['input']>;
  allRoutes?: InputMaybe<Scalars['Boolean']['input']>;
  allStops?: InputMaybe<Scalars['Boolean']['input']>;
  network?: InputMaybe<Scalars['Boolean']['input']>;
  route?: InputMaybe<Scalars['String']['input']>;
  stop?: InputMaybe<Scalars['String']['input']>;
};

export type AreaEventsFilterInput = {
  direction?: InputMaybe<Scalars['Direction']['input']>;
  routeId?: InputMaybe<Scalars['String']['input']>;
};

export type Cancellation = {
  __typename?: 'Cancellation';
  cancellationEffect: CancellationEffect;
  cancellationType: CancellationType;
  category: AlertCategory;
  departureDate: Scalars['Date']['output'];
  description: Scalars['String']['output'];
  direction: Scalars['Direction']['output'];
  id: Scalars['ID']['output'];
  isCancelled: Scalars['Boolean']['output'];
  journeyStartTime: Scalars['Time']['output'];
  lastModifiedDateTime: Scalars['DateTime']['output'];
  routeId: Scalars['String']['output'];
  subCategory: CancellationSubcategory;
  title: Scalars['String']['output'];
};

export enum CancellationEffect {
  CancelEntireDeparture = 'CANCEL_ENTIRE_DEPARTURE',
  CancelStopsFromEnd = 'CANCEL_STOPS_FROM_END',
  CancelStopsFromMiddle = 'CANCEL_STOPS_FROM_MIDDLE',
  CancelStopsFromStart = 'CANCEL_STOPS_FROM_START'
}

export type CancellationSearchInput = {
  all?: InputMaybe<Scalars['Boolean']['input']>;
  departureTime?: InputMaybe<Scalars['String']['input']>;
  direction?: InputMaybe<Scalars['Int']['input']>;
  latestOnly?: InputMaybe<Scalars['Boolean']['input']>;
  routeId?: InputMaybe<Scalars['String']['input']>;
};

export enum CancellationSubcategory {
  AssaultOnDriver = 'ASSAULT_ON_DRIVER',
  AssaultOnPassenger = 'ASSAULT_ON_PASSENGER',
  AssaultOnVehicle = 'ASSAULT_ON_VEHICLE',
  BreakMalfunction = 'BREAK_MALFUNCTION',
  CongestionCausedByAccident = 'CONGESTION_CAUSED_BY_ACCIDENT',
  CongestionCausedByWeather = 'CONGESTION_CAUSED_BY_WEATHER',
  CongestionReasonUknown = 'CONGESTION_REASON_UKNOWN',
  DeviceError = 'DEVICE_ERROR',
  DoorMalfunction = 'DOOR_MALFUNCTION',
  DriverError = 'DRIVER_ERROR',
  DriverLate = 'DRIVER_LATE',
  DriverSeizure = 'DRIVER_SEIZURE',
  ElectricMalfunction = 'ELECTRIC_MALFUNCTION',
  EngineMalfunction = 'ENGINE_MALFUNCTION',
  FalseAlarm = 'FALSE_ALARM',
  FaultUnknown = 'FAULT_UNKNOWN',
  FluidLeakage = 'FLUID_LEAKAGE',
  Hidden = 'HIDDEN',
  InsufficientCapasity = 'INSUFFICIENT_CAPASITY',
  InsufficientInstructionsByAuthority = 'INSUFFICIENT_INSTRUCTIONS_BY_AUTHORITY',
  InsufficientInstructionsByOperator = 'INSUFFICIENT_INSTRUCTIONS_BY_OPERATOR',
  ItsSystemNotInstalled = 'ITS_SYSTEM_NOT_INSTALLED',
  MissparkedVehicle = 'MISSPARKED_VEHICLE',
  NdOperatorPlanningError = 'ND_OPERATOR_PLANNING_ERROR',
  NoVehicleAvailable = 'NO_VEHICLE_AVAILABLE',
  OperatorChargingService = 'OPERATOR_CHARGING_SERVICE',
  OperatorDeviceError = 'OPERATOR_DEVICE_ERROR',
  OperatorPersonnelOnStrike = 'OPERATOR_PERSONNEL_ON_STRIKE',
  OppositeFault = 'OPPOSITE_FAULT',
  OtherAssault = 'OTHER_ASSAULT',
  OtherChargingService = 'OTHER_CHARGING_SERVICE',
  OtherItsError = 'OTHER_ITS_ERROR',
  OtherMalfunction = 'OTHER_MALFUNCTION',
  OtherOperatorReason = 'OTHER_OPERATOR_REASON',
  OtherSeizure = 'OTHER_SEIZURE',
  OtherStrike = 'OTHER_STRIKE',
  OutOfFuel = 'OUT_OF_FUEL',
  OwnFault = 'OWN_FAULT',
  PassedOutPassenger = 'PASSED_OUT_PASSENGER',
  PassengerInjured = 'PASSENGER_INJURED',
  PassengerSeizure = 'PASSENGER_SEIZURE',
  RoadBlocked = 'ROAD_BLOCKED',
  SlipperyTrack = 'SLIPPERY_TRACK',
  StaffShortage = 'STAFF_SHORTAGE',
  StuckCausedBySlippery = 'STUCK_CAUSED_BY_SLIPPERY',
  UndriveableConditions = 'UNDRIVEABLE_CONDITIONS',
  UnknownCause = 'UNKNOWN_CAUSE',
  UserError = 'USER_ERROR',
  VehicleOffTheRoadByDriverError = 'VEHICLE_OFF_THE_ROAD_BY_DRIVER_ERROR',
  VehicleOffTheRoadByOtherReason = 'VEHICLE_OFF_THE_ROAD_BY_OTHER_REASON',
  WrongInformationInDevice = 'WRONG_INFORMATION_IN_DEVICE'
}

export enum CancellationType {
  BlockFirstDepartureLate = 'BLOCK_FIRST_DEPARTURE_LATE',
  CancelDeparture = 'CANCEL_DEPARTURE',
  DeparturedAfterNextJourney = 'DEPARTURED_AFTER_NEXT_JOURNEY',
  Detour = 'DETOUR',
  EarlyDeparture = 'EARLY_DEPARTURE',
  EarlyDepartureFromTimingPoint = 'EARLY_DEPARTURE_FROM_TIMING_POINT',
  LateDeparture = 'LATE_DEPARTURE',
  SkippedStopCalls = 'SKIPPED_STOP_CALLS',
  TisError = 'TIS_ERROR'
}

export type Departure = {
  __typename?: 'Departure';
  _normalDayType?: Maybe<Scalars['String']['output']>;
  alerts: Array<Alert>;
  apc?: Maybe<Scalars['Boolean']['output']>;
  cancellations: Array<Cancellation>;
  dayType: Scalars['String']['output'];
  departureDate: Scalars['Date']['output'];
  departureEvent?: Maybe<JourneyStopEvent>;
  departureId: Scalars['Int']['output'];
  departureTime: Scalars['Time']['output'];
  direction: Scalars['Direction']['output'];
  equipmentColor?: Maybe<Scalars['String']['output']>;
  equipmentIsRequired?: Maybe<Scalars['Boolean']['output']>;
  equipmentType?: Maybe<Scalars['String']['output']>;
  extraDeparture: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  index?: Maybe<Scalars['Int']['output']>;
  isCancelled: Scalars['Boolean']['output'];
  isNextDay: Scalars['Boolean']['output'];
  isOrigin?: Maybe<Scalars['Boolean']['output']>;
  isTimingStop: Scalars['Boolean']['output'];
  journey?: Maybe<DepartureJourney>;
  mode: Scalars['String']['output'];
  observedArrivalTime?: Maybe<ObservedArrival>;
  observedDepartureTime?: Maybe<ObservedDeparture>;
  operatingUnit?: Maybe<Scalars['String']['output']>;
  operatorId?: Maybe<Scalars['String']['output']>;
  originDepartureTime?: Maybe<PlannedDeparture>;
  plannedArrivalTime: PlannedArrival;
  plannedDepartureTime: PlannedDeparture;
  recoveryTime?: Maybe<Scalars['Int']['output']>;
  routeId: Scalars['String']['output'];
  stop: Stop;
  stopId: Scalars['String']['output'];
  terminalTime?: Maybe<Scalars['Int']['output']>;
  trainNumber?: Maybe<Scalars['String']['output']>;
};

export type DepartureFilterInput = {
  direction?: InputMaybe<Scalars['Direction']['input']>;
  maxHour?: InputMaybe<Scalars['Int']['input']>;
  minHour?: InputMaybe<Scalars['Int']['input']>;
  routeId?: InputMaybe<Scalars['String']['input']>;
};

export type DepartureJourney = {
  __typename?: 'DepartureJourney';
  _numInstance?: Maybe<Scalars['Int']['output']>;
  alerts: Array<Alert>;
  cancellations: Array<Cancellation>;
  departureDate: Scalars['Date']['output'];
  departureTime: Scalars['Time']['output'];
  direction?: Maybe<Scalars['Direction']['output']>;
  id: Scalars['ID']['output'];
  isCancelled: Scalars['Boolean']['output'];
  journeyType: Scalars['String']['output'];
  mode?: Maybe<Scalars['String']['output']>;
  originStopId?: Maybe<Scalars['String']['output']>;
  routeId?: Maybe<Scalars['String']['output']>;
  type: Scalars['String']['output'];
  uniqueVehicleId?: Maybe<Scalars['VehicleId']['output']>;
};

export type DriverEvent = {
  __typename?: 'DriverEvent';
  eventType: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  journeyType: Scalars['String']['output'];
  lat?: Maybe<Scalars['Float']['output']>;
  lng?: Maybe<Scalars['Float']['output']>;
  loc?: Maybe<Scalars['String']['output']>;
  mode?: Maybe<Scalars['String']['output']>;
  odo?: Maybe<Scalars['Float']['output']>;
  operatorId?: Maybe<Scalars['String']['output']>;
  receivedAt?: Maybe<Scalars['DateTime']['output']>;
  recordedAt: Scalars['DateTime']['output'];
  recordedAtUnix: Scalars['Int']['output'];
  recordedTime: Scalars['Time']['output'];
  uniqueVehicleId?: Maybe<Scalars['VehicleId']['output']>;
  vehicleId?: Maybe<Scalars['String']['output']>;
};

export type Equipment = {
  __typename?: 'Equipment';
  _matchScore?: Maybe<Scalars['Float']['output']>;
  age?: Maybe<Scalars['Int']['output']>;
  emissionClass?: Maybe<Scalars['String']['output']>;
  emissionDesc?: Maybe<Scalars['String']['output']>;
  exteriorColor?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  inService?: Maybe<Scalars['Boolean']['output']>;
  operatorId: Scalars['String']['output'];
  operatorName?: Maybe<Scalars['String']['output']>;
  registryNr?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  vehicleId: Scalars['String']['output'];
};

export type EquipmentFilterInput = {
  operatorId?: InputMaybe<Scalars['String']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  vehicleId?: InputMaybe<Scalars['String']['input']>;
};

export type ExceptionDay = {
  __typename?: 'ExceptionDay';
  dayType: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  effectiveDayTypes: Array<Scalars['String']['output']>;
  endTime?: Maybe<Scalars['Time']['output']>;
  exceptionDate: Scalars['Date']['output'];
  exclusive: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  modeScope: Scalars['String']['output'];
  scope: Scalars['String']['output'];
  scopedDayType: Scalars['String']['output'];
  startTime?: Maybe<Scalars['Time']['output']>;
};

export type Feedback = {
  __typename?: 'Feedback';
  email: Scalars['String']['output'];
  msgTs: Scalars['String']['output'];
  text: Scalars['String']['output'];
};

export type File = {
  __typename?: 'File';
  encoding: Scalars['String']['output'];
  filename: Scalars['String']['output'];
  mimetype: Scalars['String']['output'];
};

export type Journey = {
  __typename?: 'Journey';
  alerts: Array<Alert>;
  apc?: Maybe<Scalars['Boolean']['output']>;
  cancellations: Array<Cancellation>;
  departure?: Maybe<Departure>;
  departureDate: Scalars['Date']['output'];
  departureTime?: Maybe<Scalars['Time']['output']>;
  direction?: Maybe<Scalars['Direction']['output']>;
  equipment?: Maybe<Equipment>;
  events: Array<JourneyEventType>;
  headsign?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isCancelled: Scalars['Boolean']['output'];
  journeyDurationMinutes?: Maybe<Scalars['Int']['output']>;
  journeyLength?: Maybe<Scalars['Int']['output']>;
  journeyType: Scalars['String']['output'];
  mode?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  operatorId?: Maybe<Scalars['String']['output']>;
  originStopId?: Maybe<Scalars['String']['output']>;
  routeDepartures?: Maybe<Array<Departure>>;
  routeId?: Maybe<Scalars['String']['output']>;
  uniqueVehicleId?: Maybe<Scalars['VehicleId']['output']>;
  vehicleId?: Maybe<Scalars['String']['output']>;
  vehiclePositions: Array<VehiclePosition>;
};

export type JourneyCancellationEvent = {
  __typename?: 'JourneyCancellationEvent';
  _sort?: Maybe<Scalars['Int']['output']>;
  cancellationEffect: CancellationEffect;
  cancellationType: CancellationType;
  category: AlertCategory;
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isCancelled: Scalars['Boolean']['output'];
  plannedDate?: Maybe<Scalars['Date']['output']>;
  plannedTime?: Maybe<Scalars['Time']['output']>;
  recordedAt: Scalars['DateTime']['output'];
  recordedAtUnix: Scalars['Int']['output'];
  recordedTime: Scalars['Time']['output'];
  subCategory: CancellationSubcategory;
  title: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type JourneyEvent = {
  __typename?: 'JourneyEvent';
  _isVirtual?: Maybe<Scalars['Boolean']['output']>;
  _sort?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  lat?: Maybe<Scalars['Float']['output']>;
  lng?: Maybe<Scalars['Float']['output']>;
  loc?: Maybe<Scalars['String']['output']>;
  mode?: Maybe<Scalars['String']['output']>;
  odo?: Maybe<Scalars['Float']['output']>;
  receivedAt: Scalars['DateTime']['output'];
  recordedAt: Scalars['DateTime']['output'];
  recordedAtUnix: Scalars['Int']['output'];
  recordedTime: Scalars['Time']['output'];
  stopId?: Maybe<Scalars['String']['output']>;
  type: Scalars['String']['output'];
};

export type JourneyEventType = JourneyCancellationEvent | JourneyEvent | JourneyPassengerCountEvent | JourneyStopEvent | JourneyTlpEvent | PlannedStopEvent;

export type JourneyPassengerCountEvent = {
  __typename?: 'JourneyPassengerCountEvent';
  _sort?: Maybe<Scalars['Int']['output']>;
  bikesIn?: Maybe<Scalars['Int']['output']>;
  bikesOut?: Maybe<Scalars['Int']['output']>;
  dir?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  lat?: Maybe<Scalars['Float']['output']>;
  lng?: Maybe<Scalars['Float']['output']>;
  oper?: Maybe<Scalars['Int']['output']>;
  otherIn?: Maybe<Scalars['Int']['output']>;
  otherOut?: Maybe<Scalars['Int']['output']>;
  passengerCountQuality?: Maybe<Scalars['String']['output']>;
  pramsIn?: Maybe<Scalars['Int']['output']>;
  pramsOut?: Maybe<Scalars['Int']['output']>;
  receivedAt: Scalars['DateTime']['output'];
  recordedAt: Scalars['DateTime']['output'];
  recordedAtUnix: Scalars['Int']['output'];
  recordedTime: Scalars['Time']['output'];
  route?: Maybe<Scalars['String']['output']>;
  route_id?: Maybe<Scalars['String']['output']>;
  start?: Maybe<Scalars['String']['output']>;
  stop?: Maybe<Scalars['String']['output']>;
  stopId?: Maybe<Scalars['String']['output']>;
  totalPassengersIn?: Maybe<Scalars['Int']['output']>;
  totalPassengersOut?: Maybe<Scalars['Int']['output']>;
  type: Scalars['String']['output'];
  uniqueVehicleId?: Maybe<Scalars['String']['output']>;
  veh?: Maybe<Scalars['Int']['output']>;
  vehicleLoad?: Maybe<Scalars['Int']['output']>;
  vehicleLoadRatio?: Maybe<Scalars['Float']['output']>;
  vehicleLoadRatioText?: Maybe<Scalars['String']['output']>;
  wheelchairsIn?: Maybe<Scalars['Int']['output']>;
  wheelchairsOut?: Maybe<Scalars['Int']['output']>;
};

export type JourneyStopEvent = {
  __typename?: 'JourneyStopEvent';
  _isVirtual?: Maybe<Scalars['Boolean']['output']>;
  _sort?: Maybe<Scalars['Int']['output']>;
  departureId?: Maybe<Scalars['Int']['output']>;
  doorsOpened?: Maybe<Scalars['Boolean']['output']>;
  id: Scalars['ID']['output'];
  index: Scalars['Int']['output'];
  isNextDay?: Maybe<Scalars['Boolean']['output']>;
  isOrigin?: Maybe<Scalars['Boolean']['output']>;
  isTimingStop: Scalars['Boolean']['output'];
  lat?: Maybe<Scalars['Float']['output']>;
  lng?: Maybe<Scalars['Float']['output']>;
  loc?: Maybe<Scalars['String']['output']>;
  mode?: Maybe<Scalars['String']['output']>;
  nextStopId: Scalars['String']['output'];
  odo?: Maybe<Scalars['Float']['output']>;
  plannedDate?: Maybe<Scalars['Date']['output']>;
  plannedDateTime?: Maybe<Scalars['DateTime']['output']>;
  plannedTime?: Maybe<Scalars['Time']['output']>;
  plannedTimeDifference?: Maybe<Scalars['Int']['output']>;
  plannedUnix?: Maybe<Scalars['Int']['output']>;
  receivedAt: Scalars['DateTime']['output'];
  recordedAt: Scalars['DateTime']['output'];
  recordedAtUnix: Scalars['Int']['output'];
  recordedTime: Scalars['Time']['output'];
  stop?: Maybe<Stop>;
  stopId?: Maybe<Scalars['String']['output']>;
  stopped?: Maybe<Scalars['Boolean']['output']>;
  type: Scalars['String']['output'];
  unplannedStop: Scalars['Boolean']['output'];
};

export type JourneyTlpEvent = {
  __typename?: 'JourneyTlpEvent';
  _sort?: Maybe<Scalars['Int']['output']>;
  attemptSeq?: Maybe<Scalars['Int']['output']>;
  decision?: Maybe<TlpDecision>;
  frequency?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  junctionId?: Maybe<Scalars['Int']['output']>;
  lat?: Maybe<Scalars['Float']['output']>;
  lineConfigId?: Maybe<Scalars['Int']['output']>;
  lng?: Maybe<Scalars['Float']['output']>;
  loc?: Maybe<Scalars['String']['output']>;
  mode?: Maybe<Scalars['String']['output']>;
  nextStopId?: Maybe<Scalars['String']['output']>;
  odo?: Maybe<Scalars['Float']['output']>;
  pointConfigId?: Maybe<Scalars['Int']['output']>;
  priorityLevel?: Maybe<TlpPriorityLevel>;
  protocol?: Maybe<Scalars['String']['output']>;
  reason?: Maybe<TlpReason>;
  receivedAt: Scalars['DateTime']['output'];
  recordedAt: Scalars['DateTime']['output'];
  recordedAtUnix: Scalars['Int']['output'];
  recordedTime: Scalars['Time']['output'];
  requestId?: Maybe<Scalars['Int']['output']>;
  requestType?: Maybe<TlpRequestType>;
  signalGroupId?: Maybe<Scalars['Int']['output']>;
  signalGroupNbr?: Maybe<Scalars['Int']['output']>;
  type: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  sendFeedback: Feedback;
  uploadFeedbackImage: File;
};


export type MutationSendFeedbackArgs = {
  email: Scalars['String']['input'];
  text: Scalars['String']['input'];
  url: Scalars['String']['input'];
};


export type MutationUploadFeedbackImageArgs = {
  file: Scalars['Upload']['input'];
  msgTs?: InputMaybe<Scalars['String']['input']>;
};

export type ObservedArrival = {
  __typename?: 'ObservedArrival';
  arrivalDate: Scalars['Date']['output'];
  arrivalDateTime: Scalars['DateTime']['output'];
  arrivalTime: Scalars['Time']['output'];
  arrivalTimeDifference: Scalars['Int']['output'];
  eventType?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  loc?: Maybe<Scalars['String']['output']>;
};

export type ObservedDeparture = {
  __typename?: 'ObservedDeparture';
  departureDate: Scalars['Date']['output'];
  departureDateTime: Scalars['DateTime']['output'];
  departureTime: Scalars['Time']['output'];
  departureTimeDifference: Scalars['Int']['output'];
  eventType?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  loc?: Maybe<Scalars['String']['output']>;
};

export type PlannedArrival = {
  __typename?: 'PlannedArrival';
  arrivalDate: Scalars['Date']['output'];
  arrivalDateTime: Scalars['DateTime']['output'];
  arrivalTime: Scalars['Time']['output'];
  id: Scalars['ID']['output'];
  isNextDay?: Maybe<Scalars['Boolean']['output']>;
};

export type PlannedDeparture = {
  __typename?: 'PlannedDeparture';
  departureDate: Scalars['Date']['output'];
  departureDateTime: Scalars['DateTime']['output'];
  departureTime: Scalars['Time']['output'];
  id: Scalars['ID']['output'];
  isNextDay?: Maybe<Scalars['Boolean']['output']>;
};

export type PlannedStopEvent = {
  __typename?: 'PlannedStopEvent';
  _sort?: Maybe<Scalars['Int']['output']>;
  departureId?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  index: Scalars['Int']['output'];
  isNextDay?: Maybe<Scalars['Boolean']['output']>;
  isOrigin?: Maybe<Scalars['Boolean']['output']>;
  isTimingStop: Scalars['Boolean']['output'];
  plannedDate?: Maybe<Scalars['Date']['output']>;
  plannedDateTime?: Maybe<Scalars['DateTime']['output']>;
  plannedTime?: Maybe<Scalars['Time']['output']>;
  plannedUnix?: Maybe<Scalars['Int']['output']>;
  stop?: Maybe<Stop>;
  stopId?: Maybe<Scalars['String']['output']>;
  type: Scalars['String']['output'];
};

/** Any object that describes something with a position implements this interface. */
export type Position = {
  lat?: Maybe<Scalars['Float']['output']>;
  lng?: Maybe<Scalars['Float']['output']>;
};

export type Query = {
  __typename?: 'Query';
  alerts: Array<Alert>;
  cancellations: Array<Cancellation>;
  departures: Array<Maybe<Departure>>;
  driverEvents: Array<Maybe<DriverEvent>>;
  equipment: Array<Maybe<Equipment>>;
  exceptionDays: Array<Maybe<ExceptionDay>>;
  journey?: Maybe<Journey>;
  journeys: Array<Maybe<Journey>>;
  journeysByBbox: Array<Maybe<Journey>>;
  journeysByBboxAndRouteId: Array<Maybe<Journey>>;
  route?: Maybe<Route>;
  routeDepartures: Array<Maybe<Departure>>;
  routeGeometry?: Maybe<RouteGeometry>;
  routeSegments: Array<Maybe<RouteSegment>>;
  routes: Array<Maybe<Route>>;
  stop?: Maybe<Stop>;
  stops: Array<Maybe<Stop>>;
  terminal?: Maybe<Terminal>;
  terminals: Array<Maybe<Terminal>>;
  uiMessage: UiMessage;
  unsignedVehicleEvents: Array<Maybe<VehiclePosition>>;
  uploads?: Maybe<Array<Maybe<File>>>;
  vehicleJourneys: Array<Maybe<VehicleJourney>>;
  weeklyDepartures: Array<Maybe<Departure>>;
};


export type QueryAlertsArgs = {
  alertSearch?: InputMaybe<AlertSearchInput>;
  language: Scalars['String']['input'];
  time?: InputMaybe<Scalars['String']['input']>;
};


export type QueryCancellationsArgs = {
  cancellationSearch?: InputMaybe<CancellationSearchInput>;
  date?: InputMaybe<Scalars['Date']['input']>;
};


export type QueryDeparturesArgs = {
  date: Scalars['Date']['input'];
  filter?: InputMaybe<DepartureFilterInput>;
  stopId?: InputMaybe<Scalars['String']['input']>;
  terminalId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryDriverEventsArgs = {
  date: Scalars['Date']['input'];
  uniqueVehicleId: Scalars['VehicleId']['input'];
};


export type QueryEquipmentArgs = {
  date?: InputMaybe<Scalars['Date']['input']>;
  filter?: InputMaybe<EquipmentFilterInput>;
};


export type QueryExceptionDaysArgs = {
  year: Scalars['String']['input'];
};


export type QueryJourneyArgs = {
  departureDate: Scalars['Date']['input'];
  departureTime: Scalars['Time']['input'];
  direction: Scalars['Direction']['input'];
  routeId: Scalars['String']['input'];
  uniqueVehicleId?: InputMaybe<Scalars['VehicleId']['input']>;
  unsignedEvents?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryJourneysArgs = {
  departureDate: Scalars['Date']['input'];
  direction: Scalars['Direction']['input'];
  routeId: Scalars['String']['input'];
};


export type QueryJourneysByBboxArgs = {
  bbox: Scalars['PreciseBBox']['input'];
  date: Scalars['Date']['input'];
  filters?: InputMaybe<AreaEventsFilterInput>;
  maxTime: Scalars['DateTime']['input'];
  minTime: Scalars['DateTime']['input'];
  unsignedEvents?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryJourneysByBboxAndRouteIdArgs = {
  bbox: Scalars['PreciseBBox']['input'];
  date: Scalars['Date']['input'];
  direction: Scalars['String']['input'];
  filters?: InputMaybe<AreaEventsFilterInput>;
  maxTime: Scalars['DateTime']['input'];
  minTime: Scalars['DateTime']['input'];
  routeId: Scalars['String']['input'];
  speedFilter: Scalars['String']['input'];
  unsignedEvents?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryRouteArgs = {
  date: Scalars['Date']['input'];
  direction: Scalars['Direction']['input'];
  routeId: Scalars['String']['input'];
};


export type QueryRouteDeparturesArgs = {
  date: Scalars['Date']['input'];
  direction: Scalars['Direction']['input'];
  routeId: Scalars['String']['input'];
  stopId: Scalars['String']['input'];
};


export type QueryRouteGeometryArgs = {
  date: Scalars['Date']['input'];
  direction: Scalars['Direction']['input'];
  routeId: Scalars['String']['input'];
};


export type QueryRouteSegmentsArgs = {
  date: Scalars['Date']['input'];
  direction: Scalars['Direction']['input'];
  routeId: Scalars['String']['input'];
};


export type QueryRoutesArgs = {
  date?: InputMaybe<Scalars['Date']['input']>;
  filter?: InputMaybe<RouteFilterInput>;
};


export type QueryStopArgs = {
  date: Scalars['Date']['input'];
  stopId: Scalars['String']['input'];
};


export type QueryStopsArgs = {
  date?: InputMaybe<Scalars['Date']['input']>;
  filter?: InputMaybe<StopFilterInput>;
};


export type QueryTerminalArgs = {
  date?: InputMaybe<Scalars['Date']['input']>;
  terminalId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryTerminalsArgs = {
  date?: InputMaybe<Scalars['Date']['input']>;
};


export type QueryUnsignedVehicleEventsArgs = {
  date: Scalars['Date']['input'];
  uniqueVehicleId: Scalars['VehicleId']['input'];
};


export type QueryVehicleJourneysArgs = {
  date: Scalars['Date']['input'];
  uniqueVehicleId: Scalars['VehicleId']['input'];
  unsignedEvents?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryWeeklyDeparturesArgs = {
  date: Scalars['Date']['input'];
  direction: Scalars['Direction']['input'];
  lastStopArrival?: InputMaybe<Scalars['Boolean']['input']>;
  routeId: Scalars['String']['input'];
  stopId: Scalars['String']['input'];
};

export type Route = {
  __typename?: 'Route';
  _matchScore?: Maybe<Scalars['Float']['output']>;
  alerts: Array<Alert>;
  cancellations: Array<Cancellation>;
  destination?: Maybe<Scalars['String']['output']>;
  destinationStopId?: Maybe<Scalars['String']['output']>;
  direction: Scalars['Direction']['output'];
  id: Scalars['ID']['output'];
  mode?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  origin?: Maybe<Scalars['String']['output']>;
  originStopId: Scalars['String']['output'];
  routeDurationMinutes?: Maybe<Scalars['Int']['output']>;
  routeId: Scalars['String']['output'];
  routeLength?: Maybe<Scalars['Int']['output']>;
  trunkRoute?: Maybe<Scalars['Boolean']['output']>;
};

export type RouteFilterInput = {
  direction?: InputMaybe<Scalars['Direction']['input']>;
  routeId?: InputMaybe<Scalars['String']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};

export type RouteGeometry = {
  __typename?: 'RouteGeometry';
  coordinates: Array<RouteGeometryPoint>;
  id: Scalars['ID']['output'];
  mode?: Maybe<Scalars['String']['output']>;
};

export type RouteGeometryPoint = Position & {
  __typename?: 'RouteGeometryPoint';
  lat: Scalars['Float']['output'];
  lng: Scalars['Float']['output'];
};

export type RouteSegment = Position & {
  __typename?: 'RouteSegment';
  alerts: Array<Alert>;
  cancellations: Array<Cancellation>;
  destination: Scalars['String']['output'];
  destinationStopId?: Maybe<Scalars['String']['output']>;
  direction: Scalars['Direction']['output'];
  distanceFromPrevious?: Maybe<Scalars['Int']['output']>;
  distanceFromStart?: Maybe<Scalars['Int']['output']>;
  duration?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  isTimingStop: Scalars['Boolean']['output'];
  lat: Scalars['Float']['output'];
  lng: Scalars['Float']['output'];
  modes?: Maybe<Array<Scalars['String']['output']>>;
  name?: Maybe<Scalars['String']['output']>;
  originStopId?: Maybe<Scalars['String']['output']>;
  radius?: Maybe<Scalars['Float']['output']>;
  routeId: Scalars['String']['output'];
  shortId: Scalars['String']['output'];
  stopId: Scalars['String']['output'];
  stopIndex: Scalars['Int']['output'];
};

export type Stop = Position & {
  __typename?: 'Stop';
  _matchScore?: Maybe<Scalars['Float']['output']>;
  alerts: Array<Alert>;
  id: Scalars['ID']['output'];
  isTimingStop: Scalars['Boolean']['output'];
  lat: Scalars['Float']['output'];
  lng: Scalars['Float']['output'];
  modes: Array<Maybe<Scalars['String']['output']>>;
  name?: Maybe<Scalars['String']['output']>;
  radius?: Maybe<Scalars['Float']['output']>;
  routes: Array<StopRoute>;
  shortId: Scalars['String']['output'];
  stopId: Scalars['String']['output'];
  stopIndex?: Maybe<Scalars['Int']['output']>;
};

export type StopFilterInput = {
  search?: InputMaybe<Scalars['String']['input']>;
};

export type StopRoute = {
  __typename?: 'StopRoute';
  destination?: Maybe<Scalars['String']['output']>;
  direction: Scalars['Direction']['output'];
  id: Scalars['ID']['output'];
  isTimingStop: Scalars['Boolean']['output'];
  mode?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  origin?: Maybe<Scalars['String']['output']>;
  originStopId?: Maybe<Scalars['String']['output']>;
  routeId: Scalars['String']['output'];
};

export type Terminal = Position & {
  __typename?: 'Terminal';
  id: Scalars['ID']['output'];
  lat: Scalars['Float']['output'];
  lng: Scalars['Float']['output'];
  modes?: Maybe<Array<Scalars['String']['output']>>;
  name: Scalars['String']['output'];
  stopIds?: Maybe<Array<Scalars['String']['output']>>;
  stops?: Maybe<Array<Stop>>;
};

export enum TlpDecision {
  Ack = 'ACK',
  Nak = 'NAK'
}

export enum TlpPriorityLevel {
  High = 'HIGH',
  Norequest = 'NOREQUEST',
  Normal = 'NORMAL'
}

export enum TlpReason {
  Ahead = 'AHEAD',
  Global = 'GLOBAL',
  Line = 'LINE',
  Prioexep = 'PRIOEXEP'
}

export enum TlpRequestType {
  Advance = 'ADVANCE',
  DoorClose = 'DOOR_CLOSE',
  DoorOpen = 'DOOR_OPEN',
  Normal = 'NORMAL'
}

export enum TlpType {
  Tla = 'TLA',
  Tlr = 'TLR'
}

export type UiMessage = {
  __typename?: 'UIMessage';
  date?: Maybe<Scalars['String']['output']>;
  message?: Maybe<Scalars['String']['output']>;
};

export type VehicleJourney = {
  __typename?: 'VehicleJourney';
  alerts: Array<Alert>;
  cancellations: Array<Cancellation>;
  departureDate: Scalars['Date']['output'];
  departureTime: Scalars['Time']['output'];
  direction?: Maybe<Scalars['Direction']['output']>;
  headsign?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isCancelled: Scalars['Boolean']['output'];
  journeyType: Scalars['String']['output'];
  loc?: Maybe<Scalars['String']['output']>;
  mode?: Maybe<Scalars['String']['output']>;
  operatorId?: Maybe<Scalars['String']['output']>;
  recordedAt: Scalars['DateTime']['output'];
  recordedAtUnix: Scalars['Int']['output'];
  recordedTime: Scalars['Time']['output'];
  routeId?: Maybe<Scalars['String']['output']>;
  timeDifference: Scalars['Int']['output'];
  uniqueVehicleId?: Maybe<Scalars['VehicleId']['output']>;
  vehicleId?: Maybe<Scalars['String']['output']>;
};

export type VehiclePosition = Position & {
  __typename?: 'VehiclePosition';
  _sort?: Maybe<Scalars['Int']['output']>;
  delay?: Maybe<Scalars['Int']['output']>;
  doorStatus?: Maybe<Scalars['Boolean']['output']>;
  heading?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  journeyType: Scalars['String']['output'];
  lat?: Maybe<Scalars['Float']['output']>;
  lng?: Maybe<Scalars['Float']['output']>;
  loc?: Maybe<Scalars['String']['output']>;
  mode?: Maybe<Scalars['String']['output']>;
  nextStopId?: Maybe<Scalars['String']['output']>;
  odo?: Maybe<Scalars['Float']['output']>;
  operatorId?: Maybe<Scalars['String']['output']>;
  receivedAt: Scalars['DateTime']['output'];
  recordedAt: Scalars['DateTime']['output'];
  recordedAtUnix: Scalars['Int']['output'];
  recordedTime: Scalars['Time']['output'];
  stop?: Maybe<Scalars['String']['output']>;
  uniqueVehicleId?: Maybe<Scalars['VehicleId']['output']>;
  vehicleId?: Maybe<Scalars['String']['output']>;
  velocity?: Maybe<Scalars['Float']['output']>;
};
