import React, {useCallback} from "react";
import {createPortal} from "react-dom";
import moment from "moment-timezone";
import {observer} from "mobx-react-lite";
import DatePicker, {registerLocale, setDefaultLocale} from "react-datepicker";
import {format} from "date-fns";
import {text} from "../../helpers/text";
import {InputBase, ControlGroup} from "../Forms";
import "react-datepicker/dist/react-datepicker.css";
import PlusMinusInput from "../PlusMinusInput";
import Input from "../Input";
import styled, {createGlobalStyle} from "styled-components";
import {TIMEZONE} from "../../constants";
import flow from "lodash/flow";
import get from "lodash/get";
import {inject} from "../../helpers/inject";
import ExceptionDaysQuery from "../../queries/ExceptionDaysQuery";
import Tooltip from "../Tooltip";
import {legacyParse, convertTokens} from "@date-fns/upgrade/v2";
import fi from "date-fns/locale/fi";

registerLocale("fi", fi);
setDefaultLocale("fi");

const DateControlGroup = styled(ControlGroup)`
  margin-bottom: 0.6rem;
  position: relative;
`;

const DateInput = styled(PlusMinusInput)`
  display: grid;
  grid-template-columns: 2.5rem 1fr 2.5rem;

  > button {
    height: calc(2rem + 4px);
    padding: 0 0.25rem;
  }
`;

const WeekInput = styled(PlusMinusInput)`
  width: 100%;
  display: grid;
  grid-template-columns: 2.5rem 1fr 2.5rem;
  margin-top: -0.25rem;

  > button {
    background: white;
    border-color: var(--blue);
    color: var(--blue);
    z-index: 0;
    padding: 0 0.25rem;

    &:hover {
      background: #eeeeee;
    }
  }
`;

const CalendarInput = styled(InputBase)`
  min-width: 8rem;
  height: calc(2rem + 6px);
  text-align: center;
  border-color: var(--blue);
`;

const Day = styled.div``;

const CalendarStyles = createGlobalStyle`
  .react-datepicker-wrapper,
  .react-datepicker__input-container {
    display: flex;
    flex: 1 1 auto;
  }
  
  .react-datepicker-popper {
    z-index: 100;
  }
  
  .react-datepicker__day {
    &:hover {
      background: var(--light-grey) !important;
      color: white;
    }
  }
  
  .react-datepicker__day.react-datepicker__day--highlighted {
    background: var(--light-orange);
    color: var(--dark-grey);
    
    &:hover {
      background: var(--light-grey);
      color: white;
    }
  }
`;

const renderDay = (exceptionData) => (dayNumber, date) => {
  const exception = get(exceptionData, format(date, convertTokens("YYYY-MM-DD")));

  if (!exception) {
    return <Day>{dayNumber}</Day>;
  }

  return (
    <Tooltip
      helpText={`Exceptions: ${exception.effectiveDayTypes.join(", ")}${
        exception.description ? `, ${exception.description}` : ""
      }${exception.modeScope ? `, ${exception.modeScope}` : ""}`}>
      <Day>{dayNumber}</Day>
    </Tooltip>
  );
};

// A simple portal to render the calendar outside the FilterSection.
const CalendarContainer = (root) => ({className, children}) =>
  root.current
    ? createPortal(<div className={className}>{children}</div>, root.current)
    : null;

const decorate = flow(observer, inject("Filters", "Time"));

const DateSettings = decorate(({calendarRootRef, Filters, Time, state: {date, live}}) => {
  const setDate = useCallback(
    (dateVal) => {
      if (live) {
        Time.toggleLive(false);
      }

      Filters.setDate(dateVal);
    },
    [Time, Filters, live]
  );

  const onDateButtonClick = useCallback(
    (modifier) => {
      if (!date) {
        Filters.setDate("");
      } else {
        const nextDate = moment.tz(date, "YYYY-MM-DD", TIMEZONE);

        if (modifier < 0) {
          nextDate.subtract(Math.abs(modifier), "days");
        } else {
          nextDate.add(Math.abs(modifier), "days");
        }

        setDate(nextDate);
      }
    },
    [Filters, date, setDate]
  );

  return (
    <DateControlGroup>
      <CalendarStyles />
      <Input
        labelTestId="date-label"
        label={text("filterpanel.choose_date_time")}
        animatedLabel={false}>
        <WeekInput
          testIdPrefix="date-week"
          minusHelp="One week backward"
          plusHelp="One week forward"
          minusLabel={<>&laquo; 7</>}
          plusLabel={<>7 &raquo;</>}
          onDecrease={onDateButtonClick.bind(undefined, -7)}
          onIncrease={onDateButtonClick.bind(undefined, 7)}>
          <DateInput
            testIdPrefix="date-day"
            minusHelp="One day backward"
            plusHelp="One day forward"
            minusLabel={<>&lsaquo; 1</>}
            plusLabel={<>1 &rsaquo;</>}
            onDecrease={onDateButtonClick.bind(undefined, -1)}
            onIncrease={onDateButtonClick.bind(undefined, 1)}>
            <ExceptionDaysQuery>
              {({exceptionDays = []}) => {
                const dates = exceptionDays.reduce((collection, exception) => {
                  collection[
                    format(
                      legacyParse(exception.exceptionDate),
                      convertTokens("YYYY-MM-DD")
                    )
                  ] = exception;
                  return collection;
                }, {});

                const highlightedDates = Object.keys(dates).map((date) => new Date(date));

                return (
                  <DatePicker
                    dropdownMode="select"
                    customInput={
                      <CalendarInput
                        data-testid="date-input"
                        helpText="Select date field"
                      />
                    }
                    dateFormat={"yyyy-MM-dd"}
                    selected={moment.tz(date, TIMEZONE).toDate()}
                    onChange={setDate}
                    todayButton={text("general.today")}
                    className="calendar"
                    locale="fi"
                    highlightDates={highlightedDates}
                    // Z-indexing is tricky in the filterbar, so the calendarcontainer mounts
                    // a portal in a better place for the datepicker.
                    calendarContainer={CalendarContainer(calendarRootRef)}
                    renderDayContents={renderDay(dates)}
                  />
                );
              }}
            </ExceptionDaysQuery>
          </DateInput>
        </WeekInput>
      </Input>
    </DateControlGroup>
  );
});

export default DateSettings;
