import { useAuth } from "app/hooks";
import { readOwnData } from "database/client/read";
import { useState, useEffect } from "react";

export function useUserData(dataName: string) {
  const auth = useAuth();
  const [userData, setUserData] = useState(null);

  const fetchData = async () => {
    if (auth.user?.userId && dataName) {
      console.log("userId", auth.user?.userId);
      const result = await readOwnData(auth.user.userId, dataName, {
        isJSON: true,
      });
      setUserData(result);
    }
  };

  useEffect(() => {
    auth.user && fetchData();
  }, [auth.user, dataName, fetchData, setUserData]);

  return userData;
}
