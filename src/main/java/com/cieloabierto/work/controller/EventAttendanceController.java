package com.cieloabierto.work.controller;

import com.cieloabierto.work.model.Event;
import com.cieloabierto.work.model.EventAttendance;
import com.cieloabierto.work.model.Membership;
import com.cieloabierto.work.repository.EventAttendanceRepository;
import com.cieloabierto.work.repository.EventRepository;
import com.cieloabierto.work.repository.MembershipRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/attendance")
public class EventAttendanceController {

    private final EventAttendanceRepository eventAttendanceRepository;
    private final EventRepository eventRepository;
    private final MembershipRepository membershipRepository;

    public EventAttendanceController(
            EventAttendanceRepository eventAttendanceRepository,
            EventRepository eventRepository,
            MembershipRepository membershipRepository) {
        this.eventAttendanceRepository = eventAttendanceRepository;
        this.eventRepository = eventRepository;
        this.membershipRepository = membershipRepository;
    }

    @GetMapping
    public ResponseEntity<List<EventAttendance>> getAllEventAttendances() {
        return ResponseEntity.ok(eventAttendanceRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventAttendance> getEventAttendanceById(@PathVariable Long id) {
        return eventAttendanceRepository.findById(id)
                .map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> saveEventAttendance(@RequestBody EventAttendance attendance) {
        //Verificación de campo obligatorios
        if (attendance.getEventId() == null ||
            attendance.getIdCard() == null || attendance.getIdCard().isBlank() ||
            attendance.getName() == null || attendance.getName().isBlank()) {
            return ResponseEntity.badRequest().body("Los campos eventId, idCard y name son obligatorios.");
        }
        //Verificación de la existencia de los otros registros a los que hace referencia este nuevo registro
        Optional<Event> eventOpt = eventRepository.findById(attendance.getEventId());
        if (eventOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No existe un evento con ese eventId.");
        }

        if (attendance.getMembershipId() != null &&
            !membershipRepository.existsById(attendance.getMembershipId())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No existe una membresía con ese membershipId.");
        }


        Integer personsAssistance = attendance.getPersonsAssistance();
        if (personsAssistance == null) {
            personsAssistance = 1;
        } else if (personsAssistance <= 0) {
            return ResponseEntity.badRequest().body("El campo personsAssistance debe ser mayor que cero.");
        }

        Integer attendanceStatus;
        if (attendance.getAttendanceStatus() != null) {
            attendanceStatus = attendance.getAttendanceStatus();
        } else {
            attendanceStatus = 1;
        }
        // 0 es una asistencia inactiva - 1 es una asistencia activa
        Event event = eventOpt.get();
        long currentBooked = eventAttendanceRepository.sumPersonsAssistanceByEventId(event.getId());
        long addedPersons;
        if (attendanceStatus == 0) {
            addedPersons = 0L;
        } else {
            addedPersons = personsAssistance.longValue();
        }

        if (currentBooked + addedPersons > event.getMaximumCapacity()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("No hay cupo suficiente para el evento. Cupo máximo: " +
                            event.getMaximumCapacity() + ", cupo ocupado: " + currentBooked + ".");
        }
        //Si no se ingresa precio se pone en 0 (gratis)
        Integer price = attendance.getPrice();
        if (price == null) {
            price = 0;
        } else if (price < 0) {
            return ResponseEntity.badRequest()
                    .body("El campo price no puede ser negativo.");
        }

        LocalDateTime registrationDate;
        if (attendance.getRegistrationDate() != null) {
            registrationDate = attendance.getRegistrationDate();
        } else {
            registrationDate = LocalDateTime.now();
        }
        //Ingreso de los campos limpios
        // Se fuerza id null para garantizar inserción y se genera código único del lado del servidor
        attendance.setId(null);
        attendance.setId(null);
        attendance.setCode(generateUniqueCode());
        attendance.setIdCard(attendance.getIdCard().trim());
        attendance.setName(attendance.getName().trim());
        attendance.setPersonsAssistance(personsAssistance);
        attendance.setPrice(price);
        attendance.setAttendanceStatus(attendanceStatus);
        attendance.setRegistrationDate(registrationDate);

        if (attendance.getEmail() != null) {
            if (attendance.getEmail().isBlank()) {
                attendance.setEmail(null);
            } else {
                attendance.setEmail(attendance.getEmail().trim());
            }
        }
        EventAttendance saved = eventAttendanceRepository.save(attendance);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
    /**
     * Actualiza la información de una asistencia solamente con los que le llegan en la petición
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateEventAttendance(@PathVariable Long id, @RequestBody EventAttendance incoming) {
        return eventAttendanceRepository.findById(id)
                .map(existing -> {
                    if (incoming.getCode() != null && !incoming.getCode().isBlank()) {
                        String code = incoming.getCode().trim();
                        if (!code.equals(existing.getCode()) &&
                            eventAttendanceRepository.existsByCodeAndIdNot(code, id)) {
                            return ResponseEntity.status(HttpStatus.CONFLICT)
                                    .body("Ya existe otro registro de asistencia con ese code.");
                        }
                        existing.setCode(code);
                    }
                    // Si no se envía eventId en el payload, se evalúa el cupo sobre el evento ya asociado
                    Long targetEventId = incoming.getEventId() != null
                            ? incoming.getEventId()
                            : existing.getEventId();

                    Optional<Event> targetEventOpt = eventRepository.findById(targetEventId);
                    if (targetEventOpt.isEmpty()) {
                        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                .body("No existe un evento con ese eventId.");
                    }

                    if (incoming.getMembershipId() != null) {
                        if (!membershipRepository.existsById(incoming.getMembershipId())) {
                            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                    .body("No existe una membresía con ese membershipId.");
                        }
                        existing.setMembershipId(incoming.getMembershipId());
                    }

                    if (incoming.getPersonsAssistance() != null && incoming.getPersonsAssistance() <= 0) {
                        return ResponseEntity.badRequest()
                                .body("El campo personsAssistance debe ser mayor que cero.");
                    }

                    Integer targetPersons = incoming.getPersonsAssistance() != null
                            ? incoming.getPersonsAssistance()
                            : existing.getPersonsAssistance();

                    Integer targetStatus = incoming.getAttendanceStatus() != null
                            ? incoming.getAttendanceStatus()
                            : existing.getAttendanceStatus();
                    // Se excluye el registro actual para no contabilizar dos veces sus cupos previos
                    Event targetEvent = targetEventOpt.get();
                    long otherBooked = eventAttendanceRepository
                            .sumPersonsAssistanceByEventIdExcludingId(targetEventId, id);
                    long targetBooked = (targetStatus != null && targetStatus == 0)
                            ? 0L
                            : targetPersons.longValue();

                    if (otherBooked + targetBooked > targetEvent.getMaximumCapacity()) {
                        return ResponseEntity.status(HttpStatus.CONFLICT)
                                .body("No hay cupo suficiente para el evento. Cupo máximo: " +
                                        targetEvent.getMaximumCapacity() + ", cupo ocupado por otros registros: " +
                                        otherBooked + ".");
                    }

                    if (incoming.getPrice() != null) {
                        if (incoming.getPrice() < 0) {
                            return ResponseEntity.badRequest()
                                    .body("El campo price no puede ser negativo.");
                        }
                        existing.setPrice(incoming.getPrice());
                    }

                    if (incoming.getEventId() != null) {
                        existing.setEventId(incoming.getEventId());
                    }

                    if (incoming.getPersonsAssistance() != null) {
                        existing.setPersonsAssistance(incoming.getPersonsAssistance());
                    }

                    if (incoming.getIdCard() != null && !incoming.getIdCard().isBlank()) {
                        existing.setIdCard(incoming.getIdCard().trim());
                    }

                    if (incoming.getName() != null && !incoming.getName().isBlank()) {
                        existing.setName(incoming.getName().trim());
                    }

                    if (incoming.getEmail() != null && !incoming.getEmail().isBlank()) {
                        existing.setEmail(incoming.getEmail().trim());
                    }

                    if (incoming.getBirthDate() != null) {
                        existing.setBirthDate(incoming.getBirthDate());
                    }

                    if (incoming.getAttendanceStatus() != null) {
                        existing.setAttendanceStatus(incoming.getAttendanceStatus());
                    }

                    if (incoming.getRegistrationDate() != null) {
                        existing.setRegistrationDate(incoming.getRegistrationDate());
                    }

                    return ResponseEntity.ok(eventAttendanceRepository.save(existing));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
    // Autenticación de miembro por correo o documento para endpoints de autoservicio
    private ResponseEntity<?> verifyMemberForAttendance(String identifier, String password) {
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

    @GetMapping("/by-document/{idCard}")
    public ResponseEntity<?> getAttendancesByDocument(@PathVariable String idCard) {
        String cleanDoc = idCard == null ? "" : idCard.trim();
        if (cleanDoc.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body("El documento de identidad es obligatorio.");
        }

        List<EventAttendance> matches = eventAttendanceRepository.findAll().stream()
                .filter(att -> att.getIdCard() != null && att.getIdCard().equalsIgnoreCase(cleanDoc))
                .toList();

        return ResponseEntity.ok(matches);
    }

    @GetMapping("/member/my-attendances")
    public ResponseEntity<?> getMemberAttendances(
            @RequestParam String identifier,
            @RequestParam String password) {
        ResponseEntity<?> authResponse = verifyMemberForAttendance(identifier, password);
        if (!authResponse.getStatusCode().is2xxSuccessful()) {
            return authResponse;
        }

        Membership member = (Membership) authResponse.getBody();
        // Coincidencia por membershipId o por documento para incluir registros previos sin enlace directo
        List<EventAttendance> matches = eventAttendanceRepository.findAll().stream()
                .filter(att ->
                        (att.getMembershipId() != null && att.getMembershipId().equals(member.getId())) ||
                        (member.getIdCard() != null && att.getIdCard() != null && att.getIdCard().equalsIgnoreCase(member.getIdCard()))
                )
                .toList();

        return ResponseEntity.ok(matches);
    }

    @PutMapping("/member/{attendanceId}")
    public ResponseEntity<?> updateMemberAttendance(
            @PathVariable Long attendanceId,
            @RequestParam String identifier,
            @RequestParam String password,
            @RequestBody EventAttendance incoming) {
        ResponseEntity<?> authResponse = verifyMemberForAttendance(identifier, password);
        if (!authResponse.getStatusCode().is2xxSuccessful()) {
            return authResponse;
        }

        Membership member = (Membership) authResponse.getBody();
        Optional<EventAttendance> attendanceOpt = eventAttendanceRepository.findById(attendanceId);
        if (attendanceOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("No existe el registro de asistencia indicado.");
        }

        EventAttendance existing = attendanceOpt.get();
        boolean belongsToMember =
                (existing.getMembershipId() != null && existing.getMembershipId().equals(member.getId())) ||
                (member.getIdCard() != null && existing.getIdCard() != null && existing.getIdCard().equalsIgnoreCase(member.getIdCard()));

        if (!belongsToMember) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("No tienes permiso para modificar esta asistencia.");
        }

        if (incoming.getPersonsAssistance() != null && incoming.getPersonsAssistance() <= 0) {
            return ResponseEntity.badRequest()
                    .body("La cantidad de cupos debe ser mayor que cero.");
        }

        int targetPersons = incoming.getPersonsAssistance() != null
                ? incoming.getPersonsAssistance()
                : (existing.getPersonsAssistance() != null ? existing.getPersonsAssistance() : 1);

        int targetStatus = incoming.getAttendanceStatus() != null
                ? incoming.getAttendanceStatus()
                : (existing.getAttendanceStatus() != null ? existing.getAttendanceStatus() : 1);

        if (targetStatus != 0 && targetStatus != 1) {
            return ResponseEntity.badRequest()
                    .body("El estado de asistencia solo puede ser 1 (confirmada) o 0 (cancelada).");
        }

        Optional<Event> eventOpt = eventRepository.findById(existing.getEventId());
        if (eventOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("El evento asociado a esta asistencia no existe.");
        }

        Event targetEvent = eventOpt.get();
        long otherBooked = eventAttendanceRepository
                .sumPersonsAssistanceByEventIdExcludingId(targetEvent.getId(), existing.getId());
        long targetBooked = targetStatus == 0 ? 0L : targetPersons;

        if (otherBooked + targetBooked > targetEvent.getMaximumCapacity()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("No hay cupo suficiente para el evento. Cupo máximo: " +
                            targetEvent.getMaximumCapacity() + ", ocupado por otros registros: " + otherBooked + ".");
        }
        // Recálculo del total con descuento de membresía; si se cancela (status = 0), el cobro queda en 0
        int basePrice = targetEvent.getTicketPrice() != null ? targetEvent.getTicketPrice() : 0;
        int discountPercent = member.getDiscount() != null ? member.getDiscount() : 10;
        int unitPriceWithDiscount = Math.max(0, Math.round(basePrice * (100 - discountPercent) / 100.0f));
        int recalculatedPrice = targetStatus == 0 ? 0 : unitPriceWithDiscount * targetPersons;

        existing.setPersonsAssistance(targetPersons);
        existing.setAttendanceStatus(targetStatus);
        existing.setPrice(recalculatedPrice);
        if (existing.getMembershipId() == null) {
            existing.setMembershipId(member.getId());
        }

        EventAttendance saved = eventAttendanceRepository.save(existing);
        return ResponseEntity.ok(saved);
    }

    /*NUEVO ENDPOINT PARA CONSULTAR LA INFO DE MIEMBROS Y PREGARGARLA EN EL FORMULARIO DE INSCRIPCIÓN */
    @GetMapping("/member-profile")
    public ResponseEntity<?> getMemberProfileForRegistration(
            @RequestParam String identifier,
            @RequestParam String password) {
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
        // Se limpia la contraseña antes de serializar la respuesta
        member.setPassword(null);
        return ResponseEntity.ok(member);
    }
    /*________________________________________________________________________________________________ */



    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEventAttendance(@PathVariable Long id) {
        if (!eventAttendanceRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        eventAttendanceRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
    // Genera un código ATT-XXXXXX verificando colisiones en base de datos
    private String generateUniqueCode() {
        String candidate;
        do {
            int number = ThreadLocalRandom.current().nextInt(100000, 999999);
            candidate = "ATT-" + number;
        } while (eventAttendanceRepository.existsByCode(candidate));
        return candidate;
    }
}