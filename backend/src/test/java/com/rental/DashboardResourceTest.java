package com.rental;

import com.rental.aggregates.DashboardQueryService;
import io.quarkus.test.InjectMock;
import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.sql.Date;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasSize;
import static org.mockito.Mockito.when;

@QuarkusTest
class DashboardResourceTest {

    @InjectMock
    DashboardQueryService dashboardQueryService;

    @Test
    void shouldReturnAggregatedAlerts() {
        List<Object[]> debtRows = new ArrayList<>();
        debtRows.add(new Object[]{1, "credit_card", "TC Bancolombia", new BigDecimal("120000.00"), Date.valueOf(LocalDate.of(2026, 4, 20))});
        when(dashboardQueryService.loadDebtRows()).thenReturn(debtRows);

        List<Object[]> rentRows = new ArrayList<>();
        rentRows.add(new Object[]{3, "Ana Perez", new BigDecimal("1500000.00"), Date.valueOf(LocalDate.of(2026, 4, 30))});
        when(dashboardQueryService.loadRentRows()).thenReturn(rentRows);
        when(dashboardQueryService.loadCurrentMonthEarnings()).thenReturn(new Object[]{new BigDecimal("1500000.00"), new BigDecimal("220000.00")});
        when(dashboardQueryService.loadCurrentMonthDebts()).thenReturn(new Object[]{new BigDecimal("50000.00"), new BigDecimal("120000.00")});

        given()
                .when().get("/api/v1/dashboard/alerts")
                .then()
                .statusCode(200)
                .body("debts", hasSize(1))
                .body("debts[0].type", equalTo("CREDIT_CARD"))
                .body("debts[0].referenceType", equalTo("DEBT"))
                .body("debts[0].referenceId", equalTo(1))
                .body("rents", hasSize(1))
                .body("rents[0].referenceType", equalTo("RENT"))
                .body("rents[0].referenceId", equalTo(3))
                .body("rents[0].tenantName", equalTo("Ana Perez"));
    }

    @Test
    void shouldReturnEmptyStateWhenNoData() {
        when(dashboardQueryService.loadDebtRows()).thenReturn(List.of());
        when(dashboardQueryService.loadRentRows()).thenReturn(List.of());
        when(dashboardQueryService.loadCurrentMonthEarnings()).thenReturn(new Object[]{BigDecimal.ZERO, BigDecimal.ZERO});
        when(dashboardQueryService.loadCurrentMonthDebts()).thenReturn(new Object[]{BigDecimal.ZERO, BigDecimal.ZERO});

        given()
                .when().get("/api/v1/dashboard/alerts")
                .then()
                .statusCode(200)
                .body("debts", hasSize(0))
                .body("rents", hasSize(0));
    }
}
