-- Detener la ejecución del script si ocurre un error
\set ON_ERROR_STOP on

-- Eliminar tablas existentes para una inicialización limpia
DROP TABLE IF EXISTS question_answers CASCADE;
DROP TABLE IF EXISTS answers CASCADE;
DROP TABLE IF EXISTS questions CASCADE;

-- Tabla para almacenar las preguntas
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    question_text TEXT NOT NULL,
    topic VARCHAR(255)
);

-- Tabla para almacenar las respuestas
CREATE TABLE answers (
    id SERIAL PRIMARY KEY,
    answer_text TEXT NOT NULL
);

-- Tabla para relacionar preguntas y respuestas, y marcar la respuesta correcta
CREATE TABLE question_answers (
    question_id INT REFERENCES questions(id),
    answer_id INT REFERENCES answers(id),
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (question_id, answer_id)
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL, -- Almacenará la contraseña en texto plano para este ejemplo simple
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (nombre, password) VALUES
('usuario1', 'password123'),
('admin', 'adminpass'),
('maria', 'secreta');

-- Pregunta 2: Concepto de Proceso
INSERT INTO questions (question_text, topic) VALUES ('¿Cuál es la definición más precisa de un "proceso" en el contexto de sistemas operativos?', 'Procesos');

INSERT INTO answers (answer_text) VALUES
('Un programa almacenado en el disco duro.'),
('Una instancia de un programa en ejecución, con su propio espacio de direcciones y recursos.'),
('Un archivo ejecutable listo para ser cargado en memoria.'),
('Un hilo de ejecución dentro de un programa.');

INSERT INTO question_answers (question_id, answer_id, is_correct) VALUES
((SELECT id FROM questions WHERE question_text LIKE '%¿Cuál es la definición más precisa de un "proceso"%'), (SELECT id FROM answers WHERE answer_text = 'Una instancia de un programa en ejecución, con su propio espacio de direcciones y recursos.'), TRUE),
((SELECT id FROM questions WHERE question_text LIKE '%¿Cuál es la definición más precisa de un "proceso"%'), (SELECT id FROM answers WHERE answer_text = 'Un programa almacenado en el disco duro.'), FALSE),
((SELECT id FROM questions WHERE question_text LIKE '%¿Cuál es la definición más precisa de un "proceso"%'), (SELECT id FROM answers WHERE answer_text = 'Un archivo ejecutable listo para ser cargado en memoria.'), FALSE),
((SELECT id FROM questions WHERE question_text LIKE '%¿Cuál es la definición más precisa de un "proceso"%'), (SELECT id FROM answers WHERE answer_text = 'Un hilo de ejecución dentro de un programa.'), FALSE);

-- Pregunta 3: Gestión de Memoria
INSERT INTO questions (question_text, topic) VALUES ('¿Qué técnica de gestión de memoria permite a un proceso usar más memoria de la que físicamente está disponible?', 'Memoria');

INSERT INTO answers (answer_text) VALUES
('Segmentación.'),
('Paginación por demanda (Memoria Virtual).'),
('Intercambio (Swapping).'),
('Asignación contigua.');

INSERT INTO question_answers (question_id, answer_id, is_correct) VALUES
((SELECT id FROM questions WHERE question_text LIKE '%¿Qué técnica de gestión de memoria permite a un proceso usar más memoria de la que físicamente está disponible?%'), (SELECT id FROM answers WHERE answer_text = 'Paginación por demanda (Memoria Virtual).'), TRUE),
((SELECT id FROM questions WHERE question_text LIKE '%¿Qué técnica de gestión de memoria permite a un proceso usar más memoria de la que físicamente está disponible?%'), (SELECT id FROM answers WHERE answer_text = 'Segmentación.'), FALSE),
((SELECT id FROM questions WHERE question_text LIKE '%¿Qué técnica de gestión de memoria permite a un proceso usar más memoria de la que físicamente está disponible?%'), (SELECT id FROM answers WHERE answer_text = 'Intercambio (Swapping).'), FALSE),
((SELECT id FROM questions WHERE question_text LIKE '%¿Qué técnica de gestión de memoria permite a un proceso usar más memoria de la que físicamente está disponible?%'), (SELECT id FROM answers WHERE answer_text = 'Asignación contigua.'), FALSE);

-- Pregunta 4: Sincronización de Procesos
INSERT INTO questions (question_text, topic) VALUES ('¿Cuál es el propósito principal de un "semáforo" en la sincronización de procesos?', 'Sincronización');

INSERT INTO answers (answer_text) VALUES
('Para permitir que múltiples procesos accedan a una sección crítica simultáneamente.'),
('Para garantizar el orden de ejecución de los procesos en un sistema concurrente.'),
('Para controlar el acceso a recursos compartidos y evitar condiciones de carrera.'),
('Para almacenar datos temporales durante la ejecución de un proceso.');

INSERT INTO question_answers (question_id, answer_id, is_correct) VALUES
((SELECT id FROM questions WHERE question_text LIKE '%¿Cuál es el propósito principal de un "semáforo"%'), (SELECT id FROM answers WHERE answer_text = 'Para controlar el acceso a recursos compartidos y evitar condiciones de carrera.'), TRUE),
((SELECT id FROM questions WHERE question_text LIKE '%¿Cuál es el propósito principal de un "semáforo"%'), (SELECT id FROM answers WHERE answer_text = 'Para permitir que múltiples procesos accedan a una sección crítica simultáneamente.'), FALSE),
((SELECT id FROM questions WHERE question_text LIKE '%¿Cuál es el propósito principal de un "semáforo"%'), (SELECT id FROM answers WHERE answer_text = 'Para garantizar el orden de ejecución de los procesos en un sistema concurrente.'), FALSE),
((SELECT id FROM questions WHERE question_text LIKE '%¿Cuál es el propósito principal de un "semáforo"%'), (SELECT id FROM answers WHERE answer_text = 'Para almacenar datos temporales durante la ejecución de un proceso.'), FALSE);

-- Pregunta 5: Tipos de Sistemas Operativos
INSERT INTO questions (question_text, topic) VALUES ('¿Qué característica define principalmente a un sistema operativo de "tiempo real duro"?', 'Tipos de SO');

INSERT INTO answers (answer_text) VALUES
('Tiene una interfaz gráfica de usuario muy elaborada.'),
('Garantiza que las tareas críticas se completen dentro de un plazo fijo, incluso bajo carga.'),
('Prioriza el rendimiento general del sistema sobre la puntualidad de las tareas.'),
('Está diseñado para ejecutar un solo programa a la vez.');

INSERT INTO question_answers (question_id, answer_id, is_correct) VALUES
((SELECT id FROM questions WHERE question_text LIKE '%¿Qué característica define principalmente a un sistema operativo de "tiempo real duro"%'), (SELECT id FROM answers WHERE answer_text = 'Garantiza que las tareas críticas se completen dentro de un plazo fijo, incluso bajo carga.'), TRUE),
((SELECT id FROM questions WHERE question_text LIKE '%¿Qué característica define principalmente a un sistema operativo de "tiempo real duro"%'), (SELECT id FROM answers WHERE answer_text = 'Tiene una interfaz gráfica de usuario muy elaborada.'), FALSE),
((SELECT id FROM questions WHERE question_text LIKE '%¿Qué característica define principalmente a un sistema operativo de "tiempo real duro"%'), (SELECT id FROM answers WHERE answer_text = 'Prioriza el rendimiento general del sistema sobre la puntualidad de las tareas.'), FALSE),
((SELECT id FROM questions WHERE question_text LIKE '%¿Qué característica define principalmente a un sistema operativo de "tiempo real duro"%'), (SELECT id FROM answers WHERE answer_text = 'Está diseñado para ejecutar un solo programa a la vez.'), FALSE);

-- Pregunta 6: Interbloqueo (Deadlock)
INSERT INTO questions (question_text, topic) VALUES ('¿Cuál de las siguientes condiciones NO es necesaria para que ocurra un interbloqueo (deadlock)?', 'Sincronización');

INSERT INTO answers (answer_text) VALUES
('Exclusión mutua.'),
('Retención y espera.'),
('No apropiación.'),
('Pre-asignación de recursos.');

INSERT INTO question_answers (question_id, answer_id, is_correct) VALUES
((SELECT id FROM questions WHERE question_text LIKE '%¿Cuál de las siguientes condiciones NO es necesaria para que ocurra un interbloqueo (deadlock)?%'), (SELECT id FROM answers WHERE answer_text = 'Pre-asignación de recursos.'), TRUE),
((SELECT id FROM questions WHERE question_text LIKE '%¿Cuál de las siguientes condiciones NO es necesaria para que ocurra un interbloqueo (deadlock)?%'), (SELECT id FROM answers WHERE answer_text = 'Exclusión mutua.'), FALSE),
((SELECT id FROM questions WHERE question_text LIKE '%¿Cuál de las siguientes condiciones NO es necesaria para que ocurra un interbloqueo (deadlock)?%'), (SELECT id FROM answers WHERE answer_text = 'Retención y espera.'), FALSE),
((SELECT id FROM questions WHERE question_text LIKE '%¿Cuál de las siguientes condiciones NO es necesaria para que ocurra un interbloqueo (deadlock)?%'), (SELECT id FROM answers WHERE answer_text = 'No apropiación.'), FALSE);

-- Pregunta 7: Hilos (Threads)
INSERT INTO questions (question_text, topic) VALUES ('¿Cuál es la principal ventaja de usar hilos (threads) sobre procesos separados para una aplicación?', 'Procesos');

INSERT INTO answers (answer_text) VALUES
('Cada hilo tiene su propio espacio de direcciones de memoria, lo que aumenta la seguridad.'),
('Los hilos son más pesados de crear y gestionar que los procesos.'),
('Los hilos comparten el mismo espacio de direcciones de memoria, facilitando la comunicación y reduciendo la sobrecarga.'),
('Los hilos solo pueden ejecutarse en un único núcleo de CPU.');

INSERT INTO question_answers (question_id, answer_id, is_correct) VALUES
((SELECT id FROM questions WHERE question_text LIKE '%¿Cuál es la principal ventaja de usar hilos (threads) sobre procesos separados para una aplicación?%'), (SELECT id FROM answers WHERE answer_text = 'Los hilos comparten el mismo espacio de direcciones de memoria, facilitando la comunicación y reduciendo la sobrecarga.'), TRUE),
((SELECT id FROM questions WHERE question_text LIKE '%¿Cuál es la principal ventaja de usar hilos (threads) sobre procesos separados para una aplicación?%'), (SELECT id FROM answers WHERE answer_text = 'Cada hilo tiene su propio espacio de direcciones de memoria, lo que aumenta la seguridad.'), FALSE),
((SELECT id FROM questions WHERE question_text LIKE '%¿Cuál es la principal ventaja de usar hilos (threads) sobre procesos separados para una aplicación?%'), (SELECT id FROM answers WHERE answer_text = 'Los hilos son más pesados de crear y gestionar que los procesos.'), FALSE),
((SELECT id FROM questions WHERE question_text LIKE '%¿Cuál es la principal ventaja de usar hilos (threads) sobre procesos separados para una aplicación?%'), (SELECT id FROM answers WHERE answer_text = 'Los hilos solo pueden ejecutarse en un único núcleo de CPU.'), FALSE);

-- Pregunta 8: Planificación de CPU
INSERT INTO questions (question_text, topic) VALUES ('¿Qué algoritmo de planificación de CPU asigna el procesador al proceso que ha solicitado el CPU más recientemente y lo mantiene hasta que se bloquea o termina?', 'Planificación');

INSERT INTO answers (answer_text) VALUES
('Round Robin.'),
('Shortest Job First (SJF).'),
('First-Come, First-Served (FCFS).'),
('Proceso de ejecución de cola.');

INSERT INTO question_answers (question_id, answer_id, is_correct) VALUES
((SELECT id FROM questions WHERE question_text LIKE '%¿Qué algoritmo de planificación de CPU asigna el procesador al proceso que ha solicitado el CPU más recientemente y lo mantiene hasta que se bloquea o termina?%'), (SELECT id FROM answers WHERE answer_text = 'Proceso de ejecución de cola.'), FALSE),
((SELECT id FROM questions WHERE question_text LIKE '%¿Qué algoritmo de planificación de CPU asigna el procesador al proceso que ha solicitado el CPU más recientemente y lo mantiene hasta que se bloquea o termina?%'), (SELECT id FROM answers WHERE answer_text = 'First-Come, First-Served (FCFS).'), TRUE),
((SELECT id FROM questions WHERE question_text LIKE '%¿Qué algoritmo de planificación de CPU asigna el procesador al proceso que ha solicitado el CPU más recientemente y lo mantiene hasta que se bloquea o termina?%'), (SELECT id FROM answers WHERE answer_text = 'Round Robin.'), FALSE),
((SELECT id FROM questions WHERE question_text LIKE '%¿Qué algoritmo de planificación de CPU asigna el procesador al proceso que ha solicitado el CPU más recientemente y lo mantiene hasta que se bloquea o termina?%'), (SELECT id FROM answers WHERE answer_text = 'Shortest Job First (SJF).'), FALSE);

-- Pregunta 9: Llamadas al Sistema (System Calls)
INSERT INTO questions (question_text, topic) VALUES ('¿Cuál es el propósito principal de una "llamada al sistema" (system call)?', 'Conceptos Básicos');

INSERT INTO answers (answer_text) VALUES
('Permitir que el usuario interactúe directamente con el hardware sin pasar por el sistema operativo.'),
('Solicitar un servicio al kernel del sistema operativo.'),
('Ejecutar operaciones aritméticas y lógicas dentro de un programa de usuario.'),
('Compilar código fuente a código máquina.');

INSERT INTO question_answers (question_id, answer_id, is_correct) VALUES
((SELECT id FROM questions WHERE question_text LIKE '%¿Cuál es el propósito principal de una "llamada al sistema" (system call)?%'), (SELECT id FROM answers WHERE answer_text = 'Solicitar un servicio al kernel del sistema operativo.'), TRUE),
((SELECT id FROM questions WHERE question_text LIKE '%¿Cuál es el propósito principal de una "llamada al sistema" (system call)?%'), (SELECT id FROM answers WHERE answer_text = 'Permitir que el usuario interactúe directamente con el hardware sin pasar por el sistema operativo.'), FALSE),
((SELECT id FROM questions WHERE question_text LIKE '%¿Cuál es el propósito principal de una "llamada al sistema" (system call)?%'), (SELECT id FROM answers WHERE answer_text = 'Ejecutar operaciones aritméticas y lógicas dentro de un programa de usuario.'), FALSE),
((SELECT id FROM questions WHERE question_text LIKE '%¿Cuál es el propósito principal de una "llamada al sistema" (system call)?%'), (SELECT id FROM answers WHERE answer_text = 'Compilar código fuente a código máquina.'), FALSE);

-- Pregunta 10: Modos de Operación (Kernel/Usuario)
INSERT INTO questions (question_text, topic) VALUES ('¿Por qué los sistemas operativos utilizan modos de operación (kernel y usuario)?', 'Seguridad');

INSERT INTO answers (answer_text) VALUES
('Para permitir que cualquier programa acceda a recursos críticos del sistema.'),
('Para diferenciar entre procesos de usuario y demonios del sistema.'),
('Para proteger el sistema operativo y los recursos críticos de accesos no autorizados por parte de programas de usuario.'),
('Para mejorar el rendimiento general del sistema al ejecutar todo en modo kernel.');

INSERT INTO question_answers (question_id, answer_id, is_correct) VALUES
((SELECT id FROM questions WHERE question_text LIKE '%¿Por qué los sistemas operativos utilizan modos de operación (kernel y usuario)?%'), (SELECT id FROM answers WHERE answer_text = 'Para proteger el sistema operativo y los recursos críticos de accesos no autorizados por parte de programas de usuario.'), TRUE),
((SELECT id FROM questions WHERE question_text LIKE '%¿Por qué los sistemas operativos utilizan modos de operación (kernel y usuario)?%'), (SELECT id FROM answers WHERE answer_text = 'Para permitir que cualquier programa acceda a recursos críticos del sistema.'), FALSE),
((SELECT id FROM questions WHERE question_text = '¿Por qué los sistemas operativos utilizan modos de operación (kernel y usuario)?'), (SELECT id FROM answers WHERE answer_text = 'Para diferenciar entre procesos de usuario y demonios del sistema.'), FALSE), -- CORREGIDO: antes tenía "¿¿Por qué..."
((SELECT id FROM questions WHERE question_text LIKE '%¿Por qué los sistemas operativos utilizan modos de operación (kernel y usuario)?%'), (SELECT id FROM answers WHERE answer_text = 'Para mejorar el rendimiento general del sistema al ejecutar todo en modo kernel.'), FALSE);

-- Pregunta 11: Algoritmo de planificación de CPU
INSERT INTO questions (question_text, topic) VALUES ('¿Qué algoritmo de planificación de CPU es justo y equitativo en la asignación de tiempo de CPU a los procesos?', 'Planificación');

INSERT INTO answers (answer_text) VALUES
('First-Come, First-Served (FCFS)'),
('Shortest Job First (SJF)'),
('Priority Scheduling'),
('Round Robin');

INSERT INTO question_answers (question_id, answer_id, is_correct) VALUES
((SELECT id FROM questions WHERE question_text LIKE '%¿Qué algoritmo de planificación de CPU es justo y equitativo en la asignación de tiempo de CPU a los procesos?%'), (SELECT id FROM answers WHERE answer_text = 'Round Robin'), TRUE),
((SELECT id FROM questions WHERE question_text LIKE '%¿Qué algoritmo de planificación de CPU es justo y equitativo en la asignación de tiempo de CPU a los procesos?%'), (SELECT id FROM answers WHERE answer_text = 'First-Come, First-Served (FCFS)'), FALSE),
((SELECT id FROM questions WHERE question_text LIKE '%¿Qué algoritmo de planificación de CPU es justo y equitativo en la asignación de tiempo de CPU a los procesos?%'), (SELECT id FROM answers WHERE answer_text = 'Shortest Job First (SJF)'), FALSE),
((SELECT id FROM questions WHERE question_text LIKE '%¿Qué algoritmo de planificación de CPU es justo y equitativo en la asignación de tiempo de CPU a los procesos?%'), (SELECT id FROM answers WHERE answer_text = 'Priority Scheduling'), FALSE);


-- Pregunta 12: Memoria de Acceso Aleatorio (RAM)
INSERT INTO questions (question_text, topic) VALUES ('¿Cuál es la función principal de la Memoria de Acceso Aleatorio (RAM) en un sistema operativo?', 'Memoria');

INSERT INTO answers (answer_text) VALUES
('Almacenar datos de forma permanente, incluso cuando el equipo está apagado.'),
('Servir como caché para el procesador, acelerando el acceso a datos frecuentemente usados.'),
('Almacenar temporalmente los programas y datos que están siendo utilizados activamente por la CPU.'),
('Gestionar las operaciones de entrada/salida de la computadora.');

INSERT INTO question_answers (question_id, answer_id, is_correct) VALUES
((SELECT id FROM questions WHERE question_text LIKE '%¿Cuál es la función principal de la Memoria de Acceso Aleatorio (RAM) en un sistema operativo?%'), (SELECT id FROM answers WHERE answer_text = 'Almacenar temporalmente los programas y datos que están siendo utilizados activamente por la CPU.'), TRUE),
((SELECT id FROM questions WHERE question_text LIKE '%¿Cuál es la función principal de la Memoria de Acceso Aleatorio (RAM) en un sistema operativo?%'), (SELECT id FROM answers WHERE answer_text = 'Almacenar datos de forma permanente, incluso cuando el equipo está apagado.'), FALSE),
((SELECT id FROM questions WHERE question_text LIKE '%¿Cuál es la función principal de la Memoria de Acceso Aleatorio (RAM) en un sistema operativo?%'), (SELECT id FROM answers WHERE answer_text = 'Servir como caché para el procesador, acelerando el acceso a datos frecuentemente usados.'), FALSE),
((SELECT id FROM questions WHERE question_text LIKE '%¿Cuál es la función principal de la Memoria de Acceso Aleatorio (RAM) en un sistema operativo?%'), (SELECT id FROM answers WHERE answer_text = 'Gestionar las operaciones de entrada/salida de la computadora.'), FALSE);


-- Pregunta 13: Concepto de Kernel
INSERT INTO questions (question_text, topic) VALUES ('¿Qué es el "kernel" de un sistema operativo?', 'Conceptos Básicos');

INSERT INTO answers (answer_text) VALUES
('La interfaz gráfica de usuario que interactúa con el usuario.'),
('El conjunto de aplicaciones de software que vienen preinstaladas con el sistema operativo.'),
('El componente central del sistema operativo que gestiona los recursos del hardware y proporciona servicios a los programas.'),
('Un programa antivirus que protege el sistema.');

INSERT INTO question_answers (question_id, answer_id, is_correct) VALUES
((SELECT id FROM questions WHERE question_text LIKE '%¿Qué es el "kernel" de un sistema operativo?%'), (SELECT id FROM answers WHERE answer_text = 'El componente central del sistema operativo que gestiona los recursos del hardware y proporciona servicios a los programas.'), TRUE),
((SELECT id FROM questions WHERE question_text LIKE '%¿Qué es el "kernel" de un sistema operativo?%'), (SELECT id FROM answers WHERE answer_text = 'La interfaz gráfica de usuario que interactúa con el usuario.'), FALSE),
((SELECT id FROM questions WHERE question_text LIKE '%¿Qué es el "kernel" de un sistema operativo?%'), (SELECT id FROM answers WHERE answer_text = 'El conjunto de aplicaciones de software que vienen preinstaladas con el sistema operativo.'), FALSE),
((SELECT id FROM questions WHERE question_text LIKE '%¿Qué es el "kernel" de un sistema operativo?%'), (SELECT id FROM answers WHERE answer_text = 'Un programa antivirus que protege el sistema.'), FALSE);


-- Pregunta 14: Monitores en C
INSERT INTO questions (question_text, topic) VALUES ('¿Qué es un "monitor" en el contexto de la sincronización de procesos (como en C)?', 'Sincronización');

INSERT INTO answers (answer_text) VALUES
('Un dispositivo de visualización de información.'),
('Un programa que supervisa el rendimiento del sistema.'),
('Un constructo de alto nivel que proporciona exclusión mutua y permite a los procesos esperar por condiciones específicas.'),
('Un tipo de hilo ligero para tareas pequeñas.');

INSERT INTO question_answers (question_id, answer_id, is_correct) VALUES
((SELECT id FROM questions WHERE question_text LIKE '%¿Qué es un "monitor" en el contexto de la sincronización de procesos (como en C)?%'), (SELECT id FROM answers WHERE answer_text = 'Un constructo de alto nivel que proporciona exclusión mutua y permite a los procesos esperar por condiciones específicas.'), TRUE),
((SELECT id FROM questions WHERE question_text LIKE '%¿Qué es un "monitor" en el contexto de la sincronización de procesos (como en C)?%'), (SELECT id FROM answers WHERE answer_text = 'Un dispositivo de visualización de información.'), FALSE),
((SELECT id FROM questions WHERE question_text LIKE '%¿Qué es un "monitor" en el contexto de la sincronización de procesos (como en C)?%'), (SELECT id FROM answers WHERE answer_text = 'Un programa que supervisa el rendimiento del sistema.'), FALSE),
((SELECT id FROM questions WHERE question_text LIKE '%¿Qué es un "monitor" en el contexto de la sincronización de procesos (como en C)?%'), (SELECT id FROM answers WHERE answer_text = 'Un tipo de hilo ligero para tareas pequeñas.'), FALSE);


-- Pregunta 15: Segmentación vs. Paginación
INSERT INTO questions (question_text, topic) VALUES ('¿Cuál es la principal diferencia entre la segmentación y la paginación en la gestión de memoria?', 'Memoria');

INSERT INTO answers (answer_text) VALUES
('La segmentación divide la memoria en bloques de tamaño fijo, mientras que la paginación lo hace en bloques de tamaño variable.'),
('La segmentación es visible para el programador, mientras que la paginación es transparente.'),
('La segmentación utiliza tablas de páginas, mientras que la paginación utiliza tablas de segmentos.'),
('La paginación es susceptible a la fragmentación externa, mientras que la segmentación es susceptible a la fragmentación interna.');

INSERT INTO question_answers (question_id, answer_id, is_correct) VALUES
((SELECT id FROM questions WHERE question_text LIKE '%¿Cuál es la principal diferencia entre la segmentación y la paginación en la gestión de memoria?%'), (SELECT id FROM answers WHERE answer_text = 'La segmentación es visible para el programador, mientras que la paginación es transparente.'), TRUE),
((SELECT id FROM questions WHERE question_text LIKE '%¿Cuál es la principal diferencia entre la segmentación y la paginación en la gestión de memoria?%'), (SELECT id FROM answers WHERE answer_text = 'La segmentación divide la memoria en bloques de tamaño fijo, mientras que la paginación lo hace en bloques de tamaño variable.'), FALSE),
((SELECT id FROM questions WHERE question_text LIKE '%¿Cuál es la principal diferencia entre la segmentación y la paginación en la gestión de memoria?%'), (SELECT id FROM answers WHERE answer_text = 'La segmentación utiliza tablas de páginas, mientras que la paginación utiliza tablas de segmentos.'), FALSE),
((SELECT id FROM questions WHERE question_text LIKE '%¿Cuál es la principal diferencia entre la segmentación y la paginación en la gestión de memoria?%'), (SELECT id FROM answers WHERE answer_text = 'La paginación es susceptible a la fragmentación externa, mientras que la segmentación es susceptible a la fragmentación interna.'), FALSE);
