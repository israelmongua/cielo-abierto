package com.cieloabierto.work.repository;

import com.cieloabierto.work.model.AstronomicalObject;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AstronomicalObjectRepository extends JpaRepository<AstronomicalObject,Long> {
    /**
     *Verifica si ya existe un objeto astronomico con ese codigo
     *Se usa en el controller al momento de crear un nuevo registro
     *para evitar errores de la integridad de datos en la Base de Datos  
     */
    boolean existsByCode(String code);
    boolean existsByName(String name);
    /**
     *Verifica si existe un objeto astronomico con ese codigo pero no con ese id
     *esto para verificar que el code con el que se esta editando si es correcto
     *y no está en otro lado
     *Se usa en el controller al momento de crear un nuevo registro
     *para evitar errores de la integridad de datos en la Base de Datos  
     */
    boolean existsByCodeAndIdNot(String code, Long id);
    boolean existsByNameAndIdNot(String name, Long id);
}

