

/**
 * @param {{ year: number }} props
 */
export function WelcomeCard({ year }) {
  

  return (
    <div className="relative mb-6 rounded-xl overflow-hidden bg-gradient-to-r from-primary to-secondary text-black shadow-md">
      <div className="absolute inset-0 opacity-20" 
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400')`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center' 
        }}>
      </div>
      <div className="relative p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-heading font-bold">Selamat datang di SIP-QSSR</h2>
          <p className="mt-2 max-w-xl">
            Sistem Informasi Pengelolaan QS Sustainability Ranking (SIP-QSSR) membantu Anda dalam mengelola data dan laporan keberlanjutan universitas Anda.
            <br />
            Lacak, kelola, dan unggah data QS Sustainability Ranking.
          </p>
        </div>
        
      </div>
    </div>
  );
}

export default WelcomeCard;
