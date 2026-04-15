package com.rental.aggregates;

import io.quarkus.hibernate.orm.panache.Panache;
import jakarta.enterprise.context.ApplicationScoped;

import java.math.BigDecimal;
import java.math.RoundingMode;
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
                  AND LOWER(CAST(p.estado AS TEXT)) IN ('activo', 'vencido')
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
                prestamo_totals AS (
                    SELECT
                        COALESCE(SUM(p.monto_total - p.saldo_pendiente), 0) AS paid,
                        COALESCE(SUM(p.saldo_pendiente), 0) AS unpaid
                    FROM prestamo p
                    WHERE EXTRACT(YEAR FROM p.fecha) = EXTRACT(YEAR FROM CURRENT_DATE)
                      AND EXTRACT(MONTH FROM p.fecha) = EXTRACT(MONTH FROM CURRENT_DATE)
                )
                SELECT
                    (st.paid + pt.paid) AS paid,
                    (st.unpaid + pt.unpaid) AS unpaid
                FROM service_totals st, prestamo_totals pt
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

    public List<Object[]> loadMonthlyOccupancyRates(int year) {
        return Panache.getEntityManager().createNativeQuery("""
                WITH months AS (
                    SELECT generate_series(1, 12) AS month
                ),
                zones AS (
                    SELECT id
                    FROM zona_habitacional
                ),
                occupied AS (
                    SELECT
                        m.month,
                        COUNT(DISTINCT c.zona_habitacional_id) AS occupied_zones
                    FROM months m
                    JOIN contrato c ON c.estado IN ('activo', 'en_mora')
                        AND c.fecha_inicio <= (make_date(CAST(:year AS int), m.month::int, 1) + INTERVAL '1 month' - INTERVAL '1 day')
                        AND (c.fecha_fin IS NULL OR c.fecha_fin >= make_date(CAST(:year AS int), m.month::int, 1))
                    GROUP BY m.month
                )
                SELECT
                    m.month,
                    COALESCE(o.occupied_zones, 0) AS occupied_zones,
                    (SELECT COUNT(*) FROM zones) AS total_zones
                FROM months m
                LEFT JOIN occupied o ON o.month = m.month
                ORDER BY m.month
                """)
                .setParameter("year", year)
                .getResultList();
    }

    public List<Object[]> loadIncomeVsExpensesByMonth(int year) {
        return Panache.getEntityManager().createNativeQuery("""
                WITH months AS (
                    SELECT generate_series(1, 12) AS month
                ),
                income AS (
                    SELECT pr.mes::int AS month, COALESCE(SUM(pr.monto_pagado), 0) AS total
                    FROM pago_renta pr
                    WHERE pr.anio = :year
                    GROUP BY pr.mes
                ),
                expenses AS (
                    SELECT fs.mes::int AS month, COALESCE(SUM(fs.valor_total), 0) AS total
                    FROM factura_servicio fs
                    WHERE fs.anio = :year
                      AND fs.estado <> 'anulada'
                    GROUP BY fs.mes
                )
                SELECT
                    m.month,
                    COALESCE(i.total, 0) AS income,
                    COALESCE(e.total, 0) AS expenses
                FROM months m
                LEFT JOIN income i ON i.month = m.month
                LEFT JOIN expenses e ON e.month = m.month
                ORDER BY m.month
                """)
                .setParameter("year", year)
                .getResultList();
    }

    public Object[] loadDebtStatusSummary() {
        List<Object[]> rows = Panache.getEntityManager().createNativeQuery("""
                WITH rent_debts AS (
                    SELECT
                        COALESCE(SUM(pr.monto_pagado), 0) AS settled,
                        COALESCE(SUM(CASE WHEN pr.estado IN ('pendiente', 'parcial') THEN GREATEST(pr.monto_esperado - pr.monto_pagado, 0) ELSE 0 END), 0) AS pending,
                        COALESCE(SUM(CASE WHEN pr.estado = 'vencido' THEN GREATEST(pr.monto_esperado - pr.monto_pagado, 0) ELSE 0 END), 0) AS overdue
                    FROM pago_renta pr
                ),
                service_debts AS (
                    SELECT
                        COALESCE(SUM(CASE WHEN fs.estado = 'pagada' THEN fs.valor_total ELSE 0 END), 0) AS settled,
                        COALESCE(SUM(CASE WHEN fs.estado = 'pendiente' THEN fs.valor_total ELSE 0 END), 0) AS pending,
                        COALESCE(SUM(CASE WHEN fs.estado = 'vencida' THEN fs.valor_total ELSE 0 END), 0) AS overdue
                    FROM factura_servicio fs
                    WHERE fs.estado <> 'anulada'
                ),
                loan_debts AS (
                    SELECT
                        COALESCE(SUM(p.monto_total - p.saldo_pendiente), 0) AS settled,
                        COALESCE(SUM(CASE WHEN p.estado = 'activo' THEN p.saldo_pendiente ELSE 0 END), 0) AS pending,
                        COALESCE(SUM(CASE WHEN p.estado = 'vencido' THEN p.saldo_pendiente ELSE 0 END), 0) AS overdue
                    FROM prestamo p
                )
                SELECT
                    (rd.settled + sd.settled + ld.settled) AS settled,
                    (rd.pending + sd.pending + ld.pending) AS pending,
                    (rd.overdue + sd.overdue + ld.overdue) AS overdue
                FROM rent_debts rd, service_debts sd, loan_debts ld
                """).getResultList();

        if (rows.isEmpty()) {
            return new Object[]{BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO};
        }

        Object[] row = rows.get(0);
        BigDecimal settled = toBigDecimal(row[0]);
        BigDecimal pending = toBigDecimal(row[1]);
        BigDecimal overdue = toBigDecimal(row[2]);
        BigDecimal total = settled.add(pending).add(overdue);
        BigDecimal rate = total.compareTo(BigDecimal.ZERO) > 0
                ? settled.multiply(BigDecimal.valueOf(100)).divide(total, 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        return new Object[]{settled, pending, overdue, total, rate};
    }

    private BigDecimal toBigDecimal(Object value) {
        if (value == null) {
            return BigDecimal.ZERO;
        }
        if (value instanceof BigDecimal bd) {
            return bd;
        }
        return new BigDecimal(value.toString());
    }
}
