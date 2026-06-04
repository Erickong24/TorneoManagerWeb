namespace TorneoManagerWeb.Domain.Models;

public class Arbitro
{
    public int IdArbitro { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Tipo { get; set; } = "PRINCIPAL"; // PRINCIPAL, ASISTENTE, VEEDOR
    public string Activo { get; set; } = "S";
}
