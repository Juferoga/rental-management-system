CREATE OR REPLACE PROCEDURE sp_generar_cobros_mes(p_anio SMALLINT, p_mes SMALLINT)
LANGUAGE plpgsql AS
$$
BEGIN
    INSERT INTO pago_renta (contrato_id, anio, mes, monto_esperado, monto_pagado, estado)
    SELECT 
        id, 
        p_anio, 
        p_mes, 
        valor_pactado, 
        0, 
        'pendiente'
    FROM contrato
    WHERE estado = 'activo'
    -- ON CONFLICT evita errores si se ejecuta el proceso dos veces
    ON CONFLICT (contrato_id, anio, mes) DO NOTHING; 
END;
$$;