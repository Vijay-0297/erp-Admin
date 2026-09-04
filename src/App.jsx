import { Toaster } from 'react-hot-toast'
import AppRoutes from './routes/AppRoutes.jsx'

export default function App() {
  return (
    <>
      <AppRoutes />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#161923',
            color: '#fff',
            fontSize: '13.5px',
            borderRadius: '10px',
          },
          success: { iconTheme: { primary: '#3563e9', secondary: '#fff' } },
          error: { iconTheme: { primary: '#e6484f', secondary: '#fff' } },
        }}
      />
    </>
  )
}
