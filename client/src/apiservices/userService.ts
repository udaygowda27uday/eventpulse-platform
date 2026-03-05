import api from "./axiosConfig";

export const registerUser = async (payload: any) => {
  const response = await api.post("/users/register", payload);
  return response.data;
};

export const loginUser = async (payload: any) => {
  const response = await api.post("/users/login", payload);
  return response.data;
};

export const logoutUser = async () => {
  const response = await api.post("/users/logout");
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get("/users/current-user");
  return response.data;
};

export const getAllUsers = async () => {
  const response = await api.get("/users/get-all-users");
  return response.data;
};

// Users update their OWN profile (name only — no ID in URL)
export const updateProfile = async (data: { name?: string; email?: string }) => {
  const response = await api.put("/users/update-profile", data);
  return response.data;
};

// Admin only — promote or demote another user's isAdmin status
export const updateUserRole = async (id: string, isAdmin: boolean) => {
  const response = await api.put(`/users/update-user-role/${id}`, { isAdmin });
  return response.data;
};

export const deleteUser = async (id: string) => {
  const response = await api.delete(`/users/delete-user/${id}`);
  return response.data;
};