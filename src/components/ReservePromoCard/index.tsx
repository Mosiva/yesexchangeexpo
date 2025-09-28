// components/ReservePromoCard.tsx
import React from "react";
import {
    Image,
    ImageSourcePropType,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type Props = {
  onPress: () => void;
  title?: string;
  ctaText?: string;
  photo?: ImageSourcePropType;
};

export default function ReservePromoCard({
  onPress,
  title = "Бронирование\nкурса/суммы",
  ctaText = "Забронировать",
  photo = require("../../../assets/images/team.png"),
}: Props) {
  // Slightly smaller image on Android
  const IMG_PCT = Platform.select({ ios: "54%", android: "50%" })!;
  // How wide the dark left side is
  const LEFT_PCT = Platform.select({ ios: "50%", android: "50%" })!;
  // Diagonal thickness
  const TRI_W = 34;

  return (
    <View style={styles.card}>
      {/* Right image */}
      <Image
        source={photo}
        style={[styles.photo, { width: IMG_PCT as any }]}
        resizeMode="cover"
      />

      {/* Left dark block (percentage width) */}
      <View style={[styles.leftWrap, { width: LEFT_PCT as any }]}>
        {/* diagonal made with a triangle; sits at the right edge of the dark block */}
        <View
          style={[
            styles.triangle,
            {
              borderLeftWidth: TRI_W,
              // was: borderTopWidth: CARD_H,
              borderBottomWidth: CARD_H, // ⟵ flip the diagonal
              right: -TRI_W,
            },
          ]}
        />
      </View>

      {/* Content on top */}
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>

        <TouchableOpacity
          style={styles.cta}
          onPress={onPress}
          activeOpacity={0.9}
        >
          <Text style={styles.ctaText}>{ctaText}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const CARD_H = 175;
const R = 10;
const DARK = "#2B2B2B";
const ORANGE = "#F58220";

const styles = StyleSheet.create({
  card: {
    height: CARD_H,
    borderRadius: R,
    overflow: "hidden",
    backgroundColor: DARK, // base color = dark; image covers right side
  },

  photo: {
    position: "absolute",
    height: 175,
    right: 0,
    top: 0,
    bottom: 0,
  },

  // dark left side + anchor for the triangle
  leftWrap: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: DARK,
  },

  // CSS-triangle diagonal (Android-friendly)
  triangle: {
    position: "absolute",
    top: 0,
    width: 0,
    height: 0,
    borderLeftColor: DARK, // visible wedge color
    // was: borderTopColor: "transparent",
    borderBottomColor: "transparent", // ⟵ use bottom instead of top
  },

  // text & button
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    justifyContent: "space-between",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "400",
    lineHeight: 34,
  },
  cta: {
    backgroundColor: ORANGE,
    height: 40,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  ctaText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
});
