
import { SignedIn, SignedOut, SignInButton,SignOutButton, UserButton, useUser } from '@clerk/clerk-react'
import { Navigate, Route, Routes } from 'react-router'
import HomePage from './pages/HomePage'
import ProblemsPage from './pages/ProblemsPage'
import { Toaster } from 'react-hot-toast';

function App() {
 
const {isSignedIn, isLoaded} = useUser();

//this will get ri of the flickering of the page when the user is not loaded yet, it will return null until the user is loaded and then it will render the page
if(!isLoaded) return null;
  return (
    <>
    <Routes>
    
     <Route path="/" element={!isSignedIn ? <HomePage /> : <Navigate to="/dashboard" />}/>
     <Route path="/dashboard" element={isSignedIn ? <DashboardPage /> : <Navigate to={"/"} />}/>

     <Route path="/problems" element={isSignedIn ? <ProblemsPage /> : <Navigate to={"/" }/>}/>
      
    </Routes>

    <Toaster toastOptions={{duration:3000}}/>
    </>
  )
}

export default App
