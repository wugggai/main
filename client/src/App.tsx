import React from 'react';
import MainView from './Main View/MainView'

import {BrowserRouter, Routes, Route} from 'react-router-dom'

function App() {
  return <BrowserRouter>
    <Routes>
      <Route path='/' element={<MainView />} />
    </Routes>
  </BrowserRouter>
}

export default App;
