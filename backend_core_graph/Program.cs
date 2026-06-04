using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using backend_core_graph; // Graph, Durak class'larını kullanabilmek için

var builder = WebApplication.CreateBuilder(args);

// REACT İÇİN İZİN KARTI (CORS AYARI) 
builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactIzin", policy =>
    {
        policy.WithOrigins("http://localhost:5173") // Senin React arayüzünün adresi
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// İzni aktifleştir
app.UseCors("ReactIzin");

Hashtable durakHashtable = new Hashtable();
KdTree durakAgaci = new KdTree();
Multigraph sehirGrafi = new Multigraph();
List<HatVerisi> tumHatlar = new List<HatVerisi>();

try
{
    // Durakları Oku
    string jsonYolu = "../python_scripts/test_sehir.json";
    if (System.IO.File.Exists(jsonYolu))
    {
        string jsonMetni = System.IO.File.ReadAllText(jsonYolu);
        var gelenDuraklar = System.Text.Json.JsonSerializer.Deserialize<List<Durak>>(jsonMetni,
            new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        if (gelenDuraklar != null)
        {
            foreach (var durak in gelenDuraklar)
            {
                durakHashtable.Durak_Ekle(durak);
                durakAgaci.Insert(durak);
            }
        }
    }

    // Hatları Oku
    string hatJsonYolu = "../python_scripts/test_hatlar.json";
    if (System.IO.File.Exists(hatJsonYolu))
    {
        string hatJsonMetni = System.IO.File.ReadAllText(hatJsonYolu);
        var gelenHatlar = System.Text.Json.JsonSerializer.Deserialize<List<HatVerisi>>(hatJsonMetni,
            new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        if (gelenHatlar != null) {
            tumHatlar = gelenHatlar;
        }
    }
}
catch (Exception) { }

// ==========================================
// DIŞARIYA AÇILAN API KAPILARI (ENDPOINTS)
// ==========================================


app.MapGet("/api/duraklar", () =>
{
    return Results.Ok(durakHashtable.TumDuraklariGetir());
});

app.MapGet("/api/enyakin-durak", (float lat, float lng) =>
{
    var enYakin = durakAgaci.FindNearest(lat, lng);

    if (enYakin == null) return Results.NotFound();

    return Results.Ok(new {
        ID = enYakin.ID,
        Ad = enYakin.Ad,
        X = enYakin.X,
        Y = enYakin.Y
    });
});

app.MapGet("/api/hatlar", () =>
{
    return Results.Ok(tumHatlar);
});

app.MapGet("/api/duraktan-gecen-hatlar", (int id) =>
{
    // Başlangıç veya Hedef ID'si kullanıcının seçtiği durağa eşit olan hatları bulur.
    // .Distinct() komutu sayesinde "38T" ismini listeye 10 kere yazmak yerine 1 kere yazar.
    var gecenHatlar = tumHatlar
        .Where(h => h.BaslangicID == id || h.HedefID == id)
        .Select(h => h.HatAd)
        .Distinct()
        .ToList();

    return Results.Ok(gecenHatlar);
});

app.MapPost("/api/rota-bul", (RotaIstegi istek) =>
{
    // React'ten gelen ID'lere göre gerçek durak nesnelerini buluyoruz
    var kaynak = durakHashtable.Durak_Getir(istek.baslangic_id);
    var hedef = durakHashtable.Durak_Getir(istek.hedef_id);

    if (kaynak == null || hedef == null) return Results.BadRequest("Duraklar eşleşmedi.");

    var astarSistemi = new AStarAlgorithm();

    List<Durak> bulunanRota = astarSistemi.AStar(kaynak, hedef, sehirGrafi);

    if (bulunanRota == null || bulunanRota.Count == 0) return Results.NotFound("Bu iki durak arasında geçerli bir rota bulunamadı.");

    // React'in haritada çizebilmesi için listeyi JSON formatında yolluyoruz
    return Results.Ok(new
    {
        analiz = new {
            // Şimdilik 0
            ulasim_suresi_dk = 0,
            yuruyus_mesafe_km = 0,
            aktarma_sayisi = 0
        },
        rota_detay = bulunanRota // A*'dan dönen listeyi doğrudan gönderiyoruz
    });
});

// Sunucuyu başlat
app.Run("http://0.0.0.0:5000");

public class RotaIstegi
{
    public double kullanici_x { get; set; }
    public double kullanici_y { get; set; }
    public int baslangic_id { get; set; }
    public int hedef_id { get; set; }
}
public class HatVerisi
{
    public string HatAd { get; set; }
    public double Mesafe { get; set; }
    public double Sure { get; set; }
    public int BaslangicID { get; set; }
    public int HedefID { get; set; }
}
