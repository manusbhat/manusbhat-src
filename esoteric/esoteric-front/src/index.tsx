/**
 *  COPYRIGHT © 2022 MANU BHAT
 *  
 *  ALL RIGHTS RESERVED
 * 
 */


import ReactDOM from 'react-dom/client';

import { BrowserRouter, Routes, Route} from 'react-router-dom';

import './framework/globals.css';
import Home from './routes/index/index';
import { Login } from './routes/auth/login-signup';
import Text from './routes/text/text';
import Sync from './routes/sync/sync';
import Tutoring from './routes/tutoring/tutoring';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/text" element={<Text />} />
      <Route path="/sync" element={<Sync />} />
      <Route path="/tutoring" element={<Tutoring />} />

      <Route path="/auth" element={<Login />} />
    </Routes>
</BrowserRouter>
);