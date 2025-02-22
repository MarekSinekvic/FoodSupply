import './App.css';
import { redirect, Route, Routes, useNavigate } from 'react-router-dom';
import Order from './Pages/Order';
import Processing from './Pages/Processing';
import Login, { checkLogin, LoginFootnote, logout } from './Components/Login';
import { useEffect, useState } from 'react';
import System from './Pages/System';

function Logout() {
  const navigate = useNavigate();
  useEffect(()=>{logout();navigate('/')},[]);
  return <></>;
}
function App() {
  const navigate = useNavigate();
  const [loginModal, setLoginModal] = useState(false);

  useEffect(()=>{
      (async ()=>{
          if (!await checkLogin()) setLoginModal(true);
      })();
  },[]);
  
  return (
    <>
      {loginModal ? <Login open={loginModal} onLogin={()=>{setLoginModal(false)}}/> : (
        <>
          <Routes>
            <Route path="/" element={<Processing/>}></Route>
            <Route path="/order" element={<Order/>}></Route>
            <Route path="/logout" element={<Logout/>}></Route>
            <Route path="/system" element={<System/>}></Route>
          </Routes>
          <LoginFootnote/>
        </>
      )}
      
    </>
  );
}

export const EntryPoint = 'http://localhost:8000';
export default App;
