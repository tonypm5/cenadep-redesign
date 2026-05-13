import React, { useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { LanguageProvider } from "./context/LanguageContext";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { Chatbot } from "./components/Chatbot";
import Home from "./pages/Home";
import About from "./pages/About";
import Programmes from "./pages/Programmes";
import Blog from "./pages/Blog";
import BlogDetail from "./pages/BlogDetail";
import Impact from "./pages/Impact";
import Actualites from "./pages/Actualites";
import Contact from "./pages/Contact";
import Don from "./pages/Don";
import DonationSuccess from "./pages/DonationSuccess";
import AdminLogin from "./pages/AdminLogin";
import AdminBlog from "./pages/AdminBlog";
import AdminInbox from "./pages/AdminInbox";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

function App() {
  return (
    <div className="App">
      <HelmetProvider>
        <LanguageProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/a-propos" element={<About />} />
                <Route path="/programmes" element={<Programmes />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogDetail />} />
                <Route path="/impact" element={<Impact />} />
                <Route path="/actualites" element={<Actualites />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/don" element={<Don />} />
                <Route path="/don/merci" element={<DonationSuccess />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/blog" element={<AdminBlog />} />
                <Route path="/admin/inbox" element={<AdminInbox />} />
              </Routes>
            </main>
            <Footer />
            <Chatbot />
          </BrowserRouter>
        </LanguageProvider>
      </HelmetProvider>
    </div>
  );
}

export default App;
