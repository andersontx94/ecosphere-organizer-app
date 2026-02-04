import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-black text-white min-h-screen p-6">
      <h1 className="text-xl font-bold mb-8">EcoSphere</h1>

      <nav className="flex flex-col gap-4">
        <NavLink
          to="/processos"
          className={({ isActive }) =>
            isActive ? "text-green-400 font-medium" : "text-white"
          }
        >
          Processos
        </NavLink>

        <NavLink
          to="/clientes"
          className={({ isActive }) =>
            isActive ? "text-green-400 font-medium" : "text-white"
          }
        >
          Clientes
        </NavLink>
      </nav>
    </aside>
  );
}
