import { useEffect } from "react";
import tasksService from "./services/tasksService";

tasksService.listenBackgroundEvents();

const useTaskNotificationEvents = () => {
  useEffect(() => {
    const unsubscribe = tasksService.listenForegroundEvents();
    return unsubscribe;
  }, []);
};

export default useTaskNotificationEvents;
