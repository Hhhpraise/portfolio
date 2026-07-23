import Nav from './Nav';
import MobileMenu from './MobileMenu';
import ReadingProgress from './ReadingProgress';
import ToastContainer from './ToastContainer';
import Footer from './Footer';
import Noise from '../reactbits/Noise';
import { useLenis } from '../../hooks/useLenis';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  useLenis();

  return (
    <>
      <ReadingProgress />
      <Noise patternAlpha={8} patternRefreshInterval={3} />
      <Nav />
      <MobileMenu />
      {children}
      <Footer />
      <ToastContainer />
    </>
  );
}
