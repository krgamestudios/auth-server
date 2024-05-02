#use this while debugging
CREATE DATABASE auth;
CREATE USER 'auth'@'%' IDENTIFIED BY 'charizard';
GRANT ALL PRIVILEGES ON auth.* TO 'auth'@'%';
