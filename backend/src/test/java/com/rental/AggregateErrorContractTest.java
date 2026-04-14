package com.rental;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.notNullValue;

@QuarkusTest
class AggregateErrorContractTest {

    @Test
    void testCreditsDetailNotFound() {
        given()
                .when().get("/api/v1/creditos/999999")
                .then()
                .statusCode(404)
                .body("status", equalTo(404))
                .body("error", equalTo("No encontrado"))
                .body("mensaje", notNullValue());
    }

    @Test
    void testRentDetailNotFound() {
        given()
                .when().get("/api/v1/arriendos/999999/detalle")
                .then()
                .statusCode(404)
                .body("status", equalTo(404))
                .body("error", equalTo("No encontrado"))
                .body("mensaje", notNullValue());
    }

    @Test
    void testServiceDetailNotFound() {
        given()
                .when().get("/api/v1/servicios/999999/detalle")
                .then()
                .statusCode(404)
                .body("status", equalTo(404))
                .body("error", equalTo("No encontrado"))
                .body("mensaje", notNullValue());
    }
}
