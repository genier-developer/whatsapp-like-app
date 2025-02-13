import {FC} from "react";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {Login} from "../pages/login";

export const  App: FC = ()=> {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        {/*<Route path="/chat" element={<Chat />} />*/}
      </Routes>
    </BrowserRouter>
  )
}

