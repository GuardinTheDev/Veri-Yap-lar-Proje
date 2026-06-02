import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function HaritaOdakla({ rota, kullanici, temizleKodu }) {
    const map = useMap();
    useEffect(() => {
        if (rota && rota.length > 0) {
            map.flyToBounds(rota, {padding: [50, 50], duration: 1.5});
        } else if (kullanici) {
            // Rota yoksa veya temizlendiyse kullanıcıya odakla
            map.flyTo(kullanici, 15, {duration: 1.5});
        }
    }, [rota, kullanici, map, temizleKodu]); // temizleKodu değiştikçe tetiklenir
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
  const [duraktanGecenHatlar, setDuraktanGecenHatlar] = useState([]);
  const [seciliHat, setSeciliHat] = useState('');

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
        } else {
            setDuraktanGecenHatlar([]);
            setSeciliHat('');
        }
    }, [baslangic]);
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
            baslangic_id: kaynakDurak.id || kaynakDurak.ID,
            hedef_id: hedefDurak.id || hedefDurak.ID
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
          const osrmKoordinatlar = data.rota_detay.map(durak => `${durak.y || durak.Y},${durak.x || durak.X}`).join(';');
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

          {/* SOL PANEL (Karanlık Tema) */}
          <div style={{ width: '320px', backgroundColor: '#111827', color: '#e5e7eb', padding: '25px', borderRight: '1px solid #1f2937', boxShadow: '4px 0 15px rgba(0, 210, 255, 0.05)', zIndex: 1000, overflowY: 'auto' }}>
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
              <MapContainer center={merkezKoordinat} zoom={12} style={{ height: '100%', width: '100%' }}>

                  {/* KARANLIK TEMA HARİTA ALTLIĞI */}
                  <TileLayer
                      url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                      attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
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
                                  <strong style={{ color: '#111827' }}>{ad}</strong> <br /> Sistem ID: {id}
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
  );
    (
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

              {duraktanGecenHatlar.length > 0 && (
                  <div style={{ marginTop: '10px' }}>
                      <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '5px' }}>
                          📍 Bu Duraktan Geçen Hatlar:
                      </label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                          {duraktanGecenHatlar.map(hatAd => (
                              <button
                                  key={hatAd}
                                  onClick={() => hatSecildi(hatAd)}
                                  style={{
                                      padding: '5px 10px',
                                      border: '1px solid #007bff',
                                      borderRadius: '15px',
                                      backgroundColor: seciliHat === hatAd ? '#007bff' : 'white',
                                      color: seciliHat === hatAd ? 'white' : '#007bff',
                                      cursor: 'pointer',
                                      fontWeight: 'bold',
                                      transition: 'all 0.2s'
                                  }}
                              >
                                  {hatAd}
                              </button>
                          ))}
                      </div>
                  </div>
              )}
              {/* -------------------------------------- */}

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
                  const hBaslangic = hat.BaslangicID || hat.baslangicID;
                  const hHedef = hat.HedefID || hat.hedefID;
                  const hAd = hat.HatAd || hat.hatAd;

                  const baslangicDurak = sehirVerisi.duraklar.find(d => d.id === hBaslangic || d.ID === hBaslangic);
                  const hedefDurak = sehirVerisi.duraklar.find(d => d.id === hHedef || d.ID === hHedef);

                  if (baslangicDurak && hedefDurak) {
                      const isSelected = seciliHat === hAd;
                      // Kırmızı rota çizildiyse VEYA başka bir hat seçildiyse saydamlaştır
                      const isFaded = gercekRota && gercekRota.length > 0 ? true : (seciliHat !== '' && !isSelected);

                      return (
                          <Polyline
                              key={`hat-${index}-${gercekRota ? gercekRota.length : 0}`}
                              positions={[
                                  [baslangicDurak.x || baslangicDurak.X, baslangicDurak.y || baslangicDurak.Y],
                                  [hedefDurak.x || hedefDurak.X, hedefDurak.y || hedefDurak.Y]
                              ]}
                              color={isSelected ? "#00d2ff" : "#6c757d"} // Seçiliyse Neon Mavi
                              weight={isSelected ? 6 : 2}
                              opacity={isFaded ? 0.02 : (isSelected ? 1 : 0.3)}
                          >
                              <Popup>
                                  <strong>Hat: {hAd}</strong><br/>
                                  Mesafe: {hat.Mesafe || hat.mesafe} km<br/>
                                  Süre: {hat.Sure || hat.sure} dk
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