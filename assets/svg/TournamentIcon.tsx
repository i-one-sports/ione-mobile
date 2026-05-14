import React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

export default function TournamentIcon(props: SvgProps) {
  return (
    <Svg {...props} width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        d="M0 0V2H5V6H0V8H5C6.11 8 7 7.11 7 6V5H12V15H7V14C7 12.89 6.11 12 5 12H0V14H5V18H0V20H5C6.11 20 7 19.11 7 18V17H12C13.11 17 14 16.11 14 15V11H20V9H14V5C14 3.89 13.11 3 12 3H7V2C7 0.89 6.11 0 5 0H0Z"
        fill={props.color}
      />
    </Svg>
  );
}
