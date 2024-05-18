import { API_VERSION } from "database/config";
import addPrefixForEnv from "utils/urlConfig";
const signUpurl = `${API_VERSION}/users/signup`;

export const registerUser = async (user) => {
  const url = addPrefixForEnv(signUpurl);
  console.log("url", url);
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Registration failed:", error);
  }
};
