package com.rental.Mantenimiento;
import com.rental.ZonaHabitacional.ZonaHabitacional;
import com.rental.Usuario.Usuario;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity @Table(name = "mantenimiento")
public class Mantenimiento extends PanacheEntityBase {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Integer id;
    @ManyToOne @JoinColumn(name = "zona_habitacional_id") public ZonaHabitacional zona;
    @ManyToOne @JoinColumn(name = "usuario_id") public Usuario usuario;
    public LocalDate fecha;
    public String descripcion;
    public BigDecimal costo;
    public String estado;
}
