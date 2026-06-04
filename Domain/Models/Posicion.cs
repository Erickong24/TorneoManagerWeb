namespace TorneoManagerWeb.Domain.Models;

public class Posicion
{
    public int IdTorneo { get; set; }
    public string? NombreTorneo { get; set; }
    public int IdEquipo { get; set; }
    public string? NombreEquipo { get; set; }
    public int PJ { get; set; }
    public int PG { get; set; }
    public int PE { get; set; }
    public int PP { get; set; }
    public int GF { get; set; }
    public int GC { get; set; }
    public int DG { get; set; }
    public int Puntos { get; set; }
}
