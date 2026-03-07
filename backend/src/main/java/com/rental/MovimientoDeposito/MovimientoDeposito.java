package com.rental.MovimientoDeposito;
import com.rental.Deposito.Deposito;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity @Table(name = "movimiento_deposito")
public class MovimientoDeposito extends PanacheEntityBase {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Integer id;
    @ManyToOne @JoinColumn(name = "deposito_id") public Deposito deposito;
    public LocalDate fecha;
    public BigDecimal monto;
    public String tipo;
    public String motivo;
}
