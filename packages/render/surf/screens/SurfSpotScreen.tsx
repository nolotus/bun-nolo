import { Button, Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { useGetEntryQuery } from "database/services";
import WeatherDisplay from "./WeatherDisplay";
import useSurfSpot from "../useSurfSpot";
import { modes, intervals } from "../config";
import { ModeButton, IntervalButton } from "./Buttons";
import { styles as extraStyles } from "../styles/container";
import MapView from "react-native-maps";
export function SurfSpotScreen({ id }) {
	const { mode, interval, handleModeChange, handleIntervalChange } =
		useSurfSpot();

	const { data, isLoading } = useGetEntryQuery({
		entryId: id,
		domain: "nolotus.com",
	});

	if (isLoading) {
		return <Text>loading</Text>;
	}
	if (data) {
		const { lat, lng, title } = data;

		return (
			<View style={styles.container}>
				<Text style={styles.title}>{title}</Text>
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
							<IntervalButton
								key={intervalItem.value}
								title={intervalItem.title}
								isActive={interval === intervalItem.value}
								onIntervalChange={() =>
									handleIntervalChange(intervalItem.value)
								}
							/>
						))}
					</View>
					<View style={styles.modeButtonGroup}>
						{modes.map((modeItem) => (
							<ModeButton
								key={modeItem.value}
								modeValue={modeItem.value}
								title={modeItem.title}
								isActive={mode === modeItem.value}
								onModeChange={handleModeChange}
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
	title: {
		fontSize: 26,
		fontWeight: "bold",
		color: "#333",
		paddingTop: 10,
		textAlign: "center",
	},
	...extraStyles,
});
