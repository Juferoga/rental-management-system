package com.rental.aggregates;

import com.rental.dto.MenuTreeDTO;
import io.quarkus.hibernate.orm.panache.Panache;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Path("/api/v1/menu")
@Produces(MediaType.APPLICATION_JSON)
@Tag(name = "Menu", description = "Árbol de navegación para casas y zonas")
public class MenuResource {

    @GET
    @Path("/tree")
    @Operation(summary = "Obtener árbol de casas y zonas", description = "Retorna casas con sus zonas habitacionales para construir el menú lateral.")
    public List<MenuTreeDTO> tree() {
        List<Object[]> rows = Panache.getEntityManager().createNativeQuery("""
                SELECT c.id AS house_id,
                       c.nombre AS house_name,
                       z.id AS zone_id,
                       z.nombre AS zone_name
                FROM casa c
                LEFT JOIN zona_habitacional z ON z.casa_id = c.id
                ORDER BY c.nombre, z.nombre
                """).getResultList();

        Map<Integer, MenuTreeDTO> houses = new LinkedHashMap<>();
        for (Object[] row : rows) {
            Integer houseId = ((Number) row[0]).intValue();
            String houseName = row[1] != null ? row[1].toString() : "Casa";

            MenuTreeDTO house = houses.computeIfAbsent(houseId, id -> new MenuTreeDTO(id, houseName));

            if (row[2] != null) {
                house.zones.add(new MenuTreeDTO.ZoneItemDTO(
                        ((Number) row[2]).intValue(),
                        row[3] != null ? row[3].toString() : "Zona"
                ));
            }
        }

        return new ArrayList<>(houses.values());
    }
}
