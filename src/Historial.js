import config from './config';
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
// import logoArani from "./images/logoarani.png";
import {Button, Divider, List, ListItemButton, ListItemIcon, ListItemText, Paper, Typography } from "@mui/material";
import { useContext, useState } from "react";
// import axios from "axios";
import { AppContext } from "./App";
import BarraFinal from "./componentes/BarraFinal";
import { nombreEstadoPrestamo } from "./componentes/utilidades.js";
import { Link, useNavigate } from "react-router-dom";
import BarraApp from "./componentes/BarraApp";
import { useEffect } from "react";
import axios from "axios";
import numeral from "numeral";
import moment from "moment";
import 'moment/locale/es';

function Historial() {
    const gContext = useContext(AppContext);
    const navigate = useNavigate();
    const [dataObj, set_dataObj] = useState({});
    const [cargando, set_cargando] = useState(false);
    
    useEffect(()=>{
        
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
            if(res.data.status === "ER"){
                console.log(res.data.payload.message);
            }
            if(res.data.status === "ERS"){
                localStorage.removeItem('arani_session_id');
                localStorage.removeItem('arani_session_data');
                gContext.set_logeado({estado: false, token: '', data: {}});
            }
            if(res.data.status === "OK"){
                console.log(res.data.payload);
                set_dataObj(res.data.payload);
            }
            if(res.data.status === 500){
            }
        }).catch(err => {
            console.log(err.message);
            navigate("/login");
        });
        // eslint-disable-next-line
    }, []);
    
    return (
        <Container disableGutters sx={{ minHeight: '100vh', display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"  }} component="main" maxWidth="md">
            <Box sx={{p: '4px', width: '100%'}}>
                <Paper elevation={6} sx={{p: 4}}>
                    <BarraApp />
                    <Button component={Link} to="/" variant="outlined" startIcon={<span className="material-symbols-outlined">arrow_back</span>}>Volver</Button>
                    {/* {(Object.keys(dataObj).length > 0) && <>
                    <Typography variant="h5" sx={{mt: 6}} >Historial</Typography>
                    <Typography variant="body2" sx={{}} >Listado de préstamos solicitados en Arani con información adicional.</Typography>
                    <div className="contelistadogrande">
                        {Object.keys(dataObj).map((key)=>{
                            return (
                                <div key={key} className="listadogrande">
                                    <div className="listadogrande-tit">Préstamo ({dataObj[key].amount_limit})</div>
                                    <div className="listadogrande-data">
                                        <div className="listadogrande-data-ele"><label>Restante:</label><b>{dataObj[key].amount_limit}</b></div>
                                        <div className="listadogrande-data-ele"><label>funding:</label><b>{dataObj[key].funding_date}</b></div>
                                        <div className="listadogrande-data-ele"><label>Creado: </label><b>{dataObj[key].created}</b></div>
                                        <div className="listadogrande-data-ele"><label>Expira: </label><b>{dataObj[key].expire}</b></div>
                                        <div className="listadogrande-data-ele"><label>status: </label><b>{dataObj[key].status}</b></div>
                                        <div className="listadogrande-data-ele"><label>period: </label><b>{dataObj[key].period}</b></div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    </>
                    } */}
                    {(Object.keys(dataObj).length > 0) && <>
                    <Typography variant="h5" sx={{mt: 6}} >Historial</Typography>
                    <Typography variant="body2" sx={{}} >Listado de todos los préstamos solicitados en Arani y sus estados.</Typography>
                    <Divider sx={{mt: 2}} />
                    <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                        {Object.keys(dataObj).reverse().map((key)=>{
                            return (
                                <ListItemButton component={Link} to={"/plan/"+dataObj[key].container_id} key={key} className={"listahistorialestado"+dataObj[key].status}>
                                    <ListItemIcon>
                                        <span className="material-symbols-outlined">calendar_month</span>
                                    </ListItemIcon>
                                    <ListItemText primary={"Préstamo de L. "+ numeral(dataObj[key].amount_limit).format("0,0.[00]")+""} secondary={""+moment(dataObj[key].created).format('LL')} />
                                    <Typography variant="body2" sx={{color: 'silver', pl: 6}} >{nombreEstadoPrestamo[dataObj[key].status]}</Typography>
                                </ListItemButton>
                            )
                        })}
                    </List>
                    </>
                    }
                    {(Object.keys(dataObj).length === 0 && cargando) && 
                    <Typography variant="body2" sx={{p: '4rem 0', color: 'silver', textAlign: 'center'}} >Cargando....</Typography>
                    }
                    {(Object.keys(dataObj).length === 0 && !cargando) && 
                    <Typography variant="body2" sx={{p: '4rem 0', textAlign: 'center'}} >No hay nada que mostrar aún.</Typography>
                    }
                </Paper>
                <BarraFinal />
            </Box>
        </Container>
    );
}

export default Historial;
