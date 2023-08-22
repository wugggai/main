import { NotificationProvider } from './Components/Notification/NotificationContext'
import MainView from './Main View/MainView'

import {BrowserRouter, Routes, Route, useParams, useSearchParams} from 'react-router-dom'

function App() {
  return <BrowserRouter>
    <NotificationProvider>
      <Routes>
          <Route path='/verification/token/:token' element={<GetVerificationPage />} />
          <Route path='/set_new_password' element={<GetSetNewPasswordPage />} />
          <Route path='/' element={<MainView />} />
      </Routes>
    </NotificationProvider>
  </BrowserRouter>
}

function GetVerificationPage(): JSX.Element {
  const { token } = useParams()
  return <MainView verificationToken={token} />
}

function GetSetNewPasswordPage(): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams()
  return <MainView resetPasswordToken={searchParams.get('token') || undefined} />
}

export default App;
