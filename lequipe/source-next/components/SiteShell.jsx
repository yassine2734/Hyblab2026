"use client";

import { useState } from "react";
import Menu from "./Menu/Menu";
import Header from "./Navbar/Header";
import Footer from "./Footer/Footer";

export default function SiteShell({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Space+Mono:wght@400;700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Oswald:wght@400;500;600;700;800;900&display=swap');`}</style>
      <Menu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Header onMenuOpen={() => setMenuOpen(true)} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {children}
        </div>
        <Footer />
      </div>
    </>
  );
}
