namespace TorneoManagerWeb.Domain.Models;

public class Apelacion
{
    public int IdApelacion { get; set; }
    public int IdSancion { get; set; }
    public string Estado { get; set; } = "PENDIENTE"; // PENDIENTE, APROBADA, RECHAZADA
    public string? Motivo { get; set; }
    public string? Respuesta { get; set; }
    public DateTime? FechaPresentacion { get; set; }
    public DateTime? FechaResolucion { get; set; }
}
