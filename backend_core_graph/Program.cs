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

// ==========================================
// DIŞARIYA AÇILAN API KAPILARI (ENDPOINTS)
// ==========================================


app.MapGet("/api/duraklar", () =>
{
    // Veri yapımızdan gerçek durak listesini çekiyoruz
    var gercekDuraklar = durakHashtable.TumDuraklariGetir();
    
    // C# nesnelerini React'in beklediği formatta (ID, Ad, X, Y) haritalandırıp gönderiyoruz
    return gercekDuraklar.Select(d => new {
        ID = d.ID,
        Ad = d.Ad,
        X = d.X, // Enlem
        Y = d.Y  // Boylam
    });
});

// React'ten "Rotayı Bul" dediğinde POST isteği atacağın yer
app.MapPost("/api/rota-bul", (RotaIstegi istek) =>
{
    // Kullanıcının React'ten gönderdiği başlangıç ve hedef ID'leri buraya düşer.
    // İleride burada: Dijkstra.Hesapla(istek.baslangic_id, istek.hedef_id) çalışacak
    
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
