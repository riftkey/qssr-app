import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import dataCollectionRoutes from "./routes/dataCollectionRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import indikatorRoutes from "./routes/indikatorRoutes.js";
import scope1Routes from "./routes/scope1Routes.js";
import emissionsRoutes from "./routes/emissionsRoutes.js";
import scope2Routes from "./routes/scope2Routes.js";
import giaRoutes from "./routes/giaRoutes.js";
import renewableRoutes from "./routes/renewableRoutes.js";
import netzeroRoutes from "./routes/netzeroRoutes.js";
import contactsRoutes from "./routes/contactsRoutes.js";
import researchPartnershipRoutes from "./routes/researchPartnershipRoutes.js";
import demographicRoutes from "./routes/demographicRoutes.js";
import subindikatorRoutes from "./routes/subindikatorRoutes.js";






const app = express();



const allowedOrigins = [
  'http://localhost:5173',       // lokal
  'http://localhost:3000',       // lokal lain
  'https://qssr-app-production-87f1.up.railway.app', // ganti domain prod lu
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like Postman or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // kalau pakai cookie/token
}));


dotenv.config();

app.use(express.json());
app.use("/api/scope2", scope2Routes);
app.use("/api/emissions", emissionsRoutes);
app.use("/api/gia", giaRoutes);
app.use("/api/renewable", renewableRoutes);
app.use("/api/scope1", scope1Routes);
app.use("/api/auth", authRoutes);
app.use("/api/data-collection", dataCollectionRoutes);
app.use("/api/indikator", indikatorRoutes);
app.use("/api/netzero", netzeroRoutes);
app.use("/api/contacts", contactsRoutes);
app.use("/api/research-partnerships", researchPartnershipRoutes);
app.use("/api/demographics", demographicRoutes);
app.use("/api/subindikator", subindikatorRoutes);
app.use("/uploads", express.static("uploads"));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
