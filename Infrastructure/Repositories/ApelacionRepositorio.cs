using Oracle.ManagedDataAccess.Client;
using TorneoManagerWeb.Domain.Interfaces;
using TorneoManagerWeb.Domain.Models;
using TorneoManagerWeb.Infrastructure.Data;

namespace TorneoManagerWeb.Infrastructure.Repositories;

public class ApelacionRepositorio : IApelacionRepositorio
{
    private readonly OracleDbContext _db;
    public ApelacionRepositorio(OracleDbContext db) => _db = db;

    public List<Apelacion> ListarPorSancion(int idSancion)
    {
        var lista = new List<Apelacion>();
        using var conn = _db.GetConnection();
        const string sql = "SELECT * FROM APELACION WHERE id_sancion = :id_sancion ORDER BY fecha_presentacion DESC";
        using var cmd = new OracleCommand(sql, conn);
        cmd.Parameters.Add(new OracleParameter("id_sancion", idSancion));
        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            lista.Add(new Apelacion
            {
                IdApelacion = Convert.ToInt32(reader["id_apelacion"]),
                IdSancion = Convert.ToInt32(reader["id_sancion"]),
                Estado = reader["estado"].ToString()!,
                Motivo = reader["motivo"] == DBNull.Value ? null : reader["motivo"].ToString(),
                Respuesta = reader["respuesta"] == DBNull.Value ? null : reader["respuesta"].ToString(),
                FechaPresentacion = reader["fecha_presentacion"] == DBNull.Value ? null : (DateTime?)reader["fecha_presentacion"],
                FechaResolucion = reader["fecha_resolucion"] == DBNull.Value ? null : (DateTime?)reader["fecha_resolucion"]
            });
        }
        return lista;
    }

    public void Insertar(Apelacion apelacion)
    {
        using var conn = _db.GetConnection();
        const string sql = @"INSERT INTO APELACION (id_sancion, estado, motivo, fecha_presentacion) 
                             VALUES (:id_sancion, :estado, :motivo, SYSDATE)";
        using var cmd = new OracleCommand(sql, conn);
        cmd.Parameters.Add(new OracleParameter("id_sancion", apelacion.IdSancion));
        cmd.Parameters.Add(new OracleParameter("estado", apelacion.Estado));
        cmd.Parameters.Add(new OracleParameter("motivo", (object?)apelacion.Motivo ?? DBNull.Value));
        cmd.ExecuteNonQuery();
    }

    public void Actualizar(Apelacion apelacion)
    {
        using var conn = _db.GetConnection();
        const string sql = @"UPDATE APELACION SET estado = :estado, respuesta = :respuesta, 
                             fecha_resolucion = SYSDATE WHERE id_apelacion = :id";
        using var cmd = new OracleCommand(sql, conn);
        cmd.Parameters.Add(new OracleParameter("estado", apelacion.Estado));
        cmd.Parameters.Add(new OracleParameter("respuesta", (object?)apelacion.Respuesta ?? DBNull.Value));
        cmd.Parameters.Add(new OracleParameter("id", apelacion.IdApelacion));
        cmd.ExecuteNonQuery();
    }
}
