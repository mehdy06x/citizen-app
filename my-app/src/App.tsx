
import './App.css'
import './firstsection.css'
import './secondsection.css'
import Header from './header'
import Footer from './footer'
import Accueil from './acceuil'
import Firstsection from './firstsection'
import SecondSection from './secondsection'
function App() {
  const landingBg = new URL('./images/backBleu.png', import.meta.url).toString();
  return (
    <>
    <Header/>
    <div className="landing-bg" style={{
      backgroundImage: `url(${landingBg})`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center top',
      backgroundSize: 'cover',
      backgroundAttachment: 'fixed',
      minHeight: '100vh'
    }}>
      <Accueil/>
      <Firstsection/>
      <SecondSection/>
    </div>
    <Footer/> 
    </>
  )
}
export default App
