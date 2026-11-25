package com.cieloabierto.work.repository;

import com.cieloabierto.work.model.EventAttendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EventAttendanceRepository extends JpaRepository<EventAttendance,Long>{
    /**
     *Verifica si ya existe una asistencia con ese codigo
     *Se usa en el controller al momento de crear un nuevo registro
     *para evitar errores de la integridad de datos en la Base de Datos  
     */
    boolean existsByCode(String code);
    /**
     *Verifica si existe una asistencia con ese codigo pero no con ese id
     *esto para verificar que el code con el que se esta editando si es correcto
     *y no está en otro lado
     *Se usa en el controller al momento de crear un nuevo registro
     *para evitar errores de la integridad de datos en la Base de Datos  
     */
    boolean existsByCodeAndIdNot(String code, Long id);
    //Se utiliza para crear una asistencia nueva en el controller, suma todas las personas isncritas ACTIVAS a ese evento
    @Query("SELECT COALESCE(SUM(a.personsAssistance), 0) FROM EventAttendance a WHERE a.eventId = :eventId AND a.attendanceStatus <> 0")
    Long sumPersonsAssistanceByEventId(@Param("eventId") Long eventId);
    //Se usa para editar una asistencia, cuenta las personas inscritas ACTIVAS a un evento ignorando la que esta en edición para dar un limite a la edicion de la asistenciaa actual
    @Query("SELECT COALESCE(SUM(a.personsAssistance), 0) FROM EventAttendance a WHERE a.eventId = :eventId AND a.id <> :excludeId AND a.attendanceStatus <> 0")
    Long sumPersonsAssistanceByEventIdExcludingId(@Param("eventId") Long eventId, @Param("excludeId") Long excludeId);
}
