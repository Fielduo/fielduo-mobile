import React, { useRef } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";

type SwipeCardProps = {
  children: React.ReactNode;
  onEdit?: () => void;
  onView?: () => void;
  disableEdit?: boolean;
  onOpen?: (ref: Swipeable) => void;
};

export default function SwipeCard({
  children,
  onEdit,
  onView,
  disableEdit = false,
  onOpen,
}: SwipeCardProps) {
  const swipeRef = useRef<Swipeable>(null);

  const handleSwipeOpen = (direction: "left" | "right") => {
    if (swipeRef.current) {
      onOpen?.(swipeRef.current);
    }

    if (direction === "left" && !disableEdit) {
      onEdit?.();
    }

    if (direction === "right") {
      onView?.();
    }
  };

  const renderLeftActions = () =>
    disableEdit ? null : (
      <View style={styles.leftAction}>
        <Ionicons name="create-outline" size={22} color="#fff" />
      </View>
    );

  const renderRightActions = () => (
    <View style={styles.rightAction}>
      <Ionicons name="eye-outline" size={22} color="#fff" />
    </View>
  );

  return (
    <Swipeable
      ref={swipeRef}
      renderLeftActions={disableEdit ? undefined : renderLeftActions}
      renderRightActions={renderRightActions}
      onSwipeableOpen={handleSwipeOpen}
    >
      {/* 👇 Normal tap opens view */}
      <Pressable onPress={onView}>
        {children}
      </Pressable>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  leftAction: {
    backgroundColor: "#1C95F9",
    justifyContent: "center",
    alignItems: "center",
    width: 60,
    alignSelf: "stretch",
  },
  rightAction: {
    backgroundColor: "#6C35D1",
    justifyContent: "center",
    alignItems: "center",
    width: 60,
    alignSelf: "stretch",
  },
});
