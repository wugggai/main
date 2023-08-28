import { ReactNode, createContext, useContext, useState } from 'react';
import Notification, { NotificationProps } from './Notification';

const NotificationContext = createContext((_: NotificationProps) => {});

export const useNotification = () => {
  return useContext(NotificationContext);
};

interface Props {
    children: React.ReactElement | null
}

export function NotificationProvider({ children }: Props) {
  const [notificationConfig, setNotification] = useState<NotificationProps | undefined>(undefined);
  const [timeout, updateTimeout] = useState<ReturnType<typeof setTimeout> | undefined>(undefined);

  const showNotification = (notificationConfig: NotificationProps) => {
    setNotification(notificationConfig);
    if (timeout) {
      clearTimeout(timeout)
    }
    updateTimeout(
      setTimeout(closeNotification, 15000)
    );
  };

  const closeNotification = () => {
    let newNotification = Object.assign({}, notificationConfig)
    newNotification.show = false
    setNotification(newNotification)
  }

  return (
    <NotificationContext.Provider value={showNotification}>
        {children}
      {notificationConfig && <Notification {...notificationConfig} onClose={closeNotification}/>}
    </NotificationContext.Provider>
  );
};