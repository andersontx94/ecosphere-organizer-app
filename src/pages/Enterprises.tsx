import React from "react";

export default function Enterprises() {
  const enterprises = [
    {
      client: "Construtora Alfa",
      name: "Residencial Jardim Verde",
      activity: "Construção Civil",
      city: "Manaus / AM",
      status: "Licença Ativa",
    },
    {
      client: "Solar Norte Energia",
      name: "Usina Solar Manaus",
      activity: "Geração de Energia",
      city: "Iranduba / AM",
      status: "Em Renovação",
    },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: 8 }}>
        Empreendimentos 🌱
      </h1>

      <p style={{ color: "#555", marginBottom: 24 }}>
        Gestão de clientes e empreendimentos da consultoria ambiental
      </p>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "#fff",
        }}
      >
        <thead>
          <tr>
            <th style={th}>Cliente</th>
            <th style={th}>Empreendimento</th>
            <th style={th}>Atividade</th>
            <th style={th}>Município</th>
            <th style={th}>Status Ambiental</th>
          </tr>
        </thead>

        <tbody>
          {enterprises.map((e, index) => (
            <tr key={index}>
              <td style={td}>{e.client}</td>
              <td style={td}>{e.name}</td>
              <td style={td}>{e.activity}</td>
              <td style={td}>{e.city}</td>
              <td style={td}>{e.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const th: React.CSSProperties = {
  textAlign: "left",
  padding: 12,
  borderBottom: "1px solid #ddd",
};

const td: React.CSSProperties = {
  padding: 12,
  borderBottom: "1px solid #eee",
};
