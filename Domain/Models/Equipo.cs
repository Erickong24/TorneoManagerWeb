namespace TorneoManagerWeb.Domain.Models;

public class Equipo
{
    public int IdEquipo { get; set; }
    public int IdTorneo { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? Ciudad { get; set; }
    public string? Tecnico { get; set; }
    public string Activo { get; set; } = "S";
}
