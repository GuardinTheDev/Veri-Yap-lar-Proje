import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import React, { useState , useEffect } from 'react';

function App() {
  // Haritanın başlangıçta odaklanacağı merkez noktası
  const merkezKoordinat = [40.301667820187355, 28.869718407243724];

  // Hatlar
  // Inputlardan gelecek verileri ve çizilecek rotayı tutan state'ler
  const [baslangic, setBaslangic] = useState('');
  const [hedef, setHedef] = useState('');
  const [gercekRota, setGercekRota] = useState([]);

  const [sehirVerisi, setSehirVerisi] = useState({ duraklar: [], hatlar: [] });

  useEffect(() => {
    const dataUrl = "http://localhost:8000/duraklar";

    Promise.all([
      fetch("http://localhost:8000/duraklar").then(res => res.json()),
      fetch("http://localhost:8000/hatlar").then(res => res.json())
    ])
        .then(([duraklarData, hatlarData]) => {
          setSehirVerisi({ duraklar: duraklarData, hatlar: hatlarData });
        })
        .catch(error => console.error("Veri çekilirken hata:", error));
  }, []);

  // API'ye istek atacak fonksiyon
  const rotayiBul = async () => {
    const kaynakDurak = sehirVerisi.duraklar.find(d => d.id === baslangic);
    const hedefDurak = sehirVerisi.duraklar.find(d => d.id === hedef);

    if (!baslangic || !hedef) {
      alert("Lütfen hem başlangıç hem de hedef durağını listeden seçin.");
      return;
    }

    if (!kaynakDurak || !hedefDurak) {
      alert("Seçilen durakların koordinatları bulunamadı.");
      return;
    }

    // OSRM API URL'si
    const url = `https://router.project-osrm.org/route/v1/driving/${kaynakDurak.x},${kaynakDurak.y};${hedefDurak.x},${hedefDurak.y}?overview=full&geometries=geojson`;
    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        // Leaflet [Enlem, Boylam] formatı istediği için API'den gelen veriyi ters çeviriyoruz
        const koordinatlar = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
        setGercekRota(koordinatlar);
      }
    } catch (error) {
      console.error("Hata:", error);
    }
  };

  return (
      <div style={{ display: 'flex', height: '100vh', margin: 0, fontFamily: 'sans-serif' }}>

        {/* SOL PANEL */}
        <div style={{ width: '300px', backgroundColor: '#f8f9fa', padding: '20px', boxShadow: '2px 0 5px rgba(0,0,0,0.1)', zIndex: 1000 }}>
          <h2 style={{ color: '#333' }}>Akıllı Navigasyon</h2>

          <div style={{ marginTop: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Başlangıç Durağı:</label>
            <select
                value={baslangic}
                onChange={(e) => setBaslangic(e.target.value)}
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box', cursor: 'pointer' }}
            >
              {sehirVerisi.duraklar?.map((durak) => (
              <option key={durak.ID} value={durak.ID}>
                Durak {durak.ID} - {durak.Ad}
              </option>
              ))}
            </select>
          </div>

          <div style={{ marginTop: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Hedef Durak:</label>
            <select
                value={hedef}
                onChange={(e) => setHedef(e.target.value)}
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box', cursor: 'pointer' }}
            >
              <option value="">Bir durak seçiniz...</option>
              {sehirVerisi.duraklar?.map((durak) => (
                  <option key={durak.ID} value={durak.ID}>
                    Durak {durak.ID} - {durak.Ad}
                  </option>
              ))}
            </select>
          </div>

          <button
              onClick={rotayiBul}
              style={{ marginTop: '25px', width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
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
            {sehirVerisi.duraklar?.map(durak => (
                <Marker key={durak.ID} position={[durak.Y, durak.X]}>
                  <Popup>
                    <strong>{durak.Ad}</strong> <br /> ID: {durak.ID}
                  </Popup>
                </Marker>
            ))}

            {/* Hatları Çiz */}
            {/* Sadece rota hesaplandıysa gerçek rotayı çiz */}
            {gercekRota.length > 0 && (
                <Polyline positions={gercekRota} color="#FF0000" weight={5} opacity={0.8} />
            )}
          </MapContainer>
        </div>

      </div>
  );
}

export default App;