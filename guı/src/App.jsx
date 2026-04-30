import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import sehirVerisi from './mockData.json';

function App() {
  // Haritanın başlangıçta odaklanacağı merkez noktası şimdilik istanbul
  const merkezKoordinat = [40.301667820187355, 28.869718407243724];

  // Hatlar
  const cizgiler = sehirVerisi.hatlar.map(hat => {
    const kaynakDurak = sehirVerisi.duraklar.find(d => d.id === hat.kaynak);
    const hedefDurak = sehirVerisi.duraklar.find(d => d.id === hat.hedef);
    return [
      [kaynakDurak.lat, kaynakDurak.lng],
      [hedefDurak.lat, hedefDurak.lng]
    ];
  });

  return (
      <div style={{ display: 'flex', height: '100vh', margin: 0, fontFamily: 'sans-serif' }}>

        {/* SOL PANEL: Kontroller */}
        <div style={{ width: '300px', backgroundColor: '#f8f9fa', padding: '20px', boxShadow: '2px 0 5px rgba(0,0,0,0.1)', zIndex: 1000 }}>
          <h2 style={{ color: '#333' }}>Akıllı Navigasyon</h2>

          <div style={{ marginTop: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Başlangıç Durağı:</label>
            <input type="text" placeholder="Örn: D1" style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
          </div>

          <div style={{ marginTop: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Hedef Durak:</label>
            <input type="text" placeholder="Örn: D3" style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
          </div>

          <button style={{ marginTop: '25px', width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            Rotayı Bul
          </button>
        </div>

        {/* SAĞ PANEL: Gerçek Harita Alanı */}
        <div style={{ flex: 1 }}>
          <MapContainer center={merkezKoordinat} zoom={12} style={{ height: '100%', width: '100%' }}>
            {/* Dünya haritası görsellerini çeken altlık (TileLayer) */}
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {/* Durakları Çiz */}
            {sehirVerisi.duraklar.map(durak => (
                <Marker key={durak.id} position={[durak.lat, durak.lng]}>
                  <Popup>
                    <strong>{durak.isim}</strong> <br /> ID: {durak.id}
                  </Popup>
                </Marker>
            ))}

            {/* Hatları Çiz */}
            <Polyline positions={cizgiler} color="blue" weight={3} opacity={0.6} />
          </MapContainer>
        </div>

      </div>
  );
}

export default App;