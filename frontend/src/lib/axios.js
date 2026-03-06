import axios from "axios";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL, // Set the base URL for all requests
    withCredentials: true //by adding this feild broswser will send cookies to server automatically with every request
});

export default axiosInstance;