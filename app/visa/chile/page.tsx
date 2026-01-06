import fs from "fs";
import path from "path";

export const dynamic = "force-static";

interface VisaData {
  origin: string;
  destinations: Record<string, string>;
}

function loadVisaData(): VisaData {
  const filePath = path.join(process.cwd(), "data", "generated", "Chile.json");
  const fileContents = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(fileContents) as VisaData;
}

const chileVisaData = loadVisaData();
const destinationEntries = Object.entries(chileVisaData.destinations);

export const metadata = {
  title: "Visa para chilenos | NecesitoVisa.com",
  description: "Consulta requisitos de visa para ciudadanos chilenos según el destino.",
};

export default function ChileVisaPage() {
  return (
    <main style={{ padding: "2rem", maxWidth: "960px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.75rem" }}>
        Visa para chilenos
      </h1>
      <p style={{ color: "#374151", marginBottom: "1.5rem" }}>
        Consulta rápidamente si necesitas visa para viajar desde Chile a otros países. Los datos se
        cargan desde el archivo generado para Chile y se muestran sin modificaciones adicionales.
      </p>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb", padding: "0.75rem" }}>
              Destino
            </th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb", padding: "0.75rem" }}>
              Requisito de visa
            </th>
          </tr>
        </thead>
        <tbody>
          {destinationEntries.map(([destination, requirement]) => (
            <tr key={destination}>
              <td style={{ padding: "0.75rem", borderBottom: "1px solid #f3f4f6" }}>{destination}</td>
              <td style={{ padding: "0.75rem", borderBottom: "1px solid #f3f4f6" }}>{requirement}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
