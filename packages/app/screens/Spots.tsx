import React, { useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { nolotusId } from "core/init";
import { DataType } from "create/types";
import { Loader } from "render/ui/screens/Loader";
import Card from "./Card";
import { useAppDispatch } from "../hooks";
import { useQueryData } from "app/hooks/useQueryData";
import { layout } from "render/styles/layout";

export function SpotsScreen() {
  const dispath = useAppDispatch();

  const options = {
    isJSON: true,
    condition: {
      type: DataType.SurfSpot,
    },
    limit: 20,
  };
  const queryConfig = {
    queryUserId: nolotusId,
    options,
  };

  const { data, isLoading, isSuccess } = useQueryData(queryConfig);

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
