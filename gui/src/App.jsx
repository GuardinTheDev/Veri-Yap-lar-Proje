import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function HaritaOdakla({ rota, kullanici, temizleKodu }) {
    /** @type {any} */
    const map = useMap();
    useEffect(() => {
        if (rota && rota.length > 0) {
            map.flyToBounds(rota, {padding: [50, 50], duration: 1.5});
        } else if (kullanici) {
            // Rota yoksa veya temizlendiyse kullanıcıya odakla
            map.flyTo(kullanici, 15, {duration: 1.5});
        }
    }, [rota, kullanici, map, temizleKodu]);
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
  const [duraktanGecenHatlar, setDuraktanGecenHatlar] = useState(/** @type {string[]} */ ([]));
  const [seciliHat, setSeciliHat] = useState('');
  const [karanlikTema, setKaranlikTema] = useState(true);
  const [taramaYapiliyor, setTaramaYapiliyor] = useState(false);

    useEffect(() => {
        // Hatlar için C# tarafında henüz bir endpoint yazmadığımızdan
        // şimdilik sadece durakları güncelliyoruz.
        Promise.all([
            fetch("http://localhost:5000/api/duraklar").then(res => res.json()), // C# API'si!
            fetch("http://localhost:5000/api/hatlar").then(res => res.json())    // Gerçek C# hat kapısı!
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

    useEffect(() => {
        if (baslangic) {
            fetch(`http://localhost:5000/api/duraktan-gecen-hatlar?id=${baslangic}`)
                .then(res => res.json())
                .then(data => {
                    setDuraktanGecenHatlar(data);
                    setSeciliHat(''); // Yeni durak seçilince eski harita çizimini temizle
                })
                .catch(err => console.error("Hatlar çekilemedi:", err));
        }else {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setDuraktanGecenHatlar([]);
            setSeciliHat('');
        }
    }, [baslangic]);
  // API'ye istek atacak fonksiyon
    const rotayiBul = async () => {
        // 1. Seçilen durakların objelerini bul
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

        setTaramaYapiliyor(true); // Radar animasyonunu başlat

        // DİKKAT: Artık C# (5000) değil, Python AI Servisine (8000) istek atıyoruz!
        const aiUrl = "http://localhost:8000/rota-hesapla";

        // Python'a göndereceğimiz veriler
        const requestBody = {
            baslangic_id: parseInt(kaynakDurak.id || kaynakDurak.ID),
            hedef_id: parseInt(hedefDurak.id || hedefDurak.ID)
        };

        try {
            // Python'a POST isteği atıyoruz
            const response = await fetch(aiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();
            console.log("Python'dan Gelen Rota Sonucu:", data);

            // Sol paneldeki analiz kutusunu (dk, km) güncelle
            if (data.analiz) {
                setRotaAnaliz(data.analiz);
            }

            // Haritaya kırmızı çizgiyi çizmesi için koordinatları state'e at
            if (data.rota_detay && data.rota_detay.length > 0) {
                // Gelen kıvrımlı koordinatları [Enlem, Boylam] sırasına çevirip haritaya basıyoruz
                const haritaRotasi = data.rota_detay.map(durak => [durak.x || durak.X, durak.y || durak.Y]);
                setGercekRota(haritaRotasi);
            } else {
                alert("Python servisi iki durak arasında bir rota bulamadı.");
            }

        } catch (error) {
            console.error("Python AI Servisi ile iletişimde hata:", error);
            alert("Python servisine bağlanılamadı. Backend'in 8000 portunda çalıştığından emin olun.");
        } finally {
            // İşlem bitince radar animasyonunu kapat
            setTimeout(() => {
                setTaramaYapiliyor(false);
            }, 1500);
        }
    };

    // Seçilen hattın son durağını bulup otomatik hedef yapan fonksiyon
    const hatSecildi = (hatAd) => {
        setSeciliHat(hatAd); // Haritada neon maviyi yakar

        // Büyük/küçük harf güvencesiyle kenarları bul
        const buHattinKenarlari = sehirVerisi.hatlar.filter(h => (h.HatAd || h.hatAd) === hatAd);

        if (buHattinKenarlari.length === 0) return; // Veri gelmediyse çökmesini engelle

        let aktifDurak = parseInt(baslangic);
        let ziyaretEdilenler = new Set([aktifDurak]);
        let sonDurak = aktifDurak;

        // Hattın sonuna kadar ilerle (Graph Traversal)
        while (true) {
            const siradaki = buHattinKenarlari.find(h => {
                const bID = h.BaslangicID || h.baslangicID;
                const hID = h.HedefID || h.hedefID;
                return (bID === aktifDurak && !ziyaretEdilenler.has(hID)) ||
                    (hID === aktifDurak && !ziyaretEdilenler.has(bID));
            });

            if (siradaki) {
                const bID = siradaki.BaslangicID || siradaki.baslangicID;
                const hID = siradaki.HedefID || siradaki.hedefID;
                aktifDurak = (bID === aktifDurak) ? hID : bID;
                ziyaretEdilenler.add(aktifDurak);
                sonDurak = aktifDurak;
            } else {
                break; // Gidecek yer kalmadı, son durağı bulduk
            }
        }

        // Bulduğumuz son durağı "Hedef Durak" olarak otomatik seç
        if (sonDurak !== parseInt(baslangic)) {
            setHedef(sonDurak.toString());
        }
    };

  return (
      <div style={{ display: 'flex', height: '100vh', margin: 0, fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif', backgroundColor: '#0b0f19' }}>

          {/* RADAR CSS ANİMASYONLARI */}
          <style>
              {`
              @keyframes radarSweep {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
              @keyframes pulseGlow {
                0% { box-shadow: 0 0 0 0 rgba(0, 210, 255, 0.4); }
                70% { box-shadow: 0 0 0 50px rgba(0, 210, 255, 0); }
                100% { box-shadow: 0 0 0 0 rgba(0, 210, 255, 0); }
              }
            `}
          </style>

          {/* SOL PANEL (Karanlık Tema) */}
          <div style={{ width: '320px', backgroundColor: '#111827', color: '#e5e7eb', padding: '25px', borderRight: '1px solid #1f2937', boxShadow: '4px 0 15px rgba(0, 210, 255, 0.05)', zIndex: 1000, overflowY: 'auto' }}>

              <button onClick={() => setKaranlikTema(!karanlikTema)} style={{ width: '100%', padding: '10px', marginBottom: '20px', backgroundColor: karanlikTema ? '#374151' : '#e2f0fe', color: karanlikTema ? '#fff' : '#084298', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                  {karanlikTema ? '☀️ Açık Temaya Geç' : '🌙 Karanlık Temaya Geç'}
              </button>

              <h2 style={{ color: '#00d2ff', marginTop: 0, borderBottom: '2px solid #1f2937', paddingBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '20px' }}>
                  🛰️ Akıllı Navigasyon
              </h2>

              <div style={{ marginTop: '25px' }}>
                  {enYakinDurak && (
                      <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#1e293b', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
                      <span style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>
                        📍 En Yakın Durak Tespit Edildi
                      </span>
                          <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#10b981' }}>
                        {enYakinDurak.Ad}
                      </span>
                      </div>
                  )}

                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Başlangıç Durağı</label>
                  <select
                      value={baslangic}
                      onChange={(e) => setBaslangic(e.target.value)}
                      style={{ width: '100%', padding: '10px', backgroundColor: '#1f2937', color: '#f3f4f6', border: '1px solid #374151', borderRadius: '6px', outline: 'none', cursor: 'pointer' }}
                  >
                      <option value="">Bir durak seçiniz...</option>
                      {sehirVerisi.duraklar?.map((durak, index) => {
                          const id = durak.id || durak.ID || index;
                          const ad = durak.ad || durak.Ad;
                          return (
                              <option key={id} value={id}>Durak {id} - {ad}</option>
                          );
                      })}
                  </select>

                  {duraktanGecenHatlar.length > 0 && (
                      <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#0f172a', borderRadius: '6px', border: '1px solid #1e293b' }}>
                          <label style={{ display: 'block', fontSize: '11px', color: '#6b7280', marginBottom: '8px', textTransform: 'uppercase' }}>
                              ⚡ Geçen Hatlar (Seç ve Keşfet)
                          </label>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                              {duraktanGecenHatlar.map(hatAd => {
                                  const isSelected = seciliHat === hatAd;
                                  return (
                                      <button
                                          key={hatAd}
                                          onClick={() => hatSecildi(hatAd)}
                                          style={{
                                              padding: '6px 12px',
                                              border: isSelected ? '1px solid #00d2ff' : '1px solid #374151',
                                              borderRadius: '20px',
                                              backgroundColor: isSelected ? 'rgba(0, 210, 255, 0.1)' : 'transparent',
                                              color: isSelected ? '#00d2ff' : '#9ca3af',
                                              cursor: 'pointer',
                                              fontSize: '12px',
                                              fontWeight: 'bold',
                                              transition: 'all 0.2s ease',
                                              boxShadow: isSelected ? '0 0 10px rgba(0, 210, 255, 0.2)' : 'none'
                                          }}
                                      >
                                          {hatAd}
                                      </button>
                                  )
                              })}
                          </div>
                      </div>
                  )}
              </div>

              <div style={{ marginTop: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Hedef Durak</label>
                  <select
                      value={hedef}
                      onChange={(e) => setHedef(e.target.value)}
                      style={{ width: '100%', padding: '10px', backgroundColor: '#1f2937', color: '#f3f4f6', border: '1px solid #374151', borderRadius: '6px', outline: 'none', cursor: 'pointer' }}
                  >
                      <option value="">Bir durak seçiniz...</option>
                      {sehirVerisi.duraklar?.map((durak, index) => {
                          const id = durak.id || durak.ID || index;
                          const ad = durak.ad || durak.Ad;
                          return (
                              <option key={id} value={id}>Durak {id} - {ad}</option>
                          );
                      })}
                  </select>
              </div>

              <button
                  onClick={rotayiBul}
                  style={{
                      marginTop: '30px', width: '100%', padding: '12px',
                      backgroundColor: '#00d2ff', color: '#000',
                      border: 'none', borderRadius: '6px', cursor: 'pointer',
                      fontWeight: 'bold', fontSize: '15px', textTransform: 'uppercase',
                      boxShadow: '0 0 15px rgba(0, 210, 255, 0.4)', transition: 'background 0.3s'
                  }}>
                  Rotala
              </button>

              <button
                  onClick={() => {
                      setTaramaYapiliyor(true);
                      setTimeout(() => setTaramaYapiliyor(false), 3000); // 3 saniye sonra otomatik kapanır
                  }}
                  style={{
                      marginTop: '10px', width: '100%', padding: '8px',
                      backgroundColor: 'transparent', color: '#10b981',
                      border: '1px solid #10b981', borderRadius: '6px', cursor: 'pointer',
                      fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px'
                  }}>
                  🧪 Animasyonu Test Et
              </button>

              <button
                  onClick={() => {
                      setGercekRota([]);
                      setSeciliHat('');
                      setHedef('');
                      setRotaAnaliz(null);
                  }}
                  style={{
                      marginTop: '20px', flex: 1, padding: '12px',
                      backgroundColor: '#374151', color: '#fff',
                      border: 'none', borderRadius: '6px', cursor: 'pointer',
                      fontWeight: 'bold', fontSize: '15px'
                  }}>
                  X
              </button>

              {rotaAnaliz && (
                  <div style={{ marginTop: '25px', padding: '15px', backgroundColor: '#1e293b', borderRadius: '8px', borderLeft: '4px solid #00d2ff' }}>
                      <h4 style={{ margin: '0 0 12px 0', color: '#f3f4f6', fontSize: '14px', textTransform: 'uppercase' }}>📊 Sistem Analizi</h4>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ color: '#9ca3af', fontSize: '13px' }}>Süre:</span>
                          <span style={{ color: '#00d2ff', fontWeight: 'bold', fontSize: '13px' }}>{rotaAnaliz.ulasim_suresi_dk} dk</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ color: '#9ca3af', fontSize: '13px' }}>Yürüyüş:</span>
                          <span style={{ color: '#f3f4f6', fontWeight: 'bold', fontSize: '13px' }}>{rotaAnaliz.yuruyus_mesafe_km} km</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#9ca3af', fontSize: '13px' }}>Aktarma:</span>
                          <span style={{ color: '#f3f4f6', fontWeight: 'bold', fontSize: '13px' }}>{rotaAnaliz.aktarma_sayisi}</span>
                      </div>
                  </div>
              )}
          </div>

          {/* HARİTA ALANI */}
          <div style={{ flex: 1, backgroundColor: '#0b0f19' }}>

              {/* RADAR OVERLAY (Sadece taramaYapiliyor true ise görünür) */}
              {taramaYapiliyor && (
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center', pointerEvents: 'none' }}>
                      <div style={{ position: 'relative', width: '200px', height: '200px', borderRadius: '50%', border: '2px solid rgba(0, 210, 255, 0.5)', background: 'radial-gradient(circle, rgba(0,210,255,0.1) 0%, rgba(0,0,0,0) 70%)', animation: 'pulseGlow 2s infinite', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'conic-gradient(from 0deg, rgba(0, 210, 255, 0) 70%, rgba(0, 210, 255, 0.8) 100%)', borderRadius: '50%', animation: 'radarSweep 1.5s linear infinite' }}></div>
                          <div style={{ position: 'relative', zIndex: 10, color: '#00d2ff', fontWeight: 'bold', letterSpacing: '2px', textShadow: '0 0 10px #00d2ff', fontSize: '13px', textAlign: 'center' }}>AĞ<br/>TARANIYOR</div>
                      </div>
                  </div>
              )}

              {/* HARİTANIN KENDİSİ VE BLUR EFEKTİ KAPSAYICISI */}
              <div style={{ height: '100%', width: '100%', transition: 'filter 0.6s ease', filter: taramaYapiliyor ? 'blur(6px) brightness(0.5) grayscale(40%)' : 'none', pointerEvents: taramaYapiliyor ? 'none' : 'auto' }}>

              <MapContainer center={merkezKoordinat} zoom={12} style={{ height: '100%', width: '100%' }}>

                  {/* DİNAMİK TEMA HARİTA ALTLIĞI */}
                  <TileLayer
                      url={karanlikTema ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}
                      attribution={karanlikTema ? '&copy; <a href="https://carto.com/">CartoDB</a>' : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}
                  />

                  {kullaniciKonum && (
                      <CircleMarker
                          center={kullaniciKonum}
                          radius={6}
                          pathOptions={{ fillColor: '#00d2ff', color: '#fff', weight: 2, fillOpacity: 1 }}
                      >
                          <Popup>Şu an buradasınız</Popup>
                      </CircleMarker>
                  )}

                  {sehirVerisi.duraklar?.map((durak, index) => {
                      const lat = durak.x || durak.X;
                      const lng = durak.y || durak.Y;
                      const id = durak.id || durak.ID || index;
                      const ad = durak.ad || durak.Ad;
                      if (lat === undefined || lng === undefined) return null;

                      return (
                          <Marker key={id} position={[lat, lng]}>
                              <Popup>
                                  <div style={{ textAlign: 'center', minWidth: '130px' }}>
                                      <strong style={{ color: '#111827', fontSize: '14px', display: 'block', marginBottom: '2px' }}>{ad}</strong>
                                      <span style={{ fontSize: '11px', color: '#6b7280', display: 'block', marginBottom: '10px' }}>Sistem ID: {id}</span>

                                      <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                                          <button
                                              onClick={() => setBaslangic(id.toString())}
                                              style={{ flex: 1, backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', transition: 'background 0.2s' }}
                                              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                                              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
                                          >
                                              📍 Başlangıç
                                          </button>
                                          <button
                                              onClick={() => setHedef(id.toString())}
                                              style={{ flex: 1, backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', transition: 'background 0.2s' }}
                                              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                                              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
                                          >
                                              🎯 Hedef
                                          </button>
                                      </div>
                                  </div>
                              </Popup>
                          </Marker>
                      );
                  })}

                  {sehirVerisi.hatlar?.map((hat, index) => {
                      const hBaslangic = hat.BaslangicID || hat.baslangicID;
                      const hHedef = hat.HedefID || hat.hedefID;
                      const hAd = hat.HatAd || hat.hatAd;

                      const baslangicDurak = sehirVerisi.duraklar.find(d => d.id === hBaslangic || d.ID === hBaslangic);
                      const hedefDurak = sehirVerisi.duraklar.find(d => d.id === hHedef || d.ID === hHedef);

                      if (baslangicDurak && hedefDurak) {
                          const isSelected = seciliHat === hAd;
                          const isFaded = gercekRota && gercekRota.length > 0 ? true : (seciliHat !== '' && !isSelected);

                          return (
                              <Polyline
                                  key={`hat-${index}-${gercekRota ? gercekRota.length : 0}`}
                                  positions={[
                                      [baslangicDurak.x || baslangicDurak.X, baslangicDurak.y || baslangicDurak.Y],
                                      [hedefDurak.x || hedefDurak.X, hedefDurak.y || hedefDurak.Y]
                                  ]}
                                  color={isSelected && !isFaded ? "#00d2ff" : "#374151"}
                                  weight={isSelected && !isFaded ? 5 : 1}
                                  opacity={isFaded ? 0.02 : (isSelected ? 1 : 0.6)}
                              >
                                  <Popup>
                                      <strong style={{ color: '#111827' }}>Hat: {hAd}</strong><br/>
                                      Mesafe: {hat.Mesafe || hat.mesafe} km<br/>
                                      Süre: {hat.Sure || hat.sure} dk
                                  </Popup>
                              </Polyline>
                          );
                      }
                      return null;
                  })}

                  <HaritaOdakla rota={gercekRota} kullanici={kullaniciKonum} temizleKodu={gercekRota.length} />

                  {/* OSRM KIRMIZI ROTA - CYBER RED */}
                  {gercekRota.length > 0 && (
                      <Polyline positions={gercekRota} color="#ff003c" weight={6} opacity={0.9} />
                  )}
              </MapContainer>

              </div>
          </div>

      </div>
  );
}

export default App;