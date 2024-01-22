// axios.js
import axios from "axios";

axios.defaults.headers.common["Accept-Encoding"] = "gzip";

export default axios;
