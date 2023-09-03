import React from 'react'
import { Link, useHistory } from 'react-router-dom'
import { FacebookLoginButton } from 'react-social-login-buttons'
import { LoginSocialFacebook } from 'reactjs-social-login'
import '../../App.css'

export default function SignInPage() {
  const history = useHistory()

  function goToChat() {
    history.push('/chat') // Assuming '/chat' is the route for your chat page.
  }

  return (
    <div className='text-center m-auto'>
      <div className='login-card'>
        <h2 style={{ color: 'white' }}>Sign in</h2>
        <form action='/home'>
          <p>
            <label style={{ padding: '0 9px', color: 'white' }}>Email</label>
            <br />
            <input type='text' name='email' required />
          </p>
          <p>
            <label style={{ padding: '0 9px', color: 'white' }}>
              {' '}
              Password
            </label>
            <br />
            <input type='password' name='password' required />
          </p>
          <p>
            <button id='sub_btn' type='submit'>
              Login
            </button>
          </p>
        </form>
        <footer>
          <LoginSocialFacebook
            class='sub_btn'
            appId='618455903770825'
            onResolve={(response) => {
              console.log(response)
            }}
            onReject={(error) => {
              console.log(error)
            }}
          ></LoginSocialFacebook>
          <p style={{ color: 'white' }}>
            New to MyApp? <Link to='/register'>Sign Up</Link>
          </p>

          {/* Here's your new button */}
        </footer>
      </div>
    </div>
  )
}
