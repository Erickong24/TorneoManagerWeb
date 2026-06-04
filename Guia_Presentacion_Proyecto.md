# Guía de Presentación del Proyecto: TorneoManagerWeb
Esta guía está diseñada para ayudarte a explicar el proyecto de manera sobresaliente ante tu profesor de Base de Datos y prepararte para cualquier pregunta técnica.

---

## 1. Presentación General del Proyecto

### ¿Qué es TorneoManagerWeb?
Es un sistema web integral de gestión y estadísticas para torneos de fútbol u otros deportes. El sistema permite administrar de manera estructurada y automatizada desde la creación de torneos, asignación de equipos y jugadores, hasta el calendario de partidos, registro de resultados, control disciplinario (tarjetas, sanciones, apelaciones) y métricas de rendimiento avanzadas (goles, asistencias, xG o goles esperados, alineaciones e histórico de rachas).

### ¿Por qué destaca como proyecto de Base de Datos?
No es un simple CRUD. Destaca porque delega la **lógica de negocio compleja** y las **reglas de integridad y consistencia** directamente en el motor de base de datos (**Oracle Database**), utilizando:
1. **Esquema Relacional Normalizado** con restricciones estrictas de clave primaria, foránea y de dominio.
2. **Procedimientos y Paquetes PL/SQL** para transacciones y cálculos automáticos (cómputo de la tabla de posiciones y automatización disciplinaria).
3. **Triggers (Disparadores)** para mantener la consistencia en tiempo real.
4. **Vistas Especializadas** para simplificar las consultas de reportes (goleadores, juego limpio, tabla de posiciones, sancionados).
5. **Índices Estratégicos** para optimizar el rendimiento ante consultas frecuentes.
6. **Arquitectura Limpia (Clean Architecture)** en C# / .NET 8 que consume la base de datos a través de repositorios desacoplados con ADO.NET (Oracle Managed Data Access).

---

## 2. Estructura y Diseño de la Base de Datos

### Entidades y Relaciones Principales
La base de datos cuenta con un robusto esquema relacional. A continuación se detallan las tablas y su propósito:

1. **TORNEO**: Entidad padre que define las reglas del campeonato (nombre, fechas, puntos por victoria/empate/derrota, límite de amarillas o rojas para suspensión y la categoría/división).
2. **EQUIPO**: Pertenece a un torneo (`id_torneo`). Almacena datos como nombre, ciudad de origen y director técnico.
3. **JUGADOR**: Pertenece a un equipo (`id_equipo`). Registra nombre, dorsal, posición y estado (Activo o Suspendido).
4. **PARTIDO**: Modela el encuentro entre dos equipos (local y visitante) dentro de un torneo, guardando los goles de cada uno, el estado del partido (PROGRAMADO, JUGADO, SUSPENDIDO) y formaciones tácticas.
5. **POSICION**: Tabla de agregación calculada que actúa como tabla de posiciones. Evita recalcular de forma costosa con agregados pesados cada vez que un usuario consulta la tabla. Guarda los partidos jugados (PJ), ganados (PG), empatados (PE), perdidos (PP), goles a favor (GF), en contra (GC), diferencia (DG) y puntos acumulados.
6. **GOL**: Registra los goles anotados por cada jugador en un partido, detallando el minuto y tipo (NORMAL, PENAL, AUTOGOL).
7. **TARJETA**: Controla las amonestaciones (AMARILLA o ROJA) recibidas por jugador por partido y el minuto.
8. **SANCION_JUGADOR**: Generada automáticamente o de forma manual por acumulación de tarjetas o expulsión. Lleva control de partidos suspendidos y cumplidos.
9. **APELACION**: Registra el derecho del jugador/club a apelar una sanción y su estado (PENDIENTE, APROBADA, RECHAZADA).
10. **SEDE y SEDE_BLOQUEO**: Permite programar los partidos en estadios específicos y controlar las fechas en que un estadio no está disponible por mantenimiento u otros eventos.
11. **ARBITRO y PARTIDO_ARBITRAJE**: Registra el cuerpo arbitral de los encuentros (principal, asistente, veedor), sus comentarios y una calificación de rendimiento de 1 a 10.
12. **PARTIDO_REPROGRAMACION**: Historial de cambios de fecha/hora de los encuentros.
13. **PARTIDO_EVENTO_JUGADOR**: Almacena estadísticas avanzadas por jugador en un partido (minutos jugados, asistencias, goles esperados `xG`, mapa de calor en formato JSON y premio MVP).
14. **AUDITORIA_PARTIDO**: Almacena los cambios realizados sobre los resultados de los partidos, guardando el estado "antes" y "después" para efectos de control.

---

## 3. Lógica Embebida en la Base de Datos (PL/SQL)

Tu profesor valorará enormemente que no toda la lógica resida en la aplicación. Aquí es donde brilla el proyecto:

### A. Paquetes PL/SQL
Los paquetes agrupan lógica de negocio relacionada bajo un mismo espacio de nombres, mejorando el rendimiento, la encapsulación y la seguridad.

#### 1. `PKG_TORNEO`
*   **`registrar_resultado`**: Recibe el identificador del partido, goles de local y visitante, y el usuario que realiza el cambio. Actualiza el partido, inserta un registro en la tabla de auditoría con los datos previos y nuevos, e invoca internamente a `recalcular_tabla`.
*   **`recalcular_tabla`**: Es el motor del torneo. Lee dinámicamente las reglas de puntuación del torneo (ej. si otorga 3 puntos por ganar o una regla especial). Reinicia las estadísticas del torneo en la tabla `POSICION` a 0 y barre mediante un cursor todos los partidos ya finalizados del torneo, actualizando incrementalmente los puntos, goles y partidos de los equipos local y visitante de cada encuentro.
*   **`inicializar_posiciones`**: Crea las filas base con estadísticas en cero en la tabla `POSICION` para los equipos que se acaban de registrar en un torneo.

#### 2. `PKG_TARJETAS`
*   **`registrar_tarjeta`**: Inserta la tarjeta en la tabla `TARJETA`. Si es roja directa, genera automáticamente un registro en `SANCION_JUGADOR` (1 partido de suspensión) y cambia el estado del jugador a `'SUSPENDIDO'`. Si es amarilla, invoca a `evaluar_sancion`.
*   **`evaluar_sancion`**: Lee las reglas del torneo para ver cuántas amarillas provocan una suspensión automática. Cuenta las amarillas del jugador en el torneo actual. Si alcanza el límite o un múltiplo de este (usando el operador `MOD`), genera la sanción reglamentaria y suspende al jugador de forma automática.

### B. Triggers (Disparadores)
*   **`TRG_EQUIPO_INSERT`**: Trigger de tipo `AFTER INSERT` a nivel de fila (`FOR EACH ROW`) en la tabla `EQUIPO`. Garantiza que en el momento en que se registre un equipo nuevo, automáticamente se cree su registro en la tabla `POSICION` con estadísticas inicializadas en cero. Esto evita inconsistencias de datos y asegura que el equipo aparezca inmediatamente en la tabla de posiciones oficial.

### C. Vistas (Views)
Las vistas encapsulan la complejidad de múltiples uniones (`JOIN`) y agrupaciones (`GROUP BY`), ofreciendo una API limpia para el backend:
*   **`V_TABLA_POSICIONES`**: Une la tabla `POSICION` con `EQUIPO` y `TORNEO` para devolver los nombres descriptivos ordenando las filas siguiendo los criterios oficiales de desempate (Puntos desc, Diferencia de goles desc, Goles a favor desc).
*   **`V_GOLEADORES`**: Agrupa y cuenta los registros de la tabla `GOL` por jugador, trayendo el nombre del jugador, el de su equipo y ordenándolos de mayor a menor cantidad de goles.
*   **`V_JUGADORES_SANCIONADOS`**: Filtra los registros de `SANCION_JUGADOR` donde `vigente = 'S'` para listar rápidamente quiénes no pueden jugar y cuántos partidos les restan de sanción.
*   **`V_FAIR_PLAY`**: Calcula una puntuación disciplinaria por equipo basándose en sus tarjetas (ej. 1 punto por amarilla, 3 puntos por roja). El equipo con menor puntuación va primero en la clasificación de Juego Limpio.

---

## 4. Estructura del Código C# y Conectividad ADO.NET

El sistema utiliza una arquitectura por capas bien delimitada:
*   **Domain**: Contiene las entidades puras de negocio (ej. `Partido.cs`, `Jugador.cs`) e interfaces de repositorios (`ITorneoRepositorio`). No tiene dependencias de infraestructura ni de frameworks de persistencia.
*   **Infrastructure**: Implementa la persistencia. `OracleDbContext` obtiene la cadena de conexión desde `appsettings.json` y proporciona conexiones administradas utilizando `OracleConnection`. Los Repositorios (como `PartidoRepositorio.cs`) ejecutan consultas SQL crudas parametrizadas o invocan procedimientos almacenados de paquetes mediante `CommandType.StoredProcedure`.
*   **Application Services**: Coordinan los flujos de trabajo de la aplicación y aplican validaciones adicionales.
*   **Controllers**: Exponen endpoints de API REST en formato JSON para que el cliente (Frontend HTML/JS) consuma las funcionalidades del sistema.

---

## 5. Preguntas Clave del Profesor y Cómo Responderlas (Simulacro)

Prepárate con estas respuestas técnicas precisas ante los cuestionamientos más probables del jurado:

### P1: ¿En qué Forma Normal está tu base de datos? Explica la normalización.
*   **Respuesta**: "Nuestra base de datos se encuentra en **Tercera Forma Normal (3FN)**.
    *   **Primera Forma Normal (1FN)**: Todos los atributos son atómicos (no hay arrays ni grupos repetitivos) y cada tabla posee una clave primaria bien definida.
    *   **Segunda Forma Normal (2FN)**: Al estar en 1FN, todos los atributos que no forman parte de la clave primaria dependen por completo de la clave primaria y no de partes de ella (especialmente relevante en tablas con claves compuestas como `POSICION` o `PARTIDO_ARBITRAJE`).
    *   **Tercera Forma Normal (3FN)**: No existen dependencias transitivas; es decir, ningún atributo no clave depende de otro atributo no clave. Por ejemplo, en la tabla `JUGADOR` no guardamos los datos de la ciudad o técnico del equipo; en su lugar, guardamos únicamente el `id_equipo`, obligando a consultar la tabla `EQUIPO` para conocer esa información."

### P2: Si la base de datos está normalizada, ¿por qué existe la tabla `POSICION`? ¿No es eso redundancia de datos?
*   **Respuesta**: "Efectivamente, los puntos y partidos jugados se pueden calcular en tiempo real sumando los goles y resultados de la tabla `PARTIDO`. Sin embargo, en sistemas de alta concurrencia o con un histórico masivo de partidos, hacer sumatorias agrupadas de miles de filas cada vez que un usuario visualiza la tabla de posiciones es computacionalmente ineficiente.
    Por lo tanto, aplicamos una **desnormalización controlada** mediante la tabla `POSICION`. Para evitar inconsistencias de datos (el peligro clásico de la desnormalización), implementamos la lógica en el paquete `PKG_TORNEO.recalcular_tabla`. Cada vez que se registra o modifica el resultado de un partido, el motor ejecuta la actualización de forma transaccional, garantizando que la tabla `POSICION` esté siempre sincronizada."

### P3: ¿Por qué decidieron utilizar un Paquete PL/SQL (`Package`) en lugar de almacenar la lógica en el código de C# (Backend)?
*   **Respuesta**: "Por tres razones fundamentales de diseño de bases de datos:
    1.  **Rendimiento (Reducción de Latencia de Red)**: Recalcular la tabla requiere barrer todos los partidos del torneo y hacer múltiples actualizaciones (`UPDATE`) por equipo. Si lo hiciéramos en C#, tendríamos que traer todos los registros por la red, procesarlos y enviar múltiples comandos de actualización de vuelta. Al usar PL/SQL, todo el procesamiento ocurre en memoria del servidor de base de datos y solo viaja un comando de ejecución.
    2.  **Seguridad y Modularidad**: Se encapsula la lógica. El backend no necesita saber cómo se calcula un punto o una diferencia de gol; solo invoca al procedimiento `registrar_resultado`. Si cambian las reglas del negocio, se modifican en la base de datos sin necesidad de recompilar y desplegar la aplicación web.
    3.  **Integridad Transaccional**: El procedimiento se ejecuta bajo una misma transacción en la base de datos, asegurando que si la actualización de la tabla de posiciones falla, el resultado del partido tampoco se guarde (evitando datos corruptos)."

### P4: ¿Cómo manejan la seguridad ante ataques de Inyección SQL (SQL Injection)?
*   **Respuesta**: "En toda nuestra capa de persistencia (Repositories) utilizamos **consultas preparadas con parámetros explícitos** (`OracleParameter`). Nunca concatenamos valores ingresados por el usuario directamente en la cadena SQL. Por ejemplo, en `EstadisticaRepositorio.cs` definimos `:id_partido` en la consulta y luego lo añadimos al comando usando `cmd.Parameters.Add(new OracleParameter(...))`. El motor de Oracle trata estos parámetros estrictamente como datos y no como código ejecutable, neutralizando cualquier intento de inyección SQL."

### P5: Veo que usaron Triggers en su esquema. ¿Por qué usaron un Trigger para insertar en la tabla `POSICION` en lugar de hacerlo desde C#?
*   **Respuesta**: "Para garantizar la **integridad referencial y de datos a nivel de motor**. Si un administrador registra un equipo nuevo desde la consola de Oracle, mediante un script de carga masiva, o desde otra aplicación externa, el trigger `TRG_EQUIPO_INSERT` se disparará automáticamente. Si dependiéramos de que C# haga la inserción, correríamos el riesgo de que inserciones directas en base de datos dejen al equipo sin su fila correspondiente en la tabla de posiciones, provocando fallos (como valores nulos o registros faltantes) en las consultas de los reportes."

### P6: ¿Qué índices agregaron y por qué?
*   **Respuesta**: "Además de los índices automáticos que Oracle crea para las Claves Primarias (PK) y restricciones únicas, creamos índices no agrupados de forma explícita:
    *   `idx_partido_torneo` en `PARTIDO(id_torneo)`
    *   `idx_jugador_equipo` en `JUGADOR(id_equipo)`
    *   `idx_gol_partido` en `GOL(id_partido)`
    Estos índices aceleran sustancialmente los filtros (`WHERE`) y los acoplamientos (`JOIN`) más recurrentes del sistema. Por ejemplo, para mostrar el calendario de un torneo o la lista de goleadores, el motor puede buscar directamente en el árbol del índice en lugar de realizar un escaneo completo de la tabla (`Full Table Scan`), reduciendo drásticamente las lecturas físicas en disco."

### P7: ¿Qué ocurre con la concurrencia si dos usuarios intentan registrar resultados de partidos distintos del mismo torneo al mismo tiempo?
*   **Respuesta**: "Oracle implementa control de concurrencia mediante bloqueo a nivel de fila (*Row-Level Locking*). Cuando el primer usuario ejecuta el procedimiento para registrar el resultado, Oracle bloquea únicamente las filas de la tabla `POSICION` correspondientes a los dos equipos que jugaron. Si otro usuario registra el resultado de un partido con equipos diferentes, se ejecutará en paralelo sin bloqueos. Si los partidos involucran al mismo equipo, el segundo proceso esperará ordenadamente a que la primera transacción haga `COMMIT`, manteniendo la consistencia de los puntos sin bloquear toda la tabla de posiciones."

---

## 6. Tips de Oro para la Defensa del Proyecto
1.  **Dibuja o ten a la mano el Diagrama Entidad-Relación (DER)**: Es lo primero que te va a pedir tu profesor. Asegúrate de saber señalar las relaciones 1 a Muchos (ej. Un Torneo tiene Muchos Equipos) y Muchos a Muchos resueltas con tablas intermedias (ej. `PARTIDO_ARBITRAJE` y `PARTIDO_JUGADOR`).
2.  **Muestra la consola de Oracle / SQL Developer**: Si te pide probar la base de datos de forma aislada, abre SQL Developer y ejecuta:
    ```sql
    -- Registrar un resultado directamente en DB y ver la magia del recalculo
    EXEC PKG_TORNEO.registrar_resultado(p_id_partido => 1, p_goles_local => 3, p_goles_visitante => 2, p_usuario => 'PROFESOR_BD');
    -- Consultar la tabla de posiciones calculada
    SELECT * FROM V_TABLA_POSICIONES WHERE id_torneo = 1;
    ```
    Ver cómo la base de datos trabaja por sí sola sin necesidad del frontend dejará al docente sumamente satisfecho.
3.  **Usa vocabulario técnico**: Habla de *procedimientos almacenados*, *cursores*, *integridad referencial*, *transaccionalidad (ACID)*, *triggers*, *planes de ejecución* e *índices*. Evita decir "el programa hace X", di "el motor de base de datos ejecuta Y".
