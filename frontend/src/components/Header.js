import { Link } from "react-router-dom"

function Header() {
    return (
        <header>
            <div className="header-inner">
                <div className="logo">Minerva Marketplace</div>
                <nav className="nav">
                    <ul>
                        <li>
                            <Link to={`/`}>Home</Link>
                        </li>
                        <li>
                            <Link to={`/dashboard`}>Dashboard</Link>
                        </li>
                        <li>
                            <Link to={`/items`}>View Items</Link>
                        </li>
                        <li>
                            <Link to={`/post`}>Sell</Link>
                        </li>
                        <li>
                            <Link to={`/register`}>Register</Link>
                        </li>
                        <li>
                            <Link to={`/login`}>Login</Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
}

export default Header;