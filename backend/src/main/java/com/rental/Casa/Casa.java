package com.rental.Casa;

import com.rental.Usuario.Usuario;
import com.rental.ZonaHabitacional.ZonaHabitacional;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "casa")
public class Casa extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Integer id;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    public Usuario usuario;

    public String nombre;
    public String direccion;
    public String barrio;
    public String ciudad;
    public String estado;

    @OneToMany(mappedBy = "casa")
    @JsonIgnore
    public List<ZonaHabitacional> zonas;
}
