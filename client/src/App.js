import React from "react";
import { BrowserRouter,Routes,Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Doctors from "./pages/Doctors";
import DoctorDetails from "./pages/DoctorDetails";
import Appointments from "./pages/Appointments";
import Login from "./pages/Login";
import Register from "./pages/Register";

// New Pages
import DoctorDashboard from "./pages/DoctorDashboard";
import ChatVideoCall from "./pages/ChatVideoCall";
import HeartDisease from "./pages/HeartDisease";

import ProtectedRoute from "./components/ProtectedRoute";

function App(){

return(

<BrowserRouter>

<Navbar/>
<ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

<Routes>

<Route path="/" element={<Home/>} />
<Route path="/doctors" element={<Doctors/>} />
<Route path="/login" element={<Login/>} />
<Route path="/register" element={<Register/>} />
<Route path="/heart-disease" element={<HeartDisease/>} />

<Route
path="/appointments"
element={
<ProtectedRoute>
<Appointments/>
</ProtectedRoute>
}
/>

<Route
path="/doctor/:id"
element={<DoctorDetails/>}
/>

<Route
path="/doctor-dashboard"
element={
<ProtectedRoute>
<DoctorDashboard/>
</ProtectedRoute>
}
/>

<Route
path="/communication/:appointmentId"
element={
<ProtectedRoute>
<ChatVideoCall/>
</ProtectedRoute>
}
/>

</Routes>

</BrowserRouter>

)

}

export default App;