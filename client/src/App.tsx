import React from 'react';
import MainView from './Main View/MainView'

import {BrowserRouter, Routes, Route, useParams} from 'react-router-dom'
import Verification from './Login/Verification';

function App() {
  return <BrowserRouter>
    <Routes>
      <Route path='/verification/token/:token' element={<GetVerificationPage />} />
      <Route path='/' element={<MainView />} />
    </Routes>
  </BrowserRouter>
}

function GetVerificationPage(): JSX.Element {
  const { token } = useParams()
  return <Verification token={token || ''} />
}

export default App;
