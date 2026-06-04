namespace TorneoManagerWeb.Domain.Models;

public class RachaEquipo
{
    public int IdRacha { get; set; }
    public int IdEquipo { get; set; }
    public int PartidosInvicto { get; set; }
    public int PartidosGanados { get; set; }
    public int GolesFavor { get; set; }
    public int GolesContra { get; set; }
    public DateTime? DesdeFecha { get; set; }
    public DateTime? HastaFecha { get; set; }
}
