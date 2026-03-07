package com.rental.CargoServicio;
import com.rental.FacturaServicio.FacturaServicio;
import com.rental.Contrato.Contrato;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity @Table(name = "cargo_servicio")
public class CargoServicio extends PanacheEntityBase {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Integer id;
    @ManyToOne @JoinColumn(name = "factura_id") public FacturaServicio factura;
    @ManyToOne @JoinColumn(name = "contrato_id") public Contrato contrato;
    @Column(name = "monto_asignado") public BigDecimal montoAsignado;
    public String estado;
}
