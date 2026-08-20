import React, { useRef, useState } from "react";
import {
  View,
  FlatList,
  Dimensions,
  ViewToken,
  ImageBackground,
  Pressable,
  Modal,
  Text,
  TouchableOpacity,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { EvilIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { useAppDispatch } from "@/redux/store";
import { startSession } from "@/api/sessions";
import Loader from "./loader";

const { width, height } = Dimensions.get("window");
const CARD_WIDTH = width - 70; // accounting for padding

interface PitchData {
  id: string;
  name: string;
  location: string;
  image?: any;
  isBooked: boolean;
}

interface PitchCarouselProps {
  data: PitchData[];
}

const PitchCarousel: React.FC<PitchCarouselProps> = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedItem, setSelectedItem] = useState<PitchData | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();

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
  const [loadingId, setLoadingId] = useState(false);
  const dispatch = useAppDispatch();

  const handleStartSession = (locationId: string) => {
    setLoadingId(true);
    dispatch(startSession({ locationId }))
      .unwrap()
      .then((response: any) => {
        setLoadingId(false);
        console.log("Session started:", response);
        Toast.show({
          type: "success",
          props: {
            title: "Success",
            message: response.message || "Session started successfully",
          },
        });
        router.push(`/screens/newsession?locationId=${response._id}`);
      })
      .catch((err: any) => {
        setLoadingId(false);
        console.log("Error starting session:", err);
        const message =
          err?.msg?.message || err?.msg || "Failed to start session";
        Toast.show({
          type: "error",
          props: {
            title: "Error",
            message,
          },
        });
      });
  };

  const handleCreateTournaments = (locationId: string) => {
    router.push({
      pathname: "/screens/tournamentform",
      params: {
        locationId,
      },
    });
  };

  const handlePress = (item: PitchData) => {
    setSelectedItem(item);
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
      <View className="flex-row justify-center items-center mt-4 gap-2">
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
      <Loader visible={loadingId} />
      <Modal
        visible={!!selectedItem}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedItem(null)}
      >
        <Pressable
          className="flex-1 bg-black/40 justify-center px-8"
          onPress={() => setSelectedItem(null)}
        >
          <Pressable
            className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6"
            onPress={() => {}}
          >
            <ThemedText className="text-lg font-bold mb-1">
              {selectedItem?.name}
            </ThemedText>
            <ThemedText className="text-sm mb-5 text-gray-500 dark:text-gray-400">
              What would you like to do?
            </ThemedText>
            <TouchableOpacity
              onPress={() => {
                const item = selectedItem;
                setSelectedItem(null);
                if (item) handleStartSession(item.id);
              }}
              className="bg-[#67F095] rounded-xl py-3.5 items-center mb-2.5"
            >
              <Text className="text-[#fff] text-[15px] font-semibold">
                Create Session
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                const item = selectedItem;
                setSelectedItem(null);
                if (item) handleCreateTournaments(item.id);
              }}
              className="rounded-xl py-3.5 items-center border border-[#e5e5e5] dark:border-[#67F095]"
            >
              <ThemedText className="text-[15px] font-semibold">
                Create Tournament
              </ThemedText>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default PitchCarousel;
