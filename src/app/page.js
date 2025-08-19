import dynamic from 'next/dynamic';

// Dynamic imports for client pieces
const Nav = dynamic(() => import('./Nav/Nav'), {
  ssr: true,
  loading: () => <div style={{ height: '60px' }} />
});

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
