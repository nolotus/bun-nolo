import {useState, useEffect} from 'react';
import {readOwnData} from 'database/client/read';
import { useAppSelector } from "app/hooks";


export function useUserData(dataName) {
  const currentUser = useAppSelector((state) => state.user.currentUser);

  const [userData, setUserData] = useState(null);

  const fetchData = async () => {
    if (currentUser?.userId && dataName) {
      const result = await readOwnData(currentUser.userId, dataName, {isJSON: true});
      setUserData(result);
    }
  };

  useEffect(() => {
    currentUser && fetchData();
  }, [currentUser, dataName, fetchData, setUserData]);

  return userData;
}