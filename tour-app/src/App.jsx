import { TourProvider } from './context/TourContext';
import Header from './components/Header';
import PanoramaViewer from './components/PanoramaViewer';
import AdminPanel from './components/AdminPanel';
import AdminLogin from './components/AdminLogin';

function App() {
  return (
    <TourProvider>
      <div className="w-full h-screen relative bg-black overflow-hidden">
        <PanoramaViewer />
        <Header />
        <AdminPanel />
        <AdminLogin />
      </div>
    </TourProvider>
  );
}

export default App;
