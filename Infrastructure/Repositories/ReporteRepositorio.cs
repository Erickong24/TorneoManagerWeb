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
}
