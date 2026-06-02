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

try
{
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
                durakHashtable.Durak_Ekle(durak); // Senin yazdığın fonksiyon!
                durakAgaci.Insert(durak);         // KdTree fonksiyonu!
            }
        }
    }
}
catch (Exception) { /* Dosya okunamazsa sistem çökmesin diye güvenli çember */ }

// ==========================================
// DIŞARIYA AÇILAN API KAPILARI (ENDPOINTS)
// ==========================================


app.MapGet("/api/duraklar", () =>
{
    // Doğrudan senin Hashtable'ındaki dolu durakları listeyle React'e fırlatır
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

app.MapGet("/api/hatlar", async () =>
{
    using HttpClient client = new HttpClient();

    // Kopyaladığın GitHub Raw linkini buraya yapıştıracaksın:
    string githubRawUrl = "https://raw.githubusercontent.com/kullanici_adi/repo_adi/main/python_scripts/test.hatlar.json";

    try
    {
        // GitHub'daki JSON içeriğini internet üzerinden indiriyoruz
        string jsonMetni = await client.GetStringAsync(githubRawUrl);
        return Results.Content(jsonMetni, "application/json");
    }
    catch (Exception)
    {
        // İnternet kesilirse veya link yanlışsa hata dönmesin diye boş liste verelim
        return Results.Content("[]", "application/json");
    }
});

// React'ten "Rotayı Bul" dediğinde POST isteği atacağın yer
app.MapPost("/api/rota-bul", (RotaIstegi istek) =>
{
    // Kullanıcının React'ten gönderdiği başlangıç ve hedef ID'leri buraya düşer.
    // İleride burada: A* veya dişjkstre çalışacak.
    
    return new { 
        mesaj = "C# API'sine başarıyla ulaştın!",
        hesaplanan_rota_baslangic = istek.baslangic_id,
        hesaplanan_rota_hedef = istek.hedef_id
    };
});

// Sunucuyu başlat
app.Run();

// React'ten gelecek JSON verisini C# içinde karşılayacak kalıp (Record)
record RotaIstegi(int baslangic_id, int hedef_id);
