import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from "react-router-dom";
import Cards from "./Cards";
import Monsters from "./Monsters"
import Navbar from "./Navbar"

export default function App() {
  return (
    <Router>
      <div>
        <Navbar />

        <Routes>
          <Route path="/monsters" element={<Monsters/>} />
          <Route path="/" element={<Cards/>}/>
        </Routes>
      </div>
    </Router>
  );
}