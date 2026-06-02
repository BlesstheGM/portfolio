import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Experience from '@/components/Experience';
import Projects from '@/components/Projects';
import Coursework from '@/components/Coursework';
import Skills from '@/components/Skills';
import Contact from '@/components/Contact';
export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Coursework />
        <Skills />
        <Contact />
      </main>
      <footer className="footer">
        <p>
          blessing@portfolio:~$ <span style={{ color: 'var(--green)' }}>exit 0</span>
        </p>
        <p style={{ marginTop: '0.4rem' }}>
          Built with Next.js · Deployed on Vercel · Cape Town, 2026
        </p>
      </footer>
    </>
  );
}
