import React, { useEffect, useState } from 'react'
import Navbar from './components/Navbar/Navbar'
import {Route, Router, Routes} from 'react-router-dom'
import Header from './components/Header/Header'
import Home from './pages/Home/Home'
import AboutMe from './pages/AboutUs/AboutMe'
import Gallery from './pages/Gallery/Gallery'
import Contact from './pages/Contact/Contact'
import LoginPopup from './components/LoginPopup/LoginPopup'
import StoreContextProvider from './context/StoreContext'
import Album from './pages/Albums/Album'
import Booking from './pages/Booking/Booking'
import Events from './pages/Events/Events'
import AdminDashboard from './pages/AdminDashboard/AdminDashboard'
import UserView from './pages/AdminView/UserView/UserView'
import Packages from './pages/Packages/Packages'

const App = () => {

  const [showLogin,setShowLogin] = useState(false)
  return (
    <StoreContextProvider>
    <>
    {showLogin?<LoginPopup setShowLogin={setShowLogin}/>:<></>}
      <div className='app'>
      <div>
            <Navbar setShowLogin={setShowLogin} />
      </div>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/about' element={<AboutMe />} />
        <Route path='/gallery' element={<Gallery />} />
        <Route path='/contact' element={<Contact />} />
        <Route path="/album/:albumName" element={<Album />} />
        <Route path="/booking" element={<Booking setShowLogin={setShowLogin} />} />
        <Route path="/events" element={<Events />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/userView" element={<UserView />} />
        <Route path='/packages' element={<Packages />} />
      </Routes>
    </div>
    </>
    </StoreContextProvider>
  )
}

export default App
