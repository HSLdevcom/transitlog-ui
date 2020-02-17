import {action, computed, observable} from "mobx";
import * as mobxUtils from "mobx-utils";

export function createDebouncedObservable(
  observableValue,
  interval = 1000,
  updateTimerInterval = interval
) {
  class DebouncedObservableValue {
    @observable
    value = observableValue;
    _lastUpdate = 0;
    _lastValue = null;

    @action
    setValue(value) {
      this.value = value;
    }

    @computed
    get debouncedValue() {
      const now = mobxUtils.now(updateTimerInterval);
      // Check the delta from the last update if it's time to release the latest value.
      const delta = now - this._lastUpdate;
      // Since this.value is also observable, this reaction will also run when the value changes.
      // It's best to "dot into" the value here instead of in the conditional so mobx notices it.
      const currentValue = this.value;

      if (delta >= interval) {
        // It is time for the value to be released.
        this._lastValue = currentValue;
        this._lastUpdate = now;
      }

      // Return the last value, updated or not.
      return this._lastValue;
    }
  }

  return new DebouncedObservableValue();
}
