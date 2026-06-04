using System;

namespace TorneoManagerWeb.Domain.Models;

public class SedeBloqueo
{
    public int IdBloqueo { get; set; }
    public int IdSede { get; set; }
    public DateTime FechaBloqueada { get; set; }
    public string? Motivo { get; set; }
}
