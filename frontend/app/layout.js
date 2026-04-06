import "./globals.css";
import Providers from "./providers";
import Navbar from "../components/Navbar";

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
          <main className="page-main">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
