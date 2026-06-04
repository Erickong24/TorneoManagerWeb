namespace TorneoManagerWeb.Domain.Models;

public class Jugador
{
    public int IdJugador { get; set; }
    public int IdEquipo { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Apellido { get; set; } = string.Empty;
    public string? Posicion { get; set; }
    public int? Dorsal { get; set; }
    public string Estado { get; set; } = "ACTIVO"; // ACTIVO, SUSPENDIDO
    public string Activo { get; set; } = "S";

    // Navegación
    public string? NombreEquipo { get; set; }
}
