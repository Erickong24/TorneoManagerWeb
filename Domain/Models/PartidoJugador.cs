namespace TorneoManagerWeb.Domain.Models;

public class PartidoJugador
{
    public int IdPartido { get; set; }
    public int IdJugador { get; set; }
    public string Titular { get; set; } = "S";
    public int? MinutosJugados { get; set; }
    public int Goles { get; set; }

    // Helpers for UI representation
    public string? NombreJugador { get; set; }
    public string? NombreEquipo { get; set; }
}
