import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Events from "./pages/Events";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={<Events />} />
      </Routes>
    </BrowserRouter>
  );
}
