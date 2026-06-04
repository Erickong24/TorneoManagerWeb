-- 03_packages.sql
-- Paquetes de Lógica de Negocio

-- ============================================================================
-- PKG_TORNEO
-- ============================================================================
CREATE OR REPLACE PACKAGE PKG_TORNEO AS
    PROCEDURE registrar_resultado(
        p_id_partido IN NUMBER, 
        p_goles_local IN NUMBER, 
        p_goles_visitante IN NUMBER, 
        p_usuario IN VARCHAR2
    );
    PROCEDURE recalcular_tabla(p_id_torneo IN NUMBER);
    PROCEDURE inicializar_posiciones(p_id_torneo IN NUMBER);
END PKG_TORNEO;
/

CREATE OR REPLACE PACKAGE BODY PKG_TORNEO AS

    PROCEDURE inicializar_posiciones(p_id_torneo IN NUMBER) IS
    BEGIN
        -- Insertar registros en POSICION para equipos que no esten
        INSERT INTO POSICION (id_torneo, id_equipo, pj, pg, pe, pp, gf, gc, dg, puntos)
        SELECT p_id_torneo, id_equipo, 0, 0, 0, 0, 0, 0, 0, 0
        FROM EQUIPO
        WHERE id_torneo = p_id_torneo
        AND id_equipo NOT IN (SELECT id_equipo FROM POSICION WHERE id_torneo = p_id_torneo);
    END;

    PROCEDURE recalcular_tabla(p_id_torneo IN NUMBER) IS
        CURSOR c_partidos IS
            SELECT id_local, id_visitante, goles_local, goles_visitante
            FROM PARTIDO
            WHERE id_torneo = p_id_torneo AND estado = 'JUGADO';
            
        v_pts_vic NUMBER;
        v_pts_emp NUMBER;
        v_pts_der NUMBER;
    BEGIN
        -- Obtener reglas del torneo
        SELECT puntos_victoria, puntos_empate, puntos_derrota
        INTO v_pts_vic, v_pts_emp, v_pts_der
        FROM TORNEO WHERE id_torneo = p_id_torneo;

        -- Reiniciar tabla
        UPDATE POSICION SET pj=0, pg=0, pe=0, pp=0, gf=0, gc=0, dg=0, puntos=0
        WHERE id_torneo = p_id_torneo;

        -- Recalcular
        FOR r IN c_partidos LOOP
            -- Local
            UPDATE POSICION SET
                pj = pj + 1,
                gf = gf + r.goles_local,
                gc = gc + r.goles_visitante,
                dg = dg + (r.goles_local - r.goles_visitante),
                pg = pg + CASE WHEN r.goles_local > r.goles_visitante THEN 1 ELSE 0 END,
                pe = pe + CASE WHEN r.goles_local = r.goles_visitante THEN 1 ELSE 0 END,
                pp = pp + CASE WHEN r.goles_local < r.goles_visitante THEN 1 ELSE 0 END,
                puntos = puntos + CASE 
                            WHEN r.goles_local > r.goles_visitante THEN v_pts_vic
                            WHEN r.goles_local = r.goles_visitante THEN v_pts_emp
                            ELSE v_pts_der END
            WHERE id_torneo = p_id_torneo AND id_equipo = r.id_local;

            -- Visitante
            UPDATE POSICION SET
                pj = pj + 1,
                gf = gf + r.goles_visitante,
                gc = gc + r.goles_local,
                dg = dg + (r.goles_visitante - r.goles_local),
                pg = pg + CASE WHEN r.goles_visitante > r.goles_local THEN 1 ELSE 0 END,
                pe = pe + CASE WHEN r.goles_visitante = r.goles_local THEN 1 ELSE 0 END,
                pp = pp + CASE WHEN r.goles_visitante < r.goles_local THEN 1 ELSE 0 END,
                puntos = puntos + CASE 
                            WHEN r.goles_visitante > r.goles_local THEN v_pts_vic
                            WHEN r.goles_visitante = r.goles_local THEN v_pts_emp
                            ELSE v_pts_der END
            WHERE id_torneo = p_id_torneo AND id_equipo = r.id_visitante;
        END LOOP;
    END;

    PROCEDURE registrar_resultado(
        p_id_partido IN NUMBER, 
        p_goles_local IN NUMBER, 
        p_goles_visitante IN NUMBER, 
        p_usuario IN VARCHAR2
    ) IS
        v_id_torneo NUMBER;
        v_estado_ant VARCHAR2(20);
        v_goles_local_ant NUMBER;
        v_goles_visitante_ant NUMBER;
    BEGIN
        SELECT id_torneo, estado, goles_local, goles_visitante 
        INTO v_id_torneo, v_estado_ant, v_goles_local_ant, v_goles_visitante_ant
        FROM PARTIDO WHERE id_partido = p_id_partido;

        -- Actualizar partido
        UPDATE PARTIDO 
        SET goles_local = p_goles_local,
            goles_visitante = p_goles_visitante,
            estado = 'JUGADO'
        WHERE id_partido = p_id_partido;

        -- Auditoria (Simplificada, idealmente en trigger pero aqui tambien vale)
        INSERT INTO AUDITORIA_PARTIDO (id_partido, usuario, detalle_antes, detalle_despues)
        VALUES (p_id_partido, p_usuario, 
                'Estado: ' || v_estado_ant || ', Goles: ' || v_goles_local_ant || '-' || v_goles_visitante_ant,
                'Estado: JUGADO, Goles: ' || p_goles_local || '-' || p_goles_visitante);

        -- Recalcular tabla
        recalcular_tabla(v_id_torneo);
    END;

END PKG_TORNEO;
/

-- ============================================================================
-- PKG_TARJETAS
-- ============================================================================
CREATE OR REPLACE PACKAGE PKG_TARJETAS AS
    PROCEDURE registrar_tarjeta(p_id_partido IN NUMBER, p_id_jugador IN NUMBER, p_tipo IN VARCHAR2, p_minuto IN NUMBER);
    PROCEDURE evaluar_sancion(p_id_jugador IN NUMBER, p_id_torneo IN NUMBER);
END PKG_TARJETAS;
/

CREATE OR REPLACE PACKAGE BODY PKG_TARJETAS AS

    PROCEDURE evaluar_sancion(p_id_jugador IN NUMBER, p_id_torneo IN NUMBER) IS
        v_amarillas NUMBER;
        v_limite_amarillas NUMBER;
        v_tiene_roja NUMBER;
    BEGIN
        -- Obtener limite del torneo
        SELECT amarillas_para_suspension INTO v_limite_amarillas 
        FROM TORNEO WHERE id_torneo = p_id_torneo;

        -- Contar amarillas en partidos del torneo actual (sin sancion previa vigente quizas? 
        -- Simplificacion: contamos todas las del torneo que no esten "procesadas" o simplemente acumuladas.
        -- Para hacerlo bien, deberiamos marcar tarjetas como "contabilizadas" para sancion.
        -- Asumiremos que se cuentan todas y modulo limite = 0 genera sancion nueva? 
        -- Mejor: Contar amarillas totales y ver si es multiplo del limite.
        
        SELECT COUNT(*) INTO v_amarillas
        FROM TARJETA t
        JOIN PARTIDO p ON t.id_partido = p.id_partido
        WHERE t.id_jugador = p_id_jugador 
          AND p.id_torneo = p_id_torneo 
          AND t.tipo = 'AMARILLA';

        -- Si alcanza el limite (exacto, para no sancionar doble)
        IF v_amarillas > 0 AND MOD(v_amarillas, v_limite_amarillas) = 0 THEN
             INSERT INTO SANCION_JUGADOR (id_jugador, id_torneo, motivo, partidos_suspendidos, vigente)
             VALUES (p_id_jugador, p_id_torneo, 'Acumulacion de Amarillas (' || v_amarillas || ')', 1, 'S');
             
             UPDATE JUGADOR SET estado = 'SUSPENDIDO' WHERE id_jugador = p_id_jugador;
        END IF;

    END;

    PROCEDURE registrar_tarjeta(p_id_partido IN NUMBER, p_id_jugador IN NUMBER, p_tipo IN VARCHAR2, p_minuto IN NUMBER) IS
        v_id_torneo NUMBER;
    BEGIN
        INSERT INTO TARJETA (id_partido, id_jugador, tipo, minuto)
        VALUES (p_id_partido, p_id_jugador, p_tipo, p_minuto);

        SELECT id_torneo INTO v_id_torneo FROM PARTIDO WHERE id_partido = p_id_partido;

        IF p_tipo = 'ROJA' THEN
             INSERT INTO SANCION_JUGADOR (id_jugador, id_torneo, motivo, partidos_suspendidos, vigente)
             VALUES (p_id_jugador, v_id_torneo, 'Tarjeta Roja Directa', 1, 'S');
             
             UPDATE JUGADOR SET estado = 'SUSPENDIDO' WHERE id_jugador = p_id_jugador;
        ELSE
             evaluar_sancion(p_id_jugador, v_id_torneo);
        END IF;
    END;

END PKG_TARJETAS;
/
