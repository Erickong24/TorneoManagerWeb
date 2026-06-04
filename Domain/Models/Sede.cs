namespace TorneoManagerWeb.Domain.Models;

public class Sede
{
    public int IdSede { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? Direccion { get; set; }
    public string? Ciudad { get; set; }
    public string Activo { get; set; } = "S";
}
