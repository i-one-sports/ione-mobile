import React from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";

function BracketBox({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View
      style={[
        {
          position: "absolute",
          zIndex: 2,
          width: 34,
          height: 34,
          backgroundColor: "#D9D9D9",
        },
        style,
      ]}
    />
  );
}

function BracketLine({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View
      style={[
        {
          position: "absolute",
          zIndex: 1,
          backgroundColor: "#1C1C1C",
        },
        style,
      ]}
    />
  );
}

export default function BracketDiagram() {
  return (
    <View style={{ width: 350, height: 230, position: "relative" }}>
      {[0, 52, 126, 178].map((top) => (
        <BracketBox key={`left-box-${top}`} style={{ left: 0, top }} />
      ))}

      {[0, 52, 126, 178].map((top) => (
        <BracketBox key={`right-box-${top}`} style={{ left: 316, top }} />
      ))}

      <BracketBox style={{ left: 62, top: 26 }} />
      <BracketBox style={{ left: 62, top: 152 }} />
      <BracketBox style={{ left: 121, top: 96 }} />
      <BracketBox style={{ left: 195, top: 96 }} />
      <BracketBox style={{ left: 158, top: 58 }} />
      <BracketBox style={{ left: 254, top: 26 }} />
      <BracketBox style={{ left: 254, top: 152 }} />

      {[17, 69, 143, 195].map((top) => (
        <BracketLine
          key={`left-seed-line-${top}`}
          style={{
            left: 34,
            top,
            width: 20,
            height: 2,
          }}
        />
      ))}

      <BracketLine style={{ left: 54, top: 17, width: 2, height: 54 }} />
      <BracketLine style={{ left: 54, top: 44, width: 8, height: 2 }} />
      <BracketLine style={{ left: 54, top: 143, width: 2, height: 54 }} />
      <BracketLine style={{ left: 54, top: 170, width: 8, height: 2 }} />

      <BracketLine style={{ left: 96, top: 43, width: 18, height: 2 }} />
      <BracketLine style={{ left: 96, top: 169, width: 18, height: 2 }} />
      <BracketLine style={{ left: 114, top: 43, width: 2, height: 128 }} />
      <BracketLine style={{ left: 114, top: 113, width: 7, height: 2 }} />

      <BracketLine style={{ left: 155, top: 113, width: 40, height: 2 }} />
      <BracketLine style={{ left: 175, top: 92, width: 2, height: 21 }} />

      <BracketLine style={{ left: 229, top: 113, width: 7, height: 2 }} />
      <BracketLine style={{ left: 236, top: 43, width: 2, height: 128 }} />
      <BracketLine style={{ left: 238, top: 43, width: 16, height: 2 }} />
      <BracketLine style={{ left: 238, top: 169, width: 16, height: 2 }} />

      {[17, 69, 143, 195].map((top) => (
        <BracketLine
          key={`right-seed-line-${top}`}
          style={{
            left: 302,
            top,
            width: 14,
            height: 2,
          }}
        />
      ))}

      <BracketLine style={{ left: 302, top: 17, width: 2, height: 54 }} />
      <BracketLine style={{ left: 296, top: 44, width: 8, height: 2 }} />
      <BracketLine style={{ left: 302, top: 143, width: 2, height: 54 }} />
      <BracketLine style={{ left: 296, top: 170, width: 8, height: 2 }} />
    </View>
  );
}
