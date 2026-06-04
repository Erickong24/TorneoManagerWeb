namespace TorneoManagerWeb.Domain.Models;

public class PartidoReprogramacion
{
    public int IdReprogramacion { get; set; }
    public int IdPartido { get; set; }
    public DateTime? FechaAnterior { get; set; }
    public DateTime FechaNueva { get; set; }
    public string? Motivo { get; set; }
    public string Notificado { get; set; } = "N";
}
