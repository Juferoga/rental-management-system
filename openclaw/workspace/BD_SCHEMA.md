# BD_SCHEMA.md — Esquema de Base de Datos

> **IMPORTANTE:** Siempre consulta este archivo antes de hacer un POST o PUT.
> Usar un valor de ENUM incorrecto causa error 400 del backend.

---

## Valores ENUM permitidos

### `estado` (estado_general) — usado en `casa`, `zona_habitacional`, `usuario`
```
activo | inactivo | suspendido
```

### `rol` — usado en `usuario`
```
administrador | propietario | asistente
```

### `tipo` — usado en `zona_habitacional`
```
habitacion | apartaestudio | local_comercial | garaje | bodega | otro
```

### `estado` — usado en `contrato`
```
activo | finalizado | cancelado | en_mora
```

### `estado` — usado en `deposito`
```
retenido | devuelto | aplicado
```

### `tipo` — usado en `movimiento_deposito`
```
descuento | reintegro | ajuste
```

### `estado` — usado en `pago_renta`
```
pendiente | parcial | pagado | vencido
```

### `metodoPago` / `metodo_pago` — usado en `pago_renta`
```
efectivo | transferencia_bancaria | nequi | daviplata | cheque | otro
```

### `estado` — usado en `prestamo`
```
activo | saldado | condonado | vencido
```

### `tipo` — usado en `servicio_catalogo`
```
agua | electricidad | gas | internet | telefonia | television | aseo | otro
```

### `estado` — usado en `factura_servicio`
```
pendiente | pagada | vencida | anulada
```

### `estado` — usado en `cargo_servicio`
```
pendiente | cobrado | exonerado
```

### `estado` — usado en `mantenimiento`
```
solicitado | en_progreso | completado | cancelado
```

### `tipoIdentificacion` / `tipo_identificacion` — usado en `inquilino`
```
cedula_ciudadania | cedula_extranjeria | pasaporte | nit | tarjeta_identidad
```

---

## Campos requeridos por entidad (POST)

### `usuario`
```json
{
  "nombre": "string (requerido)",
  "apellido": "string (requerido)",
  "correo": "string único (requerido)",
  "telefono": "string (opcional)",
  "rol": "propietario",
  "estado": "activo"
}
```

### `casa`
```json
{
  "usuario": {"id": 1},
  "nombre": "string (requerido)",
  "direccion": "string (requerido)",
  "barrio": "string (opcional)",
  "ciudad": "string (requerido)",
  "estado": "activo"
}
```

### `zona_habitacional` → endpoint: `/zonas`
```json
{
  "casa": {"id": 1},
  "nombre": "string (requerido)",
  "tipo": "habitacion",
  "areaM2": 12.5,
  "valorArriendo": 500000,
  "estado": "activo"
}
```

### `inquilino`
```json
{
  "nombre": "string (requerido)",
  "apellido": "string (requerido)",
  "tipoIdentificacion": "cedula_ciudadania",
  "identificacion": "string único por tipo (requerido)",
  "telefono": "string (opcional)",
  "correo": "string (opcional)"
}
```

### `contrato`
```json
{
  "inquilino": {"id": 1},
  "zonaHabitacional": {"id": 1},
  "fechaFirma": "2026-01-01",
  "fechaInicio": "2026-01-01",
  "fechaFin": null,
  "valorPactado": 800000,
  "estado": "activo"
}
```
> ⚠️ Una zona no puede tener dos contratos `activo` en el mismo período → error 409.

### `deposito`
```json
{
  "contrato": {"id": 1},
  "montoInicial": 1600000,
  "montoDisponible": 1600000,
  "estado": "retenido"
}
```
> ⚠️ Un contrato solo puede tener UN depósito → error 409 si ya existe.

### `movimiento_deposito` → endpoint: `/movimientos-deposito`
```json
{
  "deposito": {"id": 1},
  "fecha": "2026-03-01",
  "monto": 200000,
  "tipo": "descuento",
  "motivo": "Daño en ventana (requerido)"
}
```

### `pago_renta` → endpoint: `/pagos-renta`
```json
{
  "contrato": {"id": 1},
  "anio": 2026,
  "mes": 3,
  "montoEsperado": 800000,
  "montoPagado": 800000,
  "fechaPago": "2026-03-05",
  "metodoPago": "transferencia_bancaria",
  "estado": "pagado"
}
```
> ⚠️ Combinación `(contrato, anio, mes)` es única → error 409 si ya existe ese período.

### `prestamo`
```json
{
  "contrato": {"id": 1},
  "fecha": "2026-03-01",
  "montoTotal": 500000,
  "saldoPendiente": 500000,
  "motivo": "Ayuda para mudanza (requerido)",
  "estado": "activo"
}
```

### `pago_prestamo` → endpoint: `/pagos-prestamo`
```json
{
  "prestamo": {"id": 1},
  "fecha": "2026-03-10",
  "monto": 100000,
  "nota": "string (opcional)"
}
```

### `servicio_catalogo` → endpoint: `/servicios-catalogo`
```json
{
  "nombre": "Acueducto Bogotá",
  "tipo": "agua",
  "proveedor": "EAAB (opcional)"
}
```

### `factura_servicio` → endpoint: `/facturas-servicio`
```json
{
  "casa": {"id": 1},
  "servicio": {"id": 1},
  "numeroFactura": "FAC-2026-001",
  "anio": 2026,
  "mes": 3,
  "fechaVencimiento": "2026-03-20",
  "valorTotal": 85000,
  "estado": "pendiente"
}
```

### `cargo_servicio` → endpoint: `/cargos-servicio`
```json
{
  "factura": {"id": 1},
  "contrato": {"id": 1},
  "montoAsignado": 85000,
  "estado": "pendiente"
}
```

### `mantenimiento`
```json
{
  "zonaHabitacional": {"id": 1},
  "usuario": {"id": 1},
  "fecha": "2026-03-01",
  "descripcion": "texto libre (requerido)",
  "costo": 150000,
  "estado": "solicitado"
}
```

---

## Restricciones de unicidad (causan 409 si se violan)

| Entidad | Campos únicos |
|---|---|
| `usuario` | `correo` |
| `inquilino` | `(tipoIdentificacion, identificacion)` |
| `deposito` | `contrato_id` (1 depósito por contrato) |
| `pago_renta` | `(contrato_id, anio, mes)` |
| `contrato` | Una zona no puede tener dos contratos `activo` simultáneos |
| `factura_servicio` | `(servicio_id, numero_factura)` y `(casa_id, servicio_id, anio, mes)` |
| `cargo_servicio` | `(factura_id, contrato_id)` |
| `servicio_catalogo` | `(nombre, proveedor)` |
