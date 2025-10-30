package datum.travels.shared.exception;

/**
 * Excepción para errores al interactuar con Keycloak.
 */
public class KeycloakIntegrationException extends TechnicalException {

    public KeycloakIntegrationException(String mensaje) {
        super(mensaje);
    }

    public KeycloakIntegrationException(String mensaje, Throwable causa) {
        super(mensaje, causa);
    }
}
