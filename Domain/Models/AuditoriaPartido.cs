using System;

namespace TorneoManagerWeb.Domain.Models;

public class AuditoriaPartido
{
    public int IdAuditoria { get; set; }
    public int? IdPartido { get; set; }
    public string? Usuario { get; set; }
    public DateTime FechaHora { get; set; }
    public string? DetalleAntes { get; set; }
    public string? DetalleDespues { get; set; }

    // UI Helpers
    public string? DetallePartido { get; set; }
}
