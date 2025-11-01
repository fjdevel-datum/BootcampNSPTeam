package datum.travels.application.usecase.tarjeta;

import datum.travels.application.dto.tarjeta.TarjetaRequest;
import datum.travels.application.dto.tarjeta.TarjetaResponse;
import datum.travels.domain.model.Empleado;
import datum.travels.domain.model.Pais;
import datum.travels.domain.model.Tarjeta;
import datum.travels.domain.repository.EmpleadoRepository;
import datum.travels.domain.repository.PaisRepository;
import datum.travels.domain.repository.TarjetaRepository;
import datum.travels.shared.exception.BusinessException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

/**
 * Caso de uso para crear una nueva tarjeta corporativa.
 */
@ApplicationScoped
public class CrearTarjetaUseCase {

    @Inject
    TarjetaRepository tarjetaRepository;

    @Inject
    PaisRepository paisRepository;
    
    @Inject
    EmpleadoRepository empleadoRepository;

    @Transactional
    public TarjetaResponse execute(TarjetaRequest request) {
        // 1. Validar que no exista tarjeta con el mismo número
        if (tarjetaRepository.existePorNumero(request.numeroTarjeta())) {
            throw new BusinessException("Ya existe una tarjeta con el número: " + request.numeroTarjeta());
        }
        
        // 2. Validar que el país exista
        Pais pais = paisRepository.buscarPorId(request.idPais())
            .orElseThrow(() -> new BusinessException("País no encontrado con ID: " + request.idPais()));
        
        // 3. Si se proporciona empleado, validar que exista
        Empleado empleado = null;
        if (request.idEmpleado() != null) {
            empleado = empleadoRepository.buscarPorId(request.idEmpleado())
                .orElseThrow(() -> new BusinessException("Empleado no encontrado con ID: " + request.idEmpleado()));
        }
        
        // 4. Crear la tarjeta
        Tarjeta tarjeta = new Tarjeta();
        tarjeta.banco = request.banco();
        tarjeta.numeroTarjeta = request.numeroTarjeta();
        tarjeta.fechaExpiracion = request.fechaExpiracion();
        tarjeta.pais = pais;
        tarjeta.empleado = empleado;
        
        // 5. Guardar
        Tarjeta tarjetaGuardada = tarjetaRepository.guardar(tarjeta);
        
        // 6. Retornar respuesta
        return toResponse(tarjetaGuardada);
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
