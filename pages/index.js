// pages/index.js
import React from 'react';
import Head from 'next/head';
import VisitorCheckIn from '../components/VisitorCheckIn';

const HomePage = () => {
  return (
    <div style={styles.container}>
      <Head>
        <title>Visitor Check-In System</title>
        <meta name="description" content="Check in with ease using our QR code system." />
        <link rel="icon" href="/favicon.ico" /> {/* Favicon link */}
      </Head>

      <h1>Visitor Check-In System</h1>
      <p>Please scan your QR code and complete the check-in process below.</p>
      
      <VisitorCheckIn />

      <style jsx>{`
        h1 {
          font-size: 2.5em;
          margin: 20px 0;
        }
        p {
          font-size: 1.2em;
          color: #555;
          margin-bottom: 30px;
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '20px',
    backgroundColor: '#f9f9f9',
  },
};

export default HomePage;
