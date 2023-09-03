import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Chat from './components/pages/chat' // Import the Chat component
import './App.css'
import LoginPage from './components/pages/LoginPage'
import RegisterPage from './components/pages/RegisterPage'
import ForgetPasswordPage from './components/pages/ForgetPasswordPage'
import HomePage from './components/pages/HomePage'
import FacebookPageIntegrationDashboard from './components/pages/DashBoard'

export default function App() {
  useEffect(() => {
    // Initialize the Facebook SDK
    try {
      window.fbAsyncInit = function () {
        window.FB.init({
          appId: '618455903770825', // Your Facebook App ID
          cookie: true,
          xfbml: true,
          version: 'v11.0',
        })
        window.FB.AppEvents.logPageView()
      }

      // Load the Facebook SDK script
      ;(function (d, s, id) {
        var js,
          fjs = d.getElementsByTagName(s)[0]
        if (d.getElementById(id)) return
        js = d.createElement(s)
        js.id = id
        js.src = 'https://connect.facebook.net/en_US/sdk.js'
        fjs.parentNode.insertBefore(js, fjs)
      })(document, 'script', 'facebook-jssdk')
    } catch (error) {
      console.error('Error initializing Facebook SDK:', error)
    }
  }, [])

  return (
    <Router>
      <Routes>
        <Route exact path='/' component={LoginPage} />
        <Route path='/register' component={RegisterPage} />
        <Route path='/dashBoard' component={FacebookPageIntegrationDashboard} />
        <Route path='/forget-password' component={ForgetPasswordPage} />
        <Route path='/home' component={HomePage} />
        <Route path='/chat' component={Chat} /> // New route for chat
      </Routes>
    </Router>
  )
}
