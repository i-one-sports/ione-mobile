import type MaterialIcons from "@expo/vector-icons/MaterialIcons";
import type { ReactNode } from "react";

export interface SettingsHeaderProps {
  firstName: string;
  lastName: string;
  email: string;
  nickname?: string;
}

export interface SettingsRowProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  iconColor?: string;
  iconBg?: string;
  label: string;
  labelColor?: string;
  onPress?: () => void;
  rightElement?: ReactNode;
  showChevron?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
}

export interface SettingsSectionProps {
  title: string;
  children: ReactNode;
}
