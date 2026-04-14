package com.rental;

import com.rental.aggregates.DashboardQueryService;
import io.quarkus.test.InjectMock;
import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;
import static org.mockito.Mockito.when;

@QuarkusTest
class Aggregate500ContractTest {

    @InjectMock
    DashboardQueryService dashboardQueryService;

    @Test
    void testDashboardAlertsInternalError() {
        when(dashboardQueryService.loadDebtRows()).thenThrow(new RuntimeException("Simulated Database Failure"));

        given()
                .when().get("/api/v1/dashboard/alerts")
                .then()
                .statusCode(500)
                .body("status", equalTo(500))
                .body("error", equalTo("Error interno"))
                .body("mensaje", equalTo("Ocurrió un error inesperado en el servidor"));
    }
}
