create database corte;

use corte;

create table users(
    id int(11) NOT NULL auto_increment,
    username VARCHAR(30) NOT NULL,
    password VARCHAR(100) NOT NULL,
    nombre VARCHAR(65) NOT NULL,
    PRIMARY KEY (id)
);

create table colonia(
    id int not null auto_increment,
    nombre varchar(40) not null,
    PRIMARY KEY(id)
)
;
create table mikrotik(
    id int not null auto_increment,
    nombre varchar(45) not null,
    enlace varchar(70) not null,
    PRIMARY KEY(id)
);

create table estado(
    id int not null auto_increment,
    nombre varchar(10) not null,
    PRIMARY KEY(id)
);

create table clientes(
    id int not null auto_increment,
    nombre varchar(80) not null,
    telefono varchar(11) not null,
    megas_subida varchar(9),
    megas_bajada varchar(9),
    ip varchar(20),
    comentarios TEXT, 
    colonia_id int,
    mikrotik_id int,
    estado_id int,
    primary key(id),
    CONSTRAINT fk_colonia FOREIGN KEY (colonia_id) REFERENCES colonia(id),
    CONSTRAINT fk_mikrotik FOREIGN KEY (mikrotik_id) REFERENCES mikrotik(id),
    CONSTRAINT fk_estado FOREIGN KEY (estado_id) REFERENCES estado(id)
);


UPDATE clientes
SET estado_id = 1;
