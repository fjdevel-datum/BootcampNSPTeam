package datum.travels.application.usecase.gasto;

import datum.travels.application.dto.gasto.CrearGastoRequest;
import datum.travels.application.dto.gasto.GastoResponse;
import datum.travels.domain.exception.ResourceNotFoundException;
import datum.travels.domain.model.CategoriaGasto;
import datum.travels.domain.model.Evento;
import datum.travels.domain.model.Gasto;
import datum.travels.domain.model.Tarjeta;
import datum.travels.domain.repository.EventoRepository;
import datum.travels.domain.repository.GastoRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;

/**
 * Caso de Uso: Crear un Nuevo Gasto
 * 
 * Responsabilidades:
 * 1. Validar que el evento existe
 * 2. Validar que la categoría existe
 * 3. Validar que la tarjeta existe (si se proporcionó)
 * 4. Crear el gasto
 * 5. Persistir y retornar
 */
@ApplicationScoped
public class CrearGastoUseCase {

    @Inject
    GastoRepository gastoRepository;

    @Inject
    EventoRepository eventoRepository;

    @Inject
    EntityManager entityManager;

    /**
     * Crea un nuevo gasto vinculado a un evento
     *
     * @param request Datos del gasto a crear
     * @return GastoResponse con el gasto creado
     * @throws ResourceNotFoundException si el evento, categoría o tarjeta no existen
     */
    @Transactional
    public GastoResponse execute(CrearGastoRequest request) {
        
        // 1. Buscar y validar el evento
        Evento evento = eventoRepository.findByIdEvento(request.idEvento())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Evento no encontrado con ID: " + request.idEvento()
                ));

        // 2. Buscar y validar la categoría
        CategoriaGasto categoria = entityManager.find(CategoriaGasto.class, request.idCategoria());
        if (categoria == null) {
            throw new ResourceNotFoundException(
                    "Categoría no encontrada con ID: " + request.idCategoria()
            );
        }

        // 3. Buscar la tarjeta (opcional)
        Tarjeta tarjeta = null;
        if (request.idTarjeta() != null) {
            tarjeta = entityManager.find(Tarjeta.class, request.idTarjeta());
            if (tarjeta == null) {
                throw new ResourceNotFoundException(
                        "Tarjeta no encontrada con ID: " + request.idTarjeta()
                );
            }
        }

        // 4. Crear el gasto
        Gasto gasto = new Gasto();
        gasto.evento = evento;
        gasto.categoria = categoria;
        gasto.tarjeta = tarjeta;
        gasto.descripcion = request.descripcion();
        gasto.lugar = request.lugar();
        gasto.fecha = request.fecha();
        gasto.monto = request.monto();

        // 5. Persistir
        Gasto gastoCreado = gastoRepository.save(gasto);

        return GastoResponse.from(gastoCreado);
    }
}
