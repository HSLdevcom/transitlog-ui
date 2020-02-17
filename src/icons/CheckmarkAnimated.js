import React, {PureComponent} from "react";
import PropTypes from "prop-types";
import {Svg, G, Path} from "react-primitives-svg";
import Animated from "../Animated";
import View from "../View";

const ANIMATION_DELAY_IN_MS = 200;
const WIDTH_ANIMATION_DURATION_IN_MS = 400;
const SCALE_ANIMATION_DURATION_IN_MS = 300;

class Icon extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      maxWidth: new Animated.Value(0),
      scale: new Animated.Value(1),
    };
  }

  componentWillMount() {
    if (this.props.animated) {
      const animation = Animated.parallel([
        Animated.timing(this.state.maxWidth, {
          toValue: 1,
          delay: ANIMATION_DELAY_IN_MS,
          duration: WIDTH_ANIMATION_DURATION_IN_MS,
        }),
        Animated.sequence([
          Animated.timing(this.state.scale, {
            toValue: 1.2,
            delay: WIDTH_ANIMATION_DURATION_IN_MS - 100,
            duration: SCALE_ANIMATION_DURATION_IN_MS,
          }),
          Animated.timing(this.state.scale, {
            toValue: 1,
            duration: SCALE_ANIMATION_DURATION_IN_MS,
          }),
        ]),
      ]);
      if (process.env.NODE_ENV !== "test") {
        animation.start();
      }
    }
  }

  render() {
    const {fill, height, width, animated} = this.props;
    const viewStyle = {
      position: "relative",
      height,
      width,
    };
    const animatedViewStyle = {
      position: "absolute",
      overflow: "hidden",
      top: "50%",
      left: "50%",
      marginTop: (height / 2) * -1,
      marginLeft: (width / 2) * -1,
      width: this.state.maxWidth.interpolate({
        inputRange: [0, 1],
        outputRange: [0, width],
      }),
      transform: [
        {
          scale: this.state.scale.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
          }),
        },
      ],
    };
    return (
      <View style={animated && viewStyle}>
        <Animated.View style={animated && animatedViewStyle}>
          <Svg height={height} width={width} viewBox="0 0 214 168" version="1.1">
            <G strokeWidth="1">
              <G fill={fill} strokeWidth={0.01}>
                <Path d="M182.3855,6.3325 L71.7325,116.9865 L31.0795,76.3335 C23.9695,69.2235 12.4425,69.2235 5.3325,76.3335 C-1.7775,83.4435 -1.7775,94.9705 5.3325,102.0805 L45.9855,142.7325 L71.7325,168.4795 L97.4785,142.7325 L208.1325,32.0795 C215.2415,24.9695 215.2415,13.4425 208.1325,6.3325 C201.0225,-0.7775 189.4955,-0.7775 182.3855,6.3325 Z" />
              </G>
            </G>
          </Svg>
        </Animated.View>
      </View>
    );
  }
}

Icon.propTypes = {
  fill: PropTypes.string,
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  animated: PropTypes.bool,
};

Icon.defaultProps = {
  animated: false,
};

Icon.displayName = "Icons.CheckmarkAnimated";

export default Icon;
