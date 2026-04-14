package com.rental.aggregates;

import com.rental.dto.DashboardAlertsDTO;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Path("/api/v1/dashboard")
@Produces(MediaType.APPLICATION_JSON)
@Tag(name = "Dashboard", description = "Agregados para /inicio")
public class DashboardResource {

    @Inject
    DashboardQueryService dashboardQueryService;

    @GET
    @Path("/alerts")
    @Operation(summary = "Obtener alertas agregadas", description = "Retorna alertas de deudas y arriendos para el dashboard de inicio.")
    public DashboardAlertsDTO getAlerts() {
        DashboardAlertsDTO dto = new DashboardAlertsDTO();

        List<Object[]> debtRows = dashboardQueryService.loadDebtRows();

        for (Object[] row : debtRows) {
            Long debtReferenceId = toLong(row[0]);
            dto.debts.add(new DashboardAlertsDTO.DebtAlertDTO(
                    String.valueOf(row[0]),
                    row[1] != null ? row[1].toString().toUpperCase() : "DEBT",
                    debtReferenceId,
                    "DEBT",
                    row[2] != null ? row[2].toString() : "Sin descripción",
                    toBigDecimal(row[3]),
                    toLocalDate(row[4])
            ));
        }

        List<Object[]> rentRows = dashboardQueryService.loadRentRows();

        for (Object[] row : rentRows) {
            Long rentReferenceId = toLong(row[0]);
            dto.rents.add(new DashboardAlertsDTO.RentAlertDTO(
                    String.valueOf(row[0]),
                    rentReferenceId,
                    "RENT",
                    row[1] != null ? row[1].toString() : "Sin inquilino",
                    toBigDecimal(row[2]),
                    toLocalDate(row[3])
            ));
        }

        Object[] earnings = dashboardQueryService.loadCurrentMonthEarnings();
        dto.earnings = new DashboardAlertsDTO.EarningsChartDTO(
                toBigDecimal(earnings[0]),
                toBigDecimal(earnings[1])
        );

        Object[] debtsChart = dashboardQueryService.loadCurrentMonthDebts();
        dto.debtsChart = new DashboardAlertsDTO.DebtsChartDTO(
                toBigDecimal(debtsChart[0]),
                toBigDecimal(debtsChart[1])
        );

        Object[] servicesSummary = dashboardQueryService.loadCurrentMonthServices();
        dto.services = new DashboardAlertsDTO.ServicesSummaryDTO(
                toBigDecimal(servicesSummary[0]),
                toBigDecimal(servicesSummary[1]),
                toBigDecimal(servicesSummary[2])
        );

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
        if (value instanceof java.time.LocalDate ld) {
            return ld;
        }
        if (value instanceof java.sql.Timestamp ts) {
            return ts.toLocalDateTime().toLocalDate();
        }
        if (value instanceof java.time.LocalDateTime ldt) {
            return ldt.toLocalDate();
        }
        String str = value.toString();
        if (str.length() >= 10) {
            return LocalDate.parse(str.substring(0, 10));
        }
        return LocalDate.parse(str);
    }

    private Long toLong(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Number number) {
            return number.longValue();
        }
        return Long.valueOf(value.toString());
    }
}
