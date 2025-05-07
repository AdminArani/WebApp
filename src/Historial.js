import config from './config';
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { Button, Divider, List, ListItemButton, ListItemIcon, ListItemText, Paper, Typography } from "@mui/material";
import { useContext, useState, useEffect } from "react";
import { AppContext } from "./App";
import BarraFinal from "./componentes/BarraFinal";
import { nombreEstadoPrestamo } from "./componentes/utilidades.js";
import { Link, useNavigate } from "react-router-dom";
import BarraApp from "./componentes/BarraApp";
import axios from "axios";
import numeral from "numeral";
import moment from "moment";
import 'moment/locale/es';

function Historial() {
    const gContext = useContext(AppContext);
    const navigate = useNavigate();
    const [dataObj, set_dataObj] = useState({});
    const [cargando, set_cargando] = useState(false);
    
    useEffect(() => {
        set_cargando(true);
        axios.request({
            url: `${config.apiUrl}/api/app/getCustomerOfferList.php`,
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
                localStorage.removeItem('arani_session_data');
                gContext.set_logeado({ estado: false, token: '', data: {} });
            }
            if (res.data.status === "OK") {
                console.log(res.data.payload);
                set_dataObj(res.data.payload);
            }
            if (res.data.status === 500) {
                // Manejo de error 500
            }
        }).catch(err => {
            console.log(err.message);
            navigate("/login");
        });
        // eslint-disable-next-line
    }, []);

    return (
        <Container disableGutters sx={{ minHeight: '100vh', display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }} component="main" maxWidth="md">
            <Box sx={{ p: '4px', width: '100%' }}>
                <Paper elevation={6} sx={{ p: 4 }}>
                    <BarraApp />
                    <Button component={Link} to="/" variant="outlined" startIcon={<span className="material-symbols-outlined">arrow_back</span>}>Volver</Button>
                    {(Object.keys(dataObj).length > 0) && <>
                        <Typography variant="h5" sx={{ mt: 6 }}>Historial</Typography>
                        <Typography variant="body2">Listado de todos los préstamos solicitados en Arani y sus estados.</Typography>
                        <Divider sx={{ mt: 2 }} />
                        <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                            {Object.keys(dataObj).reverse().map((key) => {
                                const estado = nombreEstadoPrestamo[dataObj[key].status]; // Obtener el nombre del estado
                                const esEstadoBloqueado = estado === "Rechazado" || estado === "Pagado"; // Condición para bloquear el clic

                                return (
                                    <ListItemButton
                                        key={key}
                                        component={esEstadoBloqueado ? 'div' : Link} // Cambiar a 'div' si está bloqueado
                                        to={!esEstadoBloqueado ? `/plan/${dataObj[key].container_id}` : undefined} // Solo si no está bloqueado
                                        className={`listahistorialestado${dataObj[key].status}`}
                                        onClick={(event) => {
                                            if (esEstadoBloqueado) {
                                                event.preventDefault(); // Bloquear clic
                                                console.log(`No se permite navegar: Estado ${estado}`);
                                            }
                                        }}
                                        sx={{
                                            cursor: esEstadoBloqueado ? 'not-allowed' : 'pointer', // Cambiar cursor
                                            opacity: esEstadoBloqueado ? 0.6 : 1, // Opacidad más baja si está bloqueado
                                        }}
                                    >
                                        <ListItemIcon>
                                            <span className="material-symbols-outlined">calendar_month</span>
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={`Préstamo de L. ${numeral(dataObj[key].amount_limit).format("0,0.[00]")}`}
                                            secondary={moment(dataObj[key].created).format('LL')}
                                        />
                                        <Typography variant="body2" sx={{ color: 'silver', pl: 6 }}>
                                            {estado}
                                        </Typography>
                                    </ListItemButton>
                                );
                            })}
                        </List>
                    </>
                    }
                    {(Object.keys(dataObj).length === 0 && cargando) &&
                        <Typography variant="body2" sx={{ p: '4rem 0', color: 'silver', textAlign: 'center' }}>Cargando....</Typography>
                    }
                    {(Object.keys(dataObj).length === 0 && !cargando) &&
                        <Typography variant="body2" sx={{ p: '4rem 0', textAlign: 'center' }}>No hay nada que mostrar aún.</Typography>
                    }
                </Paper>
                <BarraFinal />
            </Box>
        </Container>
    );
}

export default Historial;
