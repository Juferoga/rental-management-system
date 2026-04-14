package com.rental.aggregates;

import com.rental.dto.CreditsSummaryDTO;
import com.rental.dto.OwnerDebtDetailDTO;
import io.quarkus.hibernate.orm.panache.Panache;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Path("/api/v1/creditos")
@Produces(MediaType.APPLICATION_JSON)
@Tag(name = "Creditos", description = "Resumen y detalle de deudas del propietario")
public class CreditsResource {

    @GET
    @Operation(summary = "Resumen de créditos", description = "Agrupa deudas por categoría para dashboard de créditos.")
    public CreditsSummaryDTO summary() {
        CreditsSummaryDTO dto = new CreditsSummaryDTO();

        List<Object[]> rows = Panache.getEntityManager().createNativeQuery("""
                SELECT id, tipo, descripcion, saldo_pendiente, estado
                FROM owner_debt
                ORDER BY id DESC
                """).getResultList();

        for (Object[] row : rows) {
            CreditsSummaryDTO.CreditItemDTO item = new CreditsSummaryDTO.CreditItemDTO(
                    String.valueOf(row[0]),
                    row[2] != null ? row[2].toString() : "Sin descripción",
                    toBigDecimal(row[3]),
                    row[4] != null ? row[4].toString() : "pendiente"
            );

            String type = row[1] != null ? row[1].toString() : "other";
            switch (type) {
                case "credit_card" -> dto.creditCards.add(item);
                case "loan" -> dto.loans.add(item);
                default -> dto.others.add(item);
            }
        }

        return dto;
    }

    @GET
    @Path("/{id}")
    @Operation(summary = "Detalle de deuda", description = "Retorna el detalle de una deuda específica del propietario.")
    public OwnerDebtDetailDTO detail(@PathParam("id") Integer id) {
        List<Object[]> rows = Panache.getEntityManager().createNativeQuery("""
                SELECT id, usuario_id, tipo, descripcion, monto_total, saldo_pendiente,
                       fecha_corte, fecha_vencimiento, estado, credit_card_id
                FROM owner_debt
                WHERE id = :id
                """)
                .setParameter("id", id)
                .getResultList();

        if (rows.isEmpty()) {
            throw new NotFoundException("Deuda no encontrada");
        }

        Object[] row = rows.get(0);
        OwnerDebtDetailDTO dto = new OwnerDebtDetailDTO();
        dto.id = String.valueOf(row[0]);
        dto.ownerId = ((Number) row[1]).intValue();
        dto.type = row[2] != null ? row[2].toString() : "other";
        dto.description = row[3] != null ? row[3].toString() : "Sin descripción";
        dto.totalAmount = toBigDecimal(row[4]);
        dto.pendingAmount = toBigDecimal(row[5]);
        dto.cutoffDate = toLocalDate(row[6]);
        dto.dueDate = toLocalDate(row[7]);
        dto.status = row[8] != null ? row[8].toString() : "pendiente";
        dto.creditCardId = row[9] != null ? ((Number) row[9]).intValue() : null;
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

    private LocalDate toLocalDate(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof java.sql.Date d) {
            return d.toLocalDate();
        }
        if (value instanceof LocalDate ld) {
            return ld;
        }
        return LocalDate.parse(value.toString());
    }
}
