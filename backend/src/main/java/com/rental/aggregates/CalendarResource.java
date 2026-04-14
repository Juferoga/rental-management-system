package com.rental.aggregates;

import com.rental.dto.CalendarEventDTO;
import io.quarkus.hibernate.orm.panache.Panache;
import jakarta.ws.rs.DefaultValue;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Path("/api/v1/calendar")
@Produces(MediaType.APPLICATION_JSON)
@Tag(name = "Calendar", description = "Eventos globales mensuales")
public class CalendarResource {

    @GET
    @Operation(summary = "Obtener eventos globales del mes", description = "Retorna eventos de vencimientos: arriendos, servicios y deudas del propietario.")
    public List<CalendarEventDTO> events(
            @QueryParam("year") Integer year,
            @QueryParam("month") Integer month
    ) {
        LocalDate now = LocalDate.now();
        int selectedYear = year != null ? year : now.getYear();
        int selectedMonth = month != null ? month : now.getMonthValue();

        List<CalendarEventDTO> result = new ArrayList<>();

        List<Object[]> rentRows = Panache.getEntityManager().createNativeQuery("""
                SELECT
                    (make_date(pr.anio::int, pr.mes::int, 1) + INTERVAL '1 month' - INTERVAL '1 day')::date AS due_date,
                    CONCAT('Arriendo ', z.nombre, ' - ', i.nombre, ' ', i.apellido) AS title,
                    pr.estado
                FROM pago_renta pr
                JOIN contrato c ON c.id = pr.contrato_id
                JOIN zona_habitacional z ON z.id = c.zona_habitacional_id
                JOIN inquilino i ON i.id = c.inquilino_id
                WHERE pr.anio = :year
                  AND pr.mes = :month
                ORDER BY due_date, z.nombre
                """)
                .setParameter("year", (short) selectedYear)
                .setParameter("month", (short) selectedMonth)
                .getResultList();

        for (Object[] row : rentRows) {
            result.add(new CalendarEventDTO(
                    toLocalDate(row[0]),
                    row[1] != null ? row[1].toString() : "Arriendo",
                    "RENT",
                    row[2] != null ? row[2].toString() : "pendiente"
            ));
        }

        List<Object[]> serviceRows = Panache.getEntityManager().createNativeQuery("""
                SELECT
                    fs.fecha_vencimiento,
                    CONCAT('Servicio ', sc.nombre, ' - ', c.nombre) AS title,
                    fs.estado
                FROM factura_servicio fs
                JOIN servicio_catalogo sc ON sc.id = fs.servicio_id
                JOIN casa c ON c.id = fs.casa_id
                WHERE fs.anio = :year
                  AND fs.mes = :month
                ORDER BY fs.fecha_vencimiento, fs.id
                """)
                .setParameter("year", (short) selectedYear)
                .setParameter("month", (short) selectedMonth)
                .getResultList();

        for (Object[] row : serviceRows) {
            result.add(new CalendarEventDTO(
                    toLocalDate(row[0]),
                    row[1] != null ? row[1].toString() : "Servicio",
                    "SERVICE",
                    row[2] != null ? row[2].toString() : "pendiente"
            ));
        }

        List<Object[]> debtRows = Panache.getEntityManager().createNativeQuery("""
                SELECT
                    od.fecha_vencimiento,
                    CONCAT('Deuda ', od.descripcion) AS title,
                    od.estado
                FROM owner_debt od
                WHERE od.fecha_vencimiento IS NOT NULL
                  AND EXTRACT(YEAR FROM od.fecha_vencimiento) = :year
                  AND EXTRACT(MONTH FROM od.fecha_vencimiento) = :month
                ORDER BY od.fecha_vencimiento, od.id
                """)
                .setParameter("year", selectedYear)
                .setParameter("month", selectedMonth)
                .getResultList();

        for (Object[] row : debtRows) {
            result.add(new CalendarEventDTO(
                    toLocalDate(row[0]),
                    row[1] != null ? row[1].toString() : "Deuda",
                    "DEBT",
                    row[2] != null ? row[2].toString() : "pendiente"
            ));
        }

        return result;
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
