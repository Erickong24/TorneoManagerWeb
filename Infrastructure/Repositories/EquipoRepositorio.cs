using Oracle.ManagedDataAccess.Client;
using TorneoManagerWeb.Domain.Interfaces;
using TorneoManagerWeb.Domain.Models;
using TorneoManagerWeb.Infrastructure.Data;

namespace TorneoManagerWeb.Infrastructure.Repositories;

public class EquipoRepositorio : IEquipoRepositorio
{
    private readonly OracleDbContext _db;

    public EquipoRepositorio(OracleDbContext db) => _db = db;

    public List<Equipo> Listar(int idTorneo)
    {
        var lista = new List<Equipo>();
        using var conn = _db.GetConnection();
        const string sql = "SELECT * FROM EQUIPO WHERE id_torneo = :id_torneo ORDER BY nombre";
        using var cmd = new OracleCommand(sql, conn);
        cmd.Parameters.Add(new OracleParameter("id_torneo", idTorneo));
        using var reader = cmd.ExecuteReader();
        while (reader.Read()) lista.Add(MapEquipo(reader));
        return lista;
    }

    public Equipo? Obtener(int id)
    {
        using var conn = _db.GetConnection();
        const string sql = "SELECT * FROM EQUIPO WHERE id_equipo = :id";
        using var cmd = new OracleCommand(sql, conn);
        cmd.Parameters.Add(new OracleParameter("id", id));
        using var reader = cmd.ExecuteReader();
        return reader.Read() ? MapEquipo(reader) : null;
    }

    public void Insertar(Equipo equipo)
    {
        using var conn = _db.GetConnection();
        const string sql = @"INSERT INTO EQUIPO (id_torneo, nombre, ciudad, tecnico, activo) 
                             VALUES (:id_torneo, :nombre, :ciudad, :tecnico, :activo)";
        using var cmd = new OracleCommand(sql, conn);
        cmd.Parameters.Add(new OracleParameter("id_torneo", equipo.IdTorneo));
        cmd.Parameters.Add(new OracleParameter("nombre", equipo.Nombre));
        cmd.Parameters.Add(new OracleParameter("ciudad", (object?)equipo.Ciudad ?? DBNull.Value));
        cmd.Parameters.Add(new OracleParameter("tecnico", (object?)equipo.Tecnico ?? DBNull.Value));
        cmd.Parameters.Add(new OracleParameter("activo", equipo.Activo));
        cmd.ExecuteNonQuery();
    }

    public void Actualizar(Equipo equipo)
    {
        using var conn = _db.GetConnection();
        const string sql = @"UPDATE EQUIPO SET nombre = :nombre, ciudad = :ciudad, tecnico = :tecnico, activo = :activo 
                             WHERE id_equipo = :id_equipo";
        using var cmd = new OracleCommand(sql, conn);
        cmd.Parameters.Add(new OracleParameter("nombre", equipo.Nombre));
        cmd.Parameters.Add(new OracleParameter("ciudad", (object?)equipo.Ciudad ?? DBNull.Value));
        cmd.Parameters.Add(new OracleParameter("tecnico", (object?)equipo.Tecnico ?? DBNull.Value));
        cmd.Parameters.Add(new OracleParameter("activo", equipo.Activo));
        cmd.Parameters.Add(new OracleParameter("id_equipo", equipo.IdEquipo));
        cmd.ExecuteNonQuery();
    }

    public void CambiarEstado(int id, bool activo)
    {
        using var conn = _db.GetConnection();
        const string sql = "UPDATE EQUIPO SET activo = :activo WHERE id_equipo = :id";
        using var cmd = new OracleCommand(sql, conn);
        cmd.Parameters.Add(new OracleParameter("activo", activo ? "S" : "N"));
        cmd.Parameters.Add(new OracleParameter("id", id));
        cmd.ExecuteNonQuery();
    }

    private static Equipo MapEquipo(OracleDataReader reader) => new()
    {
        IdEquipo = Convert.ToInt32(reader["id_equipo"]),
        IdTorneo = Convert.ToInt32(reader["id_torneo"]),
        Nombre = reader["nombre"].ToString()!,
        Ciudad = reader["ciudad"] == DBNull.Value ? null : reader["ciudad"].ToString(),
        Tecnico = reader["tecnico"] == DBNull.Value ? null : reader["tecnico"].ToString(),
        Activo = reader["activo"].ToString()!
    };
}
