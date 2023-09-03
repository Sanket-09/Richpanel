import React from 'react'

function HomePage() {
  return (
    <div
      style={{
        padding: '70px',
        // borderRadius: rounded,
        borderRadius: '30px',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#2b2929',
        textAlign: 'center',
        color: 'white',
      }}
    >
      <h1 style={{ fontSize: '24px', marginTop: '30px' }}>
        Welcome to the Dashboard
      </h1>
      <p style={{ fontSize: '18px', marginTop: '20px' }}>
        You can connect your Facebook Page here:
      </p>
      <form action='/dashBoard' method='GET'>
        <button
          style={{
            backgroundColor: '#1a2542',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            fontSize: '18px',
            cursor: 'pointer',
            borderRadius: '5px',
          }}
          type='submit'
        >
          Connect to Facebook Page
        </button>
      </form>
    </div>
  )
}

export default HomePage
