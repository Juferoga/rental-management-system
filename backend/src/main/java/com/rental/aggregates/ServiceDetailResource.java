package com.rental.aggregates;

import com.rental.dto.ServiceDetailDTO;
import com.rental.dto.ServiceListDTO;
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

@Path("/api/v1/servicios")
@Produces(MediaType.APPLICATION_JSON)
@Tag(name = "Servicios Aggregate", description = "Endpoints agregados para detalle de servicios")
public class ServiceDetailResource {

    @GET
    @Path("/list")
    @Operation(summary = "Listado agregado de servicios", description = "Retorna filas planas para tablas de servicios con zona, inquilino, monto, estado y fecha.")
    public List<ServiceListDTO> list() {
        List<Object[]> rows = Panache.getEntityManager().createNativeQuery("""
                SELECT
                    cs.id,
                    z.nombre AS zone_name,
                    CONCAT(i.nombre, ' ', i.apellido) AS tenant_name,
                    cs.monto_asignado AS amount,
                    UPPER(COALESCE(cs.estado::text, 'pendiente')) AS status,
                    fs.fecha_vencimiento AS date
                FROM cargo_servicio cs
                JOIN factura_servicio fs ON fs.id = cs.factura_id
                JOIN contrato ct ON ct.id = cs.contrato_id
                JOIN inquilino i ON i.id = ct.inquilino_id
                JOIN zona_habitacional z ON z.id = ct.zona_habitacional_id
                ORDER BY fs.fecha_vencimiento DESC, cs.id DESC
                """).getResultList();

        List<ServiceListDTO> result = new ArrayList<>();
        for (Object[] row : rows) {
            result.add(new ServiceListDTO(
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
    @Operation(summary = "Detalle de servicios por zona", description = "Retorna desglose de servicios y marcadores del mes seleccionado.")
    public ServiceDetailDTO detail(
            @PathParam("zoneId") Integer zoneId,
            @QueryParam("year") Integer year,
            @QueryParam("month") Integer month
    ) {
        List<Object[]> zoneRows = Panache.getEntityManager().createNativeQuery("""
                SELECT z.id, c.direccion
                FROM zona_habitacional z
                JOIN casa c ON c.id = z.casa_id
                WHERE z.id = :zoneId
                """).setParameter("zoneId", zoneId).getResultList();

        if (zoneRows.isEmpty()) {
            throw new NotFoundException("Zona no encontrada");
        }

        int selectedYear = year != null ? year : java.time.LocalDate.now().getYear();
        int selectedMonth = month != null ? month : java.time.LocalDate.now().getMonthValue();

        ServiceDetailDTO dto = new ServiceDetailDTO();
        dto.address = zoneRows.get(0)[1] != null ? zoneRows.get(0)[1].toString() : "Sin dirección";

        List<Object[]> rows = Panache.getEntityManager().createNativeQuery("""
                SELECT
                    COALESCE(CONCAT(i.nombre, ' ', i.apellido), 'Propietario') AS responsible,
                    cs.monto_asignado,
                    sc.tipo,
                    cs.estado,
                    COUNT(*) OVER (PARTITION BY fs.id) > 1 AS is_shared
                FROM zona_habitacional z
                JOIN casa c ON c.id = z.casa_id
                JOIN factura_servicio fs ON fs.casa_id = c.id
                JOIN servicio_catalogo sc ON sc.id = fs.servicio_id
                LEFT JOIN cargo_servicio cs ON cs.factura_id = fs.id
                LEFT JOIN contrato ct ON ct.id = cs.contrato_id
                LEFT JOIN inquilino i ON i.id = ct.inquilino_id
                WHERE z.id = :zoneId
                  AND fs.anio = :year
                  AND fs.mes = :month
                ORDER BY fs.id DESC
                """)
                .setParameter("zoneId", zoneId)
                .setParameter("year", (short) selectedYear)
                .setParameter("month", (short) selectedMonth)
                .getResultList();

        BigDecimal total = BigDecimal.ZERO;
        for (Object[] row : rows) {
            BigDecimal amount = toBigDecimal(row[1]);
            String type = normalizeType(row[2]);
            total = total.add(amount);

            dto.services.add(new ServiceDetailDTO.ServiceRowDTO(
                    row[0] != null ? row[0].toString() : "Sin responsable",
                    amount,
                    type,
                    row[3] != null ? row[3].toString() : "pending",
                    row[4] != null && (Boolean) row[4],
                    markerForType(type)
            ));
        }

        dto.totalValue = total;
        return dto;
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

    private String value(Object value, String fallback) {
        return value != null ? value.toString() : fallback;
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

    private String normalizeType(Object value) {
        if (value == null) {
            return "OTHER";
        }
        String v = value.toString().toUpperCase();
        return switch (v) {
            case "ELECTRICIDAD" -> "LIGHT";
            case "AGUA" -> "WATER";
            case "GAS" -> "GAS";
            default -> "OTHER";
        };
    }

    private String markerForType(String type) {
        return switch (type) {
            case "LIGHT" -> "💡";
            case "WATER" -> "💧";
            case "GAS" -> "⛽";
            default -> "📌";
        };
    }
}
