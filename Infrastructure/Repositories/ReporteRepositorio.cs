using Oracle.ManagedDataAccess.Client;
using TorneoManagerWeb.Domain.Interfaces;
using TorneoManagerWeb.Domain.Models;
using TorneoManagerWeb.Infrastructure.Data;

namespace TorneoManagerWeb.Infrastructure.Repositories;

public class ReporteRepositorio : IReporteRepositorio
{
    private readonly OracleDbContext _db;
    public ReporteRepositorio(OracleDbContext db) => _db = db;

    public List<Posicion> ObtenerTablaPosiciones(int idTorneo)
    {
        var lista = new List<Posicion>();
        using var conn = _db.GetConnection();
        const string sql = @"SELECT * FROM V_TABLA_POSICIONES WHERE id_torneo = :id_torneo 
                             ORDER BY puntos DESC, dg DESC, gf DESC";
        using var cmd = new OracleCommand(sql, conn);
        cmd.Parameters.Add(new OracleParameter("id_torneo", idTorneo));
        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            lista.Add(new Posicion
            {
                IdTorneo = Convert.ToInt32(reader["id_torneo"]),
                NombreTorneo = reader["nombre_torneo"].ToString(),
                IdEquipo = Convert.ToInt32(reader["id_equipo"]),
                NombreEquipo = reader["nombre_equipo"].ToString(),
                PJ = Convert.ToInt32(reader["pj"]), PG = Convert.ToInt32(reader["pg"]),
                PE = Convert.ToInt32(reader["pe"]), PP = Convert.ToInt32(reader["pp"]),
                GF = Convert.ToInt32(reader["gf"]), GC = Convert.ToInt32(reader["gc"]),
                DG = Convert.ToInt32(reader["dg"]), Puntos = Convert.ToInt32(reader["puntos"])
            });
        }
        return lista;
    }

    public List<Goleador> ObtenerGoleadores(int idTorneo)
    {
        var lista = new List<Goleador>();
        using var conn = _db.GetConnection();
        const string sql = @"SELECT * FROM V_GOLEADORES WHERE id_torneo = :id_torneo 
                             ORDER BY total_goles DESC";
        using var cmd = new OracleCommand(sql, conn);
        cmd.Parameters.Add(new OracleParameter("id_torneo", idTorneo));
        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            lista.Add(new Goleador
            {
                IdTorneo = Convert.ToInt32(reader["id_torneo"]),
                IdJugador = Convert.ToInt32(reader["id_jugador"]),
                NombreCompleto = reader["nombre_completo"].ToString()!,
                Equipo = reader["equipo"].ToString()!,
                TotalGoles = Convert.ToInt32(reader["total_goles"])
            });
        }
        return lista;
    }

    public List<SancionJugador> ObtenerSancionados(int idTorneo)
    {
        var lista = new List<SancionJugador>();
        using var conn = _db.GetConnection();
        const string sql = "SELECT * FROM V_JUGADORES_SANCIONADOS WHERE id_torneo = :id_torneo";
        using var cmd = new OracleCommand(sql, conn);
        cmd.Parameters.Add(new OracleParameter("id_torneo", idTorneo));
        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            lista.Add(new SancionJugador
            {
                IdSancion = Convert.ToInt32(reader["id_sancion"]),
                IdTorneo = Convert.ToInt32(reader["id_torneo"]),
                NombreJugador = reader["nombre_jugador"].ToString(),
                NombreEquipo = reader["equipo"].ToString(),
                Motivo = reader["motivo"].ToString(),
                PartidosSuspendidos = Convert.ToInt32(reader["partidos_suspendidos"]),
                PartidosCumplidos = Convert.ToInt32(reader["partidos_cumplidos"])
            });
        }
        return lista;
    }

    public List<FairPlayEntry> ObtenerFairPlay(int idTorneo)
    {
        var lista = new List<FairPlayEntry>();
        using var conn = _db.GetConnection();
        const string sql = @"SELECT * FROM V_FAIR_PLAY WHERE id_torneo = :id_torneo 
                             ORDER BY puntos_disciplina ASC";
        using var cmd = new OracleCommand(sql, conn);
        cmd.Parameters.Add(new OracleParameter("id_torneo", idTorneo));
        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            lista.Add(new FairPlayEntry
            {
                IdTorneo = Convert.ToInt32(reader["id_torneo"]),
                Equipo = reader["equipo"].ToString()!,
                Amarillas = Convert.ToInt32(reader["amarillas"]),
                Rojas = Convert.ToInt32(reader["rojas"]),
                Puntos = Convert.ToInt32(reader["puntos_disciplina"])
            });
        }
        return lista;
    }

    public List<AuditoriaPartido> ListarAuditorias()
    {
        var lista = new List<AuditoriaPartido>();
        using var conn = _db.GetConnection();
        const string sql = @"SELECT a.*, (el.nombre || ' vs ' || ev.nombre) AS detalle_partido
                             FROM AUDITORIA_PARTIDO a
                             LEFT JOIN PARTIDO p ON a.id_partido = p.id_partido
                             LEFT JOIN EQUIPO el ON p.id_local = el.id_equipo
                             LEFT JOIN EQUIPO ev ON p.id_visitante = ev.id_equipo
                             ORDER BY a.fecha_hora DESC";
        using var cmd = new OracleCommand(sql, conn);
        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            lista.Add(new AuditoriaPartido
            {
                IdAuditoria = Convert.ToInt32(reader["id_auditoria"]),
                IdPartido = reader["id_partido"] == DBNull.Value ? null : (int?)Convert.ToInt32(reader["id_partido"]),
                Usuario = reader["usuario"] == DBNull.Value ? null : reader["usuario"].ToString(),
                FechaHora = Convert.ToDateTime(reader["fecha_hora"]),
                DetalleAntes = reader["detalle_antes"] == DBNull.Value ? null : reader["detalle_antes"].ToString(),
                DetalleDespues = reader["detalle_despues"] == DBNull.Value ? null : reader["detalle_despues"].ToString(),
                DetallePartido = reader["detalle_partido"] == DBNull.Value ? "Partido N/A" : reader["detalle_partido"].ToString()
            });
        }
        return lista;
    }

    public List<EstadisticaJugadorSummary> ObtenerEstadisticasAvanzadas(int idTorneo)
    {
        var lista = new List<EstadisticaJugadorSummary>();
        using var conn = _db.GetConnection();
        const string sql = @"SELECT j.id_jugador,
                                    (j.nombre || ' ' || j.apellido) as nombre_completo,
                                    e.nombre as equipo,
                                    COUNT(pej.id_partido) as partidos_jugados,
                                    SUM(NVL(pej.minutos_jugados, 0)) as minutos_totales,
                                    SUM(NVL(pej.asistencias, 0)) as asistencias_totales,
                                    CAST(AVG(NVL(pej.xg_estimado, 0)) AS NUMBER(10,4)) as xg_promedio,
                                    COUNT(CASE WHEN pej.mvp_jornada = 'S' THEN 1 END) as mvp_totales
                             FROM JUGADOR j
                             JOIN EQUIPO e ON j.id_equipo = e.id_equipo
                             JOIN PARTIDO_EVENTO_JUGADOR pej ON j.id_jugador = pej.id_jugador
                             WHERE e.id_torneo = :id_torneo
                             GROUP BY j.id_jugador, j.nombre, j.apellido, e.nombre
                             ORDER BY mvp_totales DESC, asistencias_totales DESC";
        using var cmd = new OracleCommand(sql, conn);
        cmd.Parameters.Add(new OracleParameter("id_torneo", idTorneo));
        using var reader = cmd.ExecuteReader();

        // Pre-calculate ordinals for safe typed reads
        int ordId = -1, ordNombre = -1, ordEquipo = -1, ordPJ = -1, ordMin = -1, ordAst = -1, ordXg = -1, ordMvp = -1;

        while (reader.Read())
        {
            // Initialize ordinals on first row
            if (ordId == -1)
            {
                ordId = reader.GetOrdinal("id_jugador");
                ordNombre = reader.GetOrdinal("nombre_completo");
                ordEquipo = reader.GetOrdinal("equipo");
                ordPJ = reader.GetOrdinal("partidos_jugados");
                ordMin = reader.GetOrdinal("minutos_totales");
                ordAst = reader.GetOrdinal("asistencias_totales");
                ordXg = reader.GetOrdinal("xg_promedio");
                ordMvp = reader.GetOrdinal("mvp_totales");
            }

            decimal xgProm = 0m;
            if (!reader.IsDBNull(ordXg))
                xgProm = (decimal)reader.GetDouble(ordXg);

            lista.Add(new EstadisticaJugadorSummary
            {
                IdJugador = reader.GetInt32(ordId),
                NombreCompleto = reader.GetString(ordNombre),
                Equipo = reader.GetString(ordEquipo),
                PartidosJugados = reader.IsDBNull(ordPJ) ? 0 : Convert.ToInt32(reader.GetDecimal(ordPJ)),
                MinutosTotales = reader.IsDBNull(ordMin) ? 0 : Convert.ToInt32(reader.GetDecimal(ordMin)),
                AsistenciasTotales = reader.IsDBNull(ordAst) ? 0 : Convert.ToInt32(reader.GetDecimal(ordAst)),
                XgPromedio = xgProm,
                MvpTotales = reader.IsDBNull(ordMvp) ? 0 : Convert.ToInt32(reader.GetDecimal(ordMvp))
            });
        }
        return lista;
    }
}

