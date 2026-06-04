using TorneoManagerWeb.Domain.Models;

namespace TorneoManagerWeb.Domain.Interfaces;

public interface ITorneoRepositorio
{
    List<Torneo> Listar();
    Torneo? Obtener(int id);
    void Insertar(Torneo torneo);
    void Actualizar(Torneo torneo);
    void Eliminar(int id);
    List<AscensoDescenso> ListarAscensosDescensos();
    void InsertarAscensoDescenso(AscensoDescenso ad);
    void EliminarAscensoDescenso(int id);
}

public interface IEquipoRepositorio
{
    List<Equipo> Listar(int idTorneo);
    Equipo? Obtener(int id);
    void Insertar(Equipo equipo);
    void Actualizar(Equipo equipo);
    void CambiarEstado(int id, bool activo);
}

public interface IJugadorRepositorio
{
    List<Jugador> Listar(int idEquipo);
    Jugador? Obtener(int id);
    void Insertar(Jugador jugador);
    void Actualizar(Jugador jugador);
    void CambiarEstado(int id, bool activo);
}

public interface IPartidoRepositorio
{
    List<Partido> Listar(int idTorneo);
    Partido? Obtener(int id);
    void Insertar(Partido partido);
    void Actualizar(Partido partido);
    void RegistrarResultado(int idPartido, int golesLocal, int golesVisitante, string usuario);
}

public interface ITarjetaRepositorio
{
    List<Tarjeta> Listar(int idPartido);
    void Insertar(Tarjeta tarjeta);
}

public interface IGolRepositorio
{
    List<Gol> Listar(int idPartido);
    void Insertar(Gol gol);
}

public interface IReporteRepositorio
{
    List<Posicion> ObtenerTablaPosiciones(int idTorneo);
    List<Goleador> ObtenerGoleadores(int idTorneo);
    List<SancionJugador> ObtenerSancionados(int idTorneo);
    List<FairPlayEntry> ObtenerFairPlay(int idTorneo);
    List<AuditoriaPartido> ListarAuditorias();
    List<EstadisticaJugadorSummary> ObtenerEstadisticasAvanzadas(int idTorneo);
}

public interface IArbitroRepositorio
{
    List<Arbitro> Listar();
    int Insertar(Arbitro arbitro);
    void Actualizar(Arbitro arbitro);
}

public interface ISedeRepositorio
{
    List<Sede> Listar();
    int Insertar(Sede sede);
    void Actualizar(Sede sede);
    List<SedeBloqueo> ListarBloqueos(int idSede);
    void InsertarBloqueo(SedeBloqueo bloqueo);
    void EliminarBloqueo(int idBloqueo);
}

public interface ICalendarioRepositorio
{
    int InsertarReprogramacion(PartidoReprogramacion reprog);
    List<PartidoReprogramacion> ListarReprogramaciones(int idPartido);
    void RegistrarArbitraje(PartidoArbitraje arbitraje);
    List<PartidoArbitraje> ListarArbitrajes(int idPartido);
}

public interface IEstadisticaRepositorio
{
    void RegistrarEventoJugador(PartidoEventoJugador evento);
    List<PartidoEventoJugador> ListarEventosPorPartido(int idPartido);
    List<RachaEquipo> ListarRachas(int idTorneo);
    void RegistrarPartidoJugador(PartidoJugador alignment);
    List<PartidoJugador> ListarJugadoresPorPartido(int idPartido);
    void LimpiarAlineacion(int idPartido);
    void LimpiarEventos(int idPartido);
    void RegistrarRacha(RachaEquipo racha);
}

public interface IApelacionRepositorio
{
    List<Apelacion> ListarPorSancion(int idSancion);
    void Insertar(Apelacion apelacion);
    void Actualizar(Apelacion apelacion);
}
