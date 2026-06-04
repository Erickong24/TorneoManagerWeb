namespace TorneoManagerWeb.Domain.Models;

public class AscensoDescenso
{
    public int IdRegistro { get; set; }
    public int IdTorneoOrigen { get; set; }
    public int IdTorneoDestino { get; set; }
    public int IdEquipo { get; set; }
    public string Movimiento { get; set; } = string.Empty; // "ASCENSO" or "DESCENSO"

    // UI Helpers
    public string? NombreTorneoOrigen { get; set; }
    public string? NombreTorneoDestino { get; set; }
    public string? NombreEquipo { get; set; }
}
