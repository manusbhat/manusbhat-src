/**
 *  COPYRIGHT © 2022 MANU BHAT
 *  
 *  ALL RIGHTS RESERVED
 * 
 */


import ReactDOM from 'react-dom/client';

import { BrowserRouter, Routes, Route} from 'react-router-dom';

import Contact from './routes/contact/contact';
import Home from './routes/index/index';
import Experience from './routes/experience/experience';
import Personal from './routes/personal/personal';

import './framework/globals.css';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="experience" element={<Experience />} />
      <Route path="contact" element={<Contact />} />
      <Route path="personal" element={<Personal />} />
    </Routes>
</BrowserRouter>
);