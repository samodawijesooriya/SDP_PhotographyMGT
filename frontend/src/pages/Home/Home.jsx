import React from 'react'
import './Home.css'
import Header from '../../components/Header/Header'
import Navbar from '../../components/Navbar/Navbar'
import Portfolio from '../../components/Portfoliio/Portfolio'
import Footer from '../../components/Footer/Footer'

const Home = () => {
  return (
    <div>
      <Header />
      <Portfolio/>
      <Footer />
    </div>
  )
}

export default Home