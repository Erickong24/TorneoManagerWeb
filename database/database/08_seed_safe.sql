-- 08_seed_safe.sql
-- Inserta datos de ejemplo de forma idempotente, sin tocar registros existentes.
-- Ejecutar después de los scripts 01..07.

SET DEFINE OFF;

DECLARE
    v_torneo_demo    NUMBER;
    v_eq_alpha       NUMBER;
    v_eq_beta        NUMBER;
    v_j_alpha_9      NUMBER;
    v_j_beta_10      NUMBER;
    v_sede_central   NUMBER;
    v_arbitro_pri    NUMBER;
    v_partido_1      NUMBER;
    v_pos_count      NUMBER;
    v_estado_partido VARCHAR2(20);

    FUNCTION get_id_torneo(p_nombre VARCHAR2) RETURN NUMBER IS
        v NUMBER;
    BEGIN
        SELECT id_torneo INTO v FROM TORNEO WHERE nombre = p_nombre AND ROWNUM = 1;
        RETURN v;
    EXCEPTION WHEN NO_DATA_FOUND THEN RETURN NULL; END;

    FUNCTION get_id_equipo(p_torneo NUMBER, p_nombre VARCHAR2) RETURN NUMBER IS
        v NUMBER;
    BEGIN
        SELECT id_equipo INTO v FROM EQUIPO WHERE id_torneo = p_torneo AND nombre = p_nombre AND ROWNUM = 1;
        RETURN v;
    EXCEPTION WHEN NO_DATA_FOUND THEN RETURN NULL; END;

    FUNCTION get_id_jugador(p_equipo NUMBER, p_nombre VARCHAR2, p_apellido VARCHAR2) RETURN NUMBER IS
        v NUMBER;
    BEGIN
        SELECT id_jugador INTO v FROM JUGADOR WHERE id_equipo = p_equipo AND nombre = p_nombre AND apellido = p_apellido AND ROWNUM = 1;
        RETURN v;
    EXCEPTION WHEN NO_DATA_FOUND THEN RETURN NULL; END;

    FUNCTION get_id_sede(p_nombre VARCHAR2) RETURN NUMBER IS
        v NUMBER;
    BEGIN
        SELECT id_sede INTO v FROM SEDE WHERE nombre = p_nombre AND ROWNUM = 1;
        RETURN v;
    EXCEPTION WHEN NO_DATA_FOUND THEN RETURN NULL; END;

    FUNCTION get_id_arbitro(p_nombre VARCHAR2) RETURN NUMBER IS
        v NUMBER;
    BEGIN
        SELECT id_arbitro INTO v FROM ARBITRO WHERE nombre = p_nombre AND ROWNUM = 1;
        RETURN v;
    EXCEPTION WHEN NO_DATA_FOUND THEN RETURN NULL; END;

    FUNCTION get_id_partido(p_torneo NUMBER, p_local NUMBER, p_visit NUMBER, p_jornada NUMBER) RETURN NUMBER IS
        v NUMBER;
    BEGIN
        SELECT id_partido INTO v FROM PARTIDO
        WHERE id_torneo = p_torneo AND id_local = p_local AND id_visitante = p_visit AND NVL(jornada,-1)=NVL(p_jornada,-1)
        AND ROWNUM = 1;
        RETURN v;
    EXCEPTION WHEN NO_DATA_FOUND THEN RETURN NULL; END;

BEGIN
    -- Torneo
    v_torneo_demo := get_id_torneo('Torneo Demo Safe');
    IF v_torneo_demo IS NULL THEN
        INSERT INTO TORNEO (nombre, fecha_inicio, fecha_fin, puntos_victoria, puntos_empate, puntos_derrota, amarillas_para_suspension, rojas_para_suspension, categoria, division, estado)
        VALUES ('Torneo Demo Safe', DATE '2025-03-01', DATE '2025-06-30', 3, 1, 0, 3, 1, 'LIBRE', 'A', 'ACTIVO')
        RETURNING id_torneo INTO v_torneo_demo;
    END IF;

    -- Sede
    v_sede_central := get_id_sede('Estadio Central Demo');
    IF v_sede_central IS NULL THEN
        INSERT INTO SEDE (nombre, direccion, ciudad, activo) VALUES ('Estadio Central Demo', 'Av. Principal 123', 'Ciudad Demo', 'S')
        RETURNING id_sede INTO v_sede_central;
    END IF;

    -- Arbitro
    v_arbitro_pri := get_id_arbitro('Arbitro Demo');
    IF v_arbitro_pri IS NULL THEN
        INSERT INTO ARBITRO (nombre, tipo, activo) VALUES ('Arbitro Demo', 'PRINCIPAL', 'S')
        RETURNING id_arbitro INTO v_arbitro_pri;
    END IF;

    -- Equipos
    v_eq_alpha := get_id_equipo(v_torneo_demo, 'Alpha FC');
    IF v_eq_alpha IS NULL THEN
        INSERT INTO EQUIPO (id_torneo, nombre, ciudad, tecnico, activo) VALUES (v_torneo_demo, 'Alpha FC', 'Norte', 'DT Alpha', 'S')
        RETURNING id_equipo INTO v_eq_alpha;
    END IF;

    v_eq_beta := get_id_equipo(v_torneo_demo, 'Beta United');
    IF v_eq_beta IS NULL THEN
        INSERT INTO EQUIPO (id_torneo, nombre, ciudad, tecnico, activo) VALUES (v_torneo_demo, 'Beta United', 'Sur', 'DT Beta', 'S')
        RETURNING id_equipo INTO v_eq_beta;
    END IF;

    -- Jugadores
    v_j_alpha_9 := get_id_jugador(v_eq_alpha, 'Leo', 'Alvarez');
    IF v_j_alpha_9 IS NULL THEN
        INSERT INTO JUGADOR (id_equipo, nombre, apellido, posicion, dorsal, estado, activo)
        VALUES (v_eq_alpha, 'Leo', 'Alvarez', 'DEL', 9, 'ACTIVO', 'S')
        RETURNING id_jugador INTO v_j_alpha_9;
    END IF;

    v_j_beta_10 := get_id_jugador(v_eq_beta, 'Marco', 'Vega');
    IF v_j_beta_10 IS NULL THEN
        INSERT INTO JUGADOR (id_equipo, nombre, apellido, posicion, dorsal, estado, activo)
        VALUES (v_eq_beta, 'Marco', 'Vega', 'DEL', 10, 'ACTIVO', 'S')
        RETURNING id_jugador INTO v_j_beta_10;
    END IF;

    -- Partido (programado)
    v_partido_1 := get_id_partido(v_torneo_demo, v_eq_alpha, v_eq_beta, 1);
    IF v_partido_1 IS NULL THEN
        INSERT INTO PARTIDO (id_torneo, id_local, id_visitante, id_sede, fecha, jornada, estado, formacion_local, formacion_visitante)
        VALUES (v_torneo_demo, v_eq_alpha, v_eq_beta, v_sede_central, DATE '2025-03-10', 1, 'PROGRAMADO', '4-3-3', '4-4-2')
        RETURNING id_partido INTO v_partido_1;
    END IF;

    -- Designacion de arbitro
    MERGE INTO PARTIDO_ARBITRAJE pa
    USING (SELECT v_partido_1 id_partido, v_arbitro_pri id_arbitro FROM dual) s
    ON (pa.id_partido = s.id_partido AND pa.id_arbitro = s.id_arbitro AND pa.rol = 'PRINCIPAL')
    WHEN NOT MATCHED THEN
      INSERT (id_partido, id_arbitro, rol, calificacion, comentarios) VALUES (s.id_partido, s.id_arbitro, 'PRINCIPAL', NULL, NULL);

    -- Goles (si ya jugado)
    SELECT estado INTO v_estado_partido FROM PARTIDO WHERE id_partido = v_partido_1;
    IF v_estado_partido <> 'JUGADO' THEN
        UPDATE PARTIDO SET estado='JUGADO', goles_local=2, goles_visitante=1 WHERE id_partido = v_partido_1;

        INSERT INTO GOL (id_partido, id_jugador, minuto, tipo)
        SELECT v_partido_1, v_j_alpha_9, 15, 'NORMAL' FROM dual
        WHERE NOT EXISTS (SELECT 1 FROM GOL WHERE id_partido=v_partido_1 AND id_jugador=v_j_alpha_9 AND minuto=15);

        INSERT INTO GOL (id_partido, id_jugador, minuto, tipo)
        SELECT v_partido_1, v_j_beta_10, 40, 'NORMAL' FROM dual
        WHERE NOT EXISTS (SELECT 1 FROM GOL WHERE id_partido=v_partido_1 AND id_jugador=v_j_beta_10 AND minuto=40);
    END IF;

    -- Tarjeta de ejemplo
    INSERT INTO TARJETA (id_partido, id_jugador, tipo, minuto)
    SELECT v_partido_1, v_j_beta_10, 'AMARILLA', 70 FROM dual
    WHERE NOT EXISTS (SELECT 1 FROM TARJETA WHERE id_partido=v_partido_1 AND id_jugador=v_j_beta_10 AND minuto=70);

    -- Reprogramacion (historica) si procede
    INSERT INTO PARTIDO_REPROGRAMACION (id_partido, fecha_anterior, fecha_nueva, motivo, notificado)
    SELECT v_partido_1, DATE '2025-03-05', DATE '2025-03-10', 'Ajuste de calendario', 'S' FROM dual
    WHERE NOT EXISTS (SELECT 1 FROM PARTIDO_REPROGRAMACION WHERE id_partido=v_partido_1 AND fecha_nueva=DATE '2025-03-10');

    -- Evento de jugador (estadistica avanzada)
    INSERT INTO PARTIDO_EVENTO_JUGADOR (id_partido, id_jugador, minutos_jugados, asistencias, xg_estimado, posicion_en_campo, mvp_jornada)
    SELECT v_partido_1, v_j_alpha_9, 90, 1, 0.80, 'DEL', 'N' FROM dual
    WHERE NOT EXISTS (SELECT 1 FROM PARTIDO_EVENTO_JUGADOR WHERE id_partido=v_partido_1 AND id_jugador=v_j_alpha_9);

    -- Racha equipo
    INSERT INTO RACHA_EQUIPO (id_equipo, partidos_invicto, partidos_ganados, goles_favor, goles_contra, desde_fecha)
    SELECT v_eq_alpha, 3, 3, 7, 2, SYSDATE-10 FROM dual
    WHERE NOT EXISTS (SELECT 1 FROM RACHA_EQUIPO WHERE id_equipo=v_eq_alpha);

    -- Sancion y apelacion (disciplinario)
    INSERT INTO SANCION_JUGADOR (id_jugador, id_torneo, motivo, partidos_suspendidos, partidos_cumplidos, vigente, fecha_inicio, fecha_fin)
    SELECT v_j_beta_10, v_torneo_demo, 'Conducta antideportiva', 1, 0, 'S', SYSDATE, SYSDATE+7 FROM dual
    WHERE NOT EXISTS (SELECT 1 FROM SANCION_JUGADOR WHERE id_jugador=v_j_beta_10 AND id_torneo=v_torneo_demo);

    INSERT INTO APELACION (id_sancion, estado, motivo, fecha_presentacion)
    SELECT s.id_sancion, 'PENDIENTE', 'Solicita reduccion', SYSDATE
    FROM SANCION_JUGADOR s
    WHERE s.id_jugador = v_j_beta_10 AND s.id_torneo = v_torneo_demo
      AND NOT EXISTS (SELECT 1 FROM APELACION a WHERE a.id_sancion = s.id_sancion);

    -- Posiciones: asegurar filas
    SELECT COUNT(*) INTO v_pos_count FROM POSICION WHERE id_torneo = v_torneo_demo AND id_equipo IN (v_eq_alpha, v_eq_beta);
    IF v_pos_count < 2 THEN
        INSERT INTO POSICION (id_torneo, id_equipo, pj, pg, pe, pp, gf, gc, dg, puntos)
        SELECT v_torneo_demo, v_eq_alpha, 0,0,0,0,0,0,0,0 FROM dual
        WHERE NOT EXISTS (SELECT 1 FROM POSICION WHERE id_torneo=v_torneo_demo AND id_equipo=v_eq_alpha);

        INSERT INTO POSICION (id_torneo, id_equipo, pj, pg, pe, pp, gf, gc, dg, puntos)
        SELECT v_torneo_demo, v_eq_beta, 0,0,0,0,0,0,0,0 FROM dual
        WHERE NOT EXISTS (SELECT 1 FROM POSICION WHERE id_torneo=v_torneo_demo AND id_equipo=v_eq_beta);
    END IF;

    -- Ascenso/descenso ejemplo (auto referenciado al mismo torneo para no romper llaves)
    INSERT INTO ASCENSO_DESCENSO (id_torneo_origen, id_torneo_destino, id_equipo, movimiento)
    SELECT v_torneo_demo, v_torneo_demo, v_eq_alpha, 'ASCENSO' FROM dual
    WHERE NOT EXISTS (SELECT 1 FROM ASCENSO_DESCENSO WHERE id_equipo=v_eq_alpha AND id_torneo_origen=v_torneo_demo AND id_torneo_destino=v_torneo_demo);

    COMMIT;
END;
/
