namespace TorneoManagerWeb.Domain.Models;

public class EstadisticaJugadorSummary
{
    public int IdJugador { get; set; }
    public string NombreCompleto { get; set; } = string.Empty;
    public string Equipo { get; set; } = string.Empty;
    public int PartidosJugados { get; set; }
    public int MinutosTotales { get; set; }
    public int AsistenciasTotales { get; set; }
    public decimal XgPromedio { get; set; }
    public int MvpTotales { get; set; }
}
