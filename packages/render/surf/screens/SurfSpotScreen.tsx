import { Text, View, StyleSheet } from "react-native";
import React, { useLayoutEffect } from "react";

import MapView from "react-native-maps";
import i18next from "i18n";
import weatherTranslations from "integrations/weather/weatherI18n";
import { useFetchData } from "app/hooks";
import { useNavigation } from "@react-navigation/native";

import { WeatherDisplay } from "./WeatherDisplay";
import useSurfSpot from "../useSurfSpot";
import { modes, intervals } from "../config";
import ToggleButton from "./Buttons";
Object.keys(weatherTranslations).forEach((lang) => {
  const translations = weatherTranslations[lang].translation;
  i18next.addResourceBundle(lang, "translation", translations, true, true);
});

export function SurfSpotScreen({ route }) {
  const { id } = route.params;
  const navigation = useNavigation();

  const { mode, interval, handleModeChange, handleIntervalChange } =
    useSurfSpot();

  const { data, isLoading, error } = useFetchData(id);
  console.log("data", data);

  useLayoutEffect(() => {
    data?.title &&
      navigation.setOptions({
        headerTitle: `${data.title}`, // 动态设置标题
      });
  }, [navigation, data]);
  if (isLoading) {
    return <Text>loading</Text>;
  }
  if (data) {
    const { lat, lng, title } = data;

    return (
      <View style={styles.container}>
        <View style={styles.mapPlaceholder}>
          <MapView
            style={{
              width: "100%",
              height: 200,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#EDF2F7",
              borderRadius: 16,
              marginTop: 16,
            }}
            initialRegion={{
              latitude: lat,
              longitude: lng,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          />
        </View>

        <View style={styles.buttonContainer}>
          <View style={styles.intervalButtonGroup}>
            {intervals.map((intervalItem) => (
              <ToggleButton
                key={intervalItem.value}
                value={intervalItem.value}
                title={intervalItem.title}
                isActive={interval === intervalItem.value}
                onPress={handleIntervalChange}
              />
            ))}
          </View>

          <View style={styles.modeButtonGroup}>
            {modes.map((modeItem) => (
              <ToggleButton
                key={modeItem.value}
                value={modeItem.value}
                title={modeItem.title}
                isActive={mode === modeItem.value}
                onPress={handleModeChange}
              />
            ))}
          </View>
        </View>
        <WeatherDisplay lat={lat} lng={lng} mode={mode} interval={interval} />
      </View>
    );
  }
  return <Text>没有数据</Text>;
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  mapPlaceholder: {
    width: "100%",
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EDF2F7",
    borderRadius: 16,
    marginTop: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginTop: 16,
    marginBottom: 16,
  },
  intervalButtonGroup: {
    flexDirection: "row",
    flex: 0.2,
  },
  modeButtonGroup: {
    flexDirection: "row",
    flex: 0.6,
  },
});
