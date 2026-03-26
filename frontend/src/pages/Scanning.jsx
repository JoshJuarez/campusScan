import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { scanInbox } from "../api";

export default function Scanning() {
  const navigate = useNavigate();
  const userId = 1; // will come from auth later

  useEffect(() => {
    const scan = async () => {
      await scanInbox(userId);
      navigate("/events");
    };
    scan();
  }, []);

  return (
    <div>
      <h2>Scanning your inbox...</h2>
      <p>Looking for events and free food 🍕</p>
    </div>
  );
}