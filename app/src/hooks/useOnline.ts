import { useEffect, useState } from 'react'

/**
 * Estado de conexion del navegador.
 *
 * `navigator.onLine` solo garantiza que hay una interfaz de red activa, no
 * que se llegue a internet: en la feria puede haber WiFi sin salida. Por eso
 * el cliente de IA no confia solo en esto y ademas trata los fallos de red
 * como señal de que hay que degradar.
 */
export function useOnline(): boolean {
  const [online, setOnline] = useState(() => navigator.onLine)

  useEffect(() => {
    const goOnline = () => setOnline(true)
    const goOffline = () => setOnline(false)

    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  return online
}
