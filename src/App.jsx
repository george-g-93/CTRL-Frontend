// FILE: src/App.jsx
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import News from "./pages/News.jsx";
import About from "./pages/About.jsx";
import NotFound from "./pages/NotFound.jsx";
import NewsDetail from "./pages/NewsDetail.jsx";
import Services from "./pages/Services.jsx";

export default function App() {
  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/news" element={<News />} />
        <Route path="/news/:id" element={<NewsDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/services" element={<Services />} />
      </Routes>
      <Footer />
    </div>
  );
}
