namespace TorneoManagerWeb.Domain.Models;

public class Torneo
{
    public int IdTorneo { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public DateTime? FechaInicio { get; set; }
    public DateTime? FechaFin { get; set; }
    public int PuntosVictoria { get; set; } = 3;
    public int PuntosEmpate { get; set; } = 1;
    public int PuntosDerrota { get; set; } = 0;
    public int AmarillasParaSuspension { get; set; } = 3;
    public int RojasParaSuspension { get; set; } = 1;
    public string Categoria { get; set; } = "LIBRE";
    public string? Division { get; set; }
    public string Estado { get; set; } = "ACTIVO";
}
