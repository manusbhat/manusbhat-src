/**
 *  COPYRIGHT © 2022 MANU BHAT
 *  
 *  ALL RIGHTS RESERVED
 * 
 */


import ReactDOM from 'react-dom/client';

import { BrowserRouter, Routes, Route } from 'react-router-dom';

import './framework/globals.css';
import Home from './routes/index/index';
import { Login } from './routes/auth/login-signup';
import Text from './routes/text/text';
import Sync from './routes/sync/sync';
import Tutoring from './routes/tutoring/tutoring';
import Admin from './routes/admin/admin';
import { AppStateContext, EsotericState, UserHandle } from './framework/proxy';
import { PropsWithChildren, useState } from 'react';

function Provider(props: PropsWithChildren<{}>) {
  const storage = localStorage.getItem('user_handle');
  const refresh: UserHandle | null = storage ? (JSON.parse(storage) as UserHandle) : null;
  const [user, setUser] = useState<EsotericState>({ user: refresh });

  return (
    <AppStateContext.Provider value={[user.user, (user: UserHandle | null) => {
      setUser({ user: user });
      localStorage.setItem('user_handle', JSON.stringify(user));
      console.log("Storage updated", JSON.stringify(user));
    }]}>
      {props.children}
    </AppStateContext.Provider>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <Provider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/admin" element={<Admin />} />

        <Route path="/text" element={<Text />} />
        <Route path="/sync" element={<Sync />} />
        <Route path="/tutoring" element={<Tutoring />} />

        <Route path="/auth" element={<Login />} />
      </Routes>
    </BrowserRouter>
  </Provider>
);