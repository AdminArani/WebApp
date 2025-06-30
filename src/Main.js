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
        0: "Tu perfil sigue en proceso de validación. Para más detalles, <a href='https://www.arani.hn/erroresperfil.php' target='_blank'>haz clic aquí</a>.",
        1: "No pudimos confirmar tu foto selfie en tu perfil. Para más detalles, <a href='https://www.arani.hn/erroresperfil.php' target='_blank'>haz clic aquí</a>.",
        2: "Tu recibo público no es válido en tu perfil. Para más detalles, <a href='https://www.arani.hn/erroresperfil.php' target='_blank'>haz clic aquí</a>.",
        3: "No pudimos confirmar tus documentos en tu perfil. Para más detalles, <a href='https://www.arani.hn/erroresperfil.php' target='_blank'>haz clic aquí</a>.",
        4: "No pudimos confirmar tu DNI en tu perfil. Para más detalles, <a href='https://www.arani.hn/erroresperfil.php' target='_blank'>haz clic aquí</a>.",
        5: "Eres menor de edad y no aplicas en tu perfil. Para más detalles, <a href='https://www.arani.hn/erroresperfil.php' target='_blank'>haz clic aquí</a>.",
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

                    {usuarioDetalle.status === "0" && (
                        <div style={styles.container}>
                            {usuarioDetalle.errores_perfil ? (
                                <Typography
                                    style={styles.text}
                                    dangerouslySetInnerHTML={{
                                        __html: mensajesErrores[usuarioDetalle.errores_perfil] || usuarioDetalle.errores_perfil,
                                    }}
                                />
                            ) : (
                                <>
                                    <Typography style={styles.text}>
                                        Finaliza de llenar tu perfil para poder acceder a las opciones.
                                    </Typography>
                                    <Typography style={{ ...styles.text, marginTop: '8px' }}>
                                        <a href="https://app.arani.hn/#/perfil" target="_blank" rel="noopener noreferrer" style={{ color: '#3498db', textDecoration: 'none' }}>
                                            Ir a mi perfil
                                        </a>
                                    </Typography>
                                </>
                            )}
                        </div>
                    )}

                    {/* Anuncio para fechas especiales mostrar a todos los usuarios */}

                    {/* {usuarioDetalle.status === "1" && (
                        <div style={styles.container}>
                            <Typography style={styles.text}>
                                Por feriado de Semana Santa, no realizaremos desembolsos de préstamos desde el miércoles 16 de abril a las 12:00 p.m. hasta el domingo 20 de abril.
                            </Typography>
                            <Typography style={{ ...styles.text, marginTop: '8px' }}>
                                Volvemos con normalidad el lunes 21 de abril.
                            </Typography>
                            <Typography style={{ ...styles.text, marginTop: '8px' }}>
                                ✅ Tus pagos se seguirán recibiendo con normalidad.
                            </Typography>
                            <Typography style={{ ...styles.text, marginTop: '8px' }}>
                                Gracias por tu comprensión 💛
                            </Typography>
                        </div>
                    )} */}
    

                    <div className="contetilebotonpri">
                        <Link to="/perfil" className="tilebotonpri">
                            <div className="tilebotonpri-tit">Perfil</div>
                            <div className="tilebotonpri-desc">Actualiza todos los datos de tu cuenta.</div>
                            <div className="tilebotonpri-icon"><img alt="" src={tile_perfil} /></div>
                        </Link>


                        {/* Si el usuario está en la ubicación deseada, muestra el enlace de aplicar */}
                        {(() => {
                            const fechaActual = new Date();
                            const fechaUTC6 = new Date(fechaActual.toLocaleString("en-US", { timeZone: "America/Tegucigalpa" }));
                            const mes = fechaUTC6.getMonth() + 1; // Los meses en JavaScript son base 0
                            const dia = fechaUTC6.getDate();

                            // Verificar si estamos en los días de feriado
                            const diasFeriado = [16,17, 18, 19];
                            const esFeriado = mes === 4 && diasFeriado.includes(dia);

                            if (esFeriado) {
                                return (
                                    <Link className="tilebotonpri disabled">
                                        <div className="tilebotonpri-tit">Aplicar</div>
                                        <div className="tilebotonpri-desc">
                                            Actualmente nos encontramos fuera de servicio por feriado de Semana Santa.
                                        </div>
                                        <div className="tilebotonpri-estado"></div>
                                        <div className="tilebotonpri-icon"><img alt="" src={tile_aplicar} /></div>
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
                                    to={(!usuarioDetalle.ref_tipo_per || !usuarioDetalle.ref_nom_per || !usuarioDetalle.ref_tel_per ) ? "#" : "/aplicar"}
                                    className="tilebotonpri"
                                    onClick={(e) => {
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