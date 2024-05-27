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

function Main() {
    const gContext = useContext(AppContext);
    const [showAplicarLink, setShowAplicarLink] = useState(false);
    const [ubicacion, setUbicacion] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            const apiUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
    
            try {
                const response = await fetch(apiUrl);
                const data = await response.json();
                console.log(data);
    
                const ciudad = data.address.city || data.address.town || data.address.village || ''; // Cambio aquí
                const pais = data.address.country || '';
                setUbicacion(`${ciudad}, ${pais}`); // Cambio aquí
    
                // Lista de ubicaciones permitidas
                const ubicacionesPermitidas = [
                    "Tegucigalpa, Honduras",
                    "Comayagüela, Honduras",
                    "Choloma, Honduras",
                    "La lima, Honduras",
                    "Villanueva, Honduras",
                    "Progreso, Honduras",
                    "San Pedro Sula, Honduras",
                    "Intibucá, Honduras",
                ];
    
                // Verificar si la ubicación coincide con alguna de las ubicaciones permitidas
                if (ubicacionesPermitidas.includes(`${ciudad}, ${pais}`)) { // Cambio aquí
                    setShowAplicarLink(true);
                }
            } catch (error) {
                console.error('Error al obtener la ubicación:', error);
            }
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
                    <p>{ubicacion}</p> 
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