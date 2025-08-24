import React from "react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };
  return (
    <nav className="bg-blue-600 text-white px-6 py-3 shadow-md">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <p className="text-2xl font-bold">My Chat App</p>

        <div className="flex gap-6">
          {localStorage.getItem("token") && (
            <button
              onClick={handleLogout}
              className="ml-4 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
