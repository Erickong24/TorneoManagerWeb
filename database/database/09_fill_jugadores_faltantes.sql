-- 09_fill_jugadores_faltantes.sql
-- Completa cada equipo con jugadores ficticios hasta tener 15 por equipo (11 titulares + 4 suplentes)
-- Ejecutar despues de los seeds para rellenar planteles de ejemplo.

SET DEFINE OFF;

DECLARE
    TYPE t_pos_list IS TABLE OF VARCHAR2(10);
    -- Distribucion sencilla de posiciones para 15 cupos
    v_posiciones t_pos_list := t_pos_list(
        'ARQ',
        'DEF','DEF','DEF','DEF',
        'VOL','VOL','VOL','VOL',
        'DEL','DEL','DEL','DEL','DEL','DEL'
    );

    CURSOR c_equipo IS
        SELECT id_equipo, nombre FROM EQUIPO ORDER BY id_equipo;

    v_cant        NUMBER;
    v_max_dorsal  NUMBER;
BEGIN
    FOR e IN c_equipo LOOP
        SELECT COUNT(*), NVL(MAX(dorsal), 0)
        INTO v_cant, v_max_dorsal
        FROM JUGADOR
        WHERE id_equipo = e.id_equipo;

        IF v_cant < v_posiciones.COUNT THEN
            FOR idx IN v_cant + 1 .. v_posiciones.COUNT LOOP
                INSERT INTO JUGADOR (id_equipo, nombre, apellido, posicion, dorsal, estado, activo)
                VALUES (
                    e.id_equipo,
                    'Jugador ' || e.nombre,
                    LPAD(idx, 2, '0'),
                    v_posiciones(idx),
                    v_max_dorsal + (idx - v_cant),
                    'ACTIVO',
                    'S'
                );
            END LOOP;
        END IF;
    END LOOP;

    COMMIT;
END;
/
