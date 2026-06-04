using Microsoft.AspNetCore.Mvc;
using TorneoManagerWeb.Application.Services;
using TorneoManagerWeb.Domain.Models;

namespace TorneoManagerWeb.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TorneosController : ControllerBase
{
    private readonly TorneoService _svc;
    private readonly ILogger<TorneosController> _log;

    public TorneosController(TorneoService svc, ILogger<TorneosController> log) { _svc = svc; _log = log; }

    [HttpGet]
    public IActionResult Listar() { try { return Ok(_svc.Listar()); } catch (Exception ex) { _log.LogError(ex, "Error listando torneos"); return StatusCode(500, new { error = ex.Message }); } }

    [HttpGet("{id}")]
    public IActionResult Obtener(int id) { try { var t = _svc.Obtener(id); return t == null ? NotFound() : Ok(t); } catch (Exception ex) { _log.LogError(ex, "Error obteniendo torneo {Id}", id); return StatusCode(500, new { error = ex.Message }); } }

    [HttpPost]
    public IActionResult Crear([FromBody] Torneo torneo) { try { _svc.Guardar(torneo); return Ok(new { message = "Torneo creado" }); } catch (Exception ex) { _log.LogError(ex, "Error creando torneo"); return StatusCode(500, new { error = ex.Message }); } }

    [HttpPut("{id}")]
    public IActionResult Actualizar(int id, [FromBody] Torneo torneo) { try { torneo.IdTorneo = id; _svc.Guardar(torneo); return Ok(new { message = "Torneo actualizado" }); } catch (Exception ex) { _log.LogError(ex, "Error actualizando torneo {Id}", id); return StatusCode(500, new { error = ex.Message }); } }

    [HttpDelete("{id}")]
    public IActionResult Eliminar(int id) { try { _svc.Eliminar(id); return Ok(new { message = "Torneo desactivado" }); } catch (Exception ex) { _log.LogError(ex, "Error eliminando torneo {Id}", id); return StatusCode(500, new { error = ex.Message }); } }

    [HttpGet("movimientos")]
    public IActionResult ListarAscensosDescensos() { try { return Ok(_svc.ListarAscensosDescensos()); } catch (Exception ex) { _log.LogError(ex, "Error"); return StatusCode(500, new { error = ex.Message }); } }

    [HttpPost("movimientos")]
    public IActionResult RegistrarAscensoDescenso([FromBody] AscensoDescenso ad) { try { _svc.RegistrarAscensoDescenso(ad); return Ok(new { message = "Movimiento registrado" }); } catch (Exception ex) { _log.LogError(ex, "Error"); return StatusCode(500, new { error = ex.Message }); } }

    [HttpDelete("movimientos/{id}")]
    public IActionResult EliminarAscensoDescenso(int id) { try { _svc.EliminarAscensoDescenso(id); return Ok(new { message = "Movimiento eliminado" }); } catch (Exception ex) { _log.LogError(ex, "Error"); return StatusCode(500, new { error = ex.Message }); } }
}

[ApiController]
[Route("api/[controller]")]
public class EquiposController : ControllerBase
{
    private readonly EquipoService _svc;
    private readonly ILogger<EquiposController> _log;
    public EquiposController(EquipoService svc, ILogger<EquiposController> log) { _svc = svc; _log = log; }

    [HttpGet("torneo/{idTorneo}")]
    public IActionResult Listar(int idTorneo) { try { return Ok(_svc.Listar(idTorneo)); } catch (Exception ex) { _log.LogError(ex, "Error"); return StatusCode(500, new { error = ex.Message }); } }

    [HttpGet("{id}")]
    public IActionResult Obtener(int id) { try { var e = _svc.Obtener(id); return e == null ? NotFound() : Ok(e); } catch (Exception ex) { _log.LogError(ex, "Error"); return StatusCode(500, new { error = ex.Message }); } }

    [HttpPost]
    public IActionResult Crear([FromBody] Equipo equipo) { try { _svc.Guardar(equipo); return Ok(new { message = "Equipo creado" }); } catch (Exception ex) { _log.LogError(ex, "Error"); return StatusCode(500, new { error = ex.Message }); } }

    [HttpPut("{id}")]
    public IActionResult Actualizar(int id, [FromBody] Equipo equipo) { try { equipo.IdEquipo = id; _svc.Guardar(equipo); return Ok(new { message = "Equipo actualizado" }); } catch (Exception ex) { _log.LogError(ex, "Error"); return StatusCode(500, new { error = ex.Message }); } }

    [HttpPatch("{id}/estado")]
    public IActionResult CambiarEstado(int id, [FromBody] bool activo) { try { _svc.CambiarEstado(id, activo); return Ok(new { message = "Estado actualizado" }); } catch (Exception ex) { _log.LogError(ex, "Error"); return StatusCode(500, new { error = ex.Message }); } }
}

[ApiController]
[Route("api/[controller]")]
public class JugadoresController : ControllerBase
{
    private readonly JugadorService _svc;
    private readonly ILogger<JugadoresController> _log;
    public JugadoresController(JugadorService svc, ILogger<JugadoresController> log) { _svc = svc; _log = log; }

    [HttpGet("equipo/{idEquipo}")]
    public IActionResult Listar(int idEquipo) { try { return Ok(_svc.Listar(idEquipo)); } catch (Exception ex) { _log.LogError(ex, "Error"); return StatusCode(500, new { error = ex.Message }); } }

    [HttpPost]
    public IActionResult Crear([FromBody] Jugador jugador) { try { _svc.Guardar(jugador); return Ok(new { message = "Jugador guardado" }); } catch (Exception ex) { _log.LogError(ex, "Error"); return StatusCode(500, new { error = ex.Message }); } }

    [HttpPut("{id}")]
    public IActionResult Actualizar(int id, [FromBody] Jugador jugador) { try { jugador.IdJugador = id; _svc.Guardar(jugador); return Ok(new { message = "Jugador actualizado" }); } catch (Exception ex) { _log.LogError(ex, "Error"); return StatusCode(500, new { error = ex.Message }); } }

    [HttpPost("bulk")]
    public IActionResult GuardarLista([FromBody] List<Jugador> jugadores) { try { _svc.GuardarLista(jugadores); return Ok(new { message = "Jugadores guardados" }); } catch (Exception ex) { _log.LogError(ex, "Error"); return StatusCode(500, new { error = ex.Message }); } }
}

[ApiController]
[Route("api/[controller]")]
public class PartidosController : ControllerBase
{
    private readonly PartidoService _svc;
    private readonly CalendarioService _cal;
    private readonly ILogger<PartidosController> _log;
    public PartidosController(PartidoService svc, CalendarioService cal, ILogger<PartidosController> log) { _svc = svc; _cal = cal; _log = log; }

    [HttpGet("torneo/{idTorneo}")]
    public IActionResult Listar(int idTorneo) { try { return Ok(_svc.Listar(idTorneo)); } catch (Exception ex) { _log.LogError(ex, "Error"); return StatusCode(500, new { error = ex.Message }); } }

    [HttpGet("{id}")]
    public IActionResult Obtener(int id) { try { var p = _svc.Obtener(id); return p == null ? NotFound() : Ok(p); } catch (Exception ex) { _log.LogError(ex, "Error"); return StatusCode(500, new { error = ex.Message }); } }

    [HttpPost]
    public IActionResult Programar([FromBody] ProgramarPartidoRequest req)
    {
        try
        {
            var partido = new Partido
            {
                IdTorneo = req.IdTorneo, IdLocal = req.IdLocal, IdVisitante = req.IdVisitante,
                IdSede = req.IdSede, Fecha = req.Fecha, Jornada = req.Jornada,
                FormacionLocal = req.FormacionLocal, FormacionVisitante = req.FormacionVisitante
            };
            _svc.Programar(partido);
            if (partido.IdPartido != 0 && req.IdArbitro.HasValue)
            {
                _cal.RegistrarArbitraje(new PartidoArbitraje { IdPartido = partido.IdPartido, IdArbitro = req.IdArbitro.Value, Rol = "PRINCIPAL" });
            }
            return Ok(new { message = "Partido programado", idPartido = partido.IdPartido });
        }
        catch (Exception ex) { _log.LogError(ex, "Error programando partido"); return StatusCode(500, new { error = ex.Message }); }
    }

    [HttpPost("{id}/resultado")]
    public IActionResult RegistrarResultado(int id, [FromBody] ResultadoRequest req)
    {
        try { _svc.RegistrarResultado(id, req.GolesLocal, req.GolesVisitante, req.Usuario ?? "WEB_USER"); return Ok(new { message = "Resultado registrado" }); }
        catch (Exception ex) { _log.LogError(ex, "Error"); return StatusCode(500, new { error = ex.Message }); }
    }

    [HttpGet("{id}/goles")]
    public IActionResult ListarGoles(int id) { try { return Ok(_svc.ListarGoles(id)); } catch (Exception ex) { _log.LogError(ex, "Error"); return StatusCode(500, new { error = ex.Message }); } }

    [HttpPost("{id}/goles")]
    public IActionResult RegistrarGol(int id, [FromBody] Gol gol) { try { gol.IdPartido = id; _svc.RegistrarGol(gol); return Ok(new { message = "Gol registrado" }); } catch (Exception ex) { _log.LogError(ex, "Error"); return StatusCode(500, new { error = ex.Message }); } }

    [HttpGet("{id}/tarjetas")]
    public IActionResult ListarTarjetas(int id) { try { return Ok(_svc.ListarTarjetas(id)); } catch (Exception ex) { _log.LogError(ex, "Error"); return StatusCode(500, new { error = ex.Message }); } }

    [HttpPost("{id}/tarjetas")]
    public IActionResult RegistrarTarjeta(int id, [FromBody] Tarjeta tarjeta) { try { tarjeta.IdPartido = id; _svc.RegistrarTarjeta(tarjeta); return Ok(new { message = "Tarjeta registrada" }); } catch (Exception ex) { _log.LogError(ex, "Error"); return StatusCode(500, new { error = ex.Message }); } }

    [HttpPost("{id}/reprogramar")]
    public IActionResult Reprogramar(int id, [FromBody] ReprogramarRequest req)
    {
        try
        {
            var partido = _svc.Obtener(id);
            if (partido == null) return NotFound();
            if (partido.Estado == "JUGADO") return BadRequest(new { error = "No se puede reprogramar un partido jugado" });
            _cal.Reprogramar(new PartidoReprogramacion { IdPartido = id, FechaAnterior = partido.Fecha, FechaNueva = req.FechaNueva, Motivo = req.Motivo, Notificado = "N" });
            partido.Fecha = req.FechaNueva;
            _svc.Programar(partido);
            return Ok(new { message = "Partido reprogramado" });
        }
        catch (Exception ex) { _log.LogError(ex, "Error"); return StatusCode(500, new { error = ex.Message }); }
    }

    [HttpGet("{id}/arbitrajes")]
    public IActionResult ListarArbitrajes(int id) { try { return Ok(_cal.ListarArbitrajes(id)); } catch (Exception ex) { _log.LogError(ex, "Error"); return StatusCode(500, new { error = ex.Message }); } }

    [HttpGet("{id}/reprogramaciones")]
    public IActionResult ListarReprogramaciones(int id) { try { return Ok(_cal.ListarReprogramaciones(id)); } catch (Exception ex) { _log.LogError(ex, "Error"); return StatusCode(500, new { error = ex.Message }); } }

    [HttpPost("{id}/arbitrajes")]
    public IActionResult RegistrarArbitraje(int id, [FromBody] PartidoArbitraje a) { try { a.IdPartido = id; _cal.RegistrarArbitraje(a); return Ok(new { message = "Arbitraje registrado" }); } catch (Exception ex) { _log.LogError(ex, "Error"); return StatusCode(500, new { error = ex.Message }); } }
}

// DTOs for requests
public record ProgramarPartidoRequest(int IdTorneo, int IdLocal, int IdVisitante, int? IdSede, DateTime? Fecha, int? Jornada, string? FormacionLocal, string? FormacionVisitante, int? IdArbitro);
public record ResultadoRequest(int GolesLocal, int GolesVisitante, string? Usuario);
public record ReprogramarRequest(DateTime FechaNueva, string? Motivo);

[ApiController]
[Route("api/[controller]")]
public class ReportesController : ControllerBase
{
    private readonly ReporteService _svc;
    private readonly ILogger<ReportesController> _log;
    public ReportesController(ReporteService svc, ILogger<ReportesController> log) { _svc = svc; _log = log; }

    [HttpGet("{idTorneo}/posiciones")]
    public IActionResult Posiciones(int idTorneo) { try { return Ok(_svc.Posiciones(idTorneo)); } catch (Exception ex) { _log.LogError(ex, "Error"); return StatusCode(500, new { error = ex.Message }); } }

    [HttpGet("{idTorneo}/goleadores")]
    public IActionResult Goleadores(int idTorneo) { try { return Ok(_svc.Goleadores(idTorneo)); } catch (Exception ex) { _log.LogError(ex, "Error"); return StatusCode(500, new { error = ex.Message }); } }

    [HttpGet("{idTorneo}/sancionados")]
    public IActionResult Sancionados(int idTorneo) { try { return Ok(_svc.Sancionados(idTorneo)); } catch (Exception ex) { _log.LogError(ex, "Error"); return StatusCode(500, new { error = ex.Message }); } }

    [HttpGet("{idTorneo}/fairplay")]
    public IActionResult FairPlay(int idTorneo) { try { return Ok(_svc.FairPlay(idTorneo)); } catch (Exception ex) { _log.LogError(ex, "Error"); return StatusCode(500, new { error = ex.Message }); } }

    [HttpGet("auditorias")]
    public IActionResult ListarAuditorias() { try { return Ok(_svc.ListarAuditorias()); } catch (Exception ex) { _log.LogError(ex, "Error"); return StatusCode(500, new { error = ex.Message }); } }

    [HttpGet("{idTorneo}/avanzadas")]
    public IActionResult ObtenerAvanzadas(int idTorneo) { try { return Ok(_svc.ObtenerEstadisticasAvanzadas(idTorneo)); } catch (Exception ex) { _log.LogError(ex, "Error"); return StatusCode(500, new { error = ex.Message }); } }
}

[ApiController]
[Route("api/[controller]")]
public class ArbitrosController : ControllerBase
{
    private readonly ArbitroService _svc;
    private readonly ILogger<ArbitrosController> _log;
    public ArbitrosController(ArbitroService svc, ILogger<ArbitrosController> log) { _svc = svc; _log = log; }

    [HttpGet]
    public IActionResult Listar() { try { return Ok(_svc.Listar()); } catch (Exception ex) { _log.LogError(ex, "Error"); return StatusCode(500, new { error = ex.Message }); } }

    [HttpPost]
    public IActionResult Crear([FromBody] Arbitro arbitro) { try { var id = _svc.Guardar(arbitro); return Ok(new { message = "Árbitro guardado", idArbitro = id }); } catch (Exception ex) { _log.LogError(ex, "Error"); return StatusCode(500, new { error = ex.Message }); } }

    [HttpPut("{id}")]
    public IActionResult Actualizar(int id, [FromBody] Arbitro arbitro) { try { arbitro.IdArbitro = id; _svc.Guardar(arbitro); return Ok(new { message = "Árbitro actualizado" }); } catch (Exception ex) { _log.LogError(ex, "Error"); return StatusCode(500, new { error = ex.Message }); } }
}

[ApiController]
[Route("api/[controller]")]
public class SedesController : ControllerBase
{
    private readonly SedeService _svc;
    private readonly ILogger<SedesController> _log;
    public SedesController(SedeService svc, ILogger<SedesController> log) { _svc = svc; _log = log; }

    [HttpGet]
    public IActionResult Listar() { try { return Ok(_svc.Listar()); } catch (Exception ex) { _log.LogError(ex, "Error"); return StatusCode(500, new { error = ex.Message }); } }

    [HttpPost]
    public IActionResult Crear([FromBody] Sede sede) { try { var id = _svc.Guardar(sede); return Ok(new { message = "Sede guardada", idSede = id }); } catch (Exception ex) { _log.LogError(ex, "Error"); return StatusCode(500, new { error = ex.Message }); } }

    [HttpPut("{id}")]
    public IActionResult Actualizar(int id, [FromBody] Sede sede) { try { sede.IdSede = id; _svc.Guardar(sede); return Ok(new { message = "Sede actualizada" }); } catch (Exception ex) { _log.LogError(ex, "Error"); return StatusCode(500, new { error = ex.Message }); } }

    [HttpGet("{id}/bloqueos")]
    public IActionResult ListarBloqueos(int id) { try { return Ok(_svc.ListarBloqueos(id)); } catch (Exception ex) { _log.LogError(ex, "Error"); return StatusCode(500, new { error = ex.Message }); } }

    [HttpPost("{id}/bloqueos")]
    public IActionResult GuardarBloqueo(int id, [FromBody] SedeBloqueo b) { try { b.IdSede = id; _svc.GuardarBloqueo(b); return Ok(new { message = "Bloqueo registrado" }); } catch (Exception ex) { _log.LogError(ex, "Error"); return StatusCode(500, new { error = ex.Message }); } }

    [HttpDelete("bloqueos/{id}")]
    public IActionResult EliminarBloqueo(int id) { try { _svc.EliminarBloqueo(id); return Ok(new { message = "Bloqueo eliminado" }); } catch (Exception ex) { _log.LogError(ex, "Error"); return StatusCode(500, new { error = ex.Message }); } }
}

[ApiController]
[Route("api/[controller]")]
public class ApelacionesController : ControllerBase
{
    private readonly ApelacionService _svc;
    private readonly ILogger<ApelacionesController> _log;
    public ApelacionesController(ApelacionService svc, ILogger<ApelacionesController> log) { _svc = svc; _log = log; }

    [HttpGet("sancion/{idSancion}")]
    public IActionResult Listar(int idSancion) { try { return Ok(_svc.Listar(idSancion)); } catch (Exception ex) { _log.LogError(ex, "Error"); return StatusCode(500, new { error = ex.Message }); } }

    [HttpPost]
    public IActionResult Crear([FromBody] Apelacion apelacion) { try { _svc.Insertar(apelacion); return Ok(new { message = "Apelación registrada" }); } catch (Exception ex) { _log.LogError(ex, "Error"); return StatusCode(500, new { error = ex.Message }); } }

    [HttpPut("{id}")]
    public IActionResult Resolver(int id, [FromBody] Apelacion apelacion) { try { apelacion.IdApelacion = id; _svc.Resolver(apelacion); return Ok(new { message = "Apelación resuelta" }); } catch (Exception ex) { _log.LogError(ex, "Error"); return StatusCode(500, new { error = ex.Message }); } }
}

[ApiController]
[Route("api/[controller]")]
public class EstadisticasController : ControllerBase
{
    private readonly EstadisticaService _svc;
    private readonly ILogger<EstadisticasController> _log;
    public EstadisticasController(EstadisticaService svc, ILogger<EstadisticasController> log) { _svc = svc; _log = log; }

    [HttpGet("rachas/{idTorneo}")]
    public IActionResult ListarRachas(int idTorneo) { try { return Ok(_svc.ListarRachas(idTorneo)); } catch (Exception ex) { _log.LogError(ex, "Error"); return StatusCode(500, new { error = ex.Message }); } }

    [HttpGet("partido/{idPartido}/eventos")]
    public IActionResult ListarEventos(int idPartido) { try { return Ok(_svc.ListarEventos(idPartido)); } catch (Exception ex) { _log.LogError(ex, "Error"); return StatusCode(500, new { error = ex.Message }); } }

    [HttpGet("partido/{idPartido}/alineacion")]
    public IActionResult ListarAlineacion(int idPartido) { try { return Ok(_svc.ListarJugadoresPorPartido(idPartido)); } catch (Exception ex) { _log.LogError(ex, "Error"); return StatusCode(500, new { error = ex.Message }); } }

    [HttpPost("partido/{idPartido}/detalles")]
    public IActionResult GuardarDetallesPartido(int idPartido, [FromBody] GuardarDetallesRequest req)
    {
        try
        {
            _svc.LimpiarDetallesPartido(idPartido);
            
            if (req.Alineaciones != null)
            {
                foreach (var pj in req.Alineaciones)
                {
                    pj.IdPartido = idPartido;
                    _svc.RegistrarPartidoJugador(pj);
                }
            }
            
            if (req.Eventos != null)
            {
                foreach (var ev in req.Eventos)
                {
                    ev.IdPartido = idPartido;
                    _svc.RegistrarEvento(ev);
                }
            }

            return Ok(new { message = "Detalles y alineaciones guardados" });
        }
        catch (Exception ex) { _log.LogError(ex, "Error"); return StatusCode(500, new { error = ex.Message }); }
    }

    [HttpPost("racha")]
    public IActionResult RegistrarRacha([FromBody] RachaEquipo racha) { try { _svc.RegistrarRacha(racha); return Ok(new { message = "Racha registrada" }); } catch (Exception ex) { _log.LogError(ex, "Error"); return StatusCode(500, new { error = ex.Message }); } }
}


public class GuardarDetallesRequest
{
    public List<PartidoJugador> Alineaciones { get; set; } = new();
    public List<PartidoEventoJugador> Eventos { get; set; } = new();
}
