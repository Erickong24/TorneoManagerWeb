using Oracle.ManagedDataAccess.Client;
using TorneoManagerWeb.Domain.Interfaces;
using TorneoManagerWeb.Domain.Models;
using TorneoManagerWeb.Infrastructure.Data;

namespace TorneoManagerWeb.Infrastructure.Repositories;

public class EstadisticaRepositorio : IEstadisticaRepositorio
{
    private readonly OracleDbContext _db;
    public EstadisticaRepositorio(OracleDbContext db) => _db = db;

    public void RegistrarEventoJugador(PartidoEventoJugador evento)
    {
        using var conn = _db.GetConnection();
        const string sql = @"INSERT INTO PARTIDO_EVENTO_JUGADOR (id_partido, id_jugador, minutos_jugados, 
                             asistencias, xg_estimado, posicion_en_campo, heatmap_json, mvp_jornada)
                             VALUES (:id_partido, :id_jugador, :minutos, :asistencias, :xg, :posicion, :heatmap, :mvp)";
        using var cmd = new OracleCommand(sql, conn);
        cmd.Parameters.Add(new OracleParameter("id_partido", evento.IdPartido));
        cmd.Parameters.Add(new OracleParameter("id_jugador", evento.IdJugador));
        cmd.Parameters.Add(new OracleParameter("minutos", (object?)evento.MinutosJugados ?? DBNull.Value));
        cmd.Parameters.Add(new OracleParameter("asistencias", evento.Asistencias));
        cmd.Parameters.Add(new OracleParameter("xg", (object?)evento.XgEstimado ?? DBNull.Value));
        cmd.Parameters.Add(new OracleParameter("posicion", (object?)evento.PosicionEnCampo ?? DBNull.Value));
        cmd.Parameters.Add(new OracleParameter("heatmap", (object?)evento.HeatmapJson ?? DBNull.Value));
        cmd.Parameters.Add(new OracleParameter("mvp", evento.MvpJornadaFlag()));
        cmd.ExecuteNonQuery();
    }

    public List<PartidoEventoJugador> ListarEventosPorPartido(int idPartido)
    {
        var lista = new List<PartidoEventoJugador>();
        using var conn = _db.GetConnection();
        const string sql = "SELECT * FROM PARTIDO_EVENTO_JUGADOR WHERE id_partido = :id_partido";
        using var cmd = new OracleCommand(sql, conn);
        cmd.Parameters.Add(new OracleParameter("id_partido", idPartido));
        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            lista.Add(new PartidoEventoJugador
            {
                IdEvento = Convert.ToInt32(reader["id_evento"]),
                IdPartido = Convert.ToInt32(reader["id_partido"]),
                IdJugador = Convert.ToInt32(reader["id_jugador"]),
                MinutosJugados = reader["minutos_jugados"] == DBNull.Value ? null : (int?)Convert.ToInt32(reader["minutos_jugados"]),
                Asistencias = Convert.ToInt32(reader["asistencias"]),
                XgEstimado = reader["xg_estimado"] == DBNull.Value ? null : (decimal?)Convert.ToDecimal(reader["xg_estimado"]),
                PosicionEnCampo = reader["posicion_en_campo"] == DBNull.Value ? null : reader["posicion_en_campo"].ToString(),
                HeatmapJson = reader["heatmap_json"] == DBNull.Value ? null : reader["heatmap_json"].ToString(),
                MvpJornada = reader["mvp_jornada"].ToString()!
            });
        }
        return lista;
    }

    public List<RachaEquipo> ListarRachas(int idTorneo)
    {
        var lista = new List<RachaEquipo>();
        using var conn = _db.GetConnection();
        const string sql = @"SELECT r.*, e.nombre FROM RACHA_EQUIPO r
                             JOIN EQUIPO e ON r.id_equipo = e.id_equipo WHERE e.id_torneo = :id_torneo";
        using var cmd = new OracleCommand(sql, conn);
        cmd.Parameters.Add(new OracleParameter("id_torneo", idTorneo));
        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            lista.Add(new RachaEquipo
            {
                IdRacha = Convert.ToInt32(reader["id_racha"]),
                IdEquipo = Convert.ToInt32(reader["id_equipo"]),
                PartidosInvicto = Convert.ToInt32(reader["partidos_invicto"]),
                PartidosGanados = Convert.ToInt32(reader["partidos_ganados"]),
                GolesFavor = Convert.ToInt32(reader["goles_favor"]),
                GolesContra = Convert.ToInt32(reader["goles_contra"]),
                DesdeFecha = reader["desde_fecha"] == DBNull.Value ? null : (DateTime?)reader["desde_fecha"],
                HastaFecha = reader["hasta_fecha"] == DBNull.Value ? null : (DateTime?)reader["hasta_fecha"]
            });
        }
        return lista;
    }

    public void RegistrarPartidoJugador(PartidoJugador alignment)
    {
        using var conn = _db.GetConnection();
        const string sql = @"INSERT INTO PARTIDO_JUGADOR (id_partido, id_jugador, titular, minutos_jugados, goles)
                             VALUES (:id_partido, :id_jugador, :titular, :minutos, :goles)";
        using var cmd = new OracleCommand(sql, conn);
        cmd.Parameters.Add(new OracleParameter("id_partido", alignment.IdPartido));
        cmd.Parameters.Add(new OracleParameter("id_jugador", alignment.IdJugador));
        cmd.Parameters.Add(new OracleParameter("titular", alignment.Titular));
        cmd.Parameters.Add(new OracleParameter("minutos", (object?)alignment.MinutosJugados ?? DBNull.Value));
        cmd.Parameters.Add(new OracleParameter("goles", alignment.Goles));
        cmd.ExecuteNonQuery();
    }

    public List<PartidoJugador> ListarJugadoresPorPartido(int idPartido)
    {
        var lista = new List<PartidoJugador>();
        using var conn = _db.GetConnection();
        const string sql = @"SELECT pj.*, j.nombre || ' ' || j.apellido AS nombre_jugador, e.nombre AS nombre_equipo
                             FROM PARTIDO_JUGADOR pj
                             JOIN JUGADOR j ON pj.id_jugador = j.id_jugador
                             JOIN EQUIPO e ON j.id_equipo = e.id_equipo
                             WHERE pj.id_partido = :id_partido";
        using var cmd = new OracleCommand(sql, conn);
        cmd.Parameters.Add(new OracleParameter("id_partido", idPartido));
        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            lista.Add(new PartidoJugador
            {
                IdPartido = Convert.ToInt32(reader["id_partido"]),
                IdJugador = Convert.ToInt32(reader["id_jugador"]),
                Titular = reader["titular"].ToString()!,
                MinutosJugados = reader["minutos_jugados"] == DBNull.Value ? null : (int?)Convert.ToInt32(reader["minutos_jugados"]),
                Goles = Convert.ToInt32(reader["goles"]),
                NombreJugador = reader["nombre_jugador"].ToString(),
                NombreEquipo = reader["nombre_equipo"].ToString()
            });
        }
        return lista;
    }

    public void LimpiarAlineacion(int idPartido)
    {
        using var conn = _db.GetConnection();
        const string sql = "DELETE FROM PARTIDO_JUGADOR WHERE id_partido = :id_partido";
        using var cmd = new OracleCommand(sql, conn);
        cmd.Parameters.Add(new OracleParameter("id_partido", idPartido));
        cmd.ExecuteNonQuery();
    }

    public void LimpiarEventos(int idPartido)
    {
        using var conn = _db.GetConnection();
        const string sql = "DELETE FROM PARTIDO_EVENTO_JUGADOR WHERE id_partido = :id_partido";
        using var cmd = new OracleCommand(sql, conn);
        cmd.Parameters.Add(new OracleParameter("id_partido", idPartido));
        cmd.ExecuteNonQuery();
    }

    public void RegistrarRacha(RachaEquipo racha)
    {
        using var conn = _db.GetConnection();
        const string sql = @"INSERT INTO RACHA_EQUIPO (id_equipo, partidos_invicto, partidos_ganados, goles_favor, goles_contra, desde_fecha, hasta_fecha)
                             VALUES (:id_equipo, :partidos_invicto, :partidos_ganados, :goles_favor, :goles_contra, :desde_fecha, :hasta_fecha)";
        using var cmd = new OracleCommand(sql, conn);
        cmd.Parameters.Add(new OracleParameter("id_equipo", racha.IdEquipo));
        cmd.Parameters.Add(new OracleParameter("partidos_invicto", racha.PartidosInvicto));
        cmd.Parameters.Add(new OracleParameter("partidos_ganados", racha.PartidosGanados));
        cmd.Parameters.Add(new OracleParameter("goles_favor", racha.GolesFavor));
        cmd.Parameters.Add(new OracleParameter("goles_contra", racha.GolesContra));
        cmd.Parameters.Add(new OracleParameter("desde_fecha", (object?)racha.DesdeFecha ?? DBNull.Value));
        cmd.Parameters.Add(new OracleParameter("hasta_fecha", (object?)racha.HastaFecha ?? DBNull.Value));
        cmd.ExecuteNonQuery();
    }
}

