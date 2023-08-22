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

  const showNotification = (notificationConfig: NotificationProps) => {
    setNotification(notificationConfig);
    setTimeout(() => {
      closeNotification();
    }, 15000);
  };

  const closeNotification = () => {
    setNotification(undefined)
  }

  return (
    <NotificationContext.Provider value={showNotification}>
        {children}
      {notificationConfig && <Notification {...notificationConfig} onClose={closeNotification}/>}
    </NotificationContext.Provider>
  );
};