import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import VideoLibrary from './pages/VideoLibrary';
import UploadVideo from './pages/UploadVideo';
import VideoProcessing from './pages/VideoProcessing';
import SemanticSearch from './pages/SemanticSearch';
import SearchResults from './pages/SearchResults';
import VideoDetail from './pages/VideoDetail';
import InvestigationHistory from './pages/InvestigationHistory';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

export const router = createBrowserRouter([
  { path: '/', Component: Login },
  {
    Component: Layout,
    children: [
      { path: '/dashboard', Component: Dashboard },
      { path: '/library', Component: VideoLibrary },
      { path: '/upload', Component: UploadVideo },
      { path: '/processing', Component: VideoProcessing },
      { path: '/search', Component: SemanticSearch },
      { path: '/results', Component: SearchResults },
      { path: '/video/:id', Component: VideoDetail },
      { path: '/history', Component: InvestigationHistory },
      { path: '/reports', Component: Reports },
      { path: '/settings', Component: Settings },
    ],
  },
]);
