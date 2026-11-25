package com.cieloabierto.work.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import java.time.LocalDateTime;

@Entity
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "event_id")
    private Long id;

    @Column(name = "code", nullable = false, unique = true)
    private Integer code;

    @Column(name = "type", nullable = false)
    private String type;

    @Column(name = "title", nullable = false)
    private String title;

    private String description;

    @Column(name = "creator_id", nullable = false)
    private Long creatorId;

    @Column(name = "id_object")
    private Long idObject;

    @Column(name = "ticket_price", nullable = false)
    private Integer ticketPrice;

    @Column(name = "location",nullable = false)
    private String location;

    @Column(name = "event_image")
    private String eventImage;

    @Column(name = "maximum_capacity", nullable = false)
    private Integer maximumCapacity;

    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;
    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate;

    public Event() {}

    public Event(Integer code, String type, String title, String description, Long creatorId,
            Long idObject, Integer ticketPrice, String location, String eventImage, Integer maximumCapacity,
            LocalDateTime startDate, LocalDateTime endDate) {
        this.code = code;
        this.type = type;
        this.title = title;
        this.description = description;
        this.creatorId = creatorId;
        this.idObject = idObject;
        this.ticketPrice = ticketPrice;
        this.location = location;
        this.eventImage = eventImage;
        this.maximumCapacity = maximumCapacity;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    public Long getId() { 
        return id; }
    public void setId(Long id) { 
        this.id = id; }

    public Integer getCode() { 
        return code; }
    public void setCode(Integer code) { 
        this.code = code; }

    public String getType() { 
        return type; }
    public void setType(String type) { 
        this.type = type; }

    public String getTitle() { 
        return title; }
    public void setTitle(String title) { 
        this.title = title; }

    public String getDescription() { 
        return description; }
    public void setDescription(String description) { 
        this.description = description; }

    public Long getCreatorId() { 
        return creatorId; }
    public void setCreatorId(Long creatorId) { 
        this.creatorId = creatorId; }

    public Long getIdObject() { 
        return idObject; }
    public void setIdObject(Long idObject) { 
        this.idObject = idObject; }

    public Integer getTicketPrice() { 
        return ticketPrice; }
    public void setTicketPrice(Integer ticketPrice) { 
        this.ticketPrice = ticketPrice; }

    public String getLocation() { 
        return location; }
    public void setLocation(String location) { 
        this.location = location; }

    public String getEventImage() { return eventImage; }
    public void setEventImage(String eventImage) { 
        this.eventImage = eventImage; }

    public Integer getMaximumCapacity() { 
        return maximumCapacity; }
    public void setMaximumCapacity(Integer maximumCapacity) { 
        this.maximumCapacity = maximumCapacity; }

    public LocalDateTime getStartDate() { 
        return startDate; }
    public void setStartDate(LocalDateTime startDate) { 
        this.startDate = startDate; }

    public LocalDateTime getEndDate() { 
        return endDate; }
    public void setEndDate(LocalDateTime endDate) { 
        this.endDate = endDate; }
}
