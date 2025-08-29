
import './App.css'
import Footer from "./footer";
import Header from "./header";
import AligningButtons from "./aligningbuttons";
import Reports from './Reports';

export default function UserDashboard() {
  return (
    <div>

      <Header/>
      <AligningButtons/>
      <Reports/>
      <Footer/>
      </div>
  )
}
