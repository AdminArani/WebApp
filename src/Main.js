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
    
    async function guardarUbicacion(customerId, personCode) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            const apiUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
    
            try {
                // Hacer la petición al API de OpenStreetMap
                const response = await fetch(apiUrl);
                const data = await response.json();
                console.log(data);
    
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
                    "Progreso, Honduras",
                    "San Pedro Sula, Honduras",
                    "Puerto Cortés, Honduras",
                    "El Progreso, Honduras",
                    "Danli,Honduras",
                    "Choluteca,Honduras",
                    "Comayagua, Honduras",
                    "Siguatepeque, Honduras",
                    "La Ceiba, Honduras",
                ];
    
                // Verificar si la ubicación coincide con alguna de las ubicaciones permitidas
                if (ubicacionesPermitidas.includes(`${ciudad}, ${pais}`)) {
                    setShowAplicarLink(true);
                }
    
                // Obtener la dirección IP del dispositivo
                const ipResponse = await fetch('https://api.ipify.org?format=json');
                const ipData = await ipResponse.json();
                const ip = ipData.ip; // Capturando la IP

                // Hacer POST a tu API para guardar latitud y longitud
                const postResponse = await fetch('https://app.aranih.com/api/app/post_locations.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        idClient: customerId,
                        dni: ip, // Enviar la IP en lugar del DNI
                        latitude: latitude,
                        longitude: longitude,
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
                console.error('Error al obtener la ubicación o hacer el POST:', error);
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
                setUbicacion('Para aplicar a un préstamo debes permitir que Arani conozca tu ubicación');
            } else {
                setUbicacion('Ubicación obtenida con éxito');
            }
    
            setLoading(false);
        };
    
        fetchUbicacion();
    }, []);

    const mensajesErrores = {
        1: "No pudimos confirmar tu foto selfie en tu perfil",
        2: "Tu recibo publico no es valido en tu perfil",
        3: "No pudimos confirmar tus documentos en tu perfil",
        4: "No pudimos confirmar tu DNI en tu perfil",
        5: "Eres menor de edad y no aplicas en tu perfil",
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
                            <span style={{ color: ubicacion === 'Para aplicar a un préstamo debes permitir que Arani conozca tu ubicación' ? 'red' : 'black' }}>
                                {ubicacion}
                            </span>
                        )}
                    </p>

                    {usuarioDetalle.status === "0" && (
                    <div style={styles.container}>
                        <Typography style={styles.text}>
                            Lo sentimos: {mensajesErrores[usuarioDetalle.errores_perfil] || usuarioDetalle.errores_perfil}
                        </Typography>
                    </div>
                    )}



                    <div className="contetilebotonpri">
                        <Link to="/perfil" className="tilebotonpri">
                            <div className="tilebotonpri-tit">Perfil</div>
                            <div className="tilebotonpri-desc">Actualiza todos los datos de tu cuenta.</div>
                            <div className="tilebotonpri-icon"><img alt="" src={tile_perfil} /></div>
                        </Link>


                        {/* Si el usuario está en la ubicación deseada, muestra el enlace de aplicar */}
                        {showAplicarLink ? (
                        
                            <Link to="/aplicar" className="tilebotonpri">
                                <div className="tilebotonpri-tit">Aplicar</div>
                                <div className="tilebotonpri-desc">Formulario para solicitar préstamos.</div>
                                <div className="tilebotonpri-estado"></div>
                                <div className="tilebotonpri-icon"><img alt="" src={tile_aplicar} /></div>
                            </Link>
                        
                        ) : (
                            // Si el usuario no está en la ubicación deseada, muestra el mensaje de error
                            
                            <Link className="tilebotonpri disabled">
                                <div className="tilebotonpri-tit">Aplicar</div>
                                <div className="tilebotonpri-desc">Lo sentimos esta opción no esta disponible en tu zona por el momento.</div>
                                <div className="tilebotonpri-estado"></div>
                                <div className="tilebotonpri-icon"><img alt="" src={tile_aplicar} /></div>
                            </Link>
                            
                        )}

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
        </Container>
    );
}

export default Main;