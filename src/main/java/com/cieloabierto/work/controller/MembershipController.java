package com.cieloabierto.work.controller;

import com.cieloabierto.work.model.Membership;
import com.cieloabierto.work.repository.MembershipRepository;
import java.util.List;
import java.time.LocalDateTime;
import java.util.concurrent.ThreadLocalRandom;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/membership")
public class MembershipController {

    private final MembershipRepository membershipRepository;

    public MembershipController(MembershipRepository membershipRepository) {
        this.membershipRepository = membershipRepository;
    }

    @GetMapping
    public ResponseEntity<List<Membership>> getAllMemberships() {
        return ResponseEntity.ok(membershipRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Membership> getMembershipById(@PathVariable Long id) {
        return membershipRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> saveMembership(@RequestBody Membership membership) {
        // Campos obligatorios mínimos para alta de membresía
        if (membership.getName() == null || membership.getName().isBlank() ||
            membership.getIdCard() == null || membership.getIdCard().isBlank() ||
            membership.getPassword() == null || membership.getPassword().isBlank()) {
            return ResponseEntity.badRequest()
                    .body("Los campos name, idCard y password son obligatorios.");
        }

        // Validación de unicidad por documento de identidad
        String idCard = membership.getIdCard().trim();
        if (membershipRepository.existsByIdCard(idCard)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Ya existe una membresía con ese idCard.");
        }

        // Normalización de email opcional: cadenas en blanco pasan a null; si existe, se valida unicidad
        String email = membership.getEmail();
        if (email != null && !email.isBlank()) {
            email = email.trim();
            if (membershipRepository.existsByEmail(email)) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body("Ya existe una membresía con ese email.");
            }
        } else {
            email = null;
        }

        Integer generatedCode = generateUniqueCode();

        // Vigencia inicial por defecto de un mes a partir de la creación
        LocalDateTime startDate = LocalDateTime.now();
        LocalDateTime endDate = startDate.plusMonths(1);

        // Se fuerza id null para garantizar inserción y se asignan valores calculados por el servidor
        membership.setId(null);
        membership.setCode(generatedCode);
        membership.setName(membership.getName().trim());
        membership.setIdCard(idCard);
        membership.setEmail(email);
        if (membership.getDiscount() == null) {
            membership.setDiscount(10);
        }
        membership.setStartDate(startDate);
        membership.setEndDate(endDate);

        Membership saved = membershipRepository.save(membership);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateMembership(@PathVariable Long id, @RequestBody Membership incoming) {
        return membershipRepository.findById(id)
                .map(existing -> {
                    // Comprobación de unicidad contra otros registros distintos al id actual
                    if (incoming.getCode() != null &&
                        membershipRepository.existsByCodeAndIdNot(incoming.getCode(), id)) {
                        return ResponseEntity.status(HttpStatus.CONFLICT)
                                .body("Ya existe otra membresía con ese code.");
                    }

                    if (incoming.getIdCard() != null && !incoming.getIdCard().isBlank()) {
                        String idCard = incoming.getIdCard().trim();
                        if (membershipRepository.existsByIdCardAndIdNot(idCard, id)) {
                            return ResponseEntity.status(HttpStatus.CONFLICT)
                                    .body("Ya existe otra membresía con ese idCard.");
                        }
                        existing.setIdCard(idCard);
                    }

                    if (incoming.getEmail() != null && !incoming.getEmail().isBlank()) {
                        String email = incoming.getEmail().trim();
                        if (membershipRepository.existsByEmailAndIdNot(email, id)) {
                            return ResponseEntity.status(HttpStatus.CONFLICT)
                                    .body("Ya existe otra membresía con ese email.");
                        }
                        existing.setEmail(email);
                    }

                    // Actualización parcial: solo se aplican campos no nulos (y no en blanco en strings)
                    if (incoming.getCode() != null) {
                        existing.setCode(incoming.getCode());
                    }

                    if (incoming.getName() != null && !incoming.getName().isBlank()) {
                        existing.setName(incoming.getName().trim());
                    }

                    if (incoming.getBirthDate() != null) {
                        existing.setBirthDate(incoming.getBirthDate());
                    }

                    if (incoming.getPassword() != null && !incoming.getPassword().isBlank()) {
                        existing.setPassword(incoming.getPassword());
                    }

                    if (incoming.getDiscount() != null) {
                        existing.setDiscount(incoming.getDiscount());
                    }

                    if (incoming.getStartDate() != null) {
                        existing.setStartDate(incoming.getStartDate());
                    }

                    if (incoming.getEndDate() != null) {
                        existing.setEndDate(incoming.getEndDate());
                    }

                    return ResponseEntity.ok(membershipRepository.save(existing));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMembership(@PathVariable Long id) {
        if (!membershipRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        membershipRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // Genera un código entero de 6 dígitos sin colisiones en membershipRepository
    private Integer generateUniqueCode() {
        int candidate;
        do {
            candidate = ThreadLocalRandom.current().nextInt(100000, 999999);
        } while (membershipRepository.existsByCode(candidate));
        return candidate;
    }
}