package com.cieloabierto.work.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
public class EventAttendance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "attendance_id")
    private Long id;
    @Column(name = "event_id", nullable = false)
    private Long eventId;
    @Column(name = "membership_id", nullable = true)
    private Long membershipId;
    @Column(name = "id_card", nullable = false)
    private String idCard;
    @Column(name = "name", nullable = false)
    private String name;
    private String email;
    private LocalDate birthDate;
    @Column(name = "persons_assistance", nullable = false)
    private Integer personsAssistance;
    @Column(name = "price", nullable = false)
    private Integer price;
    private Integer attendanceStatus;
    private LocalDateTime registrationDate;
    @Column(name = "code",nullable = false, unique = true)
    private String code;

    public EventAttendance() {
    }

    public EventAttendance(String code, Long membershipId, Long eventId, String idCard, String name, String email,
            LocalDate birthDate, Integer personsAssistance, Integer price, Integer attendanceStatus,
            LocalDateTime registrationDate) {
        this.membershipId = membershipId;
        this.eventId = eventId;
        this.idCard = idCard;
        this.name = name;
        this.email = email;
        this.birthDate = birthDate;
        this.personsAssistance = personsAssistance;
        this.price = price;
        this.attendanceStatus = attendanceStatus;
        this.registrationDate = registrationDate;
        this.code = code;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
    public String getCode(){
        return code;
    }
    public void setCode(String code){
        this.code  = code;
    }
    public Long getMembershipId() {
        return membershipId;
    }

    public void setMembershipId(Long membershipId) {
        this.membershipId = membershipId;
    }

    public Long getEventId() {
        return eventId;
    }

    public void setEventId(Long eventId) {
        this.eventId = eventId;
    }

    public String getIdCard() {
        return idCard;
    }

    public void setIdCard(String idCard) {
        this.idCard = idCard;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public LocalDate getBirthDate() {
        return birthDate;
    }

    public void setBirthDate(LocalDate birthDate) {
        this.birthDate = birthDate;
    }

    public Integer getPersonsAssistance() {
        return personsAssistance;
    }

    public void setPersonsAssistance(Integer personsAssistance) {
        this.personsAssistance = personsAssistance;
    }

    public Integer getPrice() {
        return price;
    }

    public void setPrice(Integer price) {
        this.price = price;
    }

    public Integer getAttendanceStatus() {
        return attendanceStatus;
    }

    public void setAttendanceStatus(Integer attendanceStatus) {
        this.attendanceStatus = attendanceStatus;
    }

    public LocalDateTime getRegistrationDate() {
        return registrationDate;
    }

    public void setRegistrationDate(LocalDateTime registrationDate) {
        this.registrationDate = registrationDate;
    } 
}