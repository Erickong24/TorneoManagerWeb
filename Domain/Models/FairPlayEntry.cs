namespace TorneoManagerWeb.Domain.Models;

public class FairPlayEntry
{
    public int IdTorneo { get; set; }
    public string Equipo { get; set; } = string.Empty;
    public int Amarillas { get; set; }
    public int Rojas { get; set; }
    public int Puntos { get; set; }
}
