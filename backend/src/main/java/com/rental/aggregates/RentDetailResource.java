package com.rental.aggregates;

import com.rental.dto.RentListDTO;
import com.rental.dto.RentCalendarDetailDTO;
import io.quarkus.hibernate.orm.panache.Panache;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.math.BigDecimal;
import java.sql.Date;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Path("/api/v1/arriendos")
@Produces(MediaType.APPLICATION_JSON)
@Tag(name = "Arriendos Aggregate", description = "Endpoints agregados para detalle de arriendos")
public class RentDetailResource {

    @GET
    @Path("/list")
    @Operation(summary = "Listado agregado de arriendos", description = "Retorna filas planas para tablas de arriendos con zona, inquilino, monto, estado y fecha.")
    public List<RentListDTO> list() {
        List<Object[]> rows = Panache.getEntityManager().createNativeQuery("""
                SELECT
                    pr.id,
                    z.nombre AS zone_name,
                    CONCAT(i.nombre, ' ', i.apellido) AS tenant_name,
                    COALESCE(pr.monto_esperado, c.valor_pactado, z.valor_arriendo) AS amount,
                    UPPER(COALESCE(pr.estado::text, 'pendiente')) AS status,
                    COALESCE(pr.fecha_pago, make_date(pr.anio::int, pr.mes::int, 1)) AS date
                FROM pago_renta pr
                JOIN contrato c ON c.id = pr.contrato_id
                JOIN zona_habitacional z ON z.id = c.zona_habitacional_id
                JOIN inquilino i ON i.id = c.inquilino_id
                ORDER BY date DESC, pr.id DESC
                """).getResultList();

        List<RentListDTO> result = new ArrayList<>();
        for (Object[] row : rows) {
            result.add(new RentListDTO(
                    ((Number) row[0]).intValue(),
                    value(row[1], "Zona"),
                    value(row[2], "Sin inquilino"),
                    toBigDecimal(row[3]),
                    value(row[4], "PENDIENTE"),
                    toLocalDate(row[5])
            ));
        }
        return result;
    }

    @GET
    @Path("/{zoneId}/detalle")
    @Operation(summary = "Detalle calendario de arriendo", description = "Retorna navegación por meses y estado del periodo seleccionado.")
    public RentCalendarDetailDTO detail(
            @PathParam("zoneId") Integer zoneId,
            @QueryParam("year") Integer year,
            @QueryParam("month") Integer month
    ) {
        List<Object[]> baseRows = Panache.getEntityManager().createNativeQuery("""
                SELECT z.id, z.nombre,
                       CONCAT(i.nombre, ' ', i.apellido) AS tenant_name,
                       COALESCE(c.valor_pactado, z.valor_arriendo) AS rent_value
                FROM zona_habitacional z
                LEFT JOIN contrato c ON c.zona_habitacional_id = z.id AND c.estado = 'activo'
                LEFT JOIN inquilino i ON i.id = c.inquilino_id
                WHERE z.id = :zoneId
                """).setParameter("zoneId", zoneId).getResultList();

        if (baseRows.isEmpty()) {
            throw new NotFoundException("Zona no encontrada");
        }

        Object[] base = baseRows.get(0);
        int resolvedYear = year != null ? year : LocalDate.now().getYear();
        int resolvedMonth = month != null ? month : LocalDate.now().getMonthValue();

        RentCalendarDetailDTO dto = new RentCalendarDetailDTO();
        dto.zoneId = zoneId;
        dto.zoneName = value(base[1], "Zona");
        dto.tenantName = value(base[2], "Sin inquilino");
        dto.rentValue = toBigDecimal(base[3]);
        dto.year = resolvedYear;
        dto.month = resolvedMonth;

        List<?> selectedPeriod = Panache.getEntityManager().createNativeQuery("""
                SELECT pr.estado
                FROM pago_renta pr
                JOIN contrato c ON c.id = pr.contrato_id
                WHERE c.zona_habitacional_id = :zoneId
                  AND pr.anio = :year
                  AND pr.mes = :month
                ORDER BY pr.id DESC
                LIMIT 1
                """)
                .setParameter("zoneId", zoneId)
                .setParameter("year", (short) resolvedYear)
                .setParameter("month", (short) resolvedMonth)
                .getResultList();

        String status = selectedPeriod.isEmpty() ? "sin_registro" : value(selectedPeriod.get(0), "sin_registro");
        dto.status = status;
        dto.statusIcon = iconForStatus(status);

        List<Object[]> monthRows = Panache.getEntityManager().createNativeQuery("""
                SELECT pr.anio, pr.mes, pr.estado
                FROM pago_renta pr
                JOIN contrato c ON c.id = pr.contrato_id
                WHERE c.zona_habitacional_id = :zoneId
                ORDER BY pr.anio DESC, pr.mes DESC
                LIMIT 24
                """).setParameter("zoneId", zoneId).getResultList();

        for (Object[] row : monthRows) {
            String periodStatus = value(row[2], "sin_registro");
            dto.months.add(new RentCalendarDetailDTO.MonthSummaryDTO(
                    ((Number) row[0]).intValue(),
                    ((Number) row[1]).intValue(),
                    periodStatus,
                    iconForStatus(periodStatus)
            ));
        }

        return dto;
    }

    private String value(Object value, String fallback) {
        return value != null ? value.toString() : fallback;
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

    private LocalDate toLocalDate(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Date d) {
            return d.toLocalDate();
        }
        if (value instanceof LocalDate ld) {
            return ld;
        }
        return LocalDate.parse(value.toString());
    }

    private String iconForStatus(String status) {
        return switch (status == null ? "" : status.toLowerCase()) {
            case "pagado" -> "check";
            case "pendiente", "parcial" -> "warning";
            case "vencido" -> "times";
            default -> "minus";
        };
    }
}
