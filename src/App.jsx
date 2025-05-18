import { Routes, Route, useParams } from 'react-router-dom';
import Main from './components/Main';
import CarparkDetail from './components/carparkdetail';
import Header from './components/Header';
import Footer from './components/Footer';

function CarparkDetailWrapper() {
  const { parkId } = useParams();
  return <CarparkDetail parkId={parkId} />;
}

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/info/:parkId" element={<CarparkDetailWrapper />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;