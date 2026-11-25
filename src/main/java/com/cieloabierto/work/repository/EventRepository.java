package com.cieloabierto.work.repository;

import com.cieloabierto.work.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventRepository extends JpaRepository<Event,Long>{
    /**
     *Verifica si ya existe un evento con ese codigo
     *Se usa en el controller al momento de crear un nuevo registro
     *para evitar errores de la integridad de datos en la Base de Datos  
     */
    boolean existsByCode(Integer code);
    /**
     *Verifica si existe un evento con ese codigo pero no con ese id
     *esto para verificar que el code con el que se esta editando si es correcto
     *y no está en otro lado
     *Se usa en el controller al momento de crear un nuevo registro
     *para evitar errores de la integridad de datos en la Base de Datos  
     */
    boolean existsByCodeAndIdNot(Integer code, Long id);
}
