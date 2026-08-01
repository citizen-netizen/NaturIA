import { createBrowserRouter, RouterProvider } from 'react-router'
import { Layout } from './components/Layout'
import { Home } from './routes/Home'
import { Stations } from './routes/Stations'
import { StationDetail } from './routes/StationDetail'
import { Tutor } from './routes/Tutor'
import { PromptLab } from './routes/PromptLab'
import { Metacognition } from './routes/Metacognition'
import { NotFound } from './routes/NotFound'

/**
 * `import.meta.env.BASE_URL` viene de `base` en vite.config.ts, asi que la
 * app funciona igual servida desde `/NaturIA/` en GitHub Pages o desde la
 * raiz en un dominio propio, sin tocar codigo.
 */
const router = createBrowserRouter(
  [
    {
      element: <Layout />,
      children: [
        { path: '/', element: <Home /> },
        { path: '/estaciones', element: <Stations /> },
        { path: '/estaciones/:stationId', element: <StationDetail /> },
        { path: '/tutor', element: <Tutor /> },
        { path: '/tutor/:stationId', element: <Tutor /> },
        { path: '/laboratorio', element: <PromptLab /> },
        { path: '/metacognicion', element: <Metacognition /> },
        { path: '*', element: <NotFound /> },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL },
)

export function App() {
  return <RouterProvider router={router} />
}
