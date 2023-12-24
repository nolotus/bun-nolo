// MessageItem.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";

const MessageItem = ({ item }) => (
	<View style={styles.message}>
		<Text style={styles.messageText}>{item.content}</Text>
	</View>
);

const styles = StyleSheet.create({
	message: {
		padding: 10,
		margin: 10,
		backgroundColor: "lightgrey",
		borderRadius: 20,
	},
	messageText: {
		color: "black",
	},
});

export default MessageItem;
