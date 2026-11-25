package com.cieloabierto.work.model;

import java.time.LocalDate;
import java.time.LocalDateTime;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity 
public class Membership {
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY) 
    @Column(name = "membership_id") 
    private Long id;
    @Column(name = "code", nullable = false,unique = true)
    private Integer code;
    @Column(name = "name", nullable = false)
    private String name;
    private LocalDate birthDate;
    @Column(name = "id_card",nullable = false, unique = true)
    private String idCard;
    @Column(name = "email", unique = true)
    private String email;
    @Column(name = "password",nullable = false)
    private String password;
    @Column(name = "discount", nullable = false)
    private Integer discount = 10;
    @Column(name = "start_date",nullable = false)
    private LocalDateTime startDate;
    @Column(name = "end_date",nullable = false)
    private LocalDateTime endDate;

    public Membership(){   
    }

    public Membership(Integer code, String name, LocalDate birthDate, String idCard, String email, String password, LocalDateTime startDate, LocalDateTime endDate) {
        this.code = code;
        this.name = name;
        this.birthDate = birthDate;
        this.idCard = idCard;
        this.email = email;
        this.password = password;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getCode() {
        return code;
    }

    public void setCode(Integer code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public LocalDate getBirthDate() {
        return birthDate;
    }

    public void setBirthDate(LocalDate birthDate) {
        this.birthDate = birthDate;
    }

    public String getIdCard() {
        return idCard;
    }

    public void setIdCard(String idCard) {
        this.idCard = idCard;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void setDiscount(Integer discount){
        this.discount = discount;
    }

    public Integer getDiscount() {
        return discount;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public LocalDateTime getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }
    
}
