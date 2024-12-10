import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "app/hooks";

import { defaultDisplayConfig } from "../config";
import { CELL_HEIGHT } from "./style";

export const SurfWeatherLabelCol = () => {
  const { t } = useTranslation();
  const surface2 = useAppSelector((state) => state.theme.surface2);
  const styles = StyleSheet.create({
    labelsContainer: {
      paddingTop: CELL_HEIGHT,
      backgroundColor: surface2,
    },
    label: {
      paddingHorizontal: 6,
      height: CELL_HEIGHT,
      justifyContent: "center",
      alignItems: "center",
    },
  });
  return (
    <View style={styles.labelsContainer}>
      {defaultDisplayConfig.map(
        (config) =>
          config.enabled && (
            <View style={styles.label}>
              <Text key={config.key}>{t(config.key)}</Text>
            </View>
          )
      )}
    </View>
  );
};
