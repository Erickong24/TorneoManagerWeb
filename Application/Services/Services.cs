using TorneoManagerWeb.Domain.Interfaces;
using TorneoManagerWeb.Domain.Models;

namespace TorneoManagerWeb.Application.Services;

public class TorneoService
{
    private readonly ITorneoRepositorio _repo;
    public TorneoService(ITorneoRepositorio repo) => _repo = repo;
    public List<Torneo> Listar() => _repo.Listar();
    public Torneo? Obtener(int id) => _repo.Obtener(id);
    public void Guardar(Torneo t) { if (t.IdTorneo == 0) _repo.Insertar(t); else _repo.Actualizar(t); }
    public void Eliminar(int id) => _repo.Eliminar(id);
    public List<AscensoDescenso> ListarAscensosDescensos() => _repo.ListarAscensosDescensos();
    public void RegistrarAscensoDescenso(AscensoDescenso ad) => _repo.InsertarAscensoDescenso(ad);
    public void EliminarAscensoDescenso(int id) => _repo.EliminarAscensoDescenso(id);
}

public class EquipoService
{
    private readonly IEquipoRepositorio _repo;
    public EquipoService(IEquipoRepositorio repo) => _repo = repo;
    public List<Equipo> Listar(int idTorneo) => _repo.Listar(idTorneo);
    public Equipo? Obtener(int id) => _repo.Obtener(id);
    public void Guardar(Equipo e) { if (e.IdEquipo == 0) _repo.Insertar(e); else _repo.Actualizar(e); }
    public void CambiarEstado(int id, bool activo) => _repo.CambiarEstado(id, activo);
}

public class JugadorService
{
    private readonly IJugadorRepositorio _repo;
    public JugadorService(IJugadorRepositorio repo) => _repo = repo;
    public List<Jugador> Listar(int idEquipo) => _repo.Listar(idEquipo);
    public Jugador? Obtener(int id) => _repo.Obtener(id);
    public void Guardar(Jugador j) { if (j.IdJugador == 0) _repo.Insertar(j); else _repo.Actualizar(j); }
    public void GuardarLista(List<Jugador> jugadores) { foreach (var j in jugadores) Guardar(j); }
    public void CambiarEstado(int id, bool activo) => _repo.CambiarEstado(id, activo);
}

public class PartidoService
{
    private readonly IPartidoRepositorio _partidoRepo;
    private readonly ITarjetaRepositorio _tarjetaRepo;
    private readonly IGolRepositorio _golRepo;

    public PartidoService(IPartidoRepositorio p, ITarjetaRepositorio t, IGolRepositorio g)
    { _partidoRepo = p; _tarjetaRepo = t; _golRepo = g; }

    public List<Partido> Listar(int idTorneo) => _partidoRepo.Listar(idTorneo);
    public Partido? Obtener(int id) => _partidoRepo.Obtener(id);
    public void Programar(Partido p) { if (p.IdPartido == 0) _partidoRepo.Insertar(p); else _partidoRepo.Actualizar(p); }
    public void RegistrarResultado(int id, int gl, int gv, string usuario) => _partidoRepo.RegistrarResultado(id, gl, gv, usuario);
    public void RegistrarGol(Gol g) => _golRepo.Insertar(g);
    public List<Gol> ListarGoles(int idPartido) => _golRepo.Listar(idPartido);
    public void RegistrarTarjeta(Tarjeta t) => _tarjetaRepo.Insertar(t);
    public List<Tarjeta> ListarTarjetas(int idPartido) => _tarjetaRepo.Listar(idPartido);
}

public class ReporteService
{
    private readonly IReporteRepositorio _repo;
    public ReporteService(IReporteRepositorio repo) => _repo = repo;
    public List<Posicion> Posiciones(int idTorneo) => _repo.ObtenerTablaPosiciones(idTorneo);
    public List<Goleador> Goleadores(int idTorneo) => _repo.ObtenerGoleadores(idTorneo);
    public List<SancionJugador> Sancionados(int idTorneo) => _repo.ObtenerSancionados(idTorneo);
    public List<FairPlayEntry> FairPlay(int idTorneo) => _repo.ObtenerFairPlay(idTorneo);
    public List<AuditoriaPartido> ListarAuditorias() => _repo.ListarAuditorias();
    public List<EstadisticaJugadorSummary> ObtenerEstadisticasAvanzadas(int idTorneo) => _repo.ObtenerEstadisticasAvanzadas(idTorneo);
}

public class CalendarioService
{
    private readonly ICalendarioRepositorio _repo;
    public CalendarioService(ICalendarioRepositorio repo) => _repo = repo;
    public int Reprogramar(PartidoReprogramacion r) => _repo.InsertarReprogramacion(r);
    public List<PartidoReprogramacion> ListarReprogramaciones(int idPartido) => _repo.ListarReprogramaciones(idPartido);
    public void RegistrarArbitraje(PartidoArbitraje a) => _repo.RegistrarArbitraje(a);
    public List<PartidoArbitraje> ListarArbitrajes(int idPartido) => _repo.ListarArbitrajes(idPartido);
}

public class ArbitroService
{
    private readonly IArbitroRepositorio _repo;
    public ArbitroService(IArbitroRepositorio repo) => _repo = repo;
    public List<Arbitro> Listar() => _repo.Listar();
    public int Guardar(Arbitro a) { if (a.IdArbitro == 0) return _repo.Insertar(a); _repo.Actualizar(a); return a.IdArbitro; }
}

public class SedeService
{
    private readonly ISedeRepositorio _repo;
    public SedeService(ISedeRepositorio repo) => _repo = repo;
    public List<Sede> Listar() => _repo.Listar();
    public int Guardar(Sede s) { if (s.IdSede == 0) return _repo.Insertar(s); _repo.Actualizar(s); return s.IdSede; }
    public List<SedeBloqueo> ListarBloqueos(int idSede) => _repo.ListarBloqueos(idSede);
    public void GuardarBloqueo(SedeBloqueo b) => _repo.InsertarBloqueo(b);
    public void EliminarBloqueo(int id) => _repo.EliminarBloqueo(id);
}

public class EstadisticaService
{
    private readonly IEstadisticaRepositorio _repo;
    public EstadisticaService(IEstadisticaRepositorio repo) => _repo = repo;
    public void RegistrarEvento(PartidoEventoJugador e) => _repo.RegistrarEventoJugador(e);
    public List<PartidoEventoJugador> ListarEventos(int idPartido) => _repo.ListarEventosPorPartido(idPartido);
    public List<RachaEquipo> ListarRachas(int idTorneo) => _repo.ListarRachas(idTorneo);
    public void RegistrarPartidoJugador(PartidoJugador alignment) => _repo.RegistrarPartidoJugador(alignment);
    public List<PartidoJugador> ListarJugadoresPorPartido(int idPartido) => _repo.ListarJugadoresPorPartido(idPartido);
    public void LimpiarDetallesPartido(int idPartido) { _repo.LimpiarAlineacion(idPartido); _repo.LimpiarEventos(idPartido); }
    public void RegistrarRacha(RachaEquipo racha) => _repo.RegistrarRacha(racha);
}

public class ApelacionService
{
    private readonly IApelacionRepositorio _repo;
    public ApelacionService(IApelacionRepositorio repo) => _repo = repo;
    public List<Apelacion> Listar(int idSancion) => _repo.ListarPorSancion(idSancion);
    public void Insertar(Apelacion a) => _repo.Insertar(a);
    public void Resolver(Apelacion a) => _repo.Actualizar(a);
}
