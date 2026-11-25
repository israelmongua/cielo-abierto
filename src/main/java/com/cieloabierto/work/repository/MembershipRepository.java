package com.cieloabierto.work.repository;

import com.cieloabierto.work.model.Membership;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MembershipRepository extends JpaRepository<Membership,Long>{
    /**
     *Verifica si ya existe una membresia con ese codigo
     *Se usa en el controller al momento de crear un nuevo registro
     *para evitar errores de la integridad de datos en la Base de Datos  
     */
    boolean existsByCode(Integer code);
    boolean existsByIdCard(String idCard);
    boolean existsByEmail(String email);
    /**
     *Verifica si existe una membresia con ese codigo pero no con ese id
     *esto para verificar que el code con el que se esta editando si es correcto
     *y no está en otro lado
     *Se usa en el controller al momento de crear un nuevo registro
     *para evitar errores de la integridad de datos en la Base de Datos  
     */
    boolean existsByCodeAndIdNot(Integer code, Long id);
    boolean existsByIdCardAndIdNot(String idCard, Long id);
    boolean existsByEmailAndIdNot(String email, Long id);  
}


