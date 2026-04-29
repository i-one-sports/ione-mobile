import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

export default function OpenIcon({ stroke = "#000", ...props }: SvgProps) {
  return (
    <Svg width={12} height={6} fill="none" {...props}>
      <Path
        stroke={stroke}
        strokeLinecap="round"
        strokeWidth={1.5}
        d="m11.166.75-1.82 1.837C7.894 4.05 7.169 4.783 6.284 4.896a2.582 2.582 0 0 1-.653 0c-.884-.113-1.61-.845-3.062-2.31L.75.75"
      />
    </Svg>
  );
}
