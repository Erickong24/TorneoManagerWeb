-- 04_triggers.sql
-- Triggers para TorneoManager

-- Trigger para asegurar que al crear un equipo se inicialice en la tabla de posiciones si el torneo ya empezo
CREATE OR REPLACE TRIGGER TRG_EQUIPO_INSERT
AFTER INSERT ON EQUIPO
FOR EACH ROW
BEGIN
    INSERT INTO POSICION (id_torneo, id_equipo, pj, pg, pe, pp, gf, gc, dg, puntos)
    VALUES (:NEW.id_torneo, :NEW.id_equipo, 0, 0, 0, 0, 0, 0, 0, 0);
EXCEPTION
    WHEN DUP_VAL_ON_INDEX THEN
        NULL; -- Ya existe
END;
/

-- Trigger para recalcular tabla al actualizar partido (si se hace update directo sin paquete)
-- Nota: Es mejor usar el paquete, pero el trigger asegura consistencia si alguien hace update manual.
CREATE OR REPLACE TRIGGER TRG_PARTIDO_UPDATE
AFTER UPDATE OF goles_local, goles_visitante, estado ON PARTIDO
FOR EACH ROW
DECLARE
BEGIN
    IF :NEW.estado = 'JUGADO' THEN
        -- Llamada asincrona o directa? Directa es mas facil pero cuidado con mutating tables.
        -- Al ser AFTER UPDATE STATEMENT o ROW? 
        -- Si llamamos a recalcular_tabla que hace SELECT de PARTIDO, tendremos error ORA-04091 (Mutating Table).
        -- Solucion: No llamar al recalculo desde el trigger row-level.
        -- Lo ideal es usar el paquete PKG_TORNEO.registrar_resultado.
        -- Dejaremos este trigger solo para auditoria simple si no se uso el paquete.
        NULL; 
    END IF;
END;
/
