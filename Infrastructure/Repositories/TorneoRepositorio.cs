using Oracle.ManagedDataAccess.Client;
using TorneoManagerWeb.Domain.Interfaces;
using TorneoManagerWeb.Domain.Models;
using TorneoManagerWeb.Infrastructure.Data;

namespace TorneoManagerWeb.Infrastructure.Repositories;

public class TorneoRepositorio : ITorneoRepositorio
{
    private readonly OracleDbContext _db;
    private readonly ILogger<TorneoRepositorio> _logger;

    public TorneoRepositorio(OracleDbContext db, ILogger<TorneoRepositorio> logger)
    {
        _db = db;
        _logger = logger;
    }

    public List<Torneo> Listar()
    {
        var lista = new List<Torneo>();
        using var conn = _db.GetConnection();
        const string sql = "SELECT * FROM TORNEO ORDER BY id_torneo DESC";
        using var cmd = new OracleCommand(sql, conn);
        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            lista.Add(MapTorneo(reader));
        }
        return lista;
    }

    public Torneo? Obtener(int id)
    {
        using var conn = _db.GetConnection();
        const string sql = "SELECT * FROM TORNEO WHERE id_torneo = :id";
        using var cmd = new OracleCommand(sql, conn);
        cmd.Parameters.Add(new OracleParameter("id", id));
        using var reader = cmd.ExecuteReader();
        return reader.Read() ? MapTorneo(reader) : null;
    }

    public void Insertar(Torneo torneo)
    {
        using var conn = _db.GetConnection();
        const string sql = @"INSERT INTO TORNEO (nombre, fecha_inicio, fecha_fin, puntos_victoria, puntos_empate, 
                             puntos_derrota, amarillas_para_suspension, rojas_para_suspension, categoria, division, estado) 
                             VALUES (:nombre, :fecha_inicio, :fecha_fin, :puntos_victoria, :puntos_empate, 
                             :puntos_derrota, :amarillas_para_suspension, :rojas_para_suspension, :categoria, :division, :estado)";
        using var cmd = new OracleCommand(sql, conn);
        cmd.Parameters.Add(new OracleParameter("nombre", torneo.Nombre));
        cmd.Parameters.Add(new OracleParameter("fecha_inicio", (object?)torneo.FechaInicio ?? DBNull.Value));
        cmd.Parameters.Add(new OracleParameter("fecha_fin", (object?)torneo.FechaFin ?? DBNull.Value));
        cmd.Parameters.Add(new OracleParameter("puntos_victoria", torneo.PuntosVictoria));
        cmd.Parameters.Add(new OracleParameter("puntos_empate", torneo.PuntosEmpate));
        cmd.Parameters.Add(new OracleParameter("puntos_derrota", torneo.PuntosDerrota));
        cmd.Parameters.Add(new OracleParameter("amarillas_para_suspension", torneo.AmarillasParaSuspension));
        cmd.Parameters.Add(new OracleParameter("rojas_para_suspension", torneo.RojasParaSuspension));
        cmd.Parameters.Add(new OracleParameter("categoria", (object?)torneo.Categoria ?? DBNull.Value));
        cmd.Parameters.Add(new OracleParameter("division", (object?)torneo.Division ?? DBNull.Value));
        cmd.Parameters.Add(new OracleParameter("estado", torneo.Estado));
        cmd.ExecuteNonQuery();
        _logger.LogInformation("Torneo '{Nombre}' insertado", torneo.Nombre);
    }

    public void Actualizar(Torneo torneo)
    {
        using var conn = _db.GetConnection();
        const string sql = @"UPDATE TORNEO SET 
                             nombre = :nombre, fecha_inicio = :fecha_inicio, fecha_fin = :fecha_fin,
                             puntos_victoria = :puntos_victoria, puntos_empate = :puntos_empate, 
                             puntos_derrota = :puntos_derrota, amarillas_para_suspension = :amarillas_para_suspension,
                             rojas_para_suspension = :rojas_para_suspension, categoria = :categoria,
                             division = :division, estado = :estado
                             WHERE id_torneo = :id_torneo";
        using var cmd = new OracleCommand(sql, conn);
        cmd.Parameters.Add(new OracleParameter("nombre", torneo.Nombre));
        cmd.Parameters.Add(new OracleParameter("fecha_inicio", (object?)torneo.FechaInicio ?? DBNull.Value));
        cmd.Parameters.Add(new OracleParameter("fecha_fin", (object?)torneo.FechaFin ?? DBNull.Value));
        cmd.Parameters.Add(new OracleParameter("puntos_victoria", torneo.PuntosVictoria));
        cmd.Parameters.Add(new OracleParameter("puntos_empate", torneo.PuntosEmpate));
        cmd.Parameters.Add(new OracleParameter("puntos_derrota", torneo.PuntosDerrota));
        cmd.Parameters.Add(new OracleParameter("amarillas_para_suspension", torneo.AmarillasParaSuspension));
        cmd.Parameters.Add(new OracleParameter("rojas_para_suspension", torneo.RojasParaSuspension));
        cmd.Parameters.Add(new OracleParameter("categoria", (object?)torneo.Categoria ?? DBNull.Value));
        cmd.Parameters.Add(new OracleParameter("division", (object?)torneo.Division ?? DBNull.Value));
        cmd.Parameters.Add(new OracleParameter("estado", torneo.Estado));
        cmd.Parameters.Add(new OracleParameter("id_torneo", torneo.IdTorneo));
        cmd.ExecuteNonQuery();
        _logger.LogInformation("Torneo {Id} actualizado", torneo.IdTorneo);
    }

    public void Eliminar(int id)
    {
        using var conn = _db.GetConnection();
        const string sql = "UPDATE TORNEO SET estado = 'INACTIVO' WHERE id_torneo = :id";
        using var cmd = new OracleCommand(sql, conn);
        cmd.Parameters.Add(new OracleParameter("id", id));
        cmd.ExecuteNonQuery();
        _logger.LogInformation("Torneo {Id} desactivado", id);
    }

    public List<AscensoDescenso> ListarAscensosDescensos()
    {
        var lista = new List<AscensoDescenso>();
        using var conn = _db.GetConnection();
        const string sql = @"SELECT ad.*, 
                                    to_org.nombre as nombre_torneo_origen, 
                                    to_dst.nombre as nombre_torneo_destino, 
                                    eq.nombre as nombre_equipo
                             FROM ASCENSO_DESCENSO ad
                             JOIN TORNEO to_org ON ad.id_torneo_origen = to_org.id_torneo
                             JOIN TORNEO to_dst ON ad.id_torneo_destino = to_dst.id_torneo
                             JOIN EQUIPO eq ON ad.id_equipo = eq.id_equipo";
        using var cmd = new OracleCommand(sql, conn);
        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            lista.Add(new AscensoDescenso
            {
                IdRegistro = Convert.ToInt32(reader["id_registro"]),
                IdTorneoOrigen = Convert.ToInt32(reader["id_torneo_origen"]),
                IdTorneoDestino = Convert.ToInt32(reader["id_torneo_destino"]),
                IdEquipo = Convert.ToInt32(reader["id_equipo"]),
                Movimiento = reader["movimiento"].ToString()!,
                NombreTorneoOrigen = reader["nombre_torneo_origen"].ToString(),
                NombreTorneoDestino = reader["nombre_torneo_destino"].ToString(),
                NombreEquipo = reader["nombre_equipo"].ToString()
            });
        }
        return lista;
    }

    public void InsertarAscensoDescenso(AscensoDescenso ad)
    {
        using var conn = _db.GetConnection();
        const string sql = @"INSERT INTO ASCENSO_DESCENSO (id_torneo_origen, id_torneo_destino, id_equipo, movimiento) 
                             VALUES (:id_torneo_origen, :id_torneo_destino, :id_equipo, :movimiento)";
        using var cmd = new OracleCommand(sql, conn);
        cmd.Parameters.Add(new OracleParameter("id_torneo_origen", ad.IdTorneoOrigen));
        cmd.Parameters.Add(new OracleParameter("id_torneo_destino", ad.IdTorneoDestino));
        cmd.Parameters.Add(new OracleParameter("id_equipo", ad.IdEquipo));
        cmd.Parameters.Add(new OracleParameter("movimiento", ad.Movimiento));
        cmd.ExecuteNonQuery();
    }

    public void EliminarAscensoDescenso(int id)
    {
        using var conn = _db.GetConnection();
        const string sql = "DELETE FROM ASCENSO_DESCENSO WHERE id_registro = :id";
        using var cmd = new OracleCommand(sql, conn);
        cmd.Parameters.Add(new OracleParameter("id", id));
        cmd.ExecuteNonQuery();
    }

    private static Torneo MapTorneo(OracleDataReader reader)
    {
        return new Torneo
        {
            IdTorneo = Convert.ToInt32(reader["id_torneo"]),
            Nombre = reader["nombre"].ToString()!,
            FechaInicio = reader["fecha_inicio"] == DBNull.Value ? null : (DateTime?)reader["fecha_inicio"],
            FechaFin = reader["fecha_fin"] == DBNull.Value ? null : (DateTime?)reader["fecha_fin"],
            PuntosVictoria = Convert.ToInt32(reader["puntos_victoria"]),
            PuntosEmpate = Convert.ToInt32(reader["puntos_empate"]),
            PuntosDerrota = Convert.ToInt32(reader["puntos_derrota"]),
            AmarillasParaSuspension = Convert.ToInt32(reader["amarillas_para_suspension"]),
            RojasParaSuspension = reader["rojas_para_suspension"] == DBNull.Value ? 1 : Convert.ToInt32(reader["rojas_para_suspension"]),
            Categoria = reader["categoria"] == DBNull.Value ? "LIBRE" : reader["categoria"].ToString()!,
            Division = reader["division"] == DBNull.Value ? null : reader["division"].ToString(),
            Estado = reader["estado"].ToString()!
        };
    }
}
