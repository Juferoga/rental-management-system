package com.rental.ZonaHabitacional;

import com.rental.Casa.Casa;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "zona_habitacional")
public class ZonaHabitacional extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Integer id;

    @ManyToOne
    @JoinColumn(name = "casa_id")
    public Casa casa;

    public String nombre;
    public String tipo;

    @Column(name = "area_m2")
    public BigDecimal areaM2;

    @Column(name = "valor_arriendo")
    public BigDecimal valorArriendo;

    public String estado;
}
