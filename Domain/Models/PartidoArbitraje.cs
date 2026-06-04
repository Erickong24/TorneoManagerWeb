namespace TorneoManagerWeb.Domain.Models;

public class PartidoArbitraje
{
    public int IdPartido { get; set; }
    public int IdArbitro { get; set; }
    public string Rol { get; set; } = "PRINCIPAL"; // PRINCIPAL, ASISTENTE, VEEDOR
    public int? Calificacion { get; set; } // 1-10
    public string? Comentarios { get; set; }
    public string? NombreArbitro { get; set; }
}
