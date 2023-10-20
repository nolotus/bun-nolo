import {useState, useEffect, useContext} from 'react';
import {readOwnData} from 'database/client/read';
import {UserContext} from '../UserContext';

export function useUserData(dataName) {
  const {currentUser} = useContext(UserContext);
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