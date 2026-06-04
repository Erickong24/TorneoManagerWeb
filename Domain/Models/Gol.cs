namespace TorneoManagerWeb.Domain.Models;

public class Gol
{
    public int IdGol { get; set; }
    public int IdPartido { get; set; }
    public int IdJugador { get; set; }
    public int Minuto { get; set; }
    public string Tipo { get; set; } = "NORMAL"; // NORMAL, PENAL, AUTOGOL

    // Navegación
    public string? NombreJugador { get; set; }
}
