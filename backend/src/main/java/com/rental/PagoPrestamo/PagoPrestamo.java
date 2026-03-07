package com.rental.PagoPrestamo;
import com.rental.Prestamo.Prestamo;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity @Table(name = "pago_prestamo")
public class PagoPrestamo extends PanacheEntityBase {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Integer id;
    @ManyToOne @JoinColumn(name = "prestamo_id") public Prestamo prestamo;
    public LocalDate fecha;
    public BigDecimal monto;
    public String nota;
}
