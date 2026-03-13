<<<<<<< HEAD
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from "./pages/Signup";
import Register from './pages/Register';
import Messages from './pages/Messages';
import Post from './pages/Post';
import Items from './pages/Items';
import Item from './pages/Item';
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
                    <Route path="/register" element={<Register />} />
                    <Route path="/messages" element={<Messages />} />
                    <Route path="/items" element={<Items />} />
                    <Route path="/items/:itemID" element={<Item />} />
                </Routes>
                <Footer />
            </BrowserRouter>
        </>
    );
=======
import "./App.css";
import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Messages from "./pages/Messages";
import Post from "./pages/Post";
import Items from "./pages/Items";
import Item from "./pages/Item";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Header />
        <main className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/post"
              element={
                <ProtectedRoute>
                  <Post />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              }
            />
            <Route path="/items" element={<Items />} />
            <Route path="/items/:itemID" element={<Item />} />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
>>>>>>> c34e2d7d (- implemented item fetching and display in Items page)
}
export default App;
