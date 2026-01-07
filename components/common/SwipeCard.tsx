import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";

type SwipeCardProps = {
    children: React.ReactNode;
    onEdit?: () => void;
    onView?: () => void;
    disableEdit?: boolean;
};

export default function SwipeCard({
    children,
    onEdit,
    onView,
    disableEdit = false,
}: SwipeCardProps) {
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
            renderLeftActions={disableEdit ? undefined : renderLeftActions}
            renderRightActions={renderRightActions}
            onSwipeableLeftOpen={disableEdit ? undefined : onEdit}
            onSwipeableRightOpen={onView}
        >
            {children}
        </Swipeable>
    );
}

const styles = StyleSheet.create({
    leftAction: {
        backgroundColor: "#1C95F9",
        justifyContent: "center",
        alignItems: "center",
        width: 60,         // width of swipe action
        alignSelf: "stretch", // take full height of the card
    },
    rightAction: {
        backgroundColor: "#6C35D1",
        justifyContent: "center",
        alignItems: "center",
        width: 60,          // width of swipe action
        alignSelf: "stretch", // take full height of the card
    },
    actionText: {
        color: "#fff",
        fontSize: 12,
        marginTop: 4,
        fontWeight: "600",
    },
});

