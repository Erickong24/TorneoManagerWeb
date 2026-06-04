-- 02_views.sql
-- Vistas para TorneoManager

-- 1. Vista de Tabla de Posiciones Ordenada
CREATE OR REPLACE VIEW V_TABLA_POSICIONES AS
SELECT 
    p.id_torneo,
    t.nombre AS nombre_torneo,
    p.id_equipo,
    e.nombre AS nombre_equipo,
    p.pj,
    p.pg,
    p.pe,
    p.pp,
    p.gf,
    p.gc,
    p.dg,
    p.puntos
FROM POSICION p
JOIN EQUIPO e ON p.id_equipo = e.id_equipo
JOIN TORNEO t ON p.id_torneo = t.id_torneo
ORDER BY p.puntos DESC, p.dg DESC, p.gf DESC;



CREATE TABLE PARTIDO_JUGADOR (
    id_partido NUMBER NOT NULL,
    id_jugador NUMBER NOT NULL,
    titular CHAR(1) DEFAULT 'S',
    minutos_jugados NUMBER,
    goles NUMBER DEFAULT 0,
    CONSTRAINT pk_partido_jugador PRIMARY KEY (id_partido, id_jugador),
    CONSTRAINT fk_pj_partido FOREIGN KEY (id_partido) REFERENCES PARTIDO(id_partido),
    CONSTRAINT fk_pj_jugador FOREIGN KEY (id_jugador) REFERENCES JUGADOR(id_jugador)
);

CREATE OR REPLACE VIEW V_GOLEADORES AS
SELECT 
    t.id_torneo,
    j.id_jugador,
    j.nombre || ' ' || j.apellido AS nombre_completo,
    e.nombre AS equipo,
    COUNT(*) AS total_goles
FROM GOL g
JOIN PARTIDO p ON g.id_partido = p.id_partido
JOIN JUGADOR j ON g.id_jugador = j.id_jugador
JOIN EQUIPO e ON j.id_equipo = e.id_equipo
JOIN TORNEO t ON p.id_torneo = t.id_torneo
WHERE p.estado = 'JUGADO'
GROUP BY t.id_torneo, j.id_jugador, j.nombre, j.apellido, e.nombre
HAVING COUNT(*) > 0
ORDER BY total_goles DESC;

-- 3. Vista de Jugadores Sancionados
CREATE OR REPLACE VIEW V_JUGADORES_SANCIONADOS AS
SELECT 
    s.id_sancion,
    s.id_torneo,
    j.nombre || ' ' || j.apellido AS nombre_jugador,
    e.nombre AS equipo,
    s.motivo,
    s.partidos_suspendidos,
    s.partidos_cumplidos,
    (s.partidos_suspendidos - s.partidos_cumplidos) AS partidos_restantes
FROM SANCION_JUGADOR s
JOIN JUGADOR j ON s.id_jugador = j.id_jugador
JOIN EQUIPO e ON j.id_equipo = e.id_equipo
WHERE s.vigente = 'S';

-- 4. Vista Fair Play (Menos tarjetas es mejor)
CREATE OR REPLACE VIEW V_FAIR_PLAY AS
SELECT 
    t.id_torneo,
    e.nombre AS equipo,
    COUNT(CASE WHEN tr.tipo = 'AMARILLA' THEN 1 END) AS amarillas,
    COUNT(CASE WHEN tr.tipo = 'ROJA' THEN 1 END) AS rojas,
    (COUNT(CASE WHEN tr.tipo = 'AMARILLA' THEN 1 END) + 
     COUNT(CASE WHEN tr.tipo = 'ROJA' THEN 1 END) * 3) AS puntos_disciplina
FROM TARJETA tr
JOIN PARTIDO p ON tr.id_partido = p.id_partido
JOIN TORNEO t ON p.id_torneo = t.id_torneo
JOIN JUGADOR j ON tr.id_jugador = j.id_jugador
JOIN EQUIPO e ON j.id_equipo = e.id_equipo
GROUP BY t.id_torneo, e.nombre
ORDER BY puntos_disciplina ASC;
