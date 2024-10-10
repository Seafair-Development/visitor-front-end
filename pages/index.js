// pages/index.js
import VisitorCheckIn from "../components/VisitorCheckIn";
import ZapierResponse from "../components/ZapierResponse";

export default function Home() {
  return (
    <div>
      <h1>Visitor Check-In/Check-Out App</h1> {/* Single headline for the page */}
      <VisitorCheckIn />
      <ZapierResponse />
    </div>
  );
}
