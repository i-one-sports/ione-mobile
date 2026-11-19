import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getSessionsByLocation } from "@/api/sessions";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  bookedRanges,
  DAY_MINUTES,
  locationDayKey,
  nowOn,
  pitchWindow,
  toHHMM,
  todayKey,
} from "@/utils/pitchSlots";

interface Props {
  locationId: string;
  /** "YYYY-MM-DD"; defaults to today. */
  date?: string;
  /** "HH:mm"; missing means open all day. */
  openingHour?: string;
  closingHour?: string;
  /** Tap a free period to use its start time ("HH:mm"). */
  onPickTime?: (time: string) => void;
  /** Change it to reload (e.g. pull to refresh). */
  refreshKey?: number;
  /** Set when the parent already loads this day's bookings. */
  skipFetch?: boolean;
}

// One day's bookings at a pitch, as booked and free periods from now (on
// today) or opening, until closing. Bookings show only as "Booked" — other
// groups' details stay private.
export default function PitchDayTimeline({
  locationId,
  date,
  openingHour,
  closingHour,
  onPickTime,
  refreshKey = 0,
  skipFetch = false,
}: Props) {
  const day = date ?? todayKey();
  const isToday = day === todayKey();
  const isDark = useColorScheme() === "dark";
  const dispatch = useAppDispatch();
  const key = locationDayKey(locationId, day);
  const sessions = useAppSelector(
    (state) => state.sessions.locationSessionsByDay[key],
  );
  const loading = useAppSelector(
    (state) => state.sessions.loadingLocationDays[key],
  );

  useEffect(() => {
    if (locationId && !skipFetch)
      dispatch(getSessionsByLocation({ locationId, date: day }));
  }, [dispatch, locationId, day, refreshKey, skipFetch]);

  const accent = isDark ? "#00FF94" : "#00A85A";
  const mutedColor = isDark ? "#9BA1A6" : "#6D717F";
  const textColor = isDark ? "#fff" : "#111";
  const rowBg = isDark ? "#0D1F17" : "#EDFFF8";
  const bookedBg = isDark ? "#1a1a1a" : "#F1F1F1";

  const { open, close } = pitchWindow(openingHour, closingHour);
  const nowExact = nowOn(day);
  // From now (rounded down to 15 min) on today, else from opening.
  const from = Math.max(
    open,
    nowExact == null ? 0 : Math.floor(nowExact / 15) * 15,
  );

  const booked = bookedRanges(sessions ?? [], day).filter(
    (b) => Math.min(b.end, close) > Math.max(b.start, from),
  );

  // Fill the gaps between bookings with "free". A booked period keeps its
  // real start, so one already running reads "06:30 – 10:30 · In progress".
  const periods: { start: number; end: number; booked: boolean }[] = [];
  let cursor = from;
  for (const b of booked) {
    if (b.start > cursor)
      periods.push({ start: cursor, end: b.start, booked: false });
    periods.push({ start: b.start, end: b.end, booked: true });
    cursor = Math.max(cursor, b.end);
  }
  if (cursor < close)
    periods.push({ start: cursor, end: close, booked: false });

  if (loading && !sessions) {
    return <ActivityIndicator color={accent} style={{ paddingVertical: 20 }} />;
  }

  if (from >= close) {
    return (
      <Text style={{ color: mutedColor, fontSize: 13 }}>
        {isToday
          ? "This pitch is closed for the rest of today."
          : "This pitch is closed that day."}
      </Text>
    );
  }

  return (
    <View style={{ gap: 8 }}>
      <Text style={{ color: mutedColor, fontSize: 12 }}>
        {openingHour && closingHour
          ? `Open ${openingHour} – ${closingHour}`
          : "Open all day"}
        {booked.length === 0
          ? isToday
            ? " · No bookings yet today"
            : " · No bookings yet"
          : ""}
      </Text>
      {periods.map((p) => (
        <View
          key={`${p.start}-${p.end}`}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: p.booked ? bookedBg : rowBg,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 10,
            borderLeftWidth: 4,
            borderLeftColor: p.booked ? (isDark ? "#444" : "#BDBDBD") : accent,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons
              name={
                p.booked ? "lock-closed-outline" : "checkmark-circle-outline"
              }
              size={16}
              color={p.booked ? mutedColor : accent}
            />
            <Text style={{ color: textColor, fontSize: 14, fontWeight: "600" }}>
              {`${toHHMM(p.start)} – ${p.end >= DAY_MINUTES ? "24:00" : toHHMM(p.end)}`}
            </Text>
            <Text style={{ color: mutedColor, fontSize: 13 }}>
              {p.booked
                ? nowExact != null && p.start <= nowExact
                  ? "Booked · In progress"
                  : "Booked"
                : "Free"}
            </Text>
          </View>
          {!p.booked && onPickTime && (
            <TouchableOpacity
              onPress={() => onPickTime(toHHMM(p.start))}
              hitSlop={8}
            >
              <Text style={{ color: accent, fontSize: 13, fontWeight: "700" }}>
                Use {toHHMM(p.start)}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </View>
  );
}
