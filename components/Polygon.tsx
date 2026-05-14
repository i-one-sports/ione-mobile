import React from "react";
import { ImageBackground, Text } from "react-native";

type PolygonProps = {
  teamCode: string;
  size?: number;
};

const Polygon: React.FC<PolygonProps> = ({ teamCode, size = 48 }) => {
  const imageSource = require("@/assets/images/polygon.png");
  return (
    <ImageBackground
      source={imageSource}
      resizeMode="contain"
      style={{
        width: size,
        height: size,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text
        style={{
          color: "#fff",
          fontWeight: "700",
          fontSize: size * 0.3,
          textShadowColor: "rgba(0,0,0,0.6)",
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 3,
        }}
      >
        {teamCode}
      </Text>
    </ImageBackground>
  );
};

export default Polygon;
