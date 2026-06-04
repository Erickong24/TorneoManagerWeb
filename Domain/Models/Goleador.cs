namespace TorneoManagerWeb.Domain.Models;

public class Goleador
{
    public int IdTorneo { get; set; }
    public int IdJugador { get; set; }
    public string NombreCompleto { get; set; } = string.Empty;
    public string Equipo { get; set; } = string.Empty;
    public int TotalGoles { get; set; }
}
