package com.cieloabierto.work.controller;

import com.cieloabierto.work.model.AstronomicalObject;
import com.cieloabierto.work.repository.AstronomicalObjectRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/object")
public class AstronomicalObjectController {

    private final AstronomicalObjectRepository astronomicalObjectRepository;

    public AstronomicalObjectController(AstronomicalObjectRepository astronomicalObjectRepository) {
        this.astronomicalObjectRepository = astronomicalObjectRepository;
    }

    @GetMapping
    public ResponseEntity<List<AstronomicalObject>> getAllAstronomicalObjects() {
        return ResponseEntity.ok(astronomicalObjectRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AstronomicalObject> getAstronomicalObjectById(@PathVariable Long id) {
        return astronomicalObjectRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> saveAstronomicalObject(@RequestBody AstronomicalObject astronomicalObject) {
        // Validación de campos obligatorios antes de normalizar
        if (astronomicalObject.getCode() == null || astronomicalObject.getCode().isBlank() ||
            astronomicalObject.getName() == null || astronomicalObject.getName().isBlank()) {
            return ResponseEntity.badRequest()
                    .body("Los campos code y name son obligatorios.");
        }

        String code = astronomicalObject.getCode().trim();
        String name = astronomicalObject.getName().trim();

        // Verificación previa de unicidad para responder 409 en lugar de delegar el fallo a la restricción única de BD
        if (astronomicalObjectRepository.existsByCode(code)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Ya existe un objeto astronómico con ese code.");
        }

        if (astronomicalObjectRepository.existsByName(name)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Ya existe un objeto astronómico con ese name.");
        }

        // Se anula el id para forzar inserción y se persisten code y name recortados
        astronomicalObject.setId(null);
        astronomicalObject.setCode(code);
        astronomicalObject.setName(name);

        // Normalización de campos opcionales: cadenas en blanco pasan a null; el resto se recorta
        if (astronomicalObject.getImage() != null && astronomicalObject.getImage().isBlank()) {
            astronomicalObject.setImage(null);
        } else if (astronomicalObject.getImage() != null) {
            astronomicalObject.setImage(astronomicalObject.getImage().trim());
        }

        if (astronomicalObject.getDescription() != null && astronomicalObject.getDescription().isBlank()) {
            astronomicalObject.setDescription(null);
        } else if (astronomicalObject.getDescription() != null) {
            astronomicalObject.setDescription(astronomicalObject.getDescription().trim());
        }

        if (astronomicalObject.getLocation() != null && astronomicalObject.getLocation().isBlank()) {
            astronomicalObject.setLocation(null);
        } else if (astronomicalObject.getLocation() != null) {
            astronomicalObject.setLocation(astronomicalObject.getLocation().trim());
        }

        AstronomicalObject saved = astronomicalObjectRepository.save(astronomicalObject);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAstronomicalObject(@PathVariable Long id, @RequestBody AstronomicalObject incoming) {
        return astronomicalObjectRepository.findById(id)
                .map(existing -> {
                    // Comprueba colisión de code contra otros registros distintos al actual
                    if (incoming.getCode() != null && !incoming.getCode().isBlank()) {
                        String code = incoming.getCode().trim();
                        if (astronomicalObjectRepository.existsByCodeAndIdNot(code, id)) {
                            return ResponseEntity.status(HttpStatus.CONFLICT)
                                    .body("Ya existe otro objeto astronómico con ese code.");
                        }
                        existing.setCode(code);
                    }

                    // Comprueba colisión de name contra otros registros distintos al actual
                    if (incoming.getName() != null && !incoming.getName().isBlank()) {
                        String name = incoming.getName().trim();
                        if (astronomicalObjectRepository.existsByNameAndIdNot(name, id)) {
                            return ResponseEntity.status(HttpStatus.CONFLICT)
                                    .body("Ya existe otro objeto astronómico con ese name.");
                        }
                        existing.setName(name);
                    }

                    // Actualización parcial de atributos opcionales cuando llegan con contenido no vacío
                    if (incoming.getImage() != null && !incoming.getImage().isBlank()) {
                        existing.setImage(incoming.getImage().trim());
                    }

                    if (incoming.getDescription() != null && !incoming.getDescription().isBlank()) {
                        existing.setDescription(incoming.getDescription().trim());
                    }

                    if (incoming.getLocation() != null && !incoming.getLocation().isBlank()) {
                        existing.setLocation(incoming.getLocation().trim());
                    }

                    return ResponseEntity.ok(astronomicalObjectRepository.save(existing));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAstronomicalObject(@PathVariable Long id) {
        if (!astronomicalObjectRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        astronomicalObjectRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
