import About from "@/Components/About";
import Chairman from "@/Components/Chairman";
import Contact from "@/Components/Contact";
import Footer from "@/Components/Footer";
import Gm from "@/Components/Gm";
import Hero from "@/Components/Hero";
import Mission from "@/Components/Mission";
import Navbar from "@/Components/Navbar";
import Services from "@/Components/Services";

export default function Home() {
  return (
    <main className="overflow-hidden">
      <Navbar />
      <Hero />
      <About />
      <Services />
      <Mission />
      <Chairman />
      <Gm />
      <Contact />
      <Footer />
    </main>
  );
}