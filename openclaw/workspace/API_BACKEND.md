# API del Sistema de Gestión de Arriendos

**Base URL interna (dentro de Docker):** `http://backend:8080/api/v1`

> El skill completo con ejemplos de todos los endpoints está en `/app/instrucciones/rental-backend.md`.
> Lee ese archivo para tener los comandos exactos listos.

## Entidades y Endpoints

### 🏠 Casas (propiedades físicas)
- `GET    /casas`           → listar todas
- `POST   /casas`           → crear nueva
- `PUT    /casas/{id}`      → actualizar completa
- `PATCH  /casas/{id}`      → actualizar parcial
- `DELETE /casas/{id}`      → eliminar

Campos: `id`, `usuario`, `nombre`, `direccion`, `barrio`, `ciudad`, `estado`

### 🚪 Zonas Habitacionales (habitaciones/locales dentro de una casa)
- `GET    /zonas`
- `POST   /zonas`
- `PUT    /zonas/{id}`
- `PATCH  /zonas/{id}`
- `DELETE /zonas/{id}`

Campos: `id`, `casa`, `nombre`, `tipo`, `areaM2`, `valorArriendo`, `estado`

### 👤 Inquilinos
- `GET    /inquilinos`
- `POST   /inquilinos`
- `PUT    /inquilinos/{id}`
- `PATCH  /inquilinos/{id}`
- `DELETE /inquilinos/{id}`

Campos: `id`, `nombre`, `apellido`, `tipoIdentificacion`, `identificacion`, `telefono`, `correo`

### 📄 Contratos
- `GET    /contratos`
- `POST   /contratos`
- `PUT    /contratos/{id}`
- `PATCH  /contratos/{id}`
- `DELETE /contratos/{id}`

Campos: `id`, `inquilino`, `zonaHabitacional`, `fechaFirma`, `fechaInicio`, `fechaFin`, `valorPactado`, `estado`

### 💰 Pagos de Renta
- `GET    /pagos-renta`
- `POST   /pagos-renta`
- `PUT    /pagos-renta/{id}`
- `PATCH  /pagos-renta/{id}`
- `DELETE /pagos-renta/{id}`

Campos: `id`, `contrato`, `anio`, `mes`, `montoEsperado`, `montoPagado`, `fechaPago`, `metodoPago`, `estado`

### 🔒 Depósitos
- `GET    /depositos`
- `POST   /depositos`
- `PUT    /depositos/{id}`
- `PATCH  /depositos/{id}`
- `DELETE /depositos/{id}`

Campos: `id`, `contrato`, `montoInicial`, `montoDisponible`, `estado`

### 📋 Movimientos de Depósito
- `GET    /movimientos-deposito`
- `POST   /movimientos-deposito`
- `PUT    /movimientos-deposito/{id}`
- `PATCH  /movimientos-deposito/{id}`
- `DELETE /movimientos-deposito/{id}`

Campos: `id`, `deposito`, `fecha`, `monto`, `tipo`, `motivo`

### 🔧 Mantenimientos
- `GET    /mantenimientos`
- `POST   /mantenimientos`
- `PUT    /mantenimientos/{id}`
- `PATCH  /mantenimientos/{id}`
- `DELETE /mantenimientos/{id}`

Campos: `id`, `zona`, `usuario`, `fecha`, `descripcion`, `costo`, `estado`

### 💡 Servicios Catálogo
- `GET    /servicios-catalogo`
- `POST   /servicios-catalogo`
- `PUT    /servicios-catalogo/{id}`
- `PATCH  /servicios-catalogo/{id}`
- `DELETE /servicios-catalogo/{id}`

Campos: `id`, `nombre`, `tipo`, `proveedor`

### 🧾 Facturas de Servicio
- `GET    /facturas-servicio`
- `POST   /facturas-servicio`
- `PUT    /facturas-servicio/{id}`
- `PATCH  /facturas-servicio/{id}`
- `DELETE /facturas-servicio/{id}`

Campos: `id`, `casa`, `servicio`, `numeroFactura`, `anio`, `mes`, `fechaVencimiento`, `valorTotal`, `estado`

### 📊 Cargos de Servicio (distribución de factura por inquilino)
- `GET    /cargos-servicio`
- `POST   /cargos-servicio`
- `PUT    /cargos-servicio/{id}`
- `PATCH  /cargos-servicio/{id}`
- `DELETE /cargos-servicio/{id}`

Campos: `id`, `factura`, `contrato`, `montoAsignado`, `estado`

### 🏦 Préstamos
- `GET    /prestamos`
- `POST   /prestamos`
- `PUT    /prestamos/{id}`
- `PATCH  /prestamos/{id}`
- `DELETE /prestamos/{id}`

Campos: `id`, `contrato`, `fecha`, `montoTotal`, `saldoPendiente`, `motivo`, `estado`

### 💳 Pagos de Préstamo
- `GET    /pagos-prestamo`
- `POST   /pagos-prestamo`
- `PUT    /pagos-prestamo/{id}`
- `PATCH  /pagos-prestamo/{id}`
- `DELETE /pagos-prestamo/{id}`

Campos: `id`, `prestamo`, `fecha`, `monto`, `nota`

### 👥 Usuarios (administradores/propietarios)
- `GET    /usuarios`
- `POST   /usuarios`
- `PUT    /usuarios/{id}`
- `PATCH  /usuarios/{id}`
- `DELETE /usuarios/{id}`

Campos: `id`, `nombre`, `apellido`, `correo`, `telefono`, `rol`, `estado`

---

## Ejemplos de uso

```bash
# Listar inquilinos
curl -s http://backend:8080/api/v1/inquilinos | python3 -m json.tool

# Crear inquilino
curl -s -X POST http://backend:8080/api/v1/inquilinos \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Juan","apellido":"Pérez","correo":"j@test.com","telefono":"3001234567","tipoIdentificacion":"CC","identificacion":"123456"}' | python3 -m json.tool

# Registrar pago de renta
curl -s -X POST http://backend:8080/api/v1/pagos-renta \
  -H "Content-Type: application/json" \
  -d '{"contrato":{"id":1},"anio":2026,"mes":3,"montoEsperado":800000,"montoPagado":800000,"fechaPago":"2026-03-01","metodoPago":"transferencia","estado":"PAGADO"}' | python3 -m json.tool
```

## Notas importantes
- Para referencias entre entidades, usa el formato `{"id": N}` (ej: `"contrato":{"id":1}`)
- Las fechas van en formato `YYYY-MM-DD`
- El backend responde en JSON con Content-Type application/json
- Errores 409 = conflicto de datos únicos; 404 = no encontrado; 400 = datos inválidos
- **Lee `BD_SCHEMA.md`** para conocer los valores exactos de cada campo tipo ENUM antes de hacer un POST/PUT. Usar un valor fuera del ENUM causa error 400.
