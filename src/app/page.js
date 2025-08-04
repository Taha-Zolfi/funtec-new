// app/page.jsx

import Nav from './Nav/Nav';
import Home from './home/Home';
import About from './About/About';
import Contact from './contact/Contact';

export default function App() {
  return (
    <>
      <Nav />
      <Home />
      <About />
      <Contact />
    </>
  );
}