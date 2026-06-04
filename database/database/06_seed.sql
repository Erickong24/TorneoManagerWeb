-- 06_seed.sql
-- Carga de datos de ejemplo con referencias consistentes
-- Ejecutar después de crear el esquema (01..05)

SET DEFINE OFF;

DECLARE
    v_torneo_apertura NUMBER;
    v_torneo_clausura NUMBER;

    v_eq_tigres   NUMBER;
    v_eq_leones   NUMBER;
    v_eq_aguilas  NUMBER;
    v_eq_piratas  NUMBER;
    v_eq_atleticos NUMBER;
    v_eq_bufalos   NUMBER;

    v_j_tigres_del NUMBER;
    v_j_tigres_vol NUMBER;
    v_j_leones_del NUMBER;
    v_j_leones_def NUMBER;
    v_j_aguilas_del NUMBER;
    v_j_aguilas_vol NUMBER;
    v_j_piratas_del NUMBER;
    v_j_piratas_def NUMBER;

    v_part1 NUMBER;
    v_part2 NUMBER;
    v_part3 NUMBER;

    -- Helpers
    PROCEDURE ensure_torneo(p_nombre VARCHAR2, p_fi DATE, p_ff DATE, p_out OUT NUMBER) IS
    BEGIN
        BEGIN
            SELECT id_torneo INTO p_out FROM TORNEO WHERE nombre = p_nombre AND ROWNUM = 1;
        EXCEPTION WHEN NO_DATA_FOUND THEN
            INSERT INTO TORNEO (nombre, fecha_inicio, fecha_fin, puntos_victoria, puntos_empate, puntos_derrota, amarillas_para_suspension, estado)
            VALUES (p_nombre, p_fi, p_ff, 3, 1, 0, 3, 'ACTIVO')
            RETURNING id_torneo INTO p_out;
        END;
    END;

    PROCEDURE ensure_equipo(p_torneo NUMBER, p_nombre VARCHAR2, p_ciudad VARCHAR2, p_tecnico VARCHAR2, p_out OUT NUMBER) IS
    BEGIN
        BEGIN
            SELECT id_equipo INTO p_out FROM EQUIPO WHERE id_torneo = p_torneo AND nombre = p_nombre AND ROWNUM = 1;
        EXCEPTION WHEN NO_DATA_FOUND THEN
            INSERT INTO EQUIPO (id_torneo, nombre, ciudad, tecnico, activo)
            VALUES (p_torneo, p_nombre, p_ciudad, p_tecnico, 'S')
            RETURNING id_equipo INTO p_out;
        END;
    END;

    PROCEDURE ensure_jugador(p_equipo NUMBER, p_nombre VARCHAR2, p_apellido VARCHAR2, p_pos VARCHAR2, p_dorsal NUMBER, p_out OUT NUMBER) IS
    BEGIN
        BEGIN
            SELECT id_jugador INTO p_out FROM JUGADOR 
             WHERE id_equipo = p_equipo AND nombre = p_nombre AND apellido = p_apellido AND ROWNUM = 1;
        EXCEPTION WHEN NO_DATA_FOUND THEN
            INSERT INTO JUGADOR (id_equipo, nombre, apellido, posicion, dorsal, estado, activo)
            VALUES (p_equipo, p_nombre, p_apellido, p_pos, p_dorsal, 'ACTIVO', 'S')
            RETURNING id_jugador INTO p_out;
        END;
    END;

    PROCEDURE ensure_partido(p_torneo NUMBER, p_local NUMBER, p_visit NUMBER, p_fecha DATE, p_jornada NUMBER,
                             p_gl NUMBER, p_gv NUMBER, p_estado VARCHAR2, p_form_loc VARCHAR2, p_form_vis VARCHAR2,
                             p_out OUT NUMBER) IS
    BEGIN
        BEGIN
            SELECT id_partido INTO p_out FROM PARTIDO 
             WHERE id_torneo = p_torneo AND id_local = p_local AND id_visitante = p_visit AND NVL(jornada,-1) = NVL(p_jornada,-1)
             AND ROWNUM = 1;
        EXCEPTION WHEN NO_DATA_FOUND THEN
            INSERT INTO PARTIDO (id_torneo, id_local, id_visitante, fecha, jornada, goles_local, goles_visitante, estado, formacion_local, formacion_visitante)
            VALUES (p_torneo, p_local, p_visit, p_fecha, p_jornada, p_gl, p_gv, p_estado, p_form_loc, p_form_vis)
            RETURNING id_partido INTO p_out;
        END;
    END;

BEGIN
    -- Torneos
    ensure_torneo('Liga Apertura',  DATE '2025-02-01', DATE '2025-05-31', v_torneo_apertura);
    ensure_torneo('Liga Clausura',  DATE '2025-08-01', DATE '2025-11-30', v_torneo_clausura);

    -- Equipos torneo Apertura
    ensure_equipo(v_torneo_apertura, 'Tigres FC',      'Ciudad Norte', 'Juan Perez',   v_eq_tigres);
    ensure_equipo(v_torneo_apertura, 'Leones United',  'Ciudad Sur',   'Carlos Diaz',  v_eq_leones);
    ensure_equipo(v_torneo_apertura, 'Aguilas',        'Ciudad Este',  'Luis Gomez',   v_eq_aguilas);
    ensure_equipo(v_torneo_apertura, 'Piratas',        'Ciudad Oeste', 'Mario Ruiz',   v_eq_piratas);

    -- Equipos torneo Clausura
    ensure_equipo(v_torneo_clausura, 'Atleticos', 'Metro', 'Ricardo Silva', v_eq_atleticos);
    ensure_equipo(v_torneo_clausura, 'Bufalos',   'Valle', 'Sergio Rojas',  v_eq_bufalos);

    -- Jugadores torneo Apertura
    ensure_jugador(v_eq_tigres,   'Andres', 'Lopez', 'DEL', 9, v_j_tigres_del);
    ensure_jugador(v_eq_tigres,   'Miguel', 'Santos', 'VOL', 8, v_j_tigres_vol);
    ensure_jugador(v_eq_leones,   'Carlos', 'Mora',  'DEL', 10, v_j_leones_del);
    ensure_jugador(v_eq_leones,   'Pedro',  'Vega',  'DEF', 4, v_j_leones_def);
    ensure_jugador(v_eq_aguilas,  'Javier', 'Suarez','DEL', 11, v_j_aguilas_del);
    ensure_jugador(v_eq_aguilas,  'Oscar',  'Cruz',  'VOL', 6, v_j_aguilas_vol);
    ensure_jugador(v_eq_piratas,  'Rafael', 'Ponce', 'DEL', 7, v_j_piratas_del);
    ensure_jugador(v_eq_piratas,  'Ivan',   'Nieto', 'DEF', 5, v_j_piratas_def);

    -- Partidos torneo Apertura (marcados como jugados)
    ensure_partido(v_torneo_apertura, v_eq_tigres,  v_eq_leones,  DATE '2025-02-10', 1, 2, 1, 'JUGADO', '4-3-3',   '4-4-2',  v_part1);
    ensure_partido(v_torneo_apertura, v_eq_aguilas, v_eq_piratas, DATE '2025-02-11', 1, 1, 1, 'JUGADO', '4-2-3-1', '3-5-2',  v_part2);
    ensure_partido(v_torneo_apertura, v_eq_tigres,  v_eq_aguilas, DATE '2025-02-18', 2, 0, 0, 'JUGADO', '4-4-2',   '4-3-3',  v_part3);

    -- Goles
    INSERT INTO GOL (id_partido, id_jugador, minuto, tipo) VALUES (v_part1, v_j_tigres_del, 15, 'NORMAL');
    INSERT INTO GOL (id_partido, id_jugador, minuto, tipo) VALUES (v_part1, v_j_leones_del, 40, 'NORMAL');
    INSERT INTO GOL (id_partido, id_jugador, minuto, tipo) VALUES (v_part1, v_j_tigres_vol, 75, 'PENAL');
    INSERT INTO GOL (id_partido, id_jugador, minuto, tipo) VALUES (v_part2, v_j_aguilas_del, 22, 'NORMAL');
    INSERT INTO GOL (id_partido, id_jugador, minuto, tipo) VALUES (v_part2, v_j_piratas_del, 68, 'AUTOGOL');

    -- Tarjetas
    INSERT INTO TARJETA (id_partido, id_jugador, tipo, minuto) VALUES (v_part1, v_j_leones_def, 'AMARILLA', 55);
    INSERT INTO TARJETA (id_partido, id_jugador, tipo, minuto) VALUES (v_part1, v_j_tigres_vol, 'AMARILLA', 78);
    INSERT INTO TARJETA (id_partido, id_jugador, tipo, minuto) VALUES (v_part2, v_j_aguilas_vol, 'ROJA',    80);

    -- Sancion por la roja previa
    INSERT INTO SANCION_JUGADOR (id_jugador, id_torneo, motivo, partidos_suspendidos, partidos_cumplidos, vigente)
    VALUES (v_j_aguilas_vol, v_torneo_apertura, 'Roja directa', 1, 0, 'S');

    -- Inicializar posiciones que falten y recalcular tabla del torneo Apertura
    PKG_TORNEO.inicializar_posiciones(v_torneo_apertura);
    PKG_TORNEO.recalcular_tabla(v_torneo_apertura);
    COMMIT;
END;
/
