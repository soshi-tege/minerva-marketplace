import logo from './logo.svg';
import './App.css';
import Header from './components/Header';
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Signup from "./pages/Signup";
import Messages from './pages/Messages'
import Post from './pages/Post'
import Items from './pages/Items'
import Item from './pages/Item'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

function App() {
    return (
        <>
            <BrowserRouter>
                <Header />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/dashboard/" element={<Dashboard />} />
                    <Route path="/post" element={<Post />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/messages" element={<Messages />} />
                    <Route path="/items" element={<Items />} />
                    <Route path="/items/:itemID" element={<Item />} />
                </Routes>
            </BrowserRouter>
        </>
    );
}

export default App;
