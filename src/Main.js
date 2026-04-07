import config from './config';
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { Button, Paper, Typography } from "@mui/material";
import { useContext, useState, useEffect } from "react";
import { AppContext } from "./App";
import BarraFinal from "./componentes/BarraFinal";
import tile_perfil from "./images/tile_perfil.svg";
import tile_aplicar from "./images/tile_aplicar.svg";
import tile_chat from "./images/tile_chat.svg";
import tile_plan from "./images/tile_plan.svg";
import tile_referir from "./images/tile_referir.svg";
import tile_historial from "./images/tile_historial.svg";
import { Link } from "react-router-dom";
import BarraApp from "./componentes/BarraApp.js";
import ModalDatosFaltantes from "./componentes/ModalDatosFaltantes";
import axios from "axios";      
import { orange } from "@mui/material/colors";

function Main() {
    const gContext = useContext(AppContext);
    const [showAplicarLink, setShowAplicarLink] = useState(false);
    const [ubicacion, setUbicacion] = useState('');
    const [loading, setLoading] = useState(true);

    const [usuarioDetalle, set_usuarioDetalle] = useState({});
    const [usuarioDetalleFullR, set_usuarioDetalleFullR] = useState(false);
    const [faltaTerminarRegistro, set_faltaTerminarRegistro] = useState(false);
    const [cargando, set_cargando] = useState(true);
    const [cargando2, set_cargando2] = useState(true);
    const [openterminarreg, set_openterminarreg] = useState(false);
    const [openEditarCampos, set_openEditarCampos] = useState(false);
    const [walletData, set_walletData] = useState(false);
    const [moduloEditarActivo, set_moduloEditarActivo] = useState("");
    const [clasificacion, set_clasificacion] = useState("--");
    const [apiCamposConstructor, set_apiCamposConstructor] = useState(false);
    const [usuarioFiles, set_usuarioFiles] = useState(false);
    const [usuarioAprobadoManual, set_usuarioAprobadoManual] = useState(false);
    const [urlImagenPerfilTerminada, set_urlImagenPerfilTerminada] = useState(false);
    const [datosEnviadosArevision, set_datosEnviadosArevision] = useState(false);
    

    //aviso inicio//



    //aviso final//
    

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    function validarPerfilEnCore(callback) {
        // Para saber si ya está registrado en el CORE o no
        axios.request({
            url: `${config.apiUrl}/api/app/getProfile.php`,
            method: "post",
            data: {
                sid: gContext.logeado?.token,
            },
        })
        .then((res) => {
            set_cargando(false);
            if (res.data.status === "ER") {
                console.log(res.data.payload.message);
            }
            if (res.data.status === "ERS") {
                localStorage.removeItem('arani_session_id');
                gContext.set_logeado({ estado: false, token: '' });
            }
            if (res.data.status === "OK") {
                console.log('usuarioDetalle', res.data.payload.data);
                set_usuarioDetalleFullR(res.data);
                set_usuarioDetalle(res.data.payload.data);
                set_usuarioFiles(res.data.files);
                set_clasificacion(res.data.csas);
                if (res.data.payload.data.status === "1") {
                    set_usuarioAprobadoManual(true);
                }
    
                if (res.data.datasend === "CMP") {
                    set_datosEnviadosArevision(true);
                }
    
                // Imagen perfil
                let t18 = res.data.files.find(e => e.type === "18");
                if (t18?.dir) set_urlImagenPerfilTerminada(`${config.apiUrl}${t18?.dir}`);
    
                console.log('usuarioDetalleFullR.datasend', usuarioDetalleFullR.datasend);
                console.log('usuarioDetalleFullR', usuarioDetalleFullR);
    
                // Obtener customer_id y person_code
                const customerId = res.data.payload.data.customer_id;
                const personCode = res.data.payload.data.person_code;
    
                // Llama a la función para guardar la ubicación
                guardarUbicacion(customerId, personCode);
            }
            if (res.data.status === 500) {
                console.log("res.data.status === 500");
                set_faltaTerminarRegistro(true);
            }
            if (typeof callback === 'function') callback();
        }).catch(err => {
            console.log(err.message);
        });
    }
    
    async function guardarUbicacion(customerId) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            const apiUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
            
            try {
                const response = await fetch(apiUrl);
                const data = await response.json();
    
                const ciudad = data.address.city || data.address.town || data.address.village || '';
                const pais = data.address.country || '';
                setUbicacion(`${ciudad}, ${pais}`);
        
                // Lista de ubicaciones permitidas
                const ubicacionesPermitidas = [
                    "Tegucigalpa, Honduras",
                    "Comayagüela, Honduras",
                    "Valle de Angeles, Honduras",
                    "Choloma, Honduras",
                    "La Lima, Honduras",
                    "Villanueva, Honduras",
                    "El Progreso, Honduras",
                    "San Pedro Sula, Honduras",
                    "Puerto Cortés, Honduras",
                    "El Progreso, Honduras",
                    "Danlí, Honduras",
                    "Danlì, Honduras",
                    "Danli, Honduras",
                    "Choluteca, Honduras",
                    "Comayagua, Honduras",
                    "Siguatepeque, Honduras",
                    "La Ceiba, Honduras",
                    "La Paz, Honduras",
                    "Santa Rosa de Copán, Honduras",
                    "Gracias, Honduras",
                    "Roatán, Honduras",
                    "French Harbour, Honduras",
                    "Santa Rosa, Honduras",
                    "Intibucá, Honduras",
                ];
        
                // Verificar si la ubicación coincide con alguna de las ubicaciones permitidas
                if (ubicacionesPermitidas.includes(`${ciudad}, ${pais}`)) {
                    setShowAplicarLink(true);
                }
        
                // Obtener la dirección IP del dispositivo
                const ipResponse = await fetch('https://api.ipify.org?format=json');
                const ipData = await ipResponse.json();
                const ip = ipData.ip; // Capturando la IP
        
                // Obtener el navegador y sistema operativo
                const userAgent = navigator.userAgent;
                let navegador = 'Desconocido';
                let sistemaOperativo = 'Desconocido';
        
                if (userAgent.includes('Brave')) {
                    navegador = 'Brave Browser';
                } else if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
                    navegador = 'Google Chrome';
                } else if (userAgent.includes('Firefox')) {
                    navegador = 'Mozilla Firefox';
                } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
                    navegador = 'Apple Safari';
                } else if (userAgent.includes('Edg')) {
                    navegador = 'Microsoft Edge';
                } else if (userAgent.includes('Opera') || userAgent.includes('OPR')) {
                    navegador = 'Opera';
                } else if (userAgent.includes('MSIE') || userAgent.includes('Trident')) {
                    navegador = 'Internet Explorer';
                }
    
                if (userAgent.includes('Macintosh') || userAgent.includes('Mac OS X')) {
                    sistemaOperativo = 'MacOS';
                } else if (userAgent.includes('Win')) {
                    sistemaOperativo = 'Windows';
                } else if (userAgent.includes('Linux') || userAgent.includes('X11')) {
                    sistemaOperativo = 'Linux';
                } else if (userAgent.includes('Android')) {
                    sistemaOperativo = 'Android';
                } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
                    sistemaOperativo = 'iOS';
                }
        
                // Hacer POST a tu API para guardar latitud, longitud, navegador y sistema operativo
                const postResponse = await fetch('https://app.aranih.com/api/app/post_locations.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        idClient: customerId,
                        ip: ip, // Enviar la IP en lugar del DNI
                        latitude: latitude,
                        longitude: longitude,
                        navegador: navegador,
                        sistema_operativo: sistemaOperativo,
                    }),
                });
        
                // Verificar el estado de la respuesta
                if (!postResponse.ok) {
                    const errorMessage = await postResponse.text(); // Obtener el cuerpo de la respuesta como texto
                    console.error('Error en la respuesta del API:', errorMessage);
                    throw new Error(`HTTP error! status: ${postResponse.status}`);
                }
        
                // Intentar analizar la respuesta como JSON
                const postData = await postResponse.json();
                console.log(postData); // Manejo de la respuesta
        
            } catch (error) {
                console.error('Bienvenido:', error);
            }
        });
    }
    


    // useEffect para llamar a la función validarPerfilEnCore al cargar el componente
    useEffect(() => {
        validarPerfilEnCore(() => {
            console.log('Perfil validado al cargar la página.');
        });
    }, []);
    
    
    // useEffect para llamar a la función validarPerfilEnCore al cargar el componente
    useEffect(() => {
        validarPerfilEnCore(() => {
            console.log('Perfil validado al cargar la página.');
        });
    }, []);
    
    

    const salir = () => {
        gContext.set_logeado({ estado: false, token: '' });
        localStorage.removeItem('arani_session_id');
    };

    const abrirLandBot = () => {
        // eslint-disable-next-line
        myLandbot.open();
    };

    const [ubicacionNoDisponible, setUbicacionNoDisponible] = useState(false);

    useEffect(() => {
        const fetchUbicacion = async () => {
            setUbicacion('Cargando ubicación...'); // Mostrar mensaje de carga
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const ubicacionExistente = false; // Cambia esto según el resultado de tu API
            
            if (!ubicacionExistente) {
                setUbicacion('Para continuar con el proceso de solicitud de préstamo en Arani App, es necesario que el navegador acceda a tu ubicación en tu celular.');
            } else {
                setUbicacion('Ubicación obtenida con éxito');
            }
    
            setLoading(false);
        };
    
        fetchUbicacion();
    }, []);

    const mensajesErrores = {
        0: "Vas muy bien! Ya pasaste a la segunda etapa",
        1: "No pudimos confirmar tu foto selfie en tu perfil. Para más detalles, <a href='https://www.arani.hn/erroresperfil.php' target='_blank'>haz clic aquí</a>.",
        2: "Tu recibo público no es válido en tu perfil. Para más detalles, <a href='https://www.arani.hn/erroresperfil.php' target='_blank'>haz clic aquí</a>.",
        3: "No pudimos confirmar tus documentos en tu perfil. Para más detalles, <a href='https://www.arani.hn/erroresperfil.php' target='_blank'>haz clic aquí</a>.",
        4: "No pudimos confirmar tu DNI en tu perfil. Para más detalles, <a href='https://www.arani.hn/erroresperfil.php' target='_blank'>haz clic aquí</a>.",
        5: "Por ahora no fue posible aprobar tu préstamo tras el analisis de tu perfil. Tu situación puede mejorar con el tiempo, por lo que te invitamos a volver a intentarlo en 3 meses para una nueva evaluación. Para más detalles, <a href='https://www.arani.hn/erroresperfil.php' target='_blank'>haz clic aquí</a>.",
        7: "Por ahora no fue posible aprobar tu préstamo tras el analisis de tu perfil. Tu situación puede mejorar con el tiempo, por lo que te invitamos a volver a intentarlo en 3 meses para una nueva evaluación. Para más detalles, <a href='https://www.arani.hn/erroresperfil.php' target='_blank'>haz clic aquí</a>.",
        8: "Por ahora no fue posible aprobar tu préstamo tras el analisis de tu perfil. Tu situación puede mejorar con el tiempo, por lo que te invitamos a volver a intentarlo en 3 meses para una nueva evaluación. Para más detalles, <a href='https://www.arani.hn/erroresperfil.php' target='_blank'>haz clic aquí</a>.",
        9: "Por ahora no fue posible aprobar tu préstamo tras el analisis de tu perfil. Tu situación puede mejorar con el tiempo, por lo que te invitamos a volver a intentarlo en 3 meses para una nueva evaluación. Para más detalles, <a href='https://www.arani.hn/erroresperfil.php' target='_blank'>haz clic aquí</a>.",
        10: "Por ahora no fue posible aprobar tu préstamo tras el analisis de tu perfil. Tu situación puede mejorar con el tiempo, por lo que te invitamos a volver a intentarlo en 3 meses para una nueva evaluación. Para más detalles, <a href='https://www.arani.hn/erroresperfil.php' target='_blank'>haz clic aquí</a>.",
        11: "Por ahora no fue posible aprobar tu préstamo tras el analisis de tu perfil. Tu situación puede mejorar con el tiempo, por lo que te invitamos a volver a intentarlo en 3 meses para una nueva evaluación. Para más detalles, <a href='https://www.arani.hn/erroresperfil.php' target='_blank'>haz clic aquí</a>.",
        12: "Por ahora no fue posible aprobar tu préstamo tras el analisis de tu perfil. Tu situación puede mejorar con el tiempo, por lo que te invitamos a volver a intentarlo en 3 meses para una nueva evaluación. Para más detalles, <a href='https://www.arani.hn/erroresperfil.php' target='_blank'>haz clic aquí</a>.",
        13: "Faltan documentos requeridos. Para más detalles, <a href='https://www.arani.hn/erroresperfil.php' target='_blank'>haz clic aquí</a>.",
        14: "Validación de fotografía selfie fallida. Para más detalles, <a href='https://www.arani.hn/erroresperfil.php' target='_blank'>haz clic aquí</a>.",
        15: "Recibo público no es válido. Para más detalles, <a href='https://www.arani.hn/erroresperfil.php' target='_blank'>haz clic aquí</a>.",
        16: "Recibo público mayor al tiempo permitido. Para más detalles, <a href='https://www.arani.hn/erroresperfil.php' target='_blank'>haz clic aquí</a>.",
        17: "Referencias no son validas. Para más detalles, <a href='https://www.arani.hn/erroresperfil.php' target='_blank'>haz clic aquí</a>.",
        18: "No pudimos validar tu identidad. Para más detalles, <a href='https://www.arani.hn/erroresperfil.php' target='_blank'>haz clic aquí</a>.",
        19: "Cuenta de banco no es valida, Para más detalles, <a href='https://www.arani.hn/erroresperfil.php' target='_blank'>haz clic aquí</a>.",
        21: "Solicitud no aprobada por ahora no fue posible aprobar tu préstamo tras el análisis de tu perfil. Tu situación puede mejorar con el tiempo, por lo que te invitamos a volver a intentarlo en 3 meses para una nueva evaluación.",
        22: "Solicitud no aprobada por ahora no fue posible aprobar tu préstamo tras el análisis de tu perfil. Tu situación puede mejorar con el tiempo, por lo que te invitamos a volver a intentarlo en 3 meses para una nueva evaluación.",
        23: "Solicitud no aprobada por ahora no fue posible aprobar tu préstamo tras el análisis de tu perfil. Tu situación puede mejorar con el tiempo, por lo que te invitamos a volver a intentarlo en 3 meses para una nueva evaluación."
    };
    
    

    const styles = {
        container: {
          padding: '16px',
          margin: '16px auto',
          maxWidth: '500px',
          backgroundColor: '#fff5f5',
          border: '1px solid #f5c2c2',
          borderRadius: '8px',
          textAlign: 'center',
          boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
        },
        text: {
          color: '#e74c3c',
          fontSize: '16px',
          fontWeight: 'bold',
          lineHeight: '1.5',
        },
        containerOk: {
                    padding: '16px',
                    margin: '16px auto',
                    maxWidth: '500px',
                    backgroundColor: '#f0fff4',
                    border: '1px solid #b7ebc6',
                    borderRadius: '8px',
                    textAlign: 'center',
                    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                },
                textOk: {
                    color: '#5b75e7',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    lineHeight: '1.5',
                },
                linkOk: {
                    color: orange[700],
                    textDecoration: 'underline',
                },
    };

    const [showModal, setShowModal] = useState(false);

    const handleSaveDatosFaltantes = (formData) => {
        // Aquí puedes enviar los datos al backend o actualizar el estado
        console.log("Datos guardados:", formData);
        setShowModal(false);
    };
      

    return (   
            <Container disableGutters sx={{ minHeight: '100vh', display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }} component="main" maxWidth="md">
            {loading ? (
                 <div style={{ 
                    position: 'fixed', 
                    top: 0, 
                    left: 0, 
                    width: '100%', 
                    height: '100%', 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    backgroundColor: '#5b75e7' 
                  }}>
                    <img src={process.env.PUBLIC_URL + '/araniloader1.gif'} alt="loading" style={{height: '250px', width:'250px'}}/>
                  </div>
            ) : (
            <Box sx={{ p: '4px' }}>
                <Paper elevation={6} sx={{ p: 6 }}>
                    <BarraApp />
                    <Typography variant="h5" sx={{ mt: 6 }}>Inicio</Typography>
                    <p>
                        <strong>Ubicación: </strong> 
                        {loading ? 'Cargando...' : (
                            <span style={{ color: ubicacion === 'Para continuar con el proceso de solicitud de préstamo en Arani App, es necesario que el navegador acceda a tu ubicación en tu celular.' ? 'red' : 'black' }}>
                                {ubicacion}
                                {ubicacion === 'Para continuar con el proceso de solicitud de préstamo en Arani App, es necesario que el navegador acceda a tu ubicación en tu celular.' && (
                                    <a href="https://www.arani.hn/erroresperfil.php#ubicacion" target="_blank" rel="noopener noreferrer" style={{ marginLeft: '8px', color: 'blue' }}>
                                        Ver más
                                    </a>
                                )}
                            </span>
                        )}
                    </p>
                    {usuarioDetalle.status === "1" &&
                    !showAplicarLink &&
                    ubicacion !== "Para continuar con el proceso de solicitud de préstamo en Arani App, es necesario que el navegador acceda a tu ubicación en tu celular." && (
                        <div style={{ color: "#e74c3c", fontWeight: "bold", marginBottom: 16 }}>
                            Lo sentimos, actualmente esta función no está permitida en tu ubicación.
                        </div>
                    )}

                    {(usuarioDetalle.status === "0" || usuarioDetalle.status === 0) && (
                        <>
                            {(() => {
                                const errorPerfil = usuarioDetalle.errores_perfil;
                                const errorKey = errorPerfil != null ? String(errorPerfil) : "";

                                // Si existe errores_perfil, mostrarlo siempre (sin importar cuántos días hayan pasado)
                                // Nota: `0` es un valor válido pero es falsy, por eso se valida contra null/undefined.
                                if (errorPerfil != null && errorKey !== "" && errorKey !== "20") {
                                    // Caso especial: errores_perfil = 0 (mostrar en verde + link interno)
                                    if (errorKey === "0") {
                                        return (
                                            <div style={styles.containerOk}>
                                                <Typography style={styles.textOk}>
                                                    {mensajesErrores[0]}
                                                    <span> 🎉</span>
                                                    <br />
                                                    Estás a un paso de solicitar tu préstamo.
                                                    <br />
                                                    <br />
                                                    Completa tu perfil ahora y desbloquea tu monto disponible en unos minutos.
                                                    <br />
                                                    <Link to="/perfil" style={styles.linkOk}>Completar mi perfil</Link>
                                                </Typography>
                                            </div>
                                        );
                                    }

                                    // Resto de errores (mantener estilo rojo)
                                    return (
                                        <div style={styles.container}>
                                            <Typography
                                                style={styles.text}
                                                dangerouslySetInnerHTML={{
                                                    __html: mensajesErrores[errorKey] || errorPerfil,
                                                }}
                                            />
                                        </div>
                                    );
                                }

                                // Si no hay error o la fecha no es un día antes, muestra el mensaje normal
                                return (
                                    <div style={styles.container}>
                                        <Typography style={styles.text}>
                                            Hemos recibido los cambios y estamos validando tus datos. Te estaremos respondiendo dentro de 48 horas hábiles, gracias por tu paciencia!
                                        </Typography>
                                        <Typography style={{ ...styles.text, marginTop: '8px' }}>
                                            <a href="https://app.arani.hn/#/perfil" target="_blank" rel="noopener noreferrer" style={{ color: '#3498db', textDecoration: 'none' }}>
                                                Ir a mi perfil
                                            </a>
                                        </Typography>
                                    </div>
                                );
                            })()}
                        </>
                    )}

                    {/* Anuncio para fechas especiales mostrar a todos los usuarios */}
                    {(() => {
                        const fechaActual = new Date();
                        const inicioFeriado = new Date('2026-02-28'); // Inicio del feriado
                        const finFeriado = new Date('2026-03-01'); // Fin del feriado

                        if (usuarioDetalle.status === "1" && fechaActual >= inicioFeriado && fechaActual <= finFeriado) {
                            return (
                                <div style={styles.container}>
                                    <Typography style={styles.text}>
                                        Queremos recordarte que los días sábado y domingo no se procesan solicitudes
                                    </Typography>
                                    <Typography style={{ ...styles.text, marginTop: '8px' }}>
                                        ni desembolsos de préstamos. 
                                    </Typography>
                                    <Typography style={{ ...styles.text, marginTop: '8px' }}>
                                        ! De lunes a viernes estaremos encantados de ayudarte !
                                    </Typography>
                                    <Typography style={{ ...styles.text, marginTop: '8px' }}>
                                        Gracias por tu comprensión 💛
                                    </Typography>
                                </div>
                            );
                        }
                        return null; // No mostrar nada si no está dentro del rango de fechas
                    }
                    )()}
    

                    <div className="contetilebotonpri">
                        {["21", "22", "23"].includes(usuarioDetalle?.errores_perfil) ? (
                            <Link
                                to="#"
                                className="tilebotonpri disabled"
                                aria-disabled="true"
                                tabIndex={-1}
                                onClick={(e) => e.preventDefault()}
                            >
                                <div className="tilebotonpri-tit">Perfil</div>
                                <div className="tilebotonpri-desc">Lo sentimos tu perfil no es elegible.</div>
                                <div className="tilebotonpri-icon"><img alt="" src={tile_perfil} /></div>
                            </Link>
                        ) : (
                            <Link to="/perfil" className="tilebotonpri">
                                <div className="tilebotonpri-tit">Perfil</div>
                                <div className="tilebotonpri-desc">Actualiza todos los datos de tu cuenta.</div>
                                <div className="tilebotonpri-icon"><img alt="" src={tile_perfil} /></div>
                            </Link>
                        )}


                        {/* Si el usuario está en la ubicación deseada, muestra el enlace de aplicar */}
                        {(() => {
                            const fechaActual = new Date();
                            const fechaUTC6 = new Date(fechaActual.toLocaleString("en-US", { timeZone: "America/Tegucigalpa" }));
                            const anio = fechaUTC6.getFullYear();
                            const mes = fechaUTC6.getMonth() + 1; // Los meses en JavaScript son base 0
                            const dia = fechaUTC6.getDate();

                            // Verificar si estamos en fechas específicas de feriado (YYYY-MM-DD)
                            const claveFecha = `${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
                            const fechasFeriado = new Set(["2026-02-28", "2026-03-01"]);
                            const esFeriado = fechasFeriado.has(claveFecha);

                            if (esFeriado) {
                                return (
                                    <Link className="tilebotonpri disabled" style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', textAlign: 'left', overflow: 'hidden', whiteSpace: 'normal', wordWrap: 'break-word' }}>
                                    <div style={{ flex: 1 }}>
                                        <div className="tilebotonpri-tit" style={{ textAlign: 'left' }}>Aplicar</div>
                                        <div className="tilebotonpri-desc" style={{ textAlign: 'left' }}>
                                            Te recordamos que los fines de semana no se realizan solicitudes ni desembolsos de préstamos.
                                        </div>
                                    </div>
                                    <div className="tilebotonpri-icon" style={{ marginLeft: '8px' }}>
                                        <img alt="" src={tile_aplicar} />
                                    </div>
                                </Link>
                                );
                            }

                            // Si el status es "0", mostrar el botón pero deshabilitado
                            if (usuarioDetalle.status === "0" || usuarioDetalle.status === 0) {
                                return (
                                    <Link className="tilebotonpri disabled" to="#" onClick={e => e.preventDefault()}>
                                        <div className="tilebotonpri-tit">Aplicar</div>
                                        <div className="tilebotonpri-desc">
                                            Tu perfil sigue en proceso de validación. No puedes aplicar aún.
                                        </div>
                                        <div className="tilebotonpri-estado"></div>
                                        <div className="tilebotonpri-icon"><img alt="" src={tile_aplicar} /></div>
                                    </Link>
                                );
                            }

                            // Si el usuario está validado pero fuera de ubicación permitida
                            if (
                                (usuarioDetalle.status === "1" || usuarioDetalle.status === 1) &&
                                !showAplicarLink
                            ) {
                                return (
                                    <Link className="tilebotonpri disabled">
                                        <div className="tilebotonpri-tit">Aplicar</div>
                                        <div className="tilebotonpri-desc">
                                            Lo sentimos, actualmente esta función no está permitida en tu ubicación.
                                        </div>
                                        <div className="tilebotonpri-estado"></div>
                                        <div className="tilebotonpri-icon"><img alt="" src={tile_aplicar} /></div>
                                    </Link>
                                );
                            }

                            // Caso normal
                            return showAplicarLink ? (
                                <Link
                                    to={(!usuarioDetalle.ref_tipo_per || !usuarioDetalle.ref_nom_per || !usuarioDetalle.ref_tel_per) ? "#" : "/aplicar2"}
                                    className="tilebotonpri"
                                    onClick={async (e) => {
                                        if (
                                            !usuarioDetalle.ref_tipo_per ||
                                            !usuarioDetalle.ref_nom_per ||
                                            !usuarioDetalle.ref_tel_per ||
                                            !usuarioDetalle.ref_tipo_lab ||
                                            !usuarioDetalle.ref_nom_lab ||
                                            !usuarioDetalle.ref_tel_lab
                                        ) {
                                            e.preventDefault();
                                            setShowModal(true);
                                        } else {

                                            // IMPORTANTE: detener navegación automática hasta tener respuesta
                                            e.preventDefault();

                                            try {
                                                // --- NUEVA REQUEST ANTES DE IR A /aplicar ---
                                                const tokenPriceList = "d4d0YcB89pFZB4qYQALfQiqpTGaDY4VrsZrFSy8OomiVfe2pbOxk9TxbTFOTULTJ";

                                                const parseFechaSQL = (value) => {
                                                    if (!value) return null;
                                                    const raw = String(value).trim();

                                                    // Soporta: "YYYY-MM-DD" y "YYYY-MM-DD HH:mm:ss" (formato típico SQL)
                                                    // Safari suele fallar con el espacio; por eso se normaliza a ISO.
                                                    const soloFecha = raw.includes(" ") ? raw.split(" ")[0] : raw;
                                                    const iso = `${soloFecha}T00:00:00`;
                                                    const date = new Date(iso);

                                                    return Number.isNaN(date.getTime()) ? null : date;
                                                };

                                                const inicioWork = parseFechaSQL(usuarioDetalle.created);

                                                const hoy = new Date();
                                                const dias = (inicioWork && !Number.isNaN(inicioWork.getTime()))
                                                    ? Math.max(0, Math.floor((hoy.getTime() - inicioWork.getTime()) / (1000 * 60 * 60 * 24)))
                                                    : 0;

                                                const clientIdPriceList = usuarioDetalle.customerId ?? usuarioDetalle.customer_id; // por si viene con otro nombre
                                                const identidad = usuarioDetalle.person_code;

                                                const payloadPriceList = {
                                                    client_id: String(clientIdPriceList ?? ""),
                                                    identidad: String(identidad ?? ""),
                                                    token: tokenPriceList,
                                                    dias: dias,
                                                    salario: Number(usuarioDetalle.income ?? 0),
                                                    lastLoanDaysLate: dias,
                                                };

                                                console.log("[Aplicar] postPriceList -> URL:", "https://app.aranih.com/api/DecisionRules/postPriceList.php");
                                                console.log("[Aplicar] postPriceList -> usuarioDetalle.customerId:", usuarioDetalle.customerId);
                                                console.log("[Aplicar] postPriceList -> usuarioDetalle.customer_id:", usuarioDetalle.customer_id);
                                                console.log("[Aplicar] postPriceList -> usuarioDetalle.person_code:", usuarioDetalle.person_code);
                                                console.log("[Aplicar] postPriceList -> usuarioDetalle.created:", usuarioDetalle.created);
                                                console.log("[Aplicar] postPriceList -> inicioWork:", inicioWork);
                                                console.log("[Aplicar] postPriceList -> hoy:", hoy);
                                                console.log("[Aplicar] postPriceList -> dias calculados:", dias);
                                                console.log("[Aplicar] postPriceList -> usuarioDetalle.income:", usuarioDetalle.income);
                                                console.log("[Aplicar] postPriceList -> payload:", payloadPriceList);

                                                const priceListResponse = await fetch("https://app.aranih.com/api/DecisionRules/postPriceList.php", {
                                                    method: "POST",
                                                    headers: {
                                                        "Content-Type": "application/json",
                                                    },
                                                    body: JSON.stringify(payloadPriceList),
                                                });

                                                console.log("[Aplicar] postPriceList -> status:", priceListResponse.status, priceListResponse.statusText);

                                                if (!priceListResponse.ok) {
                                                    const errText = await priceListResponse.text();
                                                    console.error("[Aplicar] postPriceList -> ERROR body:", errText);
                                                    return; // NO avanzar a /aplicar
                                                } else {
                                                    // Si el endpoint devuelve JSON y quieres verlo:
                                                    // const okJson = await priceListResponse.json();
                                                    // console.log("[Aplicar] postPriceList -> OK JSON:", okJson);

                                                    // Si no estás seguro si es JSON:
                                                    const okText = await priceListResponse.text();
                                                    console.log("[Aplicar] postPriceList -> OK body:", okText);
                                                }

                                                // --- TU CÓDIGO ANTERIOR (SIN CAMBIOS, solo agrego logs) ---
                                                try {
                                                    const payloadModeloCliente = {
                                                        codigo: "f7a6d3b4-5c29-4e7f-92a4-28e5d39c3a8e",
                                                        clientId: usuarioDetalle.customer_id, // Usar el clientId del usuario
                                                    };

                                                    console.log("[Aplicar] modeloClienteExistente -> URL:", "https://app.aranih.com/api/app/modeloClienteExistente.php");
                                                    console.log("[Aplicar] modeloClienteExistente -> payload:", payloadModeloCliente);

                                                    // Enviar datos a la API
                                                    const response = await fetch("https://app.aranih.com/api/app/modeloClienteExistente.php", {
                                                        method: "POST",
                                                        headers: {
                                                            "Content-Type": "application/json",
                                                        },
                                                        body: JSON.stringify(payloadModeloCliente),
                                                    });

                                                    console.log("[Aplicar] modeloClienteExistente -> status:", response.status, response.statusText);

                                                    if (!response.ok) {
                                                        console.error("[Aplicar] modeloClienteExistente -> ERROR body:", await response.text());
                                                    } else {
                                                        console.log("[Aplicar] modeloClienteExistente -> OK body:", await response.text());
                                                    }
                                                } catch (error) {
                                                    console.error("[Aplicar] modeloClienteExistente -> Error al realizar la solicitud:", error);
                                                }

                                                // Consultar tipo de cliente para decidir ruta
                                                const tipoClientePayload = {
                                                    customerId: String(usuarioDetalle.customer_id ?? ""),
                                                    token: "I25WlOdFy0yayTP3FAJe6JQZTmidHJm5M711zTdCtihlkgl4ZcC0tfKqXXatKqbZ",
                                                };

                                                console.log("[Aplicar] getTipoCliente -> payload:", tipoClientePayload);

                                                const tipoClienteResponse = await fetch("https://app.aranih.com/api/app/getTipoCliente.php", {
                                                    method: "POST",
                                                    headers: { "Content-Type": "application/json" },
                                                    body: JSON.stringify(tipoClientePayload),
                                                });

                                                if (!tipoClienteResponse.ok) {
                                                    const errText = await tipoClienteResponse.text();
                                                    console.error("[Aplicar] getTipoCliente -> ERROR:", errText);
                                                    return; // NO avanzar
                                                }

                                                const tipoClienteRaw = (await tipoClienteResponse.text()).trim();
                                                console.log("[Aplicar] getTipoCliente -> respuesta cruda:", tipoClienteRaw);

                                                // Quitar comillas si vienen en formato JSON string
                                                let tipoClienteResult = tipoClienteRaw;
                                                try { tipoClienteResult = JSON.parse(tipoClienteRaw); } catch(e) {}
                                                tipoClienteResult = String(tipoClienteResult).trim();

                                                console.log("[Aplicar] getTipoCliente -> resultado parseado:", tipoClienteResult);

                                                if (tipoClienteResult === "nuevo") {
                                                    console.log("[Aplicar] -> Redirigiendo a /aplicar (cliente nuevo)");
                                                    window.location.hash = "#/aplicar";
                                                } else {
                                                    console.log("[Aplicar] -> Redirigiendo a /aplicar2 (cliente existente:", tipoClienteResult, ")");
                                                    window.location.hash = "#/aplicar2";
                                                }
                                            } catch (error) {
                                                console.error("[Aplicar] Error general (postPriceList/modeloClienteExistente):", error);
                                                // NO avanzar a /aplicar2
                                            } finally {
                                                // Si no navegó (por return/error), quitar loader aquí
                                                // Si ya navegó, este setLoading podría no ejecutarse antes del unmount, pero no afecta.
                                                setLoading(false);
                                            }
                                        }
                                    }}
                                >
                                    <div className="tilebotonpri-tit">Aplicar</div>
                                    <div className="tilebotonpri-desc">Formulario para solicitar préstamos.</div>
                                    <div className="tilebotonpri-estado"></div>
                                    <div className="tilebotonpri-icon"><img alt="" src={tile_aplicar} /></div>
                                </Link>
                            ) : (
                                <Link className="tilebotonpri disabled">
                                    <div className="tilebotonpri-tit">Aplicar</div>
                                    <div className="tilebotonpri-desc">
                                        {ubicacion && ubicacion !== "Para continuar con el proceso de solicitud de préstamo en Arani App, es necesario que el navegador acceda a tu ubicación en tu celular."
                                            ? `Lo sentimos, esta opción no está disponible en ${ubicacion}`
                                            : "Lo sentimos es necesario que el navegador acceda a tu ubicación en tu celular."}
                                    </div>
                                    <div className="tilebotonpri-estado"></div>
                                    <div className="tilebotonpri-icon"><img alt="" src={tile_aplicar} /></div>
                                </Link>
                            );
                        })()}

                        <Link to="/plan" className="tilebotonpri">
                            <div className="tilebotonpri-tit">Plan</div>
                            <div className="tilebotonpri-desc">Calendarización de los pagos de tus préstamos</div>
                            <div className="tilebotonpri-estado"></div>
                            <div className="tilebotonpri-icon"><img alt="" src={tile_plan} /></div>
                        </Link>
                        
                        <Link to="/historial" className="tilebotonpri">
                            <div className="tilebotonpri-tit">Historial</div>
                            <div className="tilebotonpri-desc">Registro de la actividad en ARANI</div>
                            <div className="tilebotonpri-estado"></div>
                            <div className="tilebotonpri-icon"><img alt="" src={tile_historial} /></div>
                        </Link>
                        
                        

                        {/* Otros componentes Link aquí */}
                        <div className="tilebotonpri" onClick={abrirLandBot}>
                            <div className="tilebotonpri-tit">Chat</div>
                            <div className="tilebotonpri-desc">Centro de ayuda de Arani.</div>
                            <div className="tilebotonpri-estado"></div>
                            <div className="tilebotonpri-icon"><img alt="" src={tile_chat} /></div>
                        </div>
                        <div className="tilebotonpri disabled">
                            <div className="tilebotonpri-tit">Referir</div>
                            <div className="tilebotonpri-desc">Invita a personas y gana recompesas.</div>
                            <div className="tilebotonpri-estado"></div>
                            <div className="tilebotonpri-icon"><img alt="" src={tile_referir} /></div>
                        </div>
                    </div>
                    <Button onClick={salir} variant="contained" sx={{ mt: 3 }}>Cerrar sesión</Button>
                </Paper>
                <BarraFinal />
            </Box>
              )}

            <ModalDatosFaltantes
                open={showModal}
                onClose={() => setShowModal(false)}
                onSave={handleSaveDatosFaltantes}
            />
        </Container>
    );
}

export default Main;