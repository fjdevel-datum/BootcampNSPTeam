package datum.travels.application.usecase.gasto;

import datum.travels.application.dto.gasto.ActualizarGastoRequest;
import datum.travels.application.dto.gasto.GastoResponse;
import datum.travels.domain.exception.ResourceNotFoundException;
import datum.travels.domain.model.CategoriaGasto;
import datum.travels.domain.model.Gasto;
import datum.travels.domain.model.Tarjeta;
import datum.travels.domain.repository.GastoRepository;
import datum.travels.infrastructure.adapter.external.ConversionMonedaService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Locale;
import java.util.Objects;

/**
 * Caso de Uso: Actualizar un gasto existente
 *
 * Permite modificar lugar, fecha, tarjeta, categoria, moneda y monto.
 * Cuando cambia la moneda o el monto se recalcula el valor en USD.
 */
@ApplicationScoped
public class ActualizarGastoUseCase {

    @Inject
    GastoRepository gastoRepository;

    @Inject
    EntityManager entityManager;

    @Inject
    ConversionMonedaService conversionMonedaService;

    @Transactional
    public GastoResponse execute(Long idGasto, ActualizarGastoRequest request) {
        Gasto gasto = gastoRepository.findByIdGasto(idGasto)
                .orElseThrow(() -> new ResourceNotFoundException("Gasto no encontrado con ID: " + idGasto));

        if (request.descripcion() != null) {
            gasto.descripcion = request.descripcion().strip();
        }

        if (request.lugar() != null) {
            gasto.lugar = request.lugar().strip();
        }

        if (request.fecha() != null) {
            gasto.fecha = request.fecha();
        }

        if (request.idCategoria() != null) {
            CategoriaGasto categoria = entityManager.find(CategoriaGasto.class, request.idCategoria());
            if (categoria == null) {
                throw new ResourceNotFoundException("Categoria no encontrada con ID: " + request.idCategoria());
            }
            gasto.categoria = categoria;
        }

        if (Boolean.TRUE.equals(request.sinTarjeta())) {
            gasto.tarjeta = null;
        } else if (request.idTarjeta() != null) {
            Tarjeta tarjeta = entityManager.find(Tarjeta.class, request.idTarjeta());
            if (tarjeta == null) {
                throw new ResourceNotFoundException("Tarjeta no encontrada con ID: " + request.idTarjeta());
            }
            gasto.tarjeta = tarjeta;
        }

        boolean montoActualizado = false;
        if (request.monto() != null) {
            gasto.monto = request.monto();
            montoActualizado = true;
        }

        boolean monedaActualizada = false;
        if (request.moneda() != null) {
            String monedaNormalizada = request.moneda().trim().toUpperCase(Locale.ROOT);
            if (!Objects.equals(monedaNormalizada, gasto.moneda)) {
                gasto.moneda = monedaNormalizada;
                monedaActualizada = true;
            }
        }

        if (montoActualizado || monedaActualizada) {
            BigDecimal montoBase = gasto.monto;
            String moneda = gasto.moneda != null ? gasto.moneda : "USD";

            if ("USD".equalsIgnoreCase(moneda)) {
                gasto.montoUsd = montoBase;
                gasto.tasaCambio = BigDecimal.ONE;
            } else {
                BigDecimal montoUsd = conversionMonedaService.convertirAUSD(montoBase, moneda);
                gasto.montoUsd = montoUsd;
                gasto.tasaCambio = conversionMonedaService.obtenerTasaCambio(moneda, "USD");
            }
            gasto.fechaTasaCambio = LocalDate.now();
        }

        return GastoResponse.from(gasto);
    }
}




