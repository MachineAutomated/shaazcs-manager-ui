import axios from "axios";
import { API_BASE_URL } from "../config";

export async function getCategories() {
    return axios.get(`${API_BASE_URL}/utils/categories`)
}