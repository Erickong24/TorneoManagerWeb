using System.Data;
using Oracle.ManagedDataAccess.Client;

namespace TorneoManagerWeb.Infrastructure.Data;

/// <summary>
/// Oracle database context that reads connection string from configuration.
/// Registered as Scoped in DI container.
/// </summary>
public class OracleDbContext
{
    private readonly string _connectionString;

    public OracleDbContext(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("Oracle")
            ?? throw new InvalidOperationException(
                "La cadena de conexión 'Oracle' no está configurada en appsettings.json.");
    }

    public OracleConnection GetConnection()
    {
        var connection = new OracleConnection(_connectionString);
        if (connection.State != ConnectionState.Open)
        {
            connection.Open();
        }
        return connection;
    }
}
