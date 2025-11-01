package datum.travels.application.usecase.tarjeta;

import datum.travels.application.dto.tarjeta.TarjetaResponse;
import datum.travels.domain.model.Tarjeta;
import datum.travels.domain.repository.TarjetaRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Caso de uso para listar todas las tarjetas corporativas.
 */
@ApplicationScoped
public class ListarTarjetasUseCase {

    @Inject
    TarjetaRepository tarjetaRepository;

    public List<TarjetaResponse> execute() {
        List<Tarjeta> tarjetas = tarjetaRepository.listarTodas();
        
        return tarjetas.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
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
        
        String nombrePais = tarjeta.pais != null ? tarjeta.pais.nombrePais : null;
        Long idPais = tarjeta.pais != null ? tarjeta.pais.idPais : null;
        
        return new TarjetaResponse(
            tarjeta.idTarjeta,
            tarjeta.banco,
            tarjeta.numeroTarjeta,
            tarjeta.fechaExpiracion,
            idPais,
            nombrePais,
            empleadoDTO
        );
    }
}
