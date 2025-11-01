package datum.travels.application.usecase.tarjeta;

import datum.travels.application.dto.tarjeta.AsignarTarjetaRequest;
import datum.travels.application.dto.tarjeta.TarjetaResponse;
import datum.travels.domain.model.Empleado;
import datum.travels.domain.model.Tarjeta;
import datum.travels.domain.repository.EmpleadoRepository;
import datum.travels.domain.repository.TarjetaRepository;
import datum.travels.shared.exception.BusinessException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

/**
 * Caso de uso para asignar una tarjeta a un empleado.
 */
@ApplicationScoped
public class AsignarTarjetaUseCase {

    @Inject
    TarjetaRepository tarjetaRepository;

    @Inject
    EmpleadoRepository empleadoRepository;

    @Transactional
    public TarjetaResponse execute(AsignarTarjetaRequest request) {
        // 1. Validar que la tarjeta exista
        Tarjeta tarjeta = tarjetaRepository.buscarPorId(request.idTarjeta())
            .orElseThrow(() -> new BusinessException("Tarjeta no encontrada con ID: " + request.idTarjeta()));
        
        // 2. Validar que el empleado exista
        Empleado empleado = empleadoRepository.buscarPorId(request.idEmpleado())
            .orElseThrow(() -> new BusinessException("Empleado no encontrado con ID: " + request.idEmpleado()));
        
        // 3. Asignar empleado a la tarjeta
        tarjeta.empleado = empleado;
        
        // 4. Actualizar
        Tarjeta tarjetaActualizada = tarjetaRepository.actualizar(tarjeta);
        
        // 5. Retornar respuesta
        return toResponse(tarjetaActualizada);
    }
    
    private TarjetaResponse toResponse(Tarjeta tarjeta) {
        TarjetaResponse.EmpleadoTarjetaDTO empleadoDTO = null;
        
        if (tarjeta.empleado != null) {
            empleadoDTO = new TarjetaResponse.EmpleadoTarjetaDTO(
                tarjeta.empleado.getIdEmpleado(),
                tarjeta.empleado.getNombre(),
                tarjeta.empleado.getApellido(),
                tarjeta.empleado.getCorreo()
            );
        }
        
        return new TarjetaResponse(
            tarjeta.idTarjeta,
            tarjeta.banco,
            tarjeta.numeroTarjeta,
            tarjeta.fechaExpiracion,
            tarjeta.pais.idPais,
            tarjeta.pais.nombrePais,
            empleadoDTO
        );
    }
}
