package com.rental.Deposito;
import com.rental.Contrato.Contrato;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity @Table(name = "deposito")
public class Deposito extends PanacheEntityBase {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Integer id;
    @OneToOne @JoinColumn(name = "contrato_id") public Contrato contrato;
    @Column(name = "monto_inicial") public BigDecimal montoInicial;
    @Column(name = "monto_disponible") public BigDecimal montoDisponible;
    public String estado;
}
