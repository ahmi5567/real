import { create } from "zustand";
import useApiRequest from "../lib/apiRequest";
const useInitializeStore = (set) => {
  const apiRequest = useApiRequest();

  return {
    number: 0,
    fetch: async () => {
      const res = await apiRequest("/users/notification");
      set({ number: res.data });
    },
    decrease: () => {
      set((prev) => ({ number: prev.number - 1 }));
    },
    reset: () => {
      set({ number: 0 });
    },
  };
};

export const useNotificationStore = () => {
  return create(useInitializeStore);
};