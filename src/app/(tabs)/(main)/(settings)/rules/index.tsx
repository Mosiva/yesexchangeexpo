import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";

// Enable LayoutAnimation on Android
if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const RulesScreen = () => {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: t("faq.process"),
      answer: t("faq.processa"),
    },
  ];

  const toggleAnswer = (index) => {
    LayoutAnimation.easeInEaseOut();
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <ScrollView style={styles.container}>
      {faqs.map((faq, index) => (
        <View key={index} style={styles.faqBlock}>
          <TouchableOpacity onPress={() => toggleAnswer(index)}>
            <View style={styles.questionRow}>
              <Text style={styles.question}>{faq.question}</Text>
            </View>
          </TouchableOpacity>
          {openIndex === index && (
            <Text style={styles.answer}>{faq.answer}</Text>
          )}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  faqBlock: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  questionRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  question: {
    fontSize: 17,
    fontWeight: "600",
    color: "#DAA520",
    flexShrink: 1,
  },
  icon: {
    width: 30,
    height: 30,
    marginRight: 10,
    tintColor: "#D67A00", // optional: for styling
  },
  answer: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
    lineHeight: 20,
  },
});

export default RulesScreen;
