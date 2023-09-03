import React from 'react'
import { Link } from 'react-router-dom'
import '../../App.css'

export default function SignUpPage() {
  return (
    <div className='text-center m-auto'>
      <div className='login-card'>
        <h2>Join us</h2>
        <h4>Create your personal account</h4>
        <form action='/home'>
          <p>
            <label style={{ padding: '0 9px' }}>Username</label>
            <br />
            <input type='text' name='username' required />
          </p>
          <p>
            <label style={{ padding: '0 9px' }}>Email address</label>
            <br />
            <input type='email' name='email' required />
          </p>
          <p>
            <label style={{ padding: '0 9px' }}>Password</label>
            <br />
            <input type='password' name='password' required />
          </p>

          <p>
            <button id='sub_btn' type='submit'>
              Register
            </button>
          </p>
        </form>
        <footer>
          <p>
            Already have account? <Link to='/'>Login</Link>
          </p>
        </footer>
      </div>
    </div>
  )
}
