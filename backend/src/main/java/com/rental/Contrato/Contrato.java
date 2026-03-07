package com.rental.Contrato;
import com.rental.Inquilino.Inquilino;
import com.rental.ZonaHabitacional.ZonaHabitacional;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity @Table(name = "contrato")
public class Contrato extends PanacheEntityBase {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Integer id;
    
    @ManyToOne @JoinColumn(name = "inquilino_id") public Inquilino inquilino;
    @ManyToOne @JoinColumn(name = "zona_habitacional_id") public ZonaHabitacional zonaHabitacional;
    
    @Column(name = "fecha_firma") public LocalDate fechaFirma;
    @Column(name = "fecha_inicio") public LocalDate fechaInicio;
    @Column(name = "fecha_fin") public LocalDate fechaFin;
    @Column(name = "valor_pactado") public BigDecimal valorPactado;
    public String estado;
}
