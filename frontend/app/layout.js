import "./globals.css";
import Providers from "./providers";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export const metadata = {
  title: "CampusScan",
  description: "Text-first campus event alerts",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          <div className="page-main">{children}</div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
