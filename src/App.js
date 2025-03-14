import { Route, Routes,Navigate } from "react-router-dom";
import Login from "./pages/login";
import Signup from "./pages/signup";
import Home from "./pages/home";

function App(){
  return(
    <>
    <Routes>
      <Route path="/" element={<Navigate to ="/login"/>}/>
      <Route path="/login" element={<Login/>}/>
      <Route path="/signup" element={<Signup/>}/>
      <Route path="/home" element={<Home/>}/>
    </Routes>
    </>

  );
}

export default App;