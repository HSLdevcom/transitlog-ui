import moment from "moment-timezone";
import {TIMEZONE} from "./constants";

// Set the default timezone for the app
moment.tz.setDefault(TIMEZONE);

Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
  value: () => {
    return {
      fillRect: function() {},
      clearRect: function() {},
      putImageData: function() {},
      createImageData: function() {
        return [];
      },
      setTransform: function() {},
      drawImage: function() {},
      save: function() {},
      fillText: function() {},
      restore: function() {},
      beginPath: function() {},
      moveTo: function() {},
      lineTo: function() {},
      closePath: function() {},
      stroke: function() {},
      translate: function() {},
      scale: function() {},
      rotate: function() {},
      arc: function() {},
      fill: function() {},
      transform: function() {},
      rect: function() {},
      clip: function() {},
    };
  },
});
