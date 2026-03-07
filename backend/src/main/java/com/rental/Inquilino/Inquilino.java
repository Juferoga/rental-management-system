package com.rental.Inquilino;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;

@Entity @Table(name = "inquilino")
public class Inquilino extends PanacheEntityBase {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Integer id;
    public String nombre;
    public String apellido;
    @Column(name = "tipo_identificacion") public String tipoIdentificacion;
    public String identificacion;
    public String telefono;
    public String correo;
}
