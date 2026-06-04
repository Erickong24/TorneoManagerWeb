using System.Data;
using Oracle.ManagedDataAccess.Client;
using TorneoManagerWeb.Domain.Interfaces;
using TorneoManagerWeb.Domain.Models;
using TorneoManagerWeb.Infrastructure.Data;

namespace TorneoManagerWeb.Infrastructure.Repositories;

public class TarjetaRepositorio : ITarjetaRepositorio
{
    private readonly OracleDbContext _db;
    public TarjetaRepositorio(OracleDbContext db) => _db = db;

    public List<Tarjeta> Listar(int idPartido)
    {
        var lista = new List<Tarjeta>();
        using var conn = _db.GetConnection();
        const string sql = @"SELECT t.*, j.nombre || ' ' || j.apellido as nombre_jugador 
                             FROM TARJETA t JOIN JUGADOR j ON t.id_jugador = j.id_jugador
                             WHERE t.id_partido = :id_partido ORDER BY t.minuto";
        using var cmd = new OracleCommand(sql, conn);
        cmd.Parameters.Add(new OracleParameter("id_partido", idPartido));
        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            lista.Add(new Tarjeta
            {
                IdTarjeta = Convert.ToInt32(reader["id_tarjeta"]),
                IdPartido = Convert.ToInt32(reader["id_partido"]),
                IdJugador = Convert.ToInt32(reader["id_jugador"]),
                Tipo = reader["tipo"].ToString()!,
                Minuto = reader["minuto"] == DBNull.Value ? null : (int?)Convert.ToInt32(reader["minuto"]),
                NombreJugador = reader["nombre_jugador"].ToString()
            });
        }
        return lista;
    }

    public void Insertar(Tarjeta tarjeta)
    {
        using var conn = _db.GetConnection();
        using var cmd = new OracleCommand("PKG_TARJETAS.registrar_tarjeta", conn);
        cmd.CommandType = CommandType.StoredProcedure;
        cmd.Parameters.Add("p_id_partido", OracleDbType.Int32).Value = tarjeta.IdPartido;
        cmd.Parameters.Add("p_id_jugador", OracleDbType.Int32).Value = tarjeta.IdJugador;
        cmd.Parameters.Add("p_tipo", OracleDbType.Varchar2).Value = tarjeta.Tipo;
        cmd.Parameters.Add("p_minuto", OracleDbType.Int32).Value = (object?)tarjeta.Minuto ?? DBNull.Value;
        cmd.ExecuteNonQuery();
    }
}
