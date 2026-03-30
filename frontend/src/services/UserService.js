import api from "./api";

export const getMyProfile = async () => {
  const res = await api.get("/api/common/me");
  return res.data;
};