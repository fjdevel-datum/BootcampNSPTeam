# 📖 Documentación Backend - Datum Travels

## 🎯 Guía de Lectura para tu Exposición

Esta carpeta contiene **5 documentos clave** que te ayudarán a defender tu proyecto backend con confianza.

---

## 📋 Índice de Documentos

### 1️⃣ [RESUMEN_EJECUTIVO.md](./RESUMEN_EJECUTIVO.md) 
**⏱️ Tiempo de lectura: 10 minutos**

**¿Qué contiene?**
- Elevator pitch de 30 segundos
- Diagrama visual de la arquitectura
- Flujo completo de una petición HTTP
- Tabla resumen de patrones y tecnologías
- Métricas de impacto (87% ahorro de tiempo)

**👉 Lee esto PRIMERO para tener una visión general.**

---

### 2️⃣ [ARQUITECTURA_Y_PATRONES.md](./ARQUITECTURA_Y_PATRONES.md)
**⏱️ Tiempo de lectura: 20 minutos**

**¿Qué contiene?**
- Explicación detallada de Clean Architecture
- Por qué es la mejor arquitectura (5 razones)
- Estructura de carpetas del proyecto
- 7 patrones de diseño implementados con ejemplos
- Comparación con otras arquitecturas

**👉 Lee esto para ENTENDER la arquitectura y justificar decisiones.**

---

### 3️⃣ [HERRAMIENTAS_Y_TECNOLOGIAS.md](./HERRAMIENTAS_Y_TECNOLOGIAS.md)
**⏱️ Tiempo de lectura: 25 minutos**

**¿Qué contiene?**
- Análisis completo de `pom.xml`
- Explicación de cada dependencia (Quarkus, Hibernate, Panache, etc.)
- Configuraciones clave de `application.properties`
- Por qué elegimos cada herramienta (vs alternativas)
- Tabla comparativa del stack tecnológico

**👉 Lee esto para DOMINAR las herramientas y responder preguntas técnicas.**

---

### 4️⃣ [GUIA_EXPOSICION.md](./GUIA_EXPOSICION.md)
**⏱️ Tiempo de lectura: 15 minutos**

**¿Qué contiene?**
- Respuestas a 15+ preguntas frecuentes de examinadores
- Decisiones técnicas clave (Quarkus vs Spring, Clean Arch, etc.)
- Checklist pre-exposición
- Consejos de presentación
- Frase de cierre con impacto

**👉 Lee esto ANTES de la exposición para preparar respuestas.**

---

### 5️⃣ [EJEMPLOS_CODIGO.md](./EJEMPLOS_CODIGO.md)
**⏱️ Tiempo de lectura: 30 minutos**

**¿Qué contiene?**
- Código real del proyecto explicado línea por línea
- Ejemplos de cada capa de Clean Architecture
- Implementación de patrones (Repository, Adapter, DTO, etc.)
- Fragmentos para mostrar en pantalla durante la exposición

**👉 Lee esto para MOSTRAR código en vivo y explicar implementación.**

---

## 🗺️ Plan de Estudio Recomendado

### Si tienes 1 HORA:
1. **RESUMEN_EJECUTIVO.md** (10 min) → Visión general
2. **GUIA_EXPOSICION.md** (15 min) → Preguntas frecuentes
3. **ARQUITECTURA_Y_PATRONES.md** (20 min) → Arquitectura
4. Repasar el **Elevator Pitch** (5 min)
5. Abrir Swagger UI y probar un endpoint (10 min)

### Si tienes 2 HORAS:
1. **RESUMEN_EJECUTIVO.md** (10 min)
2. **ARQUITECTURA_Y_PATRONES.md** (25 min)
3. **HERRAMIENTAS_Y_TECNOLOGIAS.md** (30 min)
4. **GUIA_EXPOSICION.md** (20 min)
5. Revisar **EJEMPLOS_CODIGO.md** (20 min)
6. Practicar respuestas en voz alta (15 min)

### Si tienes 4+ HORAS (RECOMENDADO):
1. Leer todos los documentos en orden
2. Abrir el código del proyecto y comparar con los ejemplos
3. Ejecutar el backend y probar endpoints con Swagger UI
4. Practicar explicación de la arquitectura con diagrama
5. Preparar demo en vivo (crear evento, listar gastos)

---

## 🎯 Objetivos de Aprendizaje

Después de leer esta documentación, deberías poder:

- ✅ Explicar Clean Architecture en 2 minutos
- ✅ Describir el flujo de una petición HTTP de inicio a fin
- ✅ Justificar por qué Quarkus y no Spring Boot
- ✅ Mencionar al menos 5 patrones de diseño implementados
- ✅ Explicar cómo funciona la autenticación con Keycloak/JWT
- ✅ Listar 10+ tecnologías del stack y explicar para qué sirven
- ✅ Mostrar código en pantalla y explicar su propósito
- ✅ Responder preguntas difíciles con confianza

---

## 🔑 Conceptos Clave a Memorizar

### Arquitectura
- **Clean Architecture:** 4 capas (Domain, Application, Infrastructure, Shared)
- **Independencia de frameworks:** La lógica de negocio NO depende de Quarkus
- **Testeable:** Use Cases se pueden probar sin BD

### Tecnologías
- **Quarkus 3.27.0:** 10x más rápido que Spring Boot
- **Panache:** 50% menos código que JPA tradicional
- **Keycloak:** Autenticación con JWT (OAuth2/OIDC)

### Patrones
1. Repository Pattern
2. Use Case Pattern
3. DTO Pattern
4. Adapter Pattern
5. Dependency Injection
6. Mapper Pattern
7. Exception Handler Pattern

### Métricas
- **Arranque:** 0.042s (vs 9s Spring Boot)
- **Memoria:** 12 MB (vs 70 MB Spring Boot)
- **ROI:** 87% reducción de tiempo en reportes

---

## 📊 Estructura de la Presentación Sugerida

### 1. Introducción (2 minutos)
- ¿Qué problema resuelve Datum Travels?
- Elevator pitch

### 2. Arquitectura (5 minutos)
- Mostrar diagrama de Clean Architecture
- Explicar flujo de una petición
- Mencionar ventajas de la arquitectura

### 3. Tecnologías (5 minutos)
- Stack tecnológico principal
- Por qué Quarkus (performance)
- Integraciones clave (Keycloak, Azure, OCR)

### 4. Patrones de Diseño (3 minutos)
- Repository Pattern (ejemplo)
- Use Case Pattern (ejemplo)
- Adapter Pattern (ejemplo)

### 5. Demo en Vivo (5 minutos)
- Abrir Swagger UI
- Login con Keycloak
- Crear un evento
- Listar gastos
- Mostrar código de un Use Case

### 6. Resultados (2 minutos)
- Métricas de impacto (87% ahorro)
- Características destacadas
- Mejoras futuras

### 7. Q&A (Resto del tiempo)
- Usar GUIA_EXPOSICION.md para responder

---

## 🎤 Preguntas Críticas a Preparar

### Arquitectura
1. ¿Por qué Clean Architecture y no MVC tradicional?
2. ¿Qué ventaja tiene separar el Domain de Infrastructure?
3. ¿Cómo se testea un Use Case sin base de datos?

### Tecnologías
4. ¿Por qué Quarkus y no Spring Boot?
5. ¿Qué es Panache y por qué lo usaste?
6. ¿Cómo funciona la autenticación con Keycloak?

### Código
7. ¿Qué es un DTO y por qué no expones entidades JPA?
8. ¿Cómo funciona el patrón Repository en tu proyecto?
9. ¿Qué pasa si la API de conversión de monedas falla?

### Integración
10. ¿Cómo garantizas que un empleado solo vea sus eventos?
11. ¿Cómo generas y envías reportes Excel?
12. ¿Cómo manejas archivos subidos desde el frontend?

**💡 Todas estas preguntas están respondidas en GUIA_EXPOSICION.md**

---

## 🛠️ Recursos Adicionales

### Código del Proyecto
- **EventoController.java:** Ejemplo de REST adapter
- **CrearEventoUseCase.java:** Ejemplo de Use Case
- **EventoRepositoryImpl.java:** Ejemplo de implementación Panache
- **application.properties:** Todas las configuraciones

### Herramientas para Demo
- **Swagger UI:** http://localhost:8081/swagger-ui
- **Keycloak Admin:** http://localhost:8180
- **Oracle SQL Developer:** Visualizar datos en BD

### Enlaces de Referencia
- Quarkus Docs: https://quarkus.io/guides/
- Clean Architecture (Uncle Bob): https://blog.cleancoder.com/
- Keycloak Docs: https://www.keycloak.org/documentation

---

## ✅ Checklist Final

**Antes de la exposición:**
- [ ] Leí al menos RESUMEN_EJECUTIVO.md y GUIA_EXPOSICION.md
- [ ] Puedo explicar Clean Architecture en 2 minutos
- [ ] Conozco el flujo completo de una petición HTTP
- [ ] Memorizé el Elevator Pitch
- [ ] Sé responder "¿Por qué Quarkus y no Spring Boot?"
- [ ] Tengo Swagger UI funcionando en mi laptop
- [ ] Probé login + crear evento + listar gastos
- [ ] Preparé al menos 1 fragmento de código para mostrar
- [ ] Conozco las métricas clave (87% ahorro, 0.042s arranque)
- [ ] Tengo respuesta para "¿Qué mejorarías con más tiempo?"

---

## 💡 Consejo Final

**No intentes memorizar todo.** 

Enfócate en:
1. **Entender** la arquitectura (por qué, no solo qué)
2. **Justificar** tus decisiones técnicas
3. **Mostrar** código real (no teoría abstracta)
4. **Ser honesto** con limitaciones y mejoras futuras

**La confianza viene de entender, no de memorizar. 🚀**

---

## 🆘 ¿Necesitas Ayuda?

Si durante tu estudio tienes dudas:
1. Revisa el código real del proyecto (compara con EJEMPLOS_CODIGO.md)
2. Prueba el sistema en Swagger UI para ver cómo funciona
3. Lee la sección de FAQ en GUIA_EXPOSICION.md
4. Consulta la documentación oficial de Quarkus/Keycloak

---

**¡Mucho éxito en tu exposición! 🎓**

Haz que se note que no solo escribiste código, sino que **entiendes** lo que construiste.
