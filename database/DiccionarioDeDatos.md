# Diccionario de Datos - TorneoManagerWeb

Este documento describe la estructura de las tablas de la base de datos Oracle utilizada en el proyecto `TorneoManagerWeb`, así como las relaciones entre ellas.

## Tablas Principales

### 1. TORNEO
Almacena la información de los torneos gestionados por el sistema.
- `id_torneo` (NUMBER, PK): Identificador único del torneo.
- `nombre` (VARCHAR2): Nombre del torneo.
- `fecha_inicio` (DATE): Fecha de inicio del torneo.
- `fecha_fin` (DATE): Fecha de finalización del torneo.
- `puntos_victoria` (NUMBER): Puntos otorgados por victoria (por defecto 3).
- `puntos_empate` (NUMBER): Puntos otorgados por empate (por defecto 1).
- `puntos_derrota` (NUMBER): Puntos otorgados por derrota (por defecto 0).
- `amarillas_para_suspension` (NUMBER): Cantidad de amarillas para suspender a un jugador.
- `rojas_para_suspension` (NUMBER): Cantidad de rojas para suspender a un jugador.
- `estado` (VARCHAR2): Estado actual del torneo ('ACTIVO' o 'INACTIVO').
- `categoria` (VARCHAR2): Categoría del torneo (por defecto 'LIBRE').
- `division` (VARCHAR2): División del torneo.

**Relaciones:**
- **1 a N** con `EQUIPO` (Un torneo tiene muchos equipos).
- **1 a N** con `PARTIDO` (Un torneo tiene muchos partidos).
- **1 a N** con `POSICION` (Un torneo tiene muchas posiciones en su tabla).
- **1 a N** con `SANCION_JUGADOR` (Un torneo registra múltiples sanciones).
- **1 a N** con `ASCENSO_DESCENSO` (Un torneo puede ser origen o destino de un ascenso/descenso).

### 2. EQUIPO
Almacena los equipos que participan en los diferentes torneos.
- `id_equipo` (NUMBER, PK): Identificador único del equipo.
- `id_torneo` (NUMBER, FK): Torneo al que pertenece el equipo.
- `nombre` (VARCHAR2): Nombre del equipo.
- `ciudad` (VARCHAR2): Ciudad de origen del equipo.
- `tecnico` (VARCHAR2): Nombre del director técnico.
- `activo` (CHAR): Indica si el equipo está activo ('S'/'N').

**Relaciones:**
- **N a 1** con `TORNEO` (Pertenece a un torneo).
- **1 a N** con `JUGADOR` (Tiene muchos jugadores).
- **1 a N** con `PARTIDO` (Participa en muchos partidos, como local o visitante).
- **1 a N** con `POSICION` (Tiene un registro en la tabla de posiciones por torneo).
- **1 a N** con `RACHA_EQUIPO` (Puede tener múltiples rachas registradas).
- **1 a N** con `ASCENSO_DESCENSO` (Puede tener movimientos de categoría).

### 3. JUGADOR
Almacena los jugadores que pertenecen a los equipos.
- `id_jugador` (NUMBER, PK): Identificador único del jugador.
- `id_equipo` (NUMBER, FK): Equipo al que pertenece.
- `nombre` (VARCHAR2): Nombres del jugador.
- `apellido` (VARCHAR2): Apellidos del jugador.
- `posicion` (VARCHAR2): Posición en la que juega.
- `dorsal` (NUMBER): Número de camiseta.
- `estado` (VARCHAR2): Estado del jugador ('ACTIVO', 'SUSPENDIDO').
- `activo` (CHAR): Indica si el jugador sigue en el equipo ('S'/'N').

**Relaciones:**
- **N a 1** con `EQUIPO` (Pertenece a un equipo).
- **1 a N** con `TARJETA` (Puede recibir múltiples tarjetas).
- **1 a N** con `GOL` (Puede anotar múltiples goles).
- **1 a N** con `SANCION_JUGADOR` (Puede recibir múltiples sanciones).
- **1 a N** con `PARTIDO_JUGADOR` (Participa en muchos partidos).
- **1 a N** con `PARTIDO_EVENTO_JUGADOR` (Genera estadísticas en múltiples partidos).

### 4. PARTIDO
Almacena la información y resultados de los encuentros entre equipos.
- `id_partido` (NUMBER, PK): Identificador único del partido.
- `id_torneo` (NUMBER, FK): Torneo al que corresponde el partido.
- `id_local` (NUMBER, FK): Equipo que juega de local.
- `id_visitante` (NUMBER, FK): Equipo que juega de visitante.
- `fecha` (DATE): Fecha y hora del encuentro.
- `jornada` (NUMBER): Número de la fecha o jornada.
- `goles_local` (NUMBER): Goles marcados por el equipo local.
- `goles_visitante` (NUMBER): Goles marcados por el equipo visitante.
- `estado` (VARCHAR2): Estado del encuentro ('PROGRAMADO', 'JUGADO', 'SUSPENDIDO').
- `formacion_local` (VARCHAR2): Formación táctica del local (ej. 4-4-2).
- `formacion_visitante` (VARCHAR2): Formación táctica del visitante.
- `id_sede` (NUMBER, FK): Sede donde se juega el partido.

**Relaciones:**
- **N a 1** con `TORNEO` (Pertenece a un torneo).
- **N a 1** con `EQUIPO` (Se relaciona con un equipo local y uno visitante).
- **N a 1** con `SEDE` (Se juega en una sede).
- **1 a N** con `GOL` (Se anotan múltiples goles en él).
- **1 a N** con `TARJETA` (Se muestran múltiples tarjetas).
- **1 a N** con `PARTIDO_ARBITRAJE` (Es dirigido por varios árbitros).
- **1 a N** con `PARTIDO_REPROGRAMACION` (Puede tener reprogramaciones).
- **1 a N** con `PARTIDO_JUGADOR` (Participan múltiples jugadores).
- **1 a N** con `PARTIDO_EVENTO_JUGADOR` (Genera múltiples eventos/estadísticas de jugadores).
- **1 a N** con `AUDITORIA_PARTIDO` (Genera múltiples registros de auditoría).

### 5. POSICION
Tabla de posiciones de los equipos en un torneo determinado.
- `id_torneo` (NUMBER, PK/FK): Torneo evaluado.
- `id_equipo` (NUMBER, PK/FK): Equipo en la tabla.
- `pj` (NUMBER): Partidos jugados.
- `pg` (NUMBER): Partidos ganados.
- `pe` (NUMBER): Partidos empatados.
- `pp` (NUMBER): Partidos perdidos.
- `gf` (NUMBER): Goles a favor.
- `gc` (NUMBER): Goles en contra.
- `dg` (NUMBER): Diferencia de goles.
- `puntos` (NUMBER): Puntos acumulados.

**Relaciones:**
- **N a 1** con `TORNEO` (Es la posición de un torneo específico).
- **N a 1** con `EQUIPO` (Es la estadística de un equipo específico).

### 6. GOL
Registro individual de los goles anotados en un partido.
- `id_gol` (NUMBER, PK): Identificador único del gol.
- `id_partido` (NUMBER, FK): Partido donde se anotó el gol.
- `id_jugador` (NUMBER, FK): Jugador que anotó.
- `minuto` (NUMBER): Minuto del encuentro en que se anotó.
- `tipo` (VARCHAR2): Tipo de gol ('NORMAL', 'PENAL', 'AUTOGOL').

**Relaciones:**
- **N a 1** con `PARTIDO` (Fue anotado en un partido).
- **N a 1** con `JUGADOR` (Fue anotado por un jugador).

### 7. TARJETA
Registro de las amonestaciones recibidas en los partidos.
- `id_tarjeta` (NUMBER, PK): Identificador único de la tarjeta.
- `id_partido` (NUMBER, FK): Partido donde ocurrió.
- `id_jugador` (NUMBER, FK): Jugador amonestado.
- `tipo` (VARCHAR2): Tipo de tarjeta ('AMARILLA', 'ROJA').
- `minuto` (NUMBER): Minuto de la infracción.

**Relaciones:**
- **N a 1** con `PARTIDO` (Fue mostrada en un partido).
- **N a 1** con `JUGADOR` (Fue recibida por un jugador).

### 8. SANCION_JUGADOR
Control de las suspensiones de los jugadores por faltas o acumulación de tarjetas.
- `id_sancion` (NUMBER, PK): Identificador único de la sanción.
- `id_jugador` (NUMBER, FK): Jugador sancionado.
- `id_torneo` (NUMBER, FK): Torneo donde aplica.
- `motivo` (VARCHAR2): Razón de la sanción.
- `partidos_suspendidos` (NUMBER): Total de partidos a cumplir.
- `partidos_cumplidos` (NUMBER): Partidos ya cumplidos.
- `vigente` (CHAR): Indica si la sanción sigue activa ('S'/'N').
- `fecha_inicio` (DATE): Fecha de inicio de sanción.
- `fecha_fin` (DATE): Fecha de fin de sanción.

**Relaciones:**
- **N a 1** con `JUGADOR` (Pertenece a un jugador).
- **N a 1** con `TORNEO` (Aplica a un torneo).
- **1 a N** con `APELACION` (Puede recibir múltiples apelaciones).

### 9. APELACION
Registro de apelaciones sobre sanciones a jugadores.
- `id_apelacion` (NUMBER, PK): Identificador único.
- `id_sancion` (NUMBER, FK): Sanción apelada.
- `estado` (VARCHAR2): 'PENDIENTE', 'APROBADA', 'RECHAZADA'.
- `motivo` (VARCHAR2): Motivo de la apelación.
- `respuesta` (VARCHAR2): Justificación de la resolución.
- `fecha_presentacion` (DATE): Fecha de ingreso.
- `fecha_resolucion` (DATE): Fecha en que se tomó decisión.

**Relaciones:**
- **N a 1** con `SANCION_JUGADOR` (Está vinculada a una sanción).

## Gestión de Árbitros y Sedes

### 10. SEDE
Lugares donde se desarrollan los encuentros deportivos.
- `id_sede` (NUMBER, PK): Identificador único de la sede.
- `nombre` (VARCHAR2): Nombre del complejo/estadio.
- `direccion` (VARCHAR2): Dirección de la sede.
- `ciudad` (VARCHAR2): Ciudad de ubicación.
- `activo` (CHAR): Disponible para jugar ('S'/'N').

**Relaciones:**
- **1 a N** con `PARTIDO` (Alberga muchos partidos).
- **1 a N** con `SEDE_BLOQUEO` (Puede tener múltiples bloqueos/mantenimientos).

### 11. SEDE_BLOQUEO
Fechas en las que una sede no está disponible.
- `id_bloqueo` (NUMBER, PK): Identificador único.
- `id_sede` (NUMBER, FK): Sede afectada.
- `fecha_bloqueada` (DATE): Día no disponible.
- `motivo` (VARCHAR2): Por qué no se puede usar.

**Relaciones:**
- **N a 1** con `SEDE` (Aplica a una sede específica).

### 12. ARBITRO
Registro de árbitros del sistema.
- `id_arbitro` (NUMBER, PK): Identificador único.
- `nombre` (VARCHAR2): Nombre del árbitro.
- `tipo` (VARCHAR2): 'PRINCIPAL', 'ASISTENTE', 'VEEDOR'.
- `activo` (CHAR): ('S'/'N').

**Relaciones:**
- **1 a N** con `PARTIDO_ARBITRAJE` (Dirige en muchos partidos).

### 13. PARTIDO_ARBITRAJE
Asignación de árbitros a partidos y calificación.
- `id_partido` (NUMBER, PK/FK): Partido arbitrado.
- `id_arbitro` (NUMBER, PK/FK): Árbitro asignado.
- `rol` (VARCHAR2, PK): Rol asumido en ese partido.
- `calificacion` (NUMBER): Puntuación del desempeño (1-10).
- `comentarios` (VARCHAR2): Observaciones adicionales.

**Relaciones:**
- **N a 1** con `PARTIDO` (Corresponde a un partido).
- **N a 1** con `ARBITRO` (Es el desempeño de un árbitro).

## Gestión Avanzada de Torneos y Estadísticas

### 14. ASCENSO_DESCENSO
Control de movimientos de equipos entre torneos (divisiones).
- `id_registro` (NUMBER, PK): Identificador.
- `id_torneo_origen` (NUMBER, FK): Torneo de donde sale.
- `id_torneo_destino` (NUMBER, FK): Torneo al que va.
- `id_equipo` (NUMBER, FK): Equipo movido.
- `movimiento` (VARCHAR2): 'ASCENSO' o 'DESCENSO'.

**Relaciones:**
- **N a 1** con `TORNEO` (Se relaciona con el torneo origen).
- **N a 1** con `TORNEO` (Se relaciona con el torneo destino).
- **N a 1** con `EQUIPO` (Es el movimiento de un equipo).

### 15. PARTIDO_REPROGRAMACION
Seguimiento a los partidos que sufren cambios de fecha.
- `id_reprog` (NUMBER, PK): Identificador único.
- `id_partido` (NUMBER, FK): Partido alterado.
- `fecha_anterior` (DATE): Cuándo se iba a jugar.
- `fecha_nueva` (DATE): Cuándo se jugará.
- `motivo` (VARCHAR2): Razón del cambio.
- `notificado` (CHAR): Si los equipos fueron avisados ('S'/'N').

**Relaciones:**
- **N a 1** con `PARTIDO` (Aplica a un partido específico).

### 16. PARTIDO_EVENTO_JUGADOR
Estadísticas detalladas por jugador en un partido específico.
- `id_evento` (NUMBER, PK): ID único.
- `id_partido` (NUMBER, FK): Partido.
- `id_jugador` (NUMBER, FK): Jugador analizado.
- `minutos_jugados` (NUMBER): Tiempo en cancha.
- `asistencias` (NUMBER): Pases gol.
- `xg_estimado` (NUMBER): Goles esperados (métricas avanzadas).
- `posicion_en_campo` (VARCHAR2): Posición en ese juego.
- `heatmap_json` (CLOB): Datos de mapa de calor.
- `mvp_jornada` (CHAR): Jugador más valioso ('S'/'N').

**Relaciones:**
- **N a 1** con `PARTIDO` (Corresponde a un partido).
- **N a 1** con `JUGADOR` (Es la estadística de un jugador).

### 17. PARTIDO_JUGADOR
Asistencia y participación básica del jugador en un partido.
- `id_partido` (NUMBER, PK/FK): Partido.
- `id_jugador` (NUMBER, PK/FK): Jugador.
- `titular` (CHAR): Si inició el encuentro ('S'/'N').
- `minutos_jugados` (NUMBER): Tiempo en cancha.
- `goles` (NUMBER): Goles anotados en el encuentro.

**Relaciones:**
- **N a 1** con `PARTIDO` (Es la participación en un partido).
- **N a 1** con `JUGADOR` (Es el registro de un jugador).

### 18. RACHA_EQUIPO
Estadísticas de rachas (invictos) de equipos.
- `id_racha` (NUMBER, PK): Identificador de la racha.
- `id_equipo` (NUMBER, FK): Equipo dueño de la racha.
- `partidos_invicto` (NUMBER): Juegos sin perder.
- `partidos_ganados` (NUMBER): Juegos ganados consecutivos.
- `goles_favor` (NUMBER): Acumulado de la racha.
- `goles_contra` (NUMBER): Acumulado de la racha.
- `desde_fecha` (DATE): Inicio de la racha.
- `hasta_fecha` (DATE): Fin de la racha.

**Relaciones:**
- **N a 1** con `EQUIPO` (Es la racha de un equipo).

### 19. AUDITORIA_PARTIDO
Tabla para llevar rastro de cambios críticos en partidos.
- `id_auditoria` (NUMBER, PK): Identificador.
- `id_partido` (NUMBER): Referencia al partido modificado.
- `usuario` (VARCHAR2): Quién modificó.
- `fecha_hora` (DATE): Cuándo.
- `detalle_antes` (VARCHAR2): Estado previo.
- `detalle_despues` (VARCHAR2): Estado nuevo.

**Relaciones:**
- **N a 1** con `PARTIDO` (Es la auditoría de un partido, aunque en el script no tiene FK explícita).
