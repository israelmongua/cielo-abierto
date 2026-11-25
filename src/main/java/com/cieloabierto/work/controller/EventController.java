package com.cieloabierto.work.controller;

import com.cieloabierto.work.model.Event;
import com.cieloabierto.work.repository.EventRepository;
import com.cieloabierto.work.model.Membership;
import com.cieloabierto.work.repository.MembershipRepository;
import com.cieloabierto.work.repository.AstronomicalObjectRepository;
import java.util.concurrent.ThreadLocalRandom;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/event")
public class EventController {

    private final EventRepository eventRepository;
    private final MembershipRepository membershipRepository;
    private final AstronomicalObjectRepository astronomicalObjectRepository;

    public EventController(
            EventRepository eventRepository,
            MembershipRepository membershipRepository,
            AstronomicalObjectRepository astronomicalObjectRepository) {
        this.eventRepository = eventRepository;
        this.membershipRepository = membershipRepository;
        this.astronomicalObjectRepository = astronomicalObjectRepository;
    }

    @GetMapping
    public ResponseEntity<List<Event>> getAllEvents() {
        return ResponseEntity.ok(eventRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Event> getEventById(@PathVariable Long id) {
        return eventRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> saveEvent(@RequestBody Event event) {
        if (event.getCreatorId() == null) {
            return ResponseEntity.badRequest()
                    .body("El campo creatorId es obligatorio.");
        }

        // Verifica existencia de la membresía creadora antes de validar el resto del payload
        if (!membershipRepository.existsById(event.getCreatorId())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("No existe una membresía con ese creatorId.");
        }

        ResponseEntity<?> validationError = validateAndNormalizeForCreate(event);
        if (validationError != null) {
            return validationError;
        }

        // Se fuerza id null para garantizar inserción y se asigna código numérico único
        event.setId(null);
        event.setCode(generateUniqueCode());

        Event saved = eventRepository.save(event);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PostMapping("/publish")
    public ResponseEntity<?> publishEvent(
            @RequestParam String identifier,
            @RequestParam String password,
            @RequestBody Event event) {
        String cleanId = identifier == null ? "" : identifier.trim();

        // Resuelve la membresía por correo, documento, código o id
        Optional<Membership> memberOpt = membershipRepository.findAll().stream()
                .filter(m ->
                        (m.getEmail() != null && m.getEmail().equalsIgnoreCase(cleanId)) ||
                        (m.getIdCard() != null && m.getIdCard().equalsIgnoreCase(cleanId)) ||
                        (String.valueOf(m.getCode()).equals(cleanId)) ||
                        (m.getId() != null && String.valueOf(m.getId()).equals(cleanId))
                )
                .findFirst();

        if (memberOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("No se encontró ninguna membresía con ese correo, documento o código.");
        }

        Membership member = memberOpt.get();
        if (member.getPassword() == null || !member.getPassword().equals(password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Contraseña de membresía incorrecta.");
        }

        if (!membershipRepository.existsById(member.getId())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("La membresía asociada no existe.");
        }

        // Vincula la autoría del evento a la membresía autenticada
        event.setCreatorId(member.getId());

        ResponseEntity<?> validationError = validateAndNormalizeForCreate(event);
        if (validationError != null) {
            return validationError;
        }

        event.setId(null);
        event.setCode(generateUniqueCode());

        Event saved = eventRepository.save(event);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateEvent(@PathVariable Long id, @RequestBody Event incoming) {
        return eventRepository.findById(id)
                .map(existing -> {
                    if (incoming.getCode() != null &&
                        !incoming.getCode().equals(existing.getCode()) &&
                        eventRepository.existsByCodeAndIdNot(incoming.getCode(), id)) {
                        return ResponseEntity.status(HttpStatus.CONFLICT)
                                .body("Ya existe otro evento con ese code.");
                    }

                    if (incoming.getCreatorId() != null &&
                        !membershipRepository.existsById(incoming.getCreatorId())) {
                        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                .body("No existe una membresía con ese creatorId.");
                    }

                    if (incoming.getIdObject() != null &&
                        !astronomicalObjectRepository.existsById(incoming.getIdObject())) {
                        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                .body("No existe un objeto astronómico con ese idObject.");
                    }

                    // Evalúa el rango temporal combinando fechas entrantes con las ya persistidas
                    var effectiveStart = incoming.getStartDate() != null
                            ? incoming.getStartDate()
                            : existing.getStartDate();
                    var effectiveEnd = incoming.getEndDate() != null
                            ? incoming.getEndDate()
                            : existing.getEndDate();
                    if (effectiveStart != null && effectiveEnd != null && effectiveEnd.isBefore(effectiveStart)) {
                        return ResponseEntity.badRequest()
                                .body("La fecha endDate no puede ser anterior a startDate.");
                    }

                    if (incoming.getMaximumCapacity() != null && incoming.getMaximumCapacity() <= 0) {
                        return ResponseEntity.badRequest()
                                .body("El campo maximumCapacity debe ser mayor que cero.");
                    }

                    if (incoming.getTicketPrice() != null && incoming.getTicketPrice() < 0) {
                        return ResponseEntity.badRequest()
                                .body("El campo ticketPrice no puede ser negativo.");
                    }

                    // Actualización parcial: solo se sobrescriben los campos presentes en el payload
                    if (incoming.getCode() != null) {
                        existing.setCode(incoming.getCode());
                    }

                    if (incoming.getType() != null && !incoming.getType().isBlank()) {
                        existing.setType(incoming.getType().trim());
                    }

                    if (incoming.getTitle() != null && !incoming.getTitle().isBlank()) {
                        existing.setTitle(incoming.getTitle().trim());
                    }

                    if (incoming.getDescription() != null && !incoming.getDescription().isBlank()) {
                        existing.setDescription(incoming.getDescription().trim());
                    }

                    if (incoming.getCreatorId() != null) {
                        existing.setCreatorId(incoming.getCreatorId());
                    }

                    if (incoming.getIdObject() != null) {
                        existing.setIdObject(incoming.getIdObject());
                    }

                    if (incoming.getTicketPrice() != null) {
                        existing.setTicketPrice(incoming.getTicketPrice());
                    }

                    if (incoming.getLocation() != null && !incoming.getLocation().isBlank()) {
                        existing.setLocation(incoming.getLocation().trim());
                    }

                    if (incoming.getEventImage() != null && !incoming.getEventImage().isBlank()) {
                        existing.setEventImage(incoming.getEventImage().trim());
                    }

                    if (incoming.getMaximumCapacity() != null) {
                        existing.setMaximumCapacity(incoming.getMaximumCapacity());
                    }

                    if (incoming.getStartDate() != null) {
                        existing.setStartDate(incoming.getStartDate());
                    }

                    if (incoming.getEndDate() != null) {
                        existing.setEndDate(incoming.getEndDate());
                    }

                    return ResponseEntity.ok(eventRepository.save(existing));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Validación de credenciales de membresía por correo o documento
    private ResponseEntity<?> verifyMemberCredentials(String identifier, String password) {
        String cleanIdentifier = identifier == null ? "" : identifier.trim();
        if (cleanIdentifier.isEmpty() || password == null || password.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Debes ingresar tu correo o documento y tu contraseña.");
        }

        Optional<Membership> memberOpt = membershipRepository.findAll().stream()
                .filter(m ->
                        (m.getEmail() != null && m.getEmail().equalsIgnoreCase(cleanIdentifier)) ||
                        (m.getIdCard() != null && m.getIdCard().equalsIgnoreCase(cleanIdentifier))
                )
                .findFirst();

        if (memberOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("No se encontró ninguna membresía con ese correo o documento.");
        }

        Membership member = memberOpt.get();
        if (member.getPassword() == null || !member.getPassword().equals(password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Contraseña de membresía incorrecta.");
        }

        return ResponseEntity.ok(member);
    }

    @GetMapping("/member/published-events")
    public ResponseEntity<?> getPublishedEventsByMember(
            @RequestParam String identifier,
            @RequestParam String password) {
        ResponseEntity<?> authResponse = verifyMemberCredentials(identifier, password);
        if (!authResponse.getStatusCode().is2xxSuccessful()) {
            return authResponse;
        }

        Membership member = (Membership) authResponse.getBody();
        List<Event> publishedEvents = eventRepository.findAll().stream()
                .filter(ev -> ev.getCreatorId() != null && ev.getCreatorId().equals(member.getId()))
                .toList();

        return ResponseEntity.ok(publishedEvents);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        if (!eventRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        eventRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // Valida campos requeridos, rangos, asociación astronómica y normaliza strings
    private ResponseEntity<?> validateAndNormalizeForCreate(Event event) {
        if (event.getType() == null || event.getType().isBlank() ||
            event.getTitle() == null || event.getTitle().isBlank() ||
            event.getLocation() == null || event.getLocation().isBlank() ||
            event.getMaximumCapacity() == null ||
            event.getStartDate() == null ||
            event.getEndDate() == null) {
            return ResponseEntity.badRequest()
                    .body("Los campos type, title, location, maximumCapacity, startDate y endDate son obligatorios.");
        }

        if (event.getMaximumCapacity() <= 0) {
            return ResponseEntity.badRequest()
                    .body("El campo maximumCapacity debe ser mayor que cero.");
        }

        if (event.getEndDate().isBefore(event.getStartDate())) {
            return ResponseEntity.badRequest()
                    .body("La fecha endDate no puede ser anterior a startDate.");
        }

        if (event.getTicketPrice() == null) {
            event.setTicketPrice(0);
        } else if (event.getTicketPrice() < 0) {
            return ResponseEntity.badRequest()
                    .body("El campo ticketPrice no puede ser negativo.");
        }

        if ("ASTRONOMICAL".equalsIgnoreCase(event.getType().trim()) && event.getIdObject() == null) {
            return ResponseEntity.badRequest()
                    .body("Los eventos astronómicos requieren un objeto astronómico asociado.");
        }

        if (event.getIdObject() != null &&
            !astronomicalObjectRepository.existsById(event.getIdObject())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("No existe un objeto astronómico con ese idObject.");
        }

        event.setType(event.getType().trim());
        event.setTitle(event.getTitle().trim());
        event.setLocation(event.getLocation().trim());

        // Cadenas en blanco en campos opcionales se convierten a null; el resto se recorta
        if (event.getDescription() != null) {
            event.setDescription(event.getDescription().isBlank() ? null : event.getDescription().trim());
        }
        if (event.getEventImage() != null) {
            event.setEventImage(event.getEventImage().isBlank() ? null : event.getEventImage().trim());
        }

        return null;
    }

    // Genera un código entero de 6 dígitos sin colisiones en eventRepository
    private Integer generateUniqueCode() {
        int candidate;
        do {
            candidate = ThreadLocalRandom.current().nextInt(100000, 999999);
        } while (eventRepository.existsByCode(candidate));
        return candidate;
    }
}
