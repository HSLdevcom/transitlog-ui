// Stolen from https://github.com/joinhonor/moment-round/blob/master/src/moment-round.js

export const roundMoment = function(moment, precision, key, direction) {
  direction = direction || "round";
  const _this = moment; //cache of this
  const methods = {
    hours: {name: "Hours", maxValue: 24},
    minutes: {name: "Minutes", maxValue: 60},
    seconds: {name: "Seconds", maxValue: 60},
    milliseconds: {name: "Milliseconds", maxValue: 1000},
  };
  const keys = {
    mm: methods.milliseconds.name,
    milliseconds: methods.milliseconds.name,
    Milliseconds: methods.milliseconds.name,
    s: methods.seconds.name,
    seconds: methods.seconds.name,
    Seconds: methods.seconds.name,
    m: methods.minutes.name,
    minutes: methods.minutes.name,
    Minutes: methods.minutes.name,
    H: methods.hours.name,
    h: methods.hours.name,
    hours: methods.hours.name,
    Hours: methods.hours.name,
  };
  let value = 0;
  let rounded = false;
  let subRatio = 1;
  let maxValue;

  // make sure key is plural
  if (key.length > 1 && key !== "mm" && key.slice(-1) !== "s") {
    key += "s";
  }
  key = keys[key].toLowerCase();

  //control
  if (!methods[key]) {
    throw new Error(
      'The value to round is not valid. Possibles ["hours", "minutes", "seconds", "milliseconds"]'
    );
  }

  const get = "get" + methods[key].name;
  const set = "set" + methods[key].name;

  for (let k in methods) {
    if (k === key) {
      value = _this._d[get]();
      maxValue = methods[k].maxValue;
      rounded = true;
    } else if (rounded) {
      subRatio *= methods[k].maxValue;
      value += _this._d["get" + methods[k].name]() / subRatio;
      _this._d["set" + methods[k].name](0);
    }
  }

  value = Math[direction](value / precision) * precision;
  value = Math.min(value, maxValue);
  _this._d[set](value);

  return _this;
};

export const ceilMoment = function(moment, precision, key) {
  return roundMoment(moment, precision, key, "ceil");
};

export const floorMoment = function(moment, precision, key) {
  return roundMoment(moment, precision, key, "floor");
};
