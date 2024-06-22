// Avatar.js
import React from "react";
import { Image, StyleSheet } from "react-native";

const Avatar = ({ uri }) => {
	return <Image source={{ uri }} style={styles.avatar} />;
};

const styles = StyleSheet.create({
	avatar: {
		width: 50,
		height: 50,
		borderRadius: 25,
		marginRight: 8,
	},
});

export default Avatar;
