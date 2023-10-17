import { API_ENDPOINTS } from "../config";

  export async function readData(dataId:string){
    let validUrl = `https://nolotus.com${API_ENDPOINTS.DATABASE}/read/${dataId}`;
    console.log('validUrl',validUrl)
    return await fetch(validUrl).then(res => {
      return res.json();
    });
  }