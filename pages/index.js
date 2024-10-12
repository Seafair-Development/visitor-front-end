// pages/index.js
import VisitorCheckIn from "../components/VisitorCheckIn";
import ZapierResponse from "../components/ZapierResponse";
import { useState } from 'react';

export default function Home() {
  const [zapierResponse, setZapierResponse] = useState(null);

  const handleZapierResponse = (response) => {
    setZapierResponse(response);
  };

  return (
    <div>
      <h1>Visitor Check-In/Check-Out App</h1>
      <VisitorCheckIn onZapierResponse={handleZapierResponse} />
      <ZapierResponse responseData={zapierResponse} />
    </div>
  );
}