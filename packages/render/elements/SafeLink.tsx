import React, { useMemo } from "react";

const allowedSchemes = ["http:", "https:", "mailto:", "tel:"];

export const SafeLink = ({ attributes, children, href }) => {
	const safeHref = useMemo(() => {
		let parsedUrl = null;
		try {
			parsedUrl = new URL(href);
			// eslint-disable-next-line no-empty
		} catch {}
		if (parsedUrl && allowedSchemes.includes(parsedUrl.protocol)) {
			return parsedUrl.href;
		}
		return "about:blank";
	}, [href]);
	return (
		<a href={safeHref} {...attributes}>
			{children}
		</a>
	);
};
