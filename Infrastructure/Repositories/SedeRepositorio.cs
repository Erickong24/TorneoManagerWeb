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

    public void Actualizar(Sede sede)
    {
        using var conn = _db.GetConnection();
        const string sql = @"UPDATE SEDE SET nombre = :nombre, direccion = :direccion, 
                             ciudad = :ciudad, activo = :activo WHERE id_sede = :id";
        using var cmd = new OracleCommand(sql, conn);
        cmd.Parameters.Add(new OracleParameter("nombre", sede.Nombre));
        cmd.Parameters.Add(new OracleParameter("direccion", (object?)sede.Direccion ?? DBNull.Value));
        cmd.Parameters.Add(new OracleParameter("ciudad", (object?)sede.Ciudad ?? DBNull.Value));
        cmd.Parameters.Add(new OracleParameter("activo", sede.Activo));
        cmd.Parameters.Add(new OracleParameter("id", sede.IdSede));
        cmd.ExecuteNonQuery();
    }
}
