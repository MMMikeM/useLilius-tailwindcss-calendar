import React, { useState, useEffect } from "react";
import "./App.css";
import {
  addDays,
  endOfMonth,
  format,
  getDate,
  getDay,
  getMonth,
  getYear,
  isToday,
  isValid,
  lastDayOfMonth,
  parse,
  startOfMonth,
} from "date-fns";

import { useLilius } from "use-lilius";

const App = () => {
  const {
    calendar,
    clearSelected,
    clearTime,
    inRange,
    isSelected,
    select,
    selected,
    setViewing,
    toggle,
    viewing,
    viewNextMonth,
    viewPreviousMonth,
    viewToday,
  } = useLilius();

  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  // Only accept digits and forward slash as input.
  const onInputChange = (input: string) => {
    setInputValue(input.trim().replace(/[^\d/]+/g, ""));
  };

  // When the input field loses focus, we need to parse
  // the input to set the date. While doing this, we also do some
  // assumptions for the user and fix mistakes.
  const onInputBlur = () => {
    // If the input is empty, we should just go ahead and
    // clear the current selection.
    if (inputValue === "") {
      clearSelected();
      return;
    }

    const parts = inputValue.split("/");
    const partsAsNumber = parts.map((p) => parseInt(p, 10));

    // Make sure the month is within the valid range
    // of months (1 - 12). If no month is given, default
    // to the one we're looking at.
    if (parts.length < 1) {
      parts[0] = `${getMonth(viewing)}`;
    } else if (partsAsNumber[0] < 1) {
      parts[0] = "1";
    } else if (partsAsNumber[0] > 12) {
      parts[0] = "12";
    }

    // Make sure the day is within the valid range
    // of days (1 - last day of the given month). If no
    // day is given, default to the first day.
    if (parts.length < 2) {
      parts[1] = "1";
    } else if (partsAsNumber[1] < 1) {
      parts[1] = "1";
    } else if (partsAsNumber[1] > getDate(lastDayOfMonth(viewing))) {
      parts[1] = `${getDate(lastDayOfMonth(viewing))}`;
    }

    // If no year is given, default to the one we're looking at.
    // If the user passes in 2 digits, append them to the first 2 digits
    // of the year we're looking at. Example: `12` becomes `2012` if we're
    // looking at any year between 2000 and 2999.
    if (parts.length < 3) {
      parts[2] = `${getYear(viewing)}`;
    } else if (partsAsNumber[2] > 9 && partsAsNumber[2] < 100) {
      parts[2] = `${
        Math.round(getYear(viewing) / 1000) * 1000 + partsAsNumber[2]
      }`;
    }

    const parsed = parse(parts.join("/"), "MM/dd/yyyy", new Date());

    if (isValid(parsed)) {
      select(parsed, true);
    } else if (selected.length > 0) {
      setInputValue(format(selected[0], "MM/dd/yyyy"));
    } else {
      setInputValue("");
    }
  };

  // When the selection is changed, we want to update the input field
  // and the currently viewed month to match.
  useEffect(() => {
    setInputValue(selected.length > 0 ? format(selected[0], "MM/dd/yyyy") : "");
    setViewing(selected.length > 0 ? selected[0] : new Date());
  }, [selected]);

  return (
    <div className="App flex w-screen h-screen justify-center p-24 bg-gray-100">
      <div className="relative text-gray-600">
        <span className="absolute top-0 right-0 flex items-center pl-2 ">
          <button
            className="bg-gray-500 text-white px-4 py-2 rounded-l-none rounded-lg focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
          >
            Open
          </button>
        </span>
        <input
          className="bg-gray-200 outline-none bg-opacity-90 px-4 py-2 rounded-lg shadow w-72"
          onBlur={() => onInputBlur()}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Select a Date"
          value={inputValue}
        />
        {isOpen ? (
          <div className="bg-gray-400 absolute rounded-lg shadow-lg mt-0.5 w-full">
            <div className="flex justify-between text-white bg-indigo-900 rounded-t-lg pt-2 px-4 pb-2">
              <button
                className="px-2 py-1 -ml-2 focus:outline-none rounded hover:bg-indigo-700"
                onClick={() => select(clearTime(new Date()), true)}
              >
                Today
              </button>
              <button
                className="px-2 py-1 -mr-2  focus:outline-none rounded hover:bg-indigo-700"
                onClick={() => select(addDays(clearTime(new Date()), 1), true)}
              >
                Tomorrow
              </button>
            </div>
            <div className="flex justify-between items-center bg-gray-50 px-2 py-2">
              <button
                className="hover:bg-gray-200 rounded px-2 pt-1 pb-2 focus:outline-none font-black text-gray-500"
                aria-label="Previous Month"
                onClick={viewPreviousMonth}
              >
                {"<"}
              </button>
              <h6 className="font-semibold">{format(viewing, "MMMM yyyy")}</h6>
              <button
                className="hover:bg-gray-200 rounded px-2 pt-1 pb-2 focus:outline-none font-black text-gray-500"
                aria-label="Next Month"
                onClick={viewNextMonth}
              >
                {">"}
              </button>
            </div>
            <div className="flex justify-between px-4 pt-2 pb-1 bg-indigo-100 text-indigo-900 font-semibold">
              {calendar.length > 0 &&
                calendar[0].map((day) => (
                  <div key={`${day}`} className="">
                    {
                      ["Sun", "Mon", "Tue", "Wed", "Tue", "Thu", "Fri", "Sat"][
                        getDay(day)
                      ]
                    }
                  </div>
                ))}
            </div>
            <div className="px-3 pb-2.5 pt-1.5 bg-indigo-50 ">
              {calendar.map((week) => (
                <div
                  className="flex justify-between mx-0 "
                  key={`week-${week[0]}`}
                >
                  {week.map((day) => {
                    let classes = "";
                    if (
                      !inRange(day, startOfMonth(viewing), endOfMonth(viewing))
                    ) {
                      classes += " text-gray-400 hover:text-gray-600";
                    }
                    if (isToday(day)) {
                      classes += " font-bold";
                    }
                    if (isSelected(day)) {
                      classes +=
                        " hover:bg-indigo-900 hover:text-white bg-indigo-800 text-white";
                    } else {
                      classes += " hover:bg-indigo-200 hover:text-indigo-900";
                    }
                    return (
                      <div
                        className={
                          "px-2.5 py-1 rounded-lg cursor-pointer " + classes
                        }
                        data-in-range={inRange(
                          day,
                          startOfMonth(viewing),
                          endOfMonth(viewing)
                        )}
                        data-selected={isSelected(day)}
                        data-today={isToday(day)}
                        key={`${day}`}
                        onClick={() => {
                          toggle(day, true);
                        }}
                      >
                        <p>{format(day, "dd")}</p>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default App;
