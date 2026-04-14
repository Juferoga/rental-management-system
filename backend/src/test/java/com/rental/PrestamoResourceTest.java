package com.rental;

import com.rental.Contrato.Contrato;
import com.rental.Prestamo.Prestamo;
import io.quarkus.narayana.jta.QuarkusTransaction;
import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;

@QuarkusTest
class PrestamoResourceTest {

    @BeforeEach
    void cleanData() {
        QuarkusTransaction.requiringNew().run(() -> {
            Prestamo.deleteAll();
            Contrato.deleteAll();
        });
    }

    @Test
    void shouldReturnPrestamoWhenIdExists() {
        Integer prestamoId = QuarkusTransaction.requiringNew().call(() -> {
            Contrato contrato = new Contrato();
            contrato.persist();

            Prestamo prestamo = new Prestamo();
            prestamo.contrato = contrato;
            prestamo.fecha = LocalDate.of(2026, 4, 14);
            prestamo.montoTotal = new BigDecimal("500000.00");
            prestamo.saldoPendiente = new BigDecimal("200000.00");
            prestamo.motivo = "Reparación";
            prestamo.estado = "pendiente";
            prestamo.persist();
            return prestamo.id;
        });

        given()
                .when().get("/api/v1/prestamos/" + prestamoId)
                .then()
                .statusCode(200)
                .body("id", equalTo(prestamoId))
                .body("motivo", equalTo("Reparación"));
    }

    @Test
    void shouldReturnNotFoundWhenPrestamoDoesNotExist() {
        given()
                .when().get("/api/v1/prestamos/999999")
                .then()
                .statusCode(404);
    }
}
