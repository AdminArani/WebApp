# Arani Web App

### Instalacion
La primera vez que bajamos el proyecto es necesario correr el comando `npm install` para instalar todas las dependecias necesarias para correr el sistema.

### Iniciar la aplicacion
Para iniciar el programa ina vez instalada las dependencias usamos el comando `npm start` y se nos abrira el navegador automativamente en `localhost:3000`


### Compilar
Para generar los archivos necesarios para subir a produccion es necesario compilar el proeycto esto lo hacemos con el comando `npm run build` lo cual creara una carpeta llamada `/build` en la raiz del proyecto.

## Librerias usadas
* React https://react.dev (librearia principal Javascript)
* Mui https://mui.com Libreria de componentes para la interfaz
* Axios https://axios-http.com/docs/intro (para las peticiones ajax)
* Momentjs https://momentjs.com (para manejo de fechas)
* Numeraljs http://numeraljs.com (Para maneoj de numeros)
* React Router https://reactrouter.com/en/main (para el manejo de rutas)

## Componentes del proyecto

| Archivo  | Descripción |
|:---------|:------------|
|index.js|Se inserta react en el dom, aqui no se hace nada mas generalmente|
| App.js      | Aqui estan las rutas y el actualizador de versiones y es la raiz del sitio    |
| App.css        | Contiene todos los estidos adicionales del proyecto    |
| CambiarPass.js      | Pantalla donde el usuario cambia su contraseña     |
|Historial.js| El historial de los prestamos|
|index.css|Estilos css de la raiz esta a un nivel mas arriba de App.css|
|Login.js|La pantalla de inicio, aqui el usuario ingresa y valida por mensaje su token de ingreso|
|Main.js|Aqui esta la pantalla inicial donde esta el menu una ve a ingresado|
|NoExiste.js|Este pantalla se muestra cuando una ruta no existe|
|Perfil.js|Esta es la pantalla del perfil del usuario, donde puede actualizar su datos|
|Plan.js|Pantalla donde se muestra la informacion del prestamo|
|Aplicar|Pantalla donde se solicitan prestamos segun la posibilidad del cliente|
|RecuperarPass.js|Pantalla para recuperar la contraseña|
|Registro.js|Pantalla de registro de nuevos usuarios|
|componentes/BarraApp.js|Componente que se inserta en multiples paginas y que es la barra superior de la aplicación|
|componentes/BarraFinal.js|Componente que se inserta en varias paginas y que muestra la versión del app y esta ubicada al final de la pagina generalmente|
|componentes/Contrato.js|Contenedor de los detalles del contrato al solicitar préstamo|
|componentes/CrearNuevoPrestamo.js|Componente que se inserta en una ventana que contiene toda la pantalla de solicitar un nuevo préstamo|
|componentes/utilidades.js|Procesadores de estados|
|componentes/TerminarRegistro.js|Pantalla de legado que pedia datos para terminar de registrar los usuarios, actualmente no esta en uso|
|ValidarMail.js|Pantalla que valida automaticamente el correo de un usuario pasandole un parametro|