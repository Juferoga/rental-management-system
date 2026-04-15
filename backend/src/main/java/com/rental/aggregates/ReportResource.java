package com.rental.aggregates;

import com.rental.dto.ReportsSummaryDTO;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Path("/api/v1/reportes")
@Produces(MediaType.APPLICATION_JSON)
@Tag(name = "Reportes", description = "Agregados para módulo de reportes")
public class ReportResource {

    @Inject
    DashboardQueryService dashboardQueryService;

    @GET
    @Path("/summary")
    @Operation(summary = "Resumen de reportes", description = "Retorna ocupación, ingresos vs gastos y estado de deudas para el año solicitado.")
    public ReportsSummaryDTO summary(@QueryParam("year") Integer year) {
        int resolvedYear = year != null ? year : LocalDate.now().getYear();

        ReportsSummaryDTO dto = new ReportsSummaryDTO();

        List<Object[]> occupancyRows = dashboardQueryService.loadMonthlyOccupancyRates(resolvedYear);
        for (Object[] row : occupancyRows) {
            int month = toInt(row[0]);
            int occupiedZones = toInt(row[1]);
            int totalZones = toInt(row[2]);
            BigDecimal occupancyRate = totalZones > 0
                    ? BigDecimal.valueOf(occupiedZones)
                    .multiply(BigDecimal.valueOf(100))
                    .divide(BigDecimal.valueOf(totalZones), 2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;

            dto.occupancyRates.add(new ReportsSummaryDTO.OccupancyRatePointDTO(month, occupiedZones, totalZones, occupancyRate));
        }

        List<Object[]> incomeExpenseRows = dashboardQueryService.loadIncomeVsExpensesByMonth(resolvedYear);
        for (Object[] row : incomeExpenseRows) {
            dto.incomeVsExpenses.add(new ReportsSummaryDTO.IncomeExpensePointDTO(
                    toInt(row[0]),
                    toBigDecimal(row[1]),
                    toBigDecimal(row[2])
            ));
        }

        Object[] debtStatus = dashboardQueryService.loadDebtStatusSummary();
        dto.debtStatus = new ReportsSummaryDTO.DebtStatusDTO(
                toBigDecimal(debtStatus[0]),
                toBigDecimal(debtStatus[1]),
                toBigDecimal(debtStatus[2]),
                toBigDecimal(debtStatus[3]),
                toBigDecimal(debtStatus[4])
        );

        dto.generatedAt = LocalDate.now();
        return dto;
    }

    private int toInt(Object value) {
        if (value == null) {
            return 0;
        }
        if (value instanceof Number number) {
            return number.intValue();
        }
        return Integer.parseInt(value.toString());
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
