import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Events from "./pages/Events";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="page-main">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/admin" element={<Events />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
