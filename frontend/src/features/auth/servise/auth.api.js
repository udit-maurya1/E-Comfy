import axios from "axios";

export const authAPI = axios.create({
  baseURL: "/api",
  withCredentials: true,
});
export const register = async ({
  email,
  contact,
  password,
  fullname,
  isSeller,
}) => {
  const response = await authAPI.post("/auth/register", {
    email,
    contact,
    password,
    fullname,
    isSeller,
  });
  return response.data;
};
export const login = async ({ email, password }) => {
  const response = await authAPI.post("/auth/login", {
    email,
    password,
  });
  return response.data;
};
export const logout = async () => {
  const response = await authAPI.post("/auth/logout");
  return response.data;
};
export const getCurrentUser = async()=>{
    const response = await authAPI.get("/auth/me");
    return response.data;
}
