import { useParams, Link } from "react-router-dom";

export default function ProcessDetail() {
  const { id } = useParams();

  return (
    <div style={{ padding: 24 }}>
      <h1>Detalhe do Processo</h1>
      <p>ID: {id}</p>

      <Link to="/processos">Voltar</Link>
    </div>
  );
}
