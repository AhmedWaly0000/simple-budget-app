import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import MainLayout from './layouts/MainLayout'
import PageLoader from './components/ui/PageLoader'

const Home = lazy(() => import('./pages/Home'))
const Rankings = lazy(() => import('./pages/Rankings'))
const PlayerDetail = lazy(() => import('./pages/PlayerDetail'))
const Compare = lazy(() => import('./pages/Compare'))
const Teams = lazy(() => import('./pages/Teams'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const CustomRankings = lazy(() => import('./pages/CustomRankings'))
const About = lazy(() => import('./pages/About'))

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/rankings" element={<Rankings />} />
            <Route path="/players/:id" element={<PlayerDetail />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/custom-rankings" element={<CustomRankings />} />
            <Route path="/about" element={<About />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
