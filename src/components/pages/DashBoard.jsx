import React from 'react'

function FacebookPageIntegrationDashboard({ pageName }) {
  return (
    <html>
      <head>
        <title>FacebookPageIntegrationDashboard</title>
        <style>
          {' '}
          {`
            body {
              background-color: #2b2929;
            }
            .container {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              background-color: #1e1e1e;
              border-radius: 20px;
              padding: 20px;
              text-align: center;
            }
            h1 {
              font-size: 2em;
              margin-bottom: 20px;
            }
            .integrated-page {
              font-size: 1.5em;
              margin-bottom: 20px;
            }
            .button {
              display: inline-block;
              padding: 10px 20px;
              border-radius: 5px;
              font-size: 1.2em;
              font-weight: bold;
              text-align: center;
              text-decoration: none;
              color: #fff;
              margin: 10px;
              cursor: pointer;
            }
            .button-red {
              background-color: #650000;
            }
            .button-blue {
              background-color: #1a2542;
            }
          `}
        </style>
      </head>
      <body>
        <div className='container'>
          <form method='POST' action='/dashBoard'>
            <h1 style={{ color: 'white' }}>Facebook Page Integration</h1>
            <div className='integrated-page' style={{ color: 'white' }}>
              Integrated page: Test Server
            </div>
            <a href='/Home' className='button button-red'>
              Delete Integration
            </a>
            <a href='/chat' className='button button-blue'>
              Reply to Messages
            </a>
          </form>
        </div>
      </body>
    </html>
  )
}

export default FacebookPageIntegrationDashboard
