import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Loader } from "render/ui/screens/Loader";
import Card from "./Card";
import { layout } from "render/styles/layout";

export function SpotsScreen() {
  const data = [];
  const isLoading = false;
  if (isLoading) {
    return <Loader />;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>浪点</Text>
      <View style={styles.cardContainer}>
        {data?.map((item) => {
          return (
            <Card
              key={item.id}
              id={item.id}
              title={item.title}
              userName={item.creator}
              imageUri="https://via.placeholder.com/150"
              avatarUri="https://via.placeholder.com/50x50"
            />
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f9f9f9",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 16,
  },
  cardContainer: {
    flexDirection: "row",
    ...layout.flexWrap,
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
});
