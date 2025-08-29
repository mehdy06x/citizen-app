import { Suspense, lazy } from 'react'

const CitizenLogin = lazy(() => import('./citizen/pages/Login.jsx'))

export default function Connect(){
  return (
    <Suspense fallback={<div>Loading login...</div>}>
      <CitizenLogin />
    </Suspense>
  )
}
