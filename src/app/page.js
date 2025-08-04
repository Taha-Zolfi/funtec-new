// app/page.jsx

import Nav from './Nav/Nav';
import Home from './Home/Home';
import About from './About/About';
import Contact from './Contact/Contact';

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