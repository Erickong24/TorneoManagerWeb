using TorneoManagerWeb.Infrastructure.Data;
using TorneoManagerWeb.Infrastructure.Repositories;
using TorneoManagerWeb.Domain.Interfaces;
using TorneoManagerWeb.Application.Services;

var builder = WebApplication.CreateBuilder(args);

// ---------- DI: Infrastructure ----------
builder.Services.AddScoped<OracleDbContext>();

// ---------- DI: Repositories ----------
builder.Services.AddScoped<ITorneoRepositorio, TorneoRepositorio>();
builder.Services.AddScoped<IEquipoRepositorio, EquipoRepositorio>();
builder.Services.AddScoped<IJugadorRepositorio, JugadorRepositorio>();
builder.Services.AddScoped<IPartidoRepositorio, PartidoRepositorio>();
builder.Services.AddScoped<ITarjetaRepositorio, TarjetaRepositorio>();
builder.Services.AddScoped<IGolRepositorio, GolRepositorio>();
builder.Services.AddScoped<IReporteRepositorio, ReporteRepositorio>();
builder.Services.AddScoped<IArbitroRepositorio, ArbitroRepositorio>();
builder.Services.AddScoped<ISedeRepositorio, SedeRepositorio>();
builder.Services.AddScoped<ICalendarioRepositorio, CalendarioRepositorio>();
builder.Services.AddScoped<IEstadisticaRepositorio, EstadisticaRepositorio>();
builder.Services.AddScoped<IApelacionRepositorio, ApelacionRepositorio>();

// ---------- DI: Application Services ----------
builder.Services.AddScoped<TorneoService>();
builder.Services.AddScoped<EquipoService>();
builder.Services.AddScoped<JugadorService>();
builder.Services.AddScoped<PartidoService>();
builder.Services.AddScoped<ReporteService>();
builder.Services.AddScoped<CalendarioService>();
builder.Services.AddScoped<ArbitroService>();
builder.Services.AddScoped<SedeService>();
builder.Services.AddScoped<EstadisticaService>();
builder.Services.AddScoped<ApelacionService>();

// ---------- MVC ----------
builder.Services.AddControllers()
    .AddJsonOptions(opts =>
    {
        opts.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });

// ---------- CORS for local development ----------
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

var app = builder.Build();

// ---------- Middleware pipeline ----------
app.UseCors();

// Serve frontend static files from wwwroot/
app.UseDefaultFiles();
app.UseStaticFiles();

app.MapControllers();

// Fallback: serve index.html for SPA routes
app.MapFallbackToFile("index.html");

app.Run();
