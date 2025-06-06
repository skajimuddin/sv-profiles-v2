import { BrowserRouter, Route, Routes } from "react-router-dom"
import HomePage from "./Pages/HomePage"

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<h1>404</h1>} />
          <Route path="/" element={<HomePage />} /> 
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
