export function transformStyles(rnStyles) {
	return Object.keys(rnStyles).reduce((acc, key) => {
		const rnStyle = rnStyles[key];
		let webStyle = { ...rnStyle };

		// React Native的paddingVertical等同于CSS中的paddingTop + paddingBottom
		if (rnStyle.paddingVertical !== undefined) {
			webStyle.paddingTop = rnStyle.paddingVertical;
			webStyle.paddingBottom = rnStyle.paddingVertical;
			delete webStyle.paddingVertical; // 从原样式中删除不被识别的属性
		}

		// React Native的paddingHorizontal等同于CSS中的paddingLeft + paddingRight
		if (rnStyle.paddingHorizontal !== undefined) {
			webStyle.paddingLeft = rnStyle.paddingHorizontal;
			webStyle.paddingRight = rnStyle.paddingHorizontal;
			delete webStyle.paddingHorizontal;
		}

		// 将React Native的elevation转换为CSS boxShadow
		if (rnStyle.elevation !== undefined) {
			const elevation = rnStyle.elevation;
			webStyle.boxShadow = `0px ${elevation}px ${
				elevation * 1.5
			}px rgba(0, 0, 0, ${Math.min(0.04 * elevation, 1)})`;
			delete webStyle.elevation;
		}

		// 将flex属性转换为flexGrow，以确保行为一致
		if (rnStyle.flex !== undefined) {
			webStyle.flexGrow = rnStyle.flex;
			delete webStyle.flex;
		}
		if (rnStyle.flexDirection) {
			webStyle.display = "flex"; // 添加display: flex
		}

		acc[key] = webStyle;
		return acc;
	}, {});
}
export function combineStyles(styleArray) {
	return styleArray.reduce((acc, style) => {
		if (style) {
			return { ...acc, ...style };
		}
		return acc;
	}, {});
}
