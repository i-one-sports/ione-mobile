import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
const ChevronRight = (props: SvgProps) => (
  <Svg {...props} width={15} height={15} fill="none">
    <Path
      d="M6.25 4.375L7.35186 5.46707C8.23056 6.33797 8.66992 6.77342 8.73757 7.30417C8.75414 7.43421 8.75414 7.56579 8.73757 7.69583C8.66992 8.22658 8.23056 8.66203 7.35186 9.53293L6.25 10.625"
      stroke="#00000033"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </Svg>
);
export default ChevronRight;
