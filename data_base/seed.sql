-- MySQL dump 10.13  Distrib 9.7.4, for Linux (x86_64)
--
-- Host: localhost    Database: cielo_abierto_v2
-- ------------------------------------------------------
-- Server version	9.7.4

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '8679485b-cc4d-11f1-8e4e-8aaba145b568:1-192';

--
-- Table structure for table `astronomical_object`
--
CREATE DATABASE IF NOT EXISTS `cielo_abierto_v2`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `cielo_abierto_v2`;
DROP TABLE IF EXISTS `astronomical_object`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `astronomical_object` (
  `id_object` bigint NOT NULL AUTO_INCREMENT,
  `code` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'URL de la imagen',
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Dónde está en el espacio (constelación, galaxia...)',
  PRIMARY KEY (`id_object`),
  UNIQUE KEY `uq_astronomical_object_code` (`code`),
  UNIQUE KEY `unique_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `astronomical_object`
--

LOCK TABLES `astronomical_object` WRITE;
/*!40000 ALTER TABLE `astronomical_object` DISABLE KEYS */;
INSERT INTO `astronomical_object` VALUES (1,'M42','Nebulosa de Orión','/images/m42.jpg','Una nebulosa difusa situada en la Vía Láctea, una de las regiones de formación estelar más cercanas.','Constelación de Orión'),(3,'OBJ-12','Nebulosa','a','Muy bonito','Andromeda'),(4,'PLN-001','Mercurio','https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=800&q=80','El planeta más pequeño del sistema solar y el más cercano al Sol. Su superficie está densamente craterizada.','Sistema Solar - Órbita Interior'),(5,'PLN-002','Venus','https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=800&q=80','El objeto más brillante en el cielo nocturno después de la Luna. Posee una atmósfera densa y tóxica de dióxido de carbono.','Sistema Solar - Órbita Interior'),(6,'PLN-003','Tierra','https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?auto=format&fit=crop&w=800&q=80','Nuestro hogar, el único mundo conocido hasta ahora que alberga vida y cuenta con abundante agua líquida en superficie.','Sistema Solar - Órbita de la Vida'),(7,'PLN-004','Marte','https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=800&q=80','El planeta rojo, famoso por su óxido de hierro superficial, sus gigantescos volcanes y cañones colosales.','Sistema Solar - Órbita Exterior'),(8,'PLN-005','Júpiter','https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=800&q=80','El gigante gaseoso más grande del sistema solar, famoso por su Gran Mancha Roja y sus numerosas lunas.','Sistema Solar - Gigantes Gaseosos'),(9,'PLN-006','Saturno','https://upload.wikimedia.org/wikipedia/commons/c/c1/Saturn_-_April_25_2016_%2837612580000%29.png?utm_source=es.wikipedia.org&utm_campaign=parser&utm_content=thumbnail_unscaled','El distinguido planeta anillado, compuesto principalmente por hidrógeno y helio con un impresionante sistema de anillos de hielo.','Sistema Solar - Gigantes Gaseosos'),(10,'PLN-007','Urano','https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=800&q=80','Un gigante helado que gira prácticamente de lado debido a una inclinación axial extrema de casi 98 grados.','Sistema Solar - Gigantes Helados'),(11,'PLN-008','Neptuno','https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=800&q=80','El planeta más distante del sistema solar en promedio, caracterizado por sus intensos vientos supersónicos y su color azul.','Sistema Solar - Gigantes Helados'),(12,'EXO-101','Prxima Centauri b','https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80','Exoplaneta rocoso que orbita en la zona habitable de la estrella más cercana al Sol, Prxima Centauri.','Constelación de Centauro'),(13,'EXO-102','Kepler-186f','https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80','El primer exoplaneta del tamaño de la Tierra descubierto en la zona habitable de su estrella madre.','Constelación de Cygnus'),(14,'EXO-103','TRAPPIST-1e','https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80','Un mundo rocoso templado, considerado uno de los mejores candidatos para buscar posibles biofirmas atmosféricas.','Constelación de Acuario'),(15,'EXO-104','HD 209458 b (Osiris)','https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80','Un Júpiter caliente que orbita tan cerca de su estrella que su atmósfera está evaporándose activamente al espacio.','Constelación de Pegaso'),(16,'EXO-105','Gliese 581g','https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80','Candidato a exoplaneta rocoso situado en la zona de habitabilidad conservadora de su estrella enana roja.','Constelación de Libra'),(17,'EXO-106','WASP-12b','https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80','Un planeta ultracaliente con forma de huevo debido a las intensas fuerzas de marea ejercidas por su estrella.','Constelación de Auriga'),(18,'EXO-107','K2-18b','https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80','Supertierra situada en la zona habitable que ha mostrado indicios preliminares de vapor de agua en su atmósfera.','Constelación de Leo'),(19,'EXO-108','LHS 1140 b','https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80','Una supertierra rocosa densa y estable, ideal para estudiar la retención atmosférica en planetas habitables.','Constelación de Cetus'),(20,'EXO-109','55 Cancri e','https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80','Un supertierra caliente apodado frecuentemente como el \"planeta de diamante\" debido a su supuesta composición interna rica en carbono.','Constelación de Cáncer'),(21,'EXO-110','TOI-700 d','https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80','Planeta del tamaño de la Tierra descubierto por el telescopio espacial TESS orbitando una estrella tranquila.','Constelación de Dorado'),(22,'EXO-111','HD 189733 b','https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80','Gigante gaseoso azulado caracterizado por lluvias horizontales de vidrio soplado impulsadas por vientos extremos.','Constelación de Vulpecula'),(23,'EXO-112','Kepler-22b','https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80','El primer exoplaneta confirmado por la misión Kepler en orbitar en medio de la zona habitable de una estrella tipo solar.','Constelación de Cygnus');
/*!40000 ALTER TABLE `astronomical_object` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `event`
--

DROP TABLE IF EXISTS `event`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `event` (
  `event_id` bigint NOT NULL AUTO_INCREMENT,
  `code` int NOT NULL COMMENT 'Identificador de negocio (lo genera la aplicación)',
  `type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `creator_id` bigint NOT NULL,
  `id_object` bigint DEFAULT NULL,
  `ticket_price` int NOT NULL DEFAULT '0' COMMENT 'Precio por persona, en pesos',
  `location` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Lugar de encuentro',
  `event_image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'URL de la imagen',
  `maximum_capacity` int NOT NULL COMMENT 'Cupo máximo, en personas',
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  PRIMARY KEY (`event_id`),
  UNIQUE KEY `uq_event_code` (`code`),
  KEY `idx_event_creator` (`creator_id`),
  KEY `idx_event_object` (`id_object`),
  KEY `idx_event_start_date` (`start_date`),
  CONSTRAINT `fk_event_creator` FOREIGN KEY (`creator_id`) REFERENCES `membership` (`membership_id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_event_object` FOREIGN KEY (`id_object`) REFERENCES `astronomical_object` (`id_object`) ON DELETE RESTRICT,
  CONSTRAINT `chk_event_capacity` CHECK ((`maximum_capacity` > 0)),
  CONSTRAINT `chk_event_dates` CHECK ((`end_date` >= `start_date`)),
  CONSTRAINT `chk_event_object_required` CHECK (((`type` = _utf8mb4'DIVULGATIVE') or (`id_object` is not null))),
  CONSTRAINT `chk_event_price` CHECK ((`ticket_price` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `event`
--

LOCK TABLES `event` WRITE;
/*!40000 ALTER TABLE `event` DISABLE KEYS */;
INSERT INTO `event` VALUES (1,201,'DIVULGATIVE','Noche de Observación de la Nebulosa de Orión','Jornada nocturna de uso de telescopios para observar M42 en detalle.',1,1,15000,'Mirador','',29,'2026-11-20 20:00:00','2026-11-21 02:00:00'),(2,202,'DIVULGATIVE','Charla: Colonización y Misterios de Marte','Conferencia magistral sobre las misiones espaciales actuales y futuras al planeta rojo.',2,NULL,0,'Auditorio','',50,'2026-12-05 18:00:00','2026-12-05 20:00:00'),(3,1001,'ASTRONOMICAL','Oposición de Saturno - El Gran Planeta','Noche de observación con telescopios de alta potencia para detallar los anillos y principales lunas de Saturno.',3,9,30000,'Planetario','',150,'2026-12-10 20:00:00','2026-12-10 23:30:00'),(4,1002,'DIVULGATIVE','Conferencia: Misterios de los Agujeros Negros','Charla magistral sobre la física de los horizontes de sucesos y la captura de la primera imagen de M87.',3,NULL,15000,'Auditorio Principal','',200,'2026-12-15 18:00:00','2026-12-15 20:00:00'),(5,1003,'ASTRONOMICAL','Elongación Máxima de Mercurio','Ventana ideal al atardecer para localizar a Mercurio sobre el horizonte occidental sin deslumbramiento solar.',4,4,35000,'Observatorio','',80,'2026-12-13 18:15:00','2026-12-13 20:00:00'),(6,1004,'DIVULGATIVE','Taller de Astrofotografía Básica con Smartphone','Aprende las configuraciones clave de exposición y sensibilidad para capturar la Vía Láctea desde el celular.',4,6,30000,'Centro Comercial','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZY8dQYNXXnhIWqEE6WLh9o-CAkrkGZfDpry1KveSmSVrFJCUbFOOPcXo&s=10',50,'2026-12-20 16:00:00','2026-12-20 19:00:00'),(7,1005,'ASTRONOMICAL','Gran Conjunción Júpiter - Saturno','Seguimiento astronómico del acercamiento visual de los dos gigantes gaseosos del sistema solar.',3,8,20000,'Parque Central','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSBlk2WNo7e2Yq3b8GNw8lNddD-CRPX7601_e3Q8BfnBd3skfvA67h1IcU&s=10',120,'2026-12-22 19:30:00','2026-12-22 22:00:00'),(8,1006,'DIVULGATIVE','Origen y Evolución del Sistema Solar','Recorrido histórico y científico por la formación de los planetas y cuerpos menores a partir de la nebulosa protosolar.',3,6,10000,'Auditorio Principal','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQD2_4eUy1PHcqbtRltI5CYY3XmCkgycYP5-GNRmzn3AXey2gNcWXZJbqo&s=10',180,'2026-12-28 17:00:00','2026-12-28 19:00:00'),(9,1007,'ASTRONOMICAL','Observación de Venus al Alba','Observación de las fases de Venus similares a las de la Luna mediante refractores acromáticos.',4,5,25000,'Planetario','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9Kco8tzaK20ufdG8ZZ3oPe6K_qURiEm2p8xKy79sNeg&s=10',100,'2027-01-10 04:30:00','2027-01-10 06:30:00'),(10,1008,'DIVULGATIVE','Exoplanetas: En busca de segundas Tierras','Métodos de detección y análisis atmosférico de mundos habitables fuera de nuestro sistema solar.',3,12,15000,'Auditorio Principal','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRMq7HdMjUYQ-dPLgs0Cb5E_Rnq3e3BwLSf-7pLmqytHACqGo62x4ZJk68c&s=10',150,'2027-01-14 18:00:00','2027-01-14 20:00:00'),(11,1009,'ASTRONOMICAL','Tránsito de la Estación Espacial Internacional','Registro fotográfico y visual del cruce de la ISS frente al horizonte nocturno.',5,6,20000,'Mirador','https://c.files.bbci.co.uk/55D2/production/_104407912_iss056e201225.jpg',60,'2027-01-18 19:00:00','2027-01-18 20:30:00'),(12,1010,'DIVULGATIVE','Taller de Astronomía para Niños: Exploradores del Espacio','Actividades lúdicas y didácticas introductorias sobre las fases lunares y constelaciones.',3,NULL,12000,'Centro Comercial','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQMbTutt-7_HkM0NHCx8OU9vITmY-z4wzF8eup0KduTgkr5mrKsNSmlgQO8&s=10',40,'2027-01-23 14:00:00','2027-01-23 17:00:00'),(13,1011,'ASTRONOMICAL','Oposición de Marte: El Planeta Rojo en su punto óptimo','Jornada especial de observación aprovechando la mínima distancia entre la Tierra y Marte.',3,7,30000,'Planetario','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS63njCQYcOH-RWC7FWFEa9pFTyhSYDGlIeBwTkmAkmYw&s',150,'2027-02-05 21:00:00','2027-02-06 00:00:00'),(14,1012,'DIVULGATIVE','Matemáticas y Mecánica Celeste','Introducción a las leyes de Kepler y el cálculo de órbitas elípticas aplicado al software de simulación.',4,NULL,18000,'Plazoleta','https://upload.wikimedia.org/wikipedia/commons/1/1d/Angular_Parameters_of_Elliptical_Orbit.png?utm_source=ast.wikipedia.org&utm_campaign=index&utm_content=original',70,'2027-02-12 16:00:00','2027-02-12 18:30:00'),(15,1013,'ASTRONOMICAL','Seguimiento de Urano y sus Lunas Mayores','Búsqueda asistida por coordenadas ecuatoriales para identificar el disco verde-azulado de Urano.',5,10,22000,'Observatorio','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTN7Pn5OMwlT4d4-uz4eMtkwZyh1t1XeGPmX289onLkJg&s=10',90,'2027-02-19 20:00:00','2027-02-19 23:00:00'),(16,1014,'DIVULGATIVE','El Telescopio James Webb: Descubriendo el universo profundo','Análisis de los datos y las imágenes infrarrojas más recientes entregadas por el JWST.',3,14,15000,'Auditorio Principal','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQf3n-5xXPA2i-oc5GO47reANLsVB1F4u7n6cWxeowMGQ&s=10',200,'2027-02-25 18:00:00','2027-02-25 20:00:00'),(17,1015,'ASTRONOMICAL','Tránsito de Lunas Galileanas en Júpiter','Observación de las sombras proyectadas por Ío y Europa sobre las bandas nubosas de Júpiter.',4,8,20000,'Parque','https://starwalk.space/gallery/images/jupiter-galilean-moons/1920x1080.jpg',130,'2027-03-04 19:30:00','2027-03-04 22:30:00'),(18,1016,'DIVULGATIVE','Radiotelescopios y el Universo Invisible','Cómo la radioastronomía nos permite escuchar púlsares, quasares y el hidrógeno neutro del cosmos.',4,NULL,15000,'Auditorio Principal','https://c.files.bbci.co.uk/1888/production/_97208260_des5.jpg',110,'2027-03-11 17:30:00','2027-03-11 19:30:00'),(19,1017,'ASTRONOMICAL','Equinoccio de Primavera: Medición Terrestre','Actividad diurna de medición de sombras y ángulo solar para comprender la inclinación axial de la Tierra.',3,6,15000,'Plazoleta','https://starwalk.space/gallery/images/what-is-an-equinox-2/1920x1080.jpg',100,'2027-03-21 10:00:00','2027-03-21 12:00:00'),(20,1018,'DIVULGATIVE','Cosmología Moderna: Materia Oscura y Energía Oscura','Charla avanzada sobre los componentes ocultos que dominan la dinámica del universo acelerado.',3,NULL,20000,'Auditorio Principal','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlz2fvek-pn_HmEH8zmlD0e32PQHzwXhIRVejRWsybxtaLcp48FthoMdc&s=10',160,'2027-03-28 18:00:00','2027-03-28 20:00:00'),(21,1019,'ASTRONOMICAL','Localización del Gigante Helado Neptuno','Observación telescópica de campo profundo para ubicar al planeta más lejano del sistema solar.',5,11,25000,'Observatorio','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1Ppt0o4Ia6yjVivMeDxV4O3Q0WT-wJYeID6kX3jg3qxEUFZPLB9GxtpgS&s=10',75,'2027-04-05 20:30:00','2027-04-06 00:00:00'),(22,1020,'DIVULGATIVE','Historia de la Exploración Espacial: Del Sputnik a Artemis','Hitos tecnológicos que marcaron la carrera espacial humana y los próximos pasos hacia la Luna y Marte.',4,NULL,15000,'Sala de Conferencias','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ0TQpDfpmIdQDOfqfgFLe2roO2WPhcyeKp9SLbQGpelm-Uogumaw6f96g&s=10',190,'2027-04-12 17:00:00','2027-04-12 19:00:00'),(24,400822,'ASTRONOMICAL','Observación de una Enana Blanca','Observación de un estrella vieja',2,8,20000,'Planetario','https://media.es.wired.com/photos/6490b68681dbfcb5b87caa17/16:9/w_2560%2Cc_limit/enana%2520blanca%2520diamante.jpg',50,'2026-11-30 17:00:00','2026-11-30 20:00:00'),(25,472091,'ASTRONOMICAL','Observación de un Agujero','Observación',6,18,20000,'Planetario','https://static.wikia.nocookie.net/interstellarfilm/images/9/9b/Black_hole.png/revision/latest?cb=20150322005003',50,'2026-11-26 23:00:00','2026-11-27 01:00:00'),(26,460502,'DIVULGATIVE','Lluvia de Meteoros Gemínidas en Cielo Abierto - Conferencia','Una conferencia enfocada en el estudio de las Lluvias de meteoros',9,NULL,20000,'Planetario','https://media.admagazine.com/photos/68558c9c590117dcddfc02d7/16:9/w_2560%2Cc_limit/IMG_0328.jpeg',60,'2025-11-04 19:00:00','2025-11-04 21:00:00');
/*!40000 ALTER TABLE `event` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `event_attendance`
--

DROP TABLE IF EXISTS `event_attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `event_attendance` (
  `attendance_id` bigint NOT NULL AUTO_INCREMENT,
  `event_id` bigint NOT NULL,
  `membership_id` bigint DEFAULT NULL,
  `id_card` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `persons_assistance` int NOT NULL DEFAULT '1' COMMENT 'Personas que cubre esta inscripción',
  `price` int NOT NULL DEFAULT '0' COMMENT 'Precio final pagado (foto del momento)',
  `attendance_status` int DEFAULT '1' COMMENT 'TRUE = confirmada, FALSE = cancelada',
  `registration_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `code` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`attendance_id`),
  UNIQUE KEY `uq_attendance_event_id_card` (`event_id`,`id_card`),
  UNIQUE KEY `uq_event_attendance_code` (`code`),
  KEY `idx_attendance_membership` (`membership_id`),
  CONSTRAINT `fk_attendance_event` FOREIGN KEY (`event_id`) REFERENCES `event` (`event_id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_attendance_membership` FOREIGN KEY (`membership_id`) REFERENCES `membership` (`membership_id`) ON DELETE SET NULL,
  CONSTRAINT `chk_attendance_persons` CHECK ((`persons_assistance` >= 1)),
  CONSTRAINT `chk_attendance_price` CHECK ((`price` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `event_attendance`
--

LOCK TABLES `event_attendance` WRITE;
/*!40000 ALTER TABLE `event_attendance` DISABLE KEYS */;
INSERT INTO `event_attendance` VALUES (3,11,4,'1017233444','Valeria Gómez','valeria.gomez@cieloabierto.co','1994-09-22',2,40000,1,'2026-11-17 19:07:18','INS-1001-A'),(4,3,NULL,'1038444555','Andrés Mejía','andres.mejia@gmail.com','1999-04-10',1,25000,1,'2026-11-17 19:07:18','INS-1001-B'),(5,4,5,'71388999','Mateo Ospina','mateo.ospina@cieloabierto.co','1988-11-03',1,13500,1,'2026-11-17 19:07:18','INS-1002-A'),(6,13,NULL,'1040777888','Laura Castaño','laura.castano@hotmail.com','2001-11-30',3,90000,1,'2026-11-17 19:07:18','INS-1011-A'),(8,25,NULL,'2131234','Juan','juan@example.com','2000-07-30',5,100000,1,'2026-11-23 00:44:02','ATT-887835'),(9,5,1,'1035442111','Ana María Gómez','ana.gomez@example.com','1998-05-14',1,0,0,'2026-11-23 00:54:01','ATT-987573'),(10,26,NULL,'1023904','Juan Hernandez','juan@example.com','1998-08-11',6,120000,1,'2026-11-24 22:53:57','ATT-847954'),(11,26,8,'1017248910','Mateo Restrepo','mateo.restrepo@correo.co','1999-04-12',1,18000,1,'2026-11-24 22:55:33','ATT-213932'),(12,18,9,'1036652184','Juliana Montoya','juliana.montoya@correo.co','2001-08-27',20,0,0,'2026-11-24 22:57:51','ATT-130072');
/*!40000 ALTER TABLE `event_attendance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `membership`
--

DROP TABLE IF EXISTS `membership`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `membership` (
  `membership_id` bigint NOT NULL AUTO_INCREMENT,
  `code` int NOT NULL COMMENT 'Identificador de negocio (lo genera la aplicación)',
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `birth_date` date DEFAULT NULL,
  `id_card` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Hash BCrypt. Nunca la contraseña en claro',
  `discount` int NOT NULL DEFAULT '0' COMMENT 'Porcentaje de descuento, de 0 a 100',
  `start_date` datetime(6) NOT NULL,
  `end_date` datetime(6) NOT NULL,
  PRIMARY KEY (`membership_id`),
  UNIQUE KEY `uq_membership_code` (`code`),
  UNIQUE KEY `uq_membership_id_card` (`id_card`),
  UNIQUE KEY `uq_membership_email` (`email`),
  CONSTRAINT `chk_membership_dates` CHECK ((`end_date` >= `start_date`)),
  CONSTRAINT `chk_membership_discount` CHECK ((`discount` between 0 and 100))
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `membership`
--

LOCK TABLES `membership` WRITE;
/*!40000 ALTER TABLE `membership` DISABLE KEYS */;
INSERT INTO `membership` VALUES (1,101,'Ana María Gómez','1998-05-14','1035442111','ana.gomez@example.com','contrasena123',10,'2026-01-01 00:00:00.000000','2026-12-31 00:00:00.000000'),(2,102,'Carlos Andrés Pérez','1992-11-20','71234567','carlos.perez@example.com','caldodecostilla',10,'2026-02-01 00:00:00.000000','2027-02-01 00:00:00.000000'),(3,501,'Carlos Restrepo','1990-05-14','1037611222','carlos.restrepo@cieloabierto.co','ejemplocontrasena',10,'2026-01-01 00:00:00.000000','2027-12-31 23:59:59.000000'),(4,502,'Valeria Gómez','1994-09-22','1017233444','valeria.gomez@cieloabierto.co','contrasenaejemplo1',10,'2026-02-01 00:00:00.000000','2027-12-31 23:59:59.000000'),(5,503,'Mateo Ospina','1988-11-03','71388999','mateo.ospina@cieloabierto.co','contrasenaejemplo345',10,'2026-03-15 00:00:00.000000','2027-03-15 23:59:59.000000'),(6,504,'Sofía Arango','1998-02-19','1036955111','sofia.arango@cieloabierto.co','contrasena',10,'2026-06-01 00:00:00.000000','2027-06-01 23:59:59.000000'),(8,772874,'Mateo Restrepo','1999-04-12','1017248910','mateo.restrepo@correo.co','AstroMateo2026!',10,'2026-11-24 22:47:42.357762','2026-12-24 22:47:42.357762'),(9,319469,'Juliana Montoya','2001-08-27','1036652184','juliana.montoya@correo.co','NebulosaJuliana#9',10,'2026-11-24 22:48:41.452495','2026-12-24 22:48:41.452495'),(10,646903,'Sebastián Giraldo','2002-02-03','1020481592','sebastian.giraldo@correo.co','OrbitaSebas$42',10,'2026-11-24 22:50:00.738584','2026-12-24 22:50:00.738584');
/*!40000 ALTER TABLE `membership` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'cielo_abierto_v2'
--
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-24 21:17:30
