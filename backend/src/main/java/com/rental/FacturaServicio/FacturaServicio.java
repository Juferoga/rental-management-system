package com.rental.FacturaServicio;
import com.rental.Casa.Casa;
import com.rental.ServicioCatalogo.ServicioCatalogo;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity @Table(name = "factura_servicio")
public class FacturaServicio extends PanacheEntityBase {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Integer id;
    @ManyToOne @JoinColumn(name = "casa_id") public Casa casa;
    @ManyToOne @JoinColumn(name = "servicio_id") public ServicioCatalogo servicio;
    @Column(name = "numero_factura") public String numeroFactura;
    @Column(columnDefinition = "SMALLINT") public Short anio;
    @Column(columnDefinition = "SMALLINT") public Short mes;
    @Column(name = "fecha_vencimiento") public LocalDate fechaVencimiento;
    @Column(name = "valor_total") public BigDecimal valorTotal;
    public String estado;
}
