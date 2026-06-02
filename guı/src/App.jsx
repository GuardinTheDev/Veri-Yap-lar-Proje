import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function HaritaOdakla({ rota, kullanici }) {
    const map = useMap();
    useEffect(() => {
        if (rota && rota.length > 0) {
            map.flyToBounds(rota, {padding: [50, 50], duration: 1.5});
        } else if (kullanici) {
            // Rota yoksa ama kullanıcı konumu geldiyse oraya 15 zoom ile yaklaş
            map.flyTo(kullanici, 15, {duration: 1.5});
        }
    }, [rota, kullanici, map]);
    return null;
}

function App() {
  // Haritanın başlangıçta odaklanacağı merkez noktası
  const merkezKoordinat = [40.301667820187355, 28.869718407243724];

  // Hatlar
  // Inputlardan gelecek verileri ve çizilecek rotayı tutan state'ler
  const [baslangic, setBaslangic] = useState('');
  const [hedef, setHedef] = useState('');
  const [gercekRota, setGercekRota] = useState([]);
  const [rotaAnaliz, setRotaAnaliz] = useState(null);
  const [sehirVerisi, setSehirVerisi] = useState({ duraklar: [], hatlar: [] });
  const [kullaniciKonum, setKullaniciKonum] = useState(null);
  const [enYakinDurak, setEnYakinDurak] = useState(null);

    useEffect(() => {
        // Hatlar için C# tarafında henüz bir endpoint yazmadığımızdan
        // şimdilik sadece durakları güncelliyoruz.
        Promise.all([
            fetch("http://localhost:5000/api/duraklar").then(res => res.json()), // C# API'si!
            Promise.resolve([])
        ])
            .then(([duraklarData, hatlarData]) => {
                setSehirVerisi({ duraklar: duraklarData, hatlar: hatlarData });
            })
            .catch(error => console.error("Veri çekilirken hata:", error));
    }, []);

    // Tarayıcıdan anlık canlı GPS konumunu alma
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    setKullaniciKonum([lat, lng]);
                },
                (error) => console.error("GPS konumu alınamadı:", error)
            );
        }
    }, []);

    // Kullanıcı konumu değiştiğinde en yakın durağı C# KdTree'den çek
    useEffect(() => {
        // Sadece kullaniciKonum null DEĞİLSE bu bloğu çalıştır
        if (kullaniciKonum) {
            fetch(`http://localhost:5000/api/enyakin-durak?lat=${kullaniciKonum[0]}&lng=${kullaniciKonum[1]}`)
                .then(res => res.json())
                .then(data => {
                    setEnYakinDurak(data);
                    // Hem id hem ID ihtimalini kontrol ediyoruz
                    const durakId = data.id || data.ID;
                    if (durakId) {
                        setBaslangic(durakId.toString());
                    }
                })
                .catch(err => console.error("En yakın durak bulunamadı:", err));
        }
    }, [kullaniciKonum]);

  // API'ye istek atacak fonksiyon
    const rotayiBul = async () => {
        // d.id veya d.ID eşleşmesini kontrol ediyoruz
        const kaynakDurak = sehirVerisi.duraklar.find(d => (d.id || d.ID).toString() === baslangic);
        const hedefDurak = sehirVerisi.duraklar.find(d => (d.id || d.ID).toString() === hedef);

    if (!baslangic || !hedef) {
      alert("Lütfen hem başlangıç hem de hedef durağını listeden seçin.");
      return;
    }

    if (!kaynakDurak || !hedefDurak) {
      alert("Seçilen durakların koordinatları bulunamadı.");
      return;
    }

    // Yapay Zeka (AI) Servisi URL'si ve Gönderilecek Veri (Body)
      const aiUrl = "http://localhost:5000/api/rota-bul";

      const requestBody = {
          kullanici_x: kullaniciKonum ? kullaniciKonum[0] : merkezKoordinat[0],
          kullanici_y: kullaniciKonum ? kullaniciKonum[1] : merkezKoordinat[1],
          baslangic_id: kaynakDurak.ID,
          hedef_id: hedefDurak.ID
      };

    try {
      // OSRM yerine Kendi Python Sunucumuza POST isteği atıyoruz
      const response = await fetch(aiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      //  GELEN VERİYİ KONSOLA YAZDIR
      console.log("AI Servisinden Gelen Rota Sonucu:", data);

      if (data.analiz) {
        setRotaAnaliz(data.analiz);
      }

      // HİBRİT SİSTEM: AI'dan gelen durak sırasını OSRM'ye verip kıvrımlı gerçek yolu çizdiriyoruz
      if (data.rota_detay && data.rota_detay.length > 0) {

        // Durakları OSRM'nin istediği Boylam,Enlem;Boylam,Enlem formatında uç uca ekliyoruz
        const osrmKoordinatlar = data.rota_detay.map(durak => `${durak.Y},${durak.X}`).join(';');
        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${osrmKoordinatlar}?overview=full&geometries=geojson`;

        // OSRM'den kıvrımlı yol verisini çekiyoruz
        const osrmResponse = await fetch(osrmUrl);
        const osrmData = await osrmResponse.json();

        if (osrmData.routes && osrmData.routes.length > 0) {
          // Gelen kıvrımlı koordinatları Leaflet'in istediği [Enlem, Boylam] sırasına çevirip haritaya basıyoruz
          const kivrimaliRota = osrmData.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
          setGercekRota(kivrimaliRota);
        }
      }

    } catch (error) {
      console.error("AI Servisi ile iletişimde hata:", error);
      alert("Yapay zeka servisine bağlanılamadı. İkinci terminalde Python sunucusunun çalıştığından emin olun.");
    }

  };

  return (
      <div style={{ display: 'flex', height: '100vh', margin: 0, fontFamily: 'sans-serif' }}>

        {/* SOL PANEL */}
        <div style={{ width: '300px', backgroundColor: '#f8f9fa', padding: '20px', boxShadow: '2px 0 5px rgba(0,0,0,0.1)', zIndex: 1000 }}>
          <h2 style={{ color: '#333' }}>Akıllı Navigasyon</h2>

          <div style={{ marginTop: '20px' }}>

              {enYakinDurak && (
                  <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#e2f0fe', borderRadius: '6px', border: '1px solid #b6d4fe' }}>
              <span style={{ fontSize: '13px', color: '#084298', display: 'block' }}>
                📍 <strong>En Yakın Durak Tespit Edildi:</strong>
              </span>
                      <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#084298' }}>
                {enYakinDurak.Ad} (Otomatik Seçildi)
              </span>
                  </div>
              )}

            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Başlangıç Durağı:</label>
            <select
                value={baslangic}
                onChange={(e) => setBaslangic(e.target.value)}
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box', cursor: 'pointer' }}
            >
              <option value="">Bir durak seçiniz...</option>
                {sehirVerisi.duraklar?.map((durak, index) => {
                    const id = durak.id || durak.ID || index;
                    const ad = durak.ad || durak.Ad;
                    return (
                        <option key={id} value={id}>
                            Durak {id} - {ad}
                        </option>
                    );
                })}
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
                {sehirVerisi.duraklar?.map((durak, index) => {
                    const id = durak.id || durak.ID || index;
                    const ad = durak.ad || durak.Ad;
                    return (
                        <option key={id} value={id}>
                            Durak {id} - {ad}
                        </option>
                    );
                })}
            </select>
          </div>

          <button
              onClick={rotayiBul}
              style={{ marginTop: '25px', width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            Rotayı Bul
          </button>

          {rotaAnaliz && (
              <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e9ecef', borderRadius: '8px', borderLeft: '5px solid #007bff' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>📊 Rota Analizi</h4>
                <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Ulaşım Süresi:</strong> {rotaAnaliz.ulasim_suresi_dk} dk</p>
                <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Yürüyüş Mesafesi:</strong> {rotaAnaliz.yuruyus_mesafe_km} km</p>
                <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Aktarma Sayısı:</strong> {rotaAnaliz.aktarma_sayisi}</p>
              </div>
          )}

        </div>

        {/* Gerçek Harita Alanı */}
        <div style={{ flex: 1 }}>
          <MapContainer center={merkezKoordinat} zoom={12} style={{ height: '100%', width: '100%' }}>
            {/* Dünya haritası görsellerini çeken altlık (TileLayer) */}
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

              {kullaniciKonum && (
                  <CircleMarker
                      center={kullaniciKonum}
                      radius={8}
                      pathOptions={{ fillColor: '#2575fc', color: 'white', weight: 2, fillOpacity: 1 }}
                  >
                      <Popup>Şu an buradasınız</Popup>
                  </CircleMarker>
              )}

            {/* Durakları Çiz */}
              {sehirVerisi.duraklar?.map((durak, index) => {
                  const lat = durak.x || durak.X;
                  const lng = durak.y || durak.Y;
                  const id = durak.id || durak.ID || index;
                  const ad = durak.ad || durak.Ad;

                  // Koordinatlar henüz yüklenmediyse çizimi atla, uygulamanın çökmesini engelle!
                  if (lat === undefined || lng === undefined) return null;

                  return (
                      <Marker key={id} position={[lat, lng]}>
                          <Popup>
                              <strong>{ad}</strong> <br /> ID: {id}
                          </Popup>
                      </Marker>
                  );
              })}

            {/* Tüm Şehir Ağını (Hatları) Çiz */}
            {sehirVerisi.hatlar?.map((hat, index) => {
              // Hattın başlangıç ve hedef duraklarının koordinatlarını buluyoruz
              const baslangic = sehirVerisi.duraklar.find(d => d.ID === hat.BaslangicID);
              const hedef = sehirVerisi.duraklar.find(d => d.ID === hat.HedefID);

              // Eğer iki durak da haritada varsa aralarına çizgi çek
              if (baslangic && hedef) {
                return (
                    <Polyline
                        key={`${index}-${gercekRota.length > 0}`}
                        positions={[
                          [baslangic.X, baslangic.Y],
                          [hedef.X, hedef.Y]
                        ]}
                        color="#6c757d" // Şık bir gri renk
                        weight={2} // İnce bir çizgi
                        opacity={gercekRota.length > 0 ? 0.05 : 0.4}
                    >
                      {/* Çizginin üstüne tıklayınca hat bilgisini göster */}
                      <Popup>
                        <strong>Hat: {hat.HatAd}</strong><br/>
                        Mesafe: {hat.Mesafe} km<br/>
                        Süre: {hat.Sure} dk
                      </Popup>
                    </Polyline>
                );
              }
              return null;
            })}

            <HaritaOdakla rota={gercekRota} kullanici={kullaniciKonum} />

            {/* Hatları Çiz */}
            {gercekRota.length > 0 && (
                <Polyline positions={gercekRota} color="#FF0000" weight={5} opacity={0.8} />
            )}
          </MapContainer>
        </div>

      </div>
  );
}

export default App;