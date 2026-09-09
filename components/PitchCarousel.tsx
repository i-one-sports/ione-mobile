import React, { useRef, useState } from "react";
import {
  View,
  FlatList,
  Dimensions,
  ViewToken,
  ImageBackground,
  Pressable,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { EvilIcons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");
const CARD_WIDTH = width - 48; // accounting for padding

export interface PitchData {
  id: string;
  name: string;
  location: string;
  image?: any;
  isBooked: boolean;
}

interface PitchCarouselProps {
  data: PitchData[];
  onSelect?: (item: PitchData) => void;
}

const PitchCarousel: React.FC<PitchCarouselProps> = ({ data, onSelect }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        setActiveIndex(viewableItems[0].index || 0);
      }
    },
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const handlePress = (item: PitchData) => {
    onSelect?.(item);
  };

  const renderItem = ({ item }: { item: PitchData }) => (
    <Pressable
      onPress={() => handlePress(item)}
      style={{ width: CARD_WIDTH, height: height * 0.2 }}
      className="rounded-[5px] overflow-hidden"
    >
      <ImageBackground
        source={
          item.image || {
            uri: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800",
          }
        }
        className="flex-1 justify-between p-6"
        resizeMode="cover"
      >
        <View className="absolute inset-0 bg-black/30" />

        {item.isBooked ? (
          <View className="self-start z-10">
            <ThemedText
              style={{ color: "white" }}
              className="text-xs font-medium"
            >
              All Match Time Slots Booked
            </ThemedText>
          </View>
        ) : null}

        <View className="z-10">
          <ThemedText
            style={{ color: "white" }}
            className="text-xl font-semibold mb-1"
          >
            {item.name}
          </ThemedText>
          <View className="flex-row items-center">
            <EvilIcons name="location" size={24} color="white" />
            <ThemedText
              style={{ color: "white" }}
              className="text-white font-semibold text-[8px]"
            >
              {item.location}
            </ThemedText>
          </View>
        </View>
      </ImageBackground>
    </Pressable>
  );

  return (
    <View>
      <FlatList
        ref={flatListRef}
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        snapToInterval={CARD_WIDTH + 16}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: 0 }}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />

      {/* Indicators */}
      <View className="flex-row items-center mt-4 justify-between">
        {data.map((_, index) => (
          <View
            key={index}
            className={`h-2 rounded-full ${
              index === activeIndex
                ? "w-2 bg-black dark:bg-white"
                : "w-2 bg-gray-300 dark:bg-gray-600"
            }`}
          />
        ))}
      </View>
    </View>
  );
};

export default PitchCarousel;
