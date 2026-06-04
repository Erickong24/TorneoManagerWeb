using Oracle.ManagedDataAccess.Client;
using TorneoManagerWeb.Domain.Interfaces;
using TorneoManagerWeb.Domain.Models;
using TorneoManagerWeb.Infrastructure.Data;

namespace TorneoManagerWeb.Infrastructure.Repositories;

public class SedeRepositorio : ISedeRepositorio
{
    private readonly OracleDbContext _db;
    public SedeRepositorio(OracleDbContext db) => _db = db;

    public List<Sede> Listar()
    {
        var lista = new List<Sede>();
        using var conn = _db.GetConnection();
        const string sql = "SELECT * FROM SEDE ORDER BY nombre";
        using var cmd = new OracleCommand(sql, conn);
        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            lista.Add(new Sede
            {
                IdSede = Convert.ToInt32(reader["id_sede"]),
                Nombre = reader["nombre"].ToString()!,
                Direccion = reader["direccion"] == DBNull.Value ? null : reader["direccion"].ToString(),
                Ciudad = reader["ciudad"] == DBNull.Value ? null : reader["ciudad"].ToString(),
                Activo = reader["activo"].ToString()!
            });
        }
        return lista;
    }

    public int Insertar(Sede sede)
    {
        using var conn = _db.GetConnection();
        const string sql = @"INSERT INTO SEDE (nombre, direccion, ciudad, activo) 
                             VALUES (:nombre, :direccion, :ciudad, :activo) RETURNING id_sede INTO :id";
        using var cmd = new OracleCommand(sql, conn);
        cmd.Parameters.Add(new OracleParameter("nombre", sede.Nombre));
        cmd.Parameters.Add(new OracleParameter("direccion", (object?)sede.Direccion ?? DBNull.Value));
        cmd.Parameters.Add(new OracleParameter("ciudad", (object?)sede.Ciudad ?? DBNull.Value));
        cmd.Parameters.Add(new OracleParameter("activo", sede.Activo));
        cmd.Parameters.Add(new OracleParameter("id", OracleDbType.Int32, System.Data.ParameterDirection.Output));
        cmd.ExecuteNonQuery();
        return Convert.ToInt32(cmd.Parameters["id"].Value.ToString());
    }

    public void Actualizar(Sede Sede)
    {
        using var conn = _db.GetConnection();
        const string sql = @"UPDATE SEDE SET nombre = :nombre, direccion = :direccion, 
                             ciudad = :ciudad, activo = :activo WHERE id_sede = :id";
        using var cmd = new OracleCommand(sql, conn);
        cmd.Parameters.Add(new OracleParameter("nombre", Sede.Nombre));
        cmd.Parameters.Add(new OracleParameter("direccion", (object?)Sede.Direccion ?? DBNull.Value));
        cmd.Parameters.Add(new OracleParameter("ciudad", (object?)Sede.Ciudad ?? DBNull.Value));
        cmd.Parameters.Add(new OracleParameter("activo", Sede.Activo));
        cmd.Parameters.Add(new OracleParameter("id", Sede.IdSede));
        cmd.ExecuteNonQuery();
    }

    public List<SedeBloqueo> ListarBloqueos(int idSede)
    {
        var lista = new List<SedeBloqueo>();
        using var conn = _db.GetConnection();
        const string sql = "SELECT * FROM SEDE_BLOQUEO WHERE id_sede = :id_sede ORDER BY fecha_bloqueada DESC";
        using var cmd = new OracleCommand(sql, conn);
        cmd.Parameters.Add(new OracleParameter("id_sede", idSede));
        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            lista.Add(new SedeBloqueo
            {
                IdBloqueo = Convert.ToInt32(reader["id_bloqueo"]),
                IdSede = Convert.ToInt32(reader["id_sede"]),
                FechaBloqueada = Convert.ToDateTime(reader["fecha_bloqueada"]),
                Motivo = reader["motivo"] == DBNull.Value ? null : reader["motivo"].ToString()
            });
        }
        return lista;
    }

    public void InsertarBloqueo(SedeBloqueo bloqueo)
    {
        using var conn = _db.GetConnection();
        const string sql = @"INSERT INTO SEDE_BLOQUEO (id_sede, fecha_bloqueada, motivo) 
                             VALUES (:id_sede, :fecha, :motivo)";
        using var cmd = new OracleCommand(sql, conn);
        cmd.Parameters.Add(new OracleParameter("id_sede", bloqueo.IdSede));
        cmd.Parameters.Add(new OracleParameter("fecha", bloqueo.FechaBloqueada));
        cmd.Parameters.Add(new OracleParameter("motivo", (object?)bloqueo.Motivo ?? DBNull.Value));
        cmd.ExecuteNonQuery();
    }

    public void EliminarBloqueo(int idBloqueo)
    {
        using var conn = _db.GetConnection();
        const string sql = "DELETE FROM SEDE_BLOQUEO WHERE id_bloqueo = :id";
        using var cmd = new OracleCommand(sql, conn);
        cmd.Parameters.Add(new OracleParameter("id", idBloqueo));
        cmd.ExecuteNonQuery();
    }
}
