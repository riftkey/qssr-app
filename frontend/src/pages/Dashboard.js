import React, { useEffect, useState } from 'react';
import axios from 'axios';
import introJs from 'intro.js';
import 'intro.js/introjs.css';

import DataTable from '../components/DataTable';
import EmissionsBarChart from "../components/EmissionsBarChart";
import CompletionStatusCard from "../components/CompletionStatusCard";
import MissingDataCard from "../components/MissingDataCard";
import WelcomeCard from '../components/WelcomeCard';
import QSSRTable from '../components/QSSRTable';
import EmissionsTrendChart from '../components/EmissionsTrendChart';

const Dashboard = () => {
  const [summary, setSummary] = useState({
    total: 0,
    filled: 0,
    unfilled: [],
  });

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await axios.get('https://qssr-app-production.up.railway.app/api/indikator/summary');
        setSummary(res.data);
      } catch (error) {
        console.error("Gagal fetch ringkasan indikator:", error);
      }
    };

    fetchSummary();
  }, []);

  const startTour = () => {
    introJs().setOptions({
      nextLabel: 'Lanjut',
      prevLabel: 'Kembali',
      skipLabel: 'Lewati',
      doneLabel: 'Selesai',
      steps: [
        {
          intro: 'Selamat datang di Dashboard QSSR! Mari saya tunjukkan fitur-fitur utamanya.'
        },
        {
          element: '#welcome-card',
          intro: 'Ini adalah sambutan dan tahun pelaporan saat ini.'
        },
        {
          element: '#status-card',
          intro: 'Kartu ini menunjukkan status pengisian indikator.'
        },
        {
          element: '#lens-table',
          intro: 'Tabel ini berisi daftar lensa dan indikator yang perlu dilaporkan.'
        },
        {
          element: '#emissions-bar',
          intro: 'Grafik batang ini menunjukkan total emisi tahunan.'
        },
        {
          element: '#emissions-line',
          intro: 'Grafik ini menunjukkan tren emisi per scope dari tahun ke tahun.'
        }
      ]
    }).start();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Dashboard QSSR</h2>
        <button
          onClick={startTour}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Mulai Panduan
        </button>
      </div>

      <div id="welcome-card">
        <WelcomeCard year={2025} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="status-card">
        <CompletionStatusCard total={summary.total} completed={summary.filled} />
        <MissingDataCard missingIndicators={summary.unfilled} />
      </div>

      <div className="p-6" id="lens-table">
        <h2 className="text-xl font-semibold mb-4">Status Lensa dan Indikator</h2>
        <QSSRTable />
      </div>

      <div id="emissions-bar">
        <EmissionsBarChart />
      </div>

      <div id="emissions-line">
        <EmissionsTrendChart />
      </div>
    </div>
  );
};

export default Dashboard;
