package com.rental.Prestamo;
import com.rental.Contrato.Contrato;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity @Table(name = "prestamo")
public class Prestamo extends PanacheEntityBase {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Integer id;
    @ManyToOne @JoinColumn(name = "contrato_id") public Contrato contrato;
    public LocalDate fecha;
    @Column(name = "monto_total") public BigDecimal montoTotal;
    @Column(name = "saldo_pendiente") public BigDecimal saldoPendiente;
    public String motivo;
    public String estado;
}
