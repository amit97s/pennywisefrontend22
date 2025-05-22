import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import {
  AccountStatement,
  DayBook,
  Home,
  TrialBalance,
} from "./pages/index.js";
import EraseAll from "./pages/EraseAll.jsx";
import AddNew from "./pages/AddNew.jsx";
import Header from "./components/Header.jsx";

const App = () => {
  return (
    <BrowserRouter>
      <div>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/day-book" element={<DayBook />} />
          <Route path="/account-statement" element={<AccountStatement />} />
          <Route path="/trial-balance" element={<TrialBalance />} />
          <Route path="/erase-all" element={<EraseAll />} />
          <Route path="/add-new" element={<AddNew />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
