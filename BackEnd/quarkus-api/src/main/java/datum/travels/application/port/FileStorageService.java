package datum.travels.application.port;

/**
 * Puerto para almacenamiento de archivos
 */
public interface FileStorageService {
    
    /**
     * Guarda un archivo
     * @param contenido Contenido del archivo (ej: Base64)
     * @param nombreArchivo Nombre del archivo
     * @param carpeta Carpeta de destino
     * @return URL o path del archivo guardado
     */
    String guardarArchivo(String contenido, String nombreArchivo, String carpeta);
    
    /**
     * Elimina un archivo
     * @param rutaArchivo Ruta del archivo
     * @return true si se eliminó correctamente
     */
    boolean eliminarArchivo(String rutaArchivo);
    
    /**
     * Obtiene la URL pública de un archivo
     * @param rutaArchivo Ruta del archivo
     * @return URL pública
     */
    String obtenerUrlPublica(String rutaArchivo);
}
