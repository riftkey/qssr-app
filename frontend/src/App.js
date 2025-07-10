import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import SubmissionFormPage from "./pages/QSSRUploadPage";
import Layout from "./components/Layout";
import DaftarIndikator from "./pages/DaftarIndikator";
import LoginPage from "./pages/LoginPage";
import LensaHistory from "./pages/DaftarIndikator";
import CarbonCalculator from "./pages/CarbonCalculator";
import Scope1Calculator from "./pages/Scope1Calculator";
import Scope2Calculator from "./pages/Scope2Calculator";
import Scope3Calculator from "./pages/Scope3Calculator";
import RegisterPage from "./pages/RegisterPage";
import EditorIndikatorModule from "./pages/EditorIndicatorModule";
import AddIndikator from "./pages/AddIndikator";
import EditIndikator from "./pages/EditIndikator";
import PrivateRoute from "./components/PrivateRoute";
import KalkulatorGIA from "./pages/KalkulatorGIA";
import RenewableEnergyCalculator from "./pages/RenewableEnergyCalculator";
import BaselineForm from "./pages/BaselineForm";
import TargetForm from "./pages/TargetForm";
import InterpolationCalculator from "./pages/InterpolationCalculator";
import ProgressEstimator from "./pages/ProgressEstimator";
import BaselineTargetForm from "./pages/BaselineTargetForm";
import EmissionNetZeroDashboard from "./pages/EmissionNetZeroDashboard";
import ContactsPage from "./pages/ContactsPage";
import ResearchPartnershipPage from "./pages/ResearchPartnershipPage";
import DemographicsPage from "./pages/DemographicsPage";
import 'intro.js/introjs.css';
import HistoricalDataPage from "./pages/HistoricalDataPage";
import ImportHistoricalPage from "./pages/ImportHistoricalPage";


function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect root path to /login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Login Page */}
        <Route path="/login" element={<LoginPage />} />

        {/* Register Page */}
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<Layout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="submission" element={<SubmissionFormPage />} />
            <Route path="indicator-list" element={<DaftarIndikator />} />
            <Route path="history" element={<LensaHistory />} />
            <Route path="carbon-calculator" element={<CarbonCalculator />} />
            <Route path="scope1-calculator" element={<Scope1Calculator />} />
            <Route path="scope2-calculator" element={<Scope2Calculator />} />
            <Route path="scope3-calculator" element={<Scope3Calculator />} />
            <Route path="editor-indikator" element={<EditorIndikatorModule />} />
            <Route path="add-indikator" element={<AddIndikator />} />
            <Route path="edit-indikator/:kode" element={<EditIndikator />} />
            <Route path="kalkulator-gia" element={<KalkulatorGIA />} />
            <Route path="renewable-energy-calculator" element={<RenewableEnergyCalculator />} />
            <Route path="baseline-form" element={<BaselineForm />} />
            <Route path="target-form" element={<TargetForm />} />
            <Route path="interpolation-calculator" element={<InterpolationCalculator />} />
            <Route path="progress-estimator" element={<ProgressEstimator />} />
            <Route path="baseline-target-form" element={<BaselineTargetForm />} />
            <Route path="emission-net-zero-dashboard" element={<EmissionNetZeroDashboard />} />
            <Route path="contacts" element={<ContactsPage />} />
            <Route path="research-partnership" element={<ResearchPartnershipPage />} />
            <Route path="demographics" element={<DemographicsPage />} />
            <Route path="historical-data" element={<HistoricalDataPage />} />
            <Route path="import-historical" element={<ImportHistoricalPage />} />
            

            {/* Optional: Redirect to dashboard if no sub-route matches */}
            
          </Route>
        </Route>

        {/* Optional: 404 Not Found */}
        <Route path="*" element={<div className="p-8 text-center">404 | Halaman tidak ditemukan</div>} />
      </Routes>
    </Router>
  );
}

export default App;
