import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div className="sidebar">

      <h2 className="logo">ID Wallet</h2>

      <nav>
        <ul>

          <li>
            <Link to="/">Dashboard</Link>
          </li>

          <li>
            <Link to="/passport">Passport</Link>
          </li>

          <li>
            <Link to="/verify">Verify</Link>
          </li>

        </ul>
      </nav>

    </div>
  );
}

export default Sidebar;