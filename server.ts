import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";

const UTILITY_DATA: Record<string, any> = {
  "Liberia": {
    electricity: [{ name: "LEC (Liberia Electricity Corp)", type: "Prepaid/Postpaid" }],
    water: [{ name: "LWSC (Liberia Water & Sewer Corp)", type: "Monthly Bill" }],
    transport: [{ name: "Orange Taxi", type: "Ride Hail" }, { name: "NTA Bus", type: "Transit" }]
  },
  "Ghana": {
    electricity: [{ name: "ECG (Electricity Company of Ghana)", type: "Prepaid" }, { name: "NEDCo", type: "Prepaid" }],
    water: [{ name: "GWCL (Ghana Water Company Ltd)", type: "Postpaid" }],
    transport: [{ name: "STC", type: "Intercity" }, { name: "Bolt/Uber", type: "Ride Hail" }]
  },
  "Nigeria": {
    electricity: [{ name: "IKEDC (Ikeja Electric)", type: "Prepaid" }, { name: "EKEDC (Eko Electric)", type: "Prepaid" }],
    water: [{ name: "LWC (Lagos Water Corp)", type: "Monthly" }],
    transport: [{ name: "GIGM", type: "Intercity" }, { name: "Lagos Bus", type: "Transit" }]
  },
  "United States": {
    electricity: [{ name: "PG&E", type: "Monthly" }, { name: "ConEd", type: "Monthly" }],
    water: [{ name: "NYC Water", type: "Quarterly" }],
    transport: [{ name: "Amtrak", type: "Train" }, { name: "Uber/Lyft", type: "Ride Hail" }]
  },
  "United Kingdom": {
    electricity: [{ name: "British Gas", type: "Monthly" }, { name: "EDF", type: "Monthly" }],
    water: [{ name: "Thames Water", type: "Monthly" }],
    transport: [{ name: "TfL", type: "Transit" }, { name: "National Rail", type: "Train" }]
  },
  "China": {
    electricity: [{ name: "State Grid", type: "Prepaid" }],
    water: [{ name: "Beijing Water", type: "Prepaid" }],
    transport: [{ name: "Didi", type: "Ride Hail" }, { name: "CRH", type: "High Speed Rail" }]
  },
  "Brazil": {
    electricity: [{ name: "Enel", type: "Monthly" }],
    water: [{ name: "Sabesp", type: "Monthly" }],
    transport: [{ name: "99", type: "Ride Hail" }, { name: "Latam", type: "Airline" }]
  },
  "Australia": {
    electricity: [{ name: "AGL", type: "Monthly" }],
    water: [{ name: "Sydney Water", type: "Quarterly" }],
    transport: [{ name: "Qantas", type: "Airline" }, { name: "NSW TrainLink", type: "Train" }]
  }
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/utilities", (req, res) => {
    const country = req.query.country as string || "Liberia";
    const data = UTILITY_DATA[country] || UTILITY_DATA["Liberia"];
    res.json(data);
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
