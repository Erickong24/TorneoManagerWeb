using System.Data;
using Oracle.ManagedDataAccess.Client;
using TorneoManagerWeb.Domain.Interfaces;
using TorneoManagerWeb.Domain.Models;
using TorneoManagerWeb.Infrastructure.Data;

namespace TorneoManagerWeb.Infrastructure.Repositories;

public class PartidoRepositorio : IPartidoRepositorio
{
    private readonly OracleDbContext _db;

    public PartidoRepositorio(OracleDbContext db) => _db = db;

    public List<Partido> Listar(int idTorneo)
    {
        var lista = new List<Partido>();
        using var conn = _db.GetConnection();
        const string sql = @"SELECT p.*, el.nombre as local, ev.nombre as visitante, 
                             s.nombre as sede, t.nombre as torneo
                             FROM PARTIDO p
                             JOIN EQUIPO el ON p.id_local = el.id_equipo
                             JOIN EQUIPO ev ON p.id_visitante = ev.id_equipo
                             JOIN TORNEO t ON p.id_torneo = t.id_torneo
                             LEFT JOIN SEDE s ON p.id_sede = s.id_sede
                             WHERE p.id_torneo = :id_torneo ORDER BY p.jornada, p.fecha";
        using var cmd = new OracleCommand(sql, conn);
        cmd.Parameters.Add(new OracleParameter("id_torneo", idTorneo));
        using var reader = cmd.ExecuteReader();
        while (reader.Read()) lista.Add(MapPartido(reader));
        return lista;
    }

    public Partido? Obtener(int id)
    {
        using var conn = _db.GetConnection();
        const string sql = @"SELECT p.*, el.nombre as local, ev.nombre as visitante, 
                             s.nombre as sede, t.nombre as torneo
                             FROM PARTIDO p
                             JOIN EQUIPO el ON p.id_local = el.id_equipo
                             JOIN EQUIPO ev ON p.id_visitante = ev.id_equipo
                             JOIN TORNEO t ON p.id_torneo = t.id_torneo
                             LEFT JOIN SEDE s ON p.id_sede = s.id_sede
                             WHERE p.id_partido = :id";
        using var cmd = new OracleCommand(sql, conn);
        cmd.Parameters.Add(new OracleParameter("id", id));
        using var reader = cmd.ExecuteReader();
        return reader.Read() ? MapPartido(reader) : null;
    }

    public void Insertar(Partido partido)
    {
        using var conn = _db.GetConnection();
        const string sql = @"INSERT INTO PARTIDO (id_torneo, id_local, id_visitante, id_sede, fecha, jornada, 
                             estado, formacion_local, formacion_visitante) 
                             VALUES (:id_torneo, :id_local, :id_visitante, :id_sede, :fecha, :jornada, 
                             'PROGRAMADO', :formacion_local, :formacion_visitante)
                             RETURNING id_partido INTO :id_partido";
        using var cmd = new OracleCommand(sql, conn);
        cmd.Parameters.Add(new OracleParameter("id_torneo", partido.IdTorneo));
        cmd.Parameters.Add(new OracleParameter("id_local", partido.IdLocal));
        cmd.Parameters.Add(new OracleParameter("id_visitante", partido.IdVisitante));
        cmd.Parameters.Add(new OracleParameter("id_sede", (object?)partido.IdSede ?? DBNull.Value));
        cmd.Parameters.Add(new OracleParameter("fecha", (object?)partido.Fecha ?? DBNull.Value));
        cmd.Parameters.Add(new OracleParameter("jornada", (object?)partido.Jornada ?? DBNull.Value));
        cmd.Parameters.Add(new OracleParameter("formacion_local", (object?)partido.FormacionLocal ?? DBNull.Value));
        cmd.Parameters.Add(new OracleParameter("formacion_visitante", (object?)partido.FormacionVisitante ?? DBNull.Value));
        var outputId = new OracleParameter("id_partido", OracleDbType.Int32, ParameterDirection.Output);
        cmd.Parameters.Add(outputId);
        cmd.ExecuteNonQuery();
        if (outputId.Value != null && outputId.Value != DBNull.Value)
            partido.IdPartido = Convert.ToInt32(outputId.Value.ToString());
    }

    public void Actualizar(Partido partido)
    {
        using var conn = _db.GetConnection();
        const string sql = @"UPDATE PARTIDO SET fecha = :fecha, jornada = :jornada, id_local = :id_local,
                             id_visitante = :id_visitante, id_sede = :id_sede,
                             formacion_local = :formacion_local, formacion_visitante = :formacion_visitante
                             WHERE id_partido = :id_partido AND estado = 'PROGRAMADO'";
        using var cmd = new OracleCommand(sql, conn);
        cmd.Parameters.Add(new OracleParameter("fecha", (object?)partido.Fecha ?? DBNull.Value));
        cmd.Parameters.Add(new OracleParameter("jornada", (object?)partido.Jornada ?? DBNull.Value));
        cmd.Parameters.Add(new OracleParameter("id_local", partido.IdLocal));
        cmd.Parameters.Add(new OracleParameter("id_visitante", partido.IdVisitante));
        cmd.Parameters.Add(new OracleParameter("id_sede", (object?)partido.IdSede ?? DBNull.Value));
        cmd.Parameters.Add(new OracleParameter("formacion_local", (object?)partido.FormacionLocal ?? DBNull.Value));
        cmd.Parameters.Add(new OracleParameter("formacion_visitante", (object?)partido.FormacionVisitante ?? DBNull.Value));
        cmd.Parameters.Add(new OracleParameter("id_partido", partido.IdPartido));
        cmd.ExecuteNonQuery();
    }

    public void RegistrarResultado(int idPartido, int golesLocal, int golesVisitante, string usuario)
    {
        using var conn = _db.GetConnection();
        using var cmd = new OracleCommand("PKG_TORNEO.registrar_resultado", conn);
        cmd.CommandType = CommandType.StoredProcedure;
        cmd.Parameters.Add("p_id_partido", OracleDbType.Int32).Value = idPartido;
        cmd.Parameters.Add("p_goles_local", OracleDbType.Int32).Value = golesLocal;
        cmd.Parameters.Add("p_goles_visitante", OracleDbType.Int32).Value = golesVisitante;
        cmd.Parameters.Add("p_usuario", OracleDbType.Varchar2).Value = usuario;
        cmd.ExecuteNonQuery();
    }

    private static Partido MapPartido(OracleDataReader reader) => new()
    {
        IdPartido = Convert.ToInt32(reader["id_partido"]),
        IdTorneo = Convert.ToInt32(reader["id_torneo"]),
        IdLocal = Convert.ToInt32(reader["id_local"]),
        IdVisitante = Convert.ToInt32(reader["id_visitante"]),
        IdSede = reader["id_sede"] == DBNull.Value ? null : (int?)Convert.ToInt32(reader["id_sede"]),
        Fecha = reader["fecha"] == DBNull.Value ? null : (DateTime?)reader["fecha"],
        Jornada = reader["jornada"] == DBNull.Value ? null : (int?)Convert.ToInt32(reader["jornada"]),
        GolesLocal = Convert.ToInt32(reader["goles_local"]),
        GolesVisitante = Convert.ToInt32(reader["goles_visitante"]),
        Estado = reader["estado"].ToString()!,
        NombreTorneo = reader["torneo"].ToString(),
        NombreLocal = reader["local"].ToString(),
        NombreVisitante = reader["visitante"].ToString(),
        NombreSede = reader["sede"] == DBNull.Value ? "" : reader["sede"].ToString(),
        FormacionLocal = reader["formacion_local"] == DBNull.Value ? "" : reader["formacion_local"].ToString(),
        FormacionVisitante = reader["formacion_visitante"] == DBNull.Value ? "" : reader["formacion_visitante"].ToString()
    };
}
