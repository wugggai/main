import React, { Fragment } from 'react';
import MainView from './Main View/MainView'

import {BrowserRouter, Routes, Route, useParams, useSearchParams} from 'react-router-dom'
import Verification from './Login/Verification';

function App() {
  return <BrowserRouter>
    <Routes>
      <Route path='/verification/token/:token' element={<GetVerificationPage />} />
      <Route path='/set_new_password' element={<GetSetNewPasswordPage />} />
      <Route path='/' element={<MainView />} />
    </Routes>
  </BrowserRouter>
}

function GetVerificationPage(): JSX.Element {
  const { token } = useParams()
  return <Verification token={token || ''} />
}

function GetSetNewPasswordPage(): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams()
  return <MainView resetPasswordToken={searchParams.get('token') || undefined} />
}

export default App;
