import api from "./api";

export async function getCategories() {
    return api.get("/utils/categories");
}

export async function createCategories(payload: Array<{ Name: string; Type: "IN" | "OUT" }>) {
    return api.post("/utils/categories", payload);
}