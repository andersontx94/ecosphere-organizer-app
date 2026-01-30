import { Link } from "react-router-dom";

export default function Processes() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Processos</h1>

      <ul>
        <li>
          <Link to="/processos/123">Processo 123</Link>
        </li>
        <li>
          <Link to="/processos/456">Processo 456</Link>
        </li>
      </ul>

      <Link to="/dashboard">Voltar ao Dashboard</Link>
    </div>
  );
}
