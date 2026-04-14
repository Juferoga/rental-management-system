package com.rental.aggregates;

import io.quarkus.hibernate.orm.panache.Panache;
import jakarta.enterprise.context.ApplicationScoped;

import java.math.BigDecimal;
import java.util.List;

@ApplicationScoped
public class DashboardQueryService {

    public List<Object[]> loadDebtRows() {
        return Panache.getEntityManager().createNativeQuery("""
                SELECT p.id,
                       'DEBT' AS reference_type,
                       COALESCE(NULLIF(p.motivo, ''), CONCAT('Préstamo #', p.id)) AS descripcion,
                       COALESCE(p.saldo_pendiente, 0) AS saldo_pendiente,
                       p.fecha
                FROM prestamo p
                WHERE p.estado IS NOT NULL
                  AND LOWER(CAST(p.estado AS TEXT)) IN ('pendiente', 'vencido', 'vencida', 'parcial')
                  AND COALESCE(p.saldo_pendiente, 0) > 0
                ORDER BY p.fecha NULLS LAST, p.id DESC
                LIMIT 20
                """).getResultList();
    }

    public List<Object[]> loadRentRows() {
        return Panache.getEntityManager().createNativeQuery("""
                SELECT z.id AS zone_id,
                       CONCAT(i.nombre, ' ', i.apellido) AS tenant_name,
                       pr.monto_esperado,
                       make_date(pr.anio::int, pr.mes::int, 1) + INTERVAL '1 month' - INTERVAL '1 day' AS cutoff_date
                FROM pago_renta pr
                JOIN contrato c ON c.id = pr.contrato_id
                JOIN inquilino i ON i.id = c.inquilino_id
                JOIN zona_habitacional z ON z.id = c.zona_habitacional_id
                WHERE pr.estado IN ('pendiente', 'parcial', 'vencido')
                ORDER BY pr.anio DESC, pr.mes DESC, z.id
                LIMIT 20
                """).getResultList();
    }

    public Object[] loadCurrentMonthEarnings() {
        List<Object[]> rows = Panache.getEntityManager().createNativeQuery("""
                SELECT
                    COALESCE(SUM(pr.monto_pagado), 0) AS collected,
                    COALESCE(SUM(GREATEST(pr.monto_esperado - pr.monto_pagado, 0)), 0) AS pending
                FROM pago_renta pr
                WHERE pr.anio = EXTRACT(YEAR FROM CURRENT_DATE)
                  AND pr.mes = EXTRACT(MONTH FROM CURRENT_DATE)
                """).getResultList();
        return rows.isEmpty() ? new Object[]{BigDecimal.ZERO, BigDecimal.ZERO} : rows.get(0);
    }

    public Object[] loadCurrentMonthDebts() {
        List<Object[]> rows = Panache.getEntityManager().createNativeQuery("""
                WITH service_totals AS (
                    SELECT
                        COALESCE(SUM(CASE WHEN fs.estado = 'pagada' THEN fs.valor_total ELSE 0 END), 0) AS paid,
                        COALESCE(SUM(CASE WHEN fs.estado IN ('pendiente', 'vencida') THEN fs.valor_total ELSE 0 END), 0) AS unpaid
                    FROM factura_servicio fs
                    WHERE fs.anio = EXTRACT(YEAR FROM CURRENT_DATE)
                      AND fs.mes = EXTRACT(MONTH FROM CURRENT_DATE)
                ),
                owner_debt_totals AS (
                    SELECT
                        COALESCE(SUM(CASE WHEN od.estado = 'pagada' THEN od.monto_total ELSE 0 END), 0) AS paid,
                        COALESCE(SUM(CASE WHEN od.estado IN ('pendiente', 'vencida') THEN od.saldo_pendiente ELSE 0 END), 0) AS unpaid
                    FROM owner_debt od
                    WHERE EXTRACT(YEAR FROM COALESCE(od.fecha_vencimiento, CURRENT_DATE)) = EXTRACT(YEAR FROM CURRENT_DATE)
                      AND EXTRACT(MONTH FROM COALESCE(od.fecha_vencimiento, CURRENT_DATE)) = EXTRACT(MONTH FROM CURRENT_DATE)
                )
                SELECT
                    (st.paid + odt.paid) AS paid,
                    (st.unpaid + odt.unpaid) AS unpaid
                FROM service_totals st, owner_debt_totals odt
                """).getResultList();
        return rows.isEmpty() ? new Object[]{BigDecimal.ZERO, BigDecimal.ZERO} : rows.get(0);
    }

    public Object[] loadCurrentMonthServices() {
        List<Object[]> rows = Panache.getEntityManager().createNativeQuery("""
                SELECT
                    COALESCE(SUM(fs.valor_total), 0) AS total,
                    COALESCE(SUM(CASE WHEN fs.estado = 'pagada' THEN fs.valor_total ELSE 0 END), 0) AS paid,
                    COALESCE(SUM(CASE WHEN fs.estado IN ('pendiente', 'vencida') THEN fs.valor_total ELSE 0 END), 0) AS pending
                FROM factura_servicio fs
                WHERE fs.anio = EXTRACT(YEAR FROM CURRENT_DATE)
                  AND fs.mes = EXTRACT(MONTH FROM CURRENT_DATE)
                """).getResultList();
        return rows.isEmpty() ? new Object[]{BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO} : rows.get(0);
    }
}
