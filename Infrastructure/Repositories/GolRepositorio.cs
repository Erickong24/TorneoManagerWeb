using Oracle.ManagedDataAccess.Client;
using TorneoManagerWeb.Domain.Interfaces;
using TorneoManagerWeb.Domain.Models;
using TorneoManagerWeb.Infrastructure.Data;

namespace TorneoManagerWeb.Infrastructure.Repositories;

public class GolRepositorio : IGolRepositorio
{
    private readonly OracleDbContext _db;
    public GolRepositorio(OracleDbContext db) => _db = db;

    public List<Gol> Listar(int idPartido)
    {
        var lista = new List<Gol>();
        using var conn = _db.GetConnection();
        const string sql = @"SELECT g.*, j.nombre || ' ' || j.apellido as nombre_jugador
                             FROM GOL g JOIN JUGADOR j ON g.id_jugador = j.id_jugador
                             WHERE g.id_partido = :id_partido ORDER BY g.minuto";
        using var cmd = new OracleCommand(sql, conn);
        cmd.Parameters.Add(new OracleParameter("id_partido", idPartido));
        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            lista.Add(new Gol
            {
                IdGol = Convert.ToInt32(reader["id_gol"]),
                IdPartido = Convert.ToInt32(reader["id_partido"]),
                IdJugador = Convert.ToInt32(reader["id_jugador"]),
                Minuto = Convert.ToInt32(reader["minuto"]),
                Tipo = reader["tipo"].ToString()!,
                NombreJugador = reader["nombre_jugador"].ToString()
            });
        }
        return lista;
    }

    public void Insertar(Gol gol)
    {
        using var conn = _db.GetConnection();
        const string sql = @"INSERT INTO GOL (id_partido, id_jugador, minuto, tipo) 
                             VALUES (:id_partido, :id_jugador, :minuto, :tipo)";
        using var cmd = new OracleCommand(sql, conn);
        cmd.Parameters.Add(new OracleParameter("id_partido", gol.IdPartido));
        cmd.Parameters.Add(new OracleParameter("id_jugador", gol.IdJugador));
        cmd.Parameters.Add(new OracleParameter("minuto", gol.Minuto));
        cmd.Parameters.Add(new OracleParameter("tipo", gol.Tipo));
        cmd.ExecuteNonQuery();
    }
}
