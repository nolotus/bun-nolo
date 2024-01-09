import { buildURL } from "app/request";
import { API_ENDPOINTS } from "database/config";

export const queryUser = async (limit, offset?, domain = "nolotus.com") => {
	const url = buildURL(
		domain,
		`${API_ENDPOINTS.USERS}?limit=${limit}&offset=${offset}`,
	);

	const response = await fetch(url);
	if (response.ok) {
		const data = await response.json();
		return data;
	}
	throw new Error("Failed to fetch data");
};
