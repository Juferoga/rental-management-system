package com.rental.PagoRenta;
import com.rental.Contrato.Contrato;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity @Table(name = "pago_renta")
public class PagoRenta extends PanacheEntityBase {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Integer id;
    @ManyToOne @JoinColumn(name = "contrato_id") public Contrato contrato;
    @Column(columnDefinition = "SMALLINT") public Short anio;
    @Column(columnDefinition = "SMALLINT") public Short mes;
    @Column(name = "monto_esperado") public BigDecimal montoEsperado;
    @Column(name = "monto_pagado") public BigDecimal montoPagado;
    @Column(name = "fecha_pago") public LocalDate fechaPago;
    @Column(name = "metodo_pago") public String metodoPago;
    @Column(name = "tipo_pago") public String tipoPago;
    public String estado;
}
