import { useEffect } from "react";
import { notificationService } from "../services/notificationService";

export const useNotificationEventListener = () => {
  useEffect(() => {
    const unsubscribe = notificationService.listenForegroundEvents();
    return unsubscribe;
  }, []);
};
