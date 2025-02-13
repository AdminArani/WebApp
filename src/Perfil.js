import config from './config';
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
// import logoArani from "./images/logoarani.png";
import {Autocomplete, Button, Dialog, DialogTitle,DialogContentText,DialogActions, DialogContent, Divider, FormControl, Grid, InputLabel, List, ListItem, ListItemButton, ListItemIcon, ListItemText, MenuItem, Paper, Select, TextField, Typography } from "@mui/material";
// import { useContext } from "react";
// import axios from "axios";
import { AppContext } from "./App";
import BarraFinal from "./componentes/BarraFinal";
import { Link, useNavigate } from "react-router-dom";
import BarraApp from "./componentes/BarraApp";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import TerminarRegistro from "./componentes/TerminarRegistro";
import {nombreGeneros} from "./componentes/utilidades";
import moment from "moment";
import numeral from "numeral";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import CircularProgress from '@mui/material/CircularProgress';
import Avatar from '@mui/material/Avatar';
import ConfirmarCorreo from "./componentes/ConfirmarCorreo";
import React from 'react';
import Aplicar from './Aplicar.js';
import Main from './Main.js';

function Perfil() {
    const gContext = useContext(AppContext);
    console.log(gContext)
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
    // const [cargandoDatosPerfil, set_cargandoDatosPerfil] = useState(false);

    const navigate = useNavigate();

    const [showAplicarLink, setShowAplicarLink] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            const apiUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
    
            try {
                const response = await fetch(apiUrl);
                const data = await response.json();
                console.log(data);
    
                const ciudad = data.address.city || ''; // Cambio aquí
                const pais = data.address.country || '';
    
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
                    "Danlí, Honduras",
                    "Choluteca, Honduras",
                    "Comayagua, Honduras",
                    "Siguatepeque, Honduras",
                    "La Ceiba, Honduras",
                ];
    
                // Verificar si la ubicación coincide con alguna de las ubicaciones permitidas
                if (ubicacionesPermitidas.includes(`${ciudad}, ${pais}`)) { // Cambio aquí
                    setShowAplicarLink(true);
                } else {
                    setErrorMessage('Lo sentimos, nuestro servicio no está disponible en tu ubicación por el momento.');
                }
            } catch (error) {
                console.error('Error al obtener la ubicación:', error);
                setErrorMessage('Error al obtener la ubicación. Por favor, inténtalo de nuevo más tarde.');
            }
        });
    }, []);

    

    function validarPerfilEnCore(callback){ // Para saber si ya esta registrado en el CORE o no
        axios.request({
            url: `${config.apiUrl}/api/app/getProfile.php`,
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
                gContext.set_logeado({estado: false, token: ''});
            }
            if(res.data.status === "OK"){
                console.log('usuarioDetalle', res.data.payload.data);
                set_usuarioDetalleFullR(res.data);
                set_usuarioDetalle(res.data.payload.data);
                set_usuarioFiles(res.data.files);
                set_clasificacion(res.data.csas);
                if(res.data.payload.data.status === "1"){
                    set_usuarioAprobadoManual(true);
                }

                if(res.data.datasend === "CMP"){
                    set_datosEnviadosArevision(true);
                }

                // Imagen perfil
                let t18 = res.data.files.find(e=>e.type === "18");
                if(t18?.dir) set_urlImagenPerfilTerminada(`${config.apiUrl}${t18?.dir}`);
                
                console.log('usuarioDetalleFullR.datasend', usuarioDetalleFullR.datasend);
                console.log('usuarioDetalleFullR', usuarioDetalleFullR);
            }
            if(res.data.status === 500){
                console.log("res.data.status === 500");
                set_faltaTerminarRegistro(true);
            }
            if(typeof callback === 'function') callback();
        }).catch(err => {
            console.log(err.message);
            navigate("/login");
        });
    }

    function calificacion(){ // Para saber si ya esta registrado en el CORE o no
        axios.request({
            url: `${config.apiUrl}/api/app/getCSAS.php`,
            method: "post",
            data: {
                sid: gContext.logeado?.token,
              },
        })
        .then((res) => {
            set_cargando2(false);
            if(res.data.status === "ER"){
                console.log(res.data.payload.message);
            }
            if(res.data.status === "ERS"){
                localStorage.removeItem('arani_session_id');
                gContext.set_logeado({estado: false, token: ''});
            }
            if(res.data.status === "OK"){
                console.log('calificacion', res.data.payload.data);
                if(res.data.payload.data.length){
                    // set_clasificacion(res.data.payload.data?.eval[0]?.scoreValue);
                }
            }
            if(res.data.status === 500){
                console.log("res.data.status === 500");
            }
        }).catch(err => {
            console.log(err.message);
            navigate("/login");
        });
    }


    // function cargarDatosSeleccionables(){

    //     axios.request({
  
    //         method: "post",
    //         data: {
    //             sid: gContext.logeado.token,
    //           },
    //     })
    //     .then((res) => {
    //         if(res.data.status === "ER"){
    //         }
    //         if(res.data.status === "OK"){
    //             console.log(res.data.payload.data);
    //             set_apiCamposConstructor(res.data.payload.data);
    //         }
    //     }).catch(err => {
    //         console.log(err.message);
    //     });

    // }
    
    useEffect(()=>{
        validarPerfilEnCore(()=>{
            calificacion();
            cargarWallet();
        });
        cargarDatosSeleccionables();
        // eslint-disable-next-line
    },[]);


    function reiniciarpantalla(){
        set_openterminarreg(false);
        set_openEditarCampos(false);
        set_faltaTerminarRegistro(false);
        // set_cargandoDatosPerfil(true);
        //----
        validarPerfilEnCore(()=>{
            calificacion();
            cargarWallet();
            // set_cargandoDatosPerfil(false);
        });
        cargarDatosSeleccionables();
    }


    function cargarWallet(){
        axios.request({
            url: `${config.apiUrl}/api/app/getWalletInfo.php`,
            method: "post",
            data: {
                sid: gContext.logeado.token,
                },
        })
        .then((res) => {
            if(res.data.status === "ER"){
            }
            if(res.data.status === "OK"){
                set_walletData(res.data.payload.data);
            }
        }).catch(err => {
            console.log(err.message);
        });
    }

    function cargarDatosSeleccionables(){

        axios.request({
            url: `${config.apiUrl}/api/app/getFieldConstructor.php`,
            method: "post",
            data: {
                sid: gContext.logeado.token,
              },
        })
        .then((res) => {
            if(res.data.status === "ER"){
            }
            if(res.data.status === "OK"){
                // console.log('constructorapi', res.data.payload.data);
                set_apiCamposConstructor(res.data.payload.data);
            }
        }).catch(err => {
            console.log(err.message);
        });

    }
    
    function sacarNombreBanco(banconumber){
        for (const key in apiCamposConstructor?.bank?.values) {
            if (Object.hasOwnProperty.call(apiCamposConstructor?.bank?.values, key)) {
                const element = apiCamposConstructor?.bank?.values[key];
                if(key === banconumber){
                    return element;
                }
            }
        }
    }

    const enviarARev = ()=>{
        axios.request({
            url: `${config.apiUrl}/api/app/send_confirmdata.php`,
            method: "post",
            data: {
                sid: gContext.logeado.token,
              },
        })
        .then((res) => {
            if(res.data.status === "ER"){
            }
            if(res.data.status === "OK"){
                // console.log('constructorapi', res.data.payload.data);
                // set_apiCamposConstructor(res.data.payload.data);
                set_datosEnviadosArevision(true);
                handleClickOpen(); //llama al modal 
            }
        }).catch(err => {
            console.log(err.message);
        });
    }

    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
      };
      
      const handleClose = () => {
        setOpen(false);
      };

    const tieneTodosCamposObligatoriosHechos = ()=>{
        if(
            usuarioDetalle.income_status &&
            usuarioDetalle.bank &&
            usuarioDetalle.marital_status &&
            parseInt(usuarioDetalle.income) >= 1 &&
            usuarioDetalle.home_status &&
            usuarioDetalle.region &&
            usuarioDetalle.dependents && 
            // usuarioDetalle.dependents_who &&
            usuarioDetalle.education &&
            usuarioDetalle.workplace &&
            usuarioDetalle.workplace_position &&
            usuarioDetalle.work_region &&
            usuarioDetalle.work_county &&
            usuarioDetalle.work_experience &&
            usuarioDetalle.file1 &&
            usuarioDetalle.file2 &&
            usuarioDetalle.file3 &&
            usuarioDetalle.file4
            ){
                return true;
        }else{
            return false;
        }
    }

    useEffect(()=>{
        console.log('cargando', cargando);
        console.log('cargando2', cargando2);
        console.log('apiCamposConstructor', apiCamposConstructor);
        console.log('faltaTerminarRegistro', faltaTerminarRegistro);
        
        // eslint-disable-next-line
    },[cargando, cargando2, apiCamposConstructor, faltaTerminarRegistro]);

    return (
        <Container disableGutters sx={{ minHeight: '100vh', display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"  }} component="main" maxWidth="md">
            <Box sx={{p: '4px', width: '100%'}}>
                <Paper elevation={6} sx={{p: 4}}>
                    <BarraApp />
                    <Button component={Link} to="/" variant="outlined" startIcon={<span className="material-symbols-outlined">arrow_back</span>}>Volver</Button>
                    
                    {(cargando || cargando2 || !apiCamposConstructor) && <Box>
                        <Typography variant="body2" sx={{p: '8rem 0', textAlign: 'center', color: 'silver'}} ><CircularProgress /><br></br>Cargando.... </Typography>
                    </Box>}
                    {(faltaTerminarRegistro && (!cargando && !cargando2 && apiCamposConstructor)) && <Box sx={{p: '6rem 0', textAlign: 'center'}}>
                        <Typography variant="body2" sx={{color: 'silver', maxWidth: '20rem', margin: '0 auto'}} >Aún falta completar el registro para acceder a esta sección.</Typography>
                        <Button onClick={()=>{set_openterminarreg(true)}} variant="contained" sx={{ mt: 2, mr: 1 }} >Completar registro</Button>
                    </Box>}
                    {(!faltaTerminarRegistro && !cargando && !cargando2 && apiCamposConstructor) &&
                    <Box sx={{pb: 6}}>
                        
                        <div className="tarjetaperfil">
                            <span className="material-symbols-outlined">person</span>
                            {!usuarioDetalle.file4 && <div className="tarjetaperfil-p1"><span style={{fontSize: '8rem', paddingRight: '1rem'}} className="material-symbols-outlined">account_circle</span></div>}
                            {usuarioDetalle.file4 && <div className="tarjetaperfil-p1"><Avatar sx={{height: '8rem', width: '8rem', mr: '2rem'}} alt="Remy Sharp" src={urlImagenPerfilTerminada} /></div>}
                            
                            <div className="tarjetaperfil-p2">
                                <div>
                                    <Typography variant="h5" sx={{}} >{usuarioDetalle.realname+" "+usuarioDetalle.midname2}</Typography>
                                    <Typography variant="body2" sx={{}} >Correo: {usuarioDetalle.email}</Typography>
                                    <Typography variant="body2" sx={{}} >Clasificación: {clasificacion}</Typography>
                                    <List sx={{}}>
                                        <ListItem>
                                            <ListItemIcon sx={{color: '#ffffff'}}>
                                                <span className="material-symbols-outlined">account_balance_wallet</span>
                                            </ListItemIcon>
                                            <ListItemText 
                                                primary={<Typography variant="body2" sx={{}} >Cuenta virtual: L {numeral(walletData.amount_wallet_balance).format('0,0.[00]')} Saldo</Typography>} 
                                                
                                            />
                                        </ListItem>
                                    </List>
                                    <Typography variant="body2" sx={{opacity: 0.6}} >Fecha de registro: {moment(usuarioDetalle.created).format("LL")}</Typography>
                                    <Typography variant="body2" sx={{opacity: 0.6}} >Id de usuario: {usuarioDetalle.customer_id}</Typography>
                                    
                                    
                                </div>
                                
                            </div>
                        </div>
                        <Typography variant="h5" sx={{mt: 6}} >Perfil</Typography>
                        <Typography sx={{mb: '2rem'}} >Información del perfil.</Typography>
                        {(!usuarioAprobadoManual && !tieneTodosCamposObligatoriosHechos()) && <Typography variant="body2" sx={{color: '#ff3e3e'}}>Antes de empezar y poder solicitar préstamos es necesario que completes los campos obligatorios de tu perfil.</Typography>}
                        {(!usuarioAprobadoManual && tieneTodosCamposObligatoriosHechos()) && <Typography variant="body2" sx={{color: '#ff8100'}}>Tus datos se revisarán pronto, una vez hecho tu cuenta sera aprobada y podras solicitar préstamos.</Typography>}
                        {usuarioAprobadoManual && 
                            <Box>
                                <Typography variant="body2" sx={{color: '#64d164'}}>Tu cuenta esta habilitada para solicitar préstamos.</Typography>
                                {showAplicarLink ? (
                                    <Button component={Link} to="/aplicar" variant="contained" sx={{ mt: 1, mr: 1 }}>Solicitar préstamo</Button>
                                ) : (
                                    <p style={{ color: 'red' }}>{errorMessage}</p>
                                )}
                            </Box>
                        }
                        <Grid container>
                            <Grid item xs={12} sm={12}>
                                <Divider textAlign="left" sx={{m: '2rem 0 1rem 0'}}>Campos Generales</Divider>
                                <Typography variant="body2" sx={{m: '0 0 2rem 0', color: 'silver'}}>Información general de la cuenta, selecciona para editar.</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <List>
                                    <ListItemButton>
                                    <ListItemIcon>
                                        <span className="material-symbols-outlined">badge</span>
                                    </ListItemIcon>
                                    <ListItemText primary={usuarioDetalle.person_code||"----"} secondary="Identidad" />
                                    </ListItemButton>
                                </List>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <List>
                                    <ListItemButton onClick={()=>{set_moduloEditarActivo('cambiarpass'); set_openEditarCampos(true);}}>
                                    <ListItemIcon>
                                        <span className="material-symbols-outlined">key</span>
                                    </ListItemIcon>
                                    <ListItemText primary={"*************"} secondary="Cambiar contraseña" />
                                    </ListItemButton>
                                </List>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <List>
                                    <ListItemButton>
                                    <ListItemIcon>
                                        <span className="material-symbols-outlined">{(usuarioDetalle.gender === 'H')?"male":'female'}</span>
                                    </ListItemIcon>
                                    <ListItemText primary={nombreGeneros[usuarioDetalle.gender]||'----'} secondary="Genero" />
                                    </ListItemButton>
                                </List>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <List>
                                    <ListItemButton>
                                    <ListItemIcon>
                                        <span className="material-symbols-outlined">person</span>
                                    </ListItemIcon>
                                    <ListItemText primary={usuarioDetalle.realname||"----"} secondary="Primer nombre" />
                                    </ListItemButton>
                                </List>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <List>
                                    <ListItemButton>
                                    <ListItemIcon>
                                        <span className="material-symbols-outlined">person</span>
                                    </ListItemIcon>
                                    <ListItemText primary={usuarioDetalle.midname||"----"} secondary="Segundo nombre" />
                                    </ListItemButton>
                                </List>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <List>
                                    <ListItemButton>
                                    <ListItemIcon>
                                        <span className="material-symbols-outlined">person</span>
                                    </ListItemIcon>
                                    <ListItemText primary={usuarioDetalle.midname2||"----"} secondary="Primer apellido" />
                                    </ListItemButton>
                                </List>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <List>
                                    <ListItemButton>
                                    <ListItemIcon>
                                        <span className="material-symbols-outlined">person</span>
                                    </ListItemIcon>
                                    <ListItemText primary={usuarioDetalle.surname||"----"} secondary="Segundo apellido" />
                                    </ListItemButton>
                                </List>
                            </Grid>
                            
                            
                            
                            
                            <Grid item xs={12} sm={6}>
                                <List>
                                    <ListItemButton onClick={()=>{set_moduloEditarActivo('telefono'); set_openEditarCampos(true);}}>
                                        <ListItemIcon>
                                            <span className="material-symbols-outlined">smartphone</span>
                                        </ListItemIcon>
                                        <ListItemText primary={usuarioDetalle.mob_phone||"----"} secondary="Teléfono" />
                                    </ListItemButton>
                                </List>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <List>
                                    <ListItemButton>
                                        <ListItemIcon>
                                            <span className="material-symbols-outlined">mail</span>
                                        </ListItemIcon>
                                        <ListItemText primary={usuarioDetalle.email||"----"} secondary={<>{(usuarioDetalleFullR.MailEst === "CMP")?"Correo (Confirmado)":"Correo (Sin confirmar)"}</>} />
                                    </ListItemButton>
                                </List>
                                <ConfirmarCorreo estadoMail={usuarioDetalleFullR.MailEst} nombreMail={usuarioDetalle.email} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <List>
                                    <ListItemButton>
                                        <ListItemIcon>
                                            <span className="material-symbols-outlined">child_care</span>
                                        </ListItemIcon>
                                        <ListItemText primary={moment(usuarioDetalle.birthday).format('LL')||"----"} secondary="Fecha de nacimiento" />
                                    </ListItemButton>
                                </List>
                            </Grid>
                            <Grid item xs={12} sm={12}>
                                <Divider textAlign="left" sx={{m: '2rem 0 1rem 0'}}>Campos Obligatorios</Divider>
                                <Typography variant="body2" sx={{m: '0 0 2rem 0', color: 'silver'}}>Para poder solicitar préstamos, primero debes llenar todos los cambpos obligatorios, despues se hara una revisión y se aprobara tu cuenta para poder hacer esa solicitud.</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                            <List>
                            <ListItemButton 
                                onClick={() => {
                                    if (usuarioDetalle.status === "0") {
                                        set_moduloEditarActivo('tipoingreso');
                                        set_openEditarCampos(true);
                                    } else {
                                        alert("Este campo está deshabilitado.");
                                    }
                                }}
                                disabled={usuarioDetalle.status === "1"} // Deshabilita el botón si status es "1"
                                style={{
                                    cursor: usuarioDetalle.status === "1" ? "not-allowed" : "pointer", // Cambia el cursor cuando está deshabilitado
                                    opacity: usuarioDetalle.status === "1" ? 0.5 : 1 // Hace que el botón se vea deshabilitado con menor opacidad
                                }}
                            >
                                <ListItemIcon>
                                    <span className="material-symbols-outlined">payments</span>
                                </ListItemIcon>
                                <ListItemText 
                                    primaryTypographyProps={{textTransform: 'capitalize'}} 
                                    primary={usuarioDetalle.income_status || "----"} 
                                    secondary="* Tipo de ingreso" 
                                />
                            </ListItemButton>
                        </List>

                            </Grid>
                            
                            <Grid item xs={12} sm={6}>
                            <List>
                                <ListItemButton 
                                    onClick={() => {
                                        if (usuarioDetalle.status === "0") {
                                            set_moduloEditarActivo('banco');
                                            set_openEditarCampos(true);
                                        } else {
                                            alert("Esta opción está deshabilitada.");
                                        }
                                    }}
                                    disabled={usuarioDetalle.status === "1"} // Deshabilita el botón si status es "1"
                                    style={{
                                        cursor: usuarioDetalle.status === "1" ? "not-allowed" : "pointer", // Cambia el cursor cuando está deshabilitado
                                        opacity: usuarioDetalle.status === "1" ? 0.5 : 1 // Hace que el botón se vea deshabilitado con menor opacidad
                                    }}
                                >
                                    <ListItemIcon>
                                        <span className="material-symbols-outlined">account_balance</span>
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary={usuarioDetalle.bank ? sacarNombreBanco(usuarioDetalle.bank) : "----"} 
                                        secondary={"* Banco"} 
                                    />
                                </ListItemButton>
                            </List>

                            </Grid>

                            <Grid item xs={12} sm={6}>
                            <List>
                                <ListItemButton 
                                    onClick={() => {
                                        if (usuarioDetalle.status === "0") {
                                            set_moduloEditarActivo('estadocivil');
                                            set_openEditarCampos(true);
                                        } else {
                                            alert("Esta opción está deshabilitada.");
                                        }
                                    }}
                                    disabled={usuarioDetalle.status === "1"} // Deshabilita el botón si status es "1"
                                    style={{
                                        cursor: usuarioDetalle.status === "1" ? "not-allowed" : "pointer", // Cambia el cursor cuando está deshabilitado
                                        opacity: usuarioDetalle.status === "1" ? 0.5 : 1 // Hace que el botón se vea deshabilitado con menor opacidad
                                    }}
                                >
                                    <ListItemIcon>
                                        <span className="material-symbols-outlined">mail</span>
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary={apiCamposConstructor.marital_status?.values[usuarioDetalle.marital_status] || "----"} 
                                        secondary="* Estado civil" 
                                    />
                                </ListItemButton>
                            </List>

                            </Grid>

                            <Grid item xs={12} sm={6}>
                            <List>
                                <ListItemButton 
                                    onClick={() => {
                                        if (usuarioDetalle.status === "0") {
                                            set_moduloEditarActivo('income');
                                            set_openEditarCampos(true);
                                        } else {
                                            alert("Esta opción está deshabilitada.");
                                        }
                                    }}
                                    disabled={usuarioDetalle.status === "1"} // Deshabilita el botón si status es "1"
                                    style={{
                                        cursor: usuarioDetalle.status === "1" ? "not-allowed" : "pointer", // Cambia el cursor cuando está deshabilitado
                                        opacity: usuarioDetalle.status === "1" ? 0.5 : 1 // Hace que el botón se vea deshabilitado con menor opacidad
                                    }}
                                >
                                    <ListItemIcon>
                                        <span className="material-symbols-outlined">account_balance_wallet</span>
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary={(parseInt(usuarioDetalle.income) >= 1) ? "L " + numeral(usuarioDetalle.income).format('0,0.[00]') : "----"} 
                                        secondary="* Ingreso mensual" 
                                    />
                                </ListItemButton>
                            </List>

                            </Grid>
                            <Grid item xs={12} sm={6}>
                            <List>
                                <ListItemButton 
                                    onClick={() => {
                                        if (usuarioDetalle.status === "0") {
                                            set_moduloEditarActivo('vivienda');
                                            set_openEditarCampos(true);
                                        } else {
                                            alert("Esta opción está deshabilitada.");
                                        }
                                    }}
                                    disabled={usuarioDetalle.status === "1"} // Deshabilita el botón si status es "1"
                                    style={{
                                        cursor: usuarioDetalle.status === "1" ? "not-allowed" : "pointer", // Cambia el cursor cuando está deshabilitado
                                        opacity: usuarioDetalle.status === "1" ? 0.5 : 1 // Hace que el botón se vea deshabilitado con menor opacidad
                                    }}
                                >
                                    <ListItemIcon>
                                        <span className="material-symbols-outlined">home</span>
                                    </ListItemIcon>
                                    <ListItemText 
                                        primaryTypographyProps={{textTransform: 'capitalize'}} 
                                        primary={usuarioDetalle.home_status || "----"} 
                                        secondary="* Casa" 
                                    />
                                </ListItemButton>
                            </List>

                            </Grid>
                            
                            <Grid item xs={12} sm={6}>
                            <List>
                                <ListItemButton 
                                    onClick={() => {
                                        if (usuarioDetalle.status === "0") {
                                            set_moduloEditarActivo('ubicacion');
                                            set_openEditarCampos(true);
                                        } else {
                                            alert("Esta opción está deshabilitada.");
                                        }
                                    }}
                                    disabled={usuarioDetalle.status === "1"} // Deshabilita el botón si status es "1"
                                    style={{
                                        cursor: usuarioDetalle.status === "1" ? "not-allowed" : "pointer", // Cambia el cursor cuando está deshabilitado
                                        opacity: usuarioDetalle.status === "1" ? 0.5 : 1 // Hace que el botón se vea deshabilitado con menor opacidad
                                    }}
                                >
                                    <ListItemIcon>
                                        <span className="material-symbols-outlined">location_on</span>
                                    </ListItemIcon>
                                    <ListItemText 
                                        primaryTypographyProps={{textTransform: 'capitalize'}} 
                                        primary={
                                            (usuarioDetalle.region || '----') + ", " +
                                            (usuarioDetalle.county || '----') + ", " +
                                            (usuarioDetalle.city || '----')
                                        } 
                                        secondary="* Ubicación domicilio" 
                                    />
                                </ListItemButton>
                            </List>

                            </Grid>

                            {/** INICIO Bloquea la edicion en tipo de dependientes si numero de dependientes es 0 **/}
                            <Grid item xs={12} sm={6}>
                            <List>
                                <ListItemButton 
                                    onClick={() => { 
                                        if (usuarioDetalle.status === "0") {
                                            set_moduloEditarActivo('numerodependientes'); 
                                            set_openEditarCampos(true); 
                                        } else {
                                            alert("Esta opción está deshabilitada.");
                                        }
                                    }}
                                    disabled={usuarioDetalle.status === "1"} // Deshabilita el botón si status es "1"
                                    style={{
                                        cursor: usuarioDetalle.status === "1" ? "not-allowed" : "pointer", // Cambia el cursor cuando está deshabilitado
                                        opacity: usuarioDetalle.status === "1" ? 0.5 : 1 // Hace que el botón se vea deshabilitado con menor opacidad
                                    }}
                                >
                                    <ListItemIcon>
                                        <span className="material-symbols-outlined">group_add</span>
                                    </ListItemIcon>
                                    <ListItemText 
                                        primaryTypographyProps={{ textTransform: 'capitalize' }}
                                        primary={usuarioDetalle.dependents || "-----"} 
                                        secondary="* Número de dependientes" 
                                    />
                                </ListItemButton>
                            </List>

                            </Grid>

                            <Grid item xs={12} sm={6}>
                            <List>
                                <ListItemButton 
                                    onClick={() => { 
                                        if (usuarioDetalle.status === "0" && usuarioDetalle.dependents > 0) {
                                            set_moduloEditarActivo('dependendeti'); 
                                            set_openEditarCampos(true); 
                                        } else {
                                            if (usuarioDetalle.dependents <= 0) {
                                                alert("No tienes dependientes registrados.");
                                            } else {
                                                alert("Esta opción está deshabilitada.");
                                            }
                                        }
                                    }}
                                    disabled={usuarioDetalle.status === "1" || usuarioDetalle.dependents <= 0}  // Deshabilita si status es "1" o no hay dependientes
                                    style={{
                                        cursor: (usuarioDetalle.status === "1" || usuarioDetalle.dependents <= 0) ? "not-allowed" : "pointer", // Cambia el cursor según el estado
                                        opacity: (usuarioDetalle.status === "1" || usuarioDetalle.dependents <= 0) ? 0.5 : 1 // Hace que el botón se vea deshabilitado
                                    }}
                                >
                                    <ListItemIcon>
                                        <span className="material-symbols-outlined">person</span>
                                    </ListItemIcon>
                                    <ListItemText 
                                        primaryTypographyProps={{ textTransform: 'capitalize' }}
                                        primary={
                                            usuarioDetalle.dependents > 0 
                                                ? usuarioDetalle.dependents_who || "-----" 
                                                : "No tengo dependientes" 
                                        } 
                                        secondary="* Tipo de dependientes" 
                                    />
                                </ListItemButton>
                            </List>


                            </Grid>
                            {/** FIN Bloquea la edicion en tipo de dependientes si numero de dependientes es 0 **/}

                            
                            <Grid item xs={12} sm={6}>
                            <List>
                                <ListItemButton 
                                    onClick={() => { 
                                        if (usuarioDetalle.status === "0") {
                                            set_moduloEditarActivo('gradoeducativo'); 
                                            set_openEditarCampos(true); 
                                        } else {
                                            alert("Esta opción está deshabilitada.");
                                        }
                                    }}
                                    disabled={usuarioDetalle.status === "1"}  // Deshabilita el botón si status es "1"
                                    style={{
                                        cursor: usuarioDetalle.status === "1" ? "not-allowed" : "pointer", // Cambia el cursor cuando está deshabilitado
                                        opacity: usuarioDetalle.status === "1" ? 0.5 : 1 // Hace que el botón se vea deshabilitado con menor opacidad
                                    }}
                                >
                                    <ListItemIcon>
                                        <span className="material-symbols-outlined">school</span>
                                    </ListItemIcon>
                                    <ListItemText 
                                        primaryTypographyProps={{ textTransform: 'capitalize' }}
                                        primary={usuarioDetalle.education ? apiCamposConstructor.education?.values[usuarioDetalle.education] : "-----"} 
                                        secondary="* Grado educativo" 
                                    />
                                </ListItemButton>
                            </List>

                            </Grid>

                            <Grid item xs={12} sm={6}>
                            <List>
                                <ListItemButton 
                                    onClick={() => { 
                                        if (usuarioDetalle.status === "0") {
                                            set_moduloEditarActivo('lugartrabajo'); 
                                            set_openEditarCampos(true); 
                                        } else {
                                            alert("Esta opción está deshabilitada.");
                                        }
                                    }}
                                    disabled={usuarioDetalle.status === "1"}  // Deshabilita el botón si status es "1"
                                    style={{
                                        cursor: usuarioDetalle.status === "1" ? "not-allowed" : "pointer", // Cambia el cursor cuando está deshabilitado
                                        opacity: usuarioDetalle.status === "1" ? 0.5 : 1 // Hace que el botón se vea deshabilitado con menor opacidad
                                    }}
                                >
                                    <ListItemIcon>
                                        <span className="material-symbols-outlined">apartment</span>
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary={usuarioDetalle.workplace || "----"} 
                                        secondary="* Lugar de trabajo" 
                                    />
                                </ListItemButton>
                            </List>

                            </Grid>
                            {/* Ejemplo de camposs trabajo */}
                            {/* posicion de trabajo  */}
                            <Grid item xs={12} sm={6}>
                            <List>
                                <ListItemButton 
                                    onClick={() => { 
                                        if (usuarioDetalle.status === "0") {
                                            set_moduloEditarActivo('posiciontrabajo'); 
                                            set_openEditarCampos(true); 
                                        } else {
                                            alert("Esta opción está deshabilitada.");
                                        }
                                    }}
                                    disabled={usuarioDetalle.status === "1"}  // Deshabilita el botón si status es "1"
                                    style={{
                                        cursor: usuarioDetalle.status === "1" ? "not-allowed" : "pointer", // Cambia el cursor cuando está deshabilitado
                                        opacity: usuarioDetalle.status === "1" ? 0.5 : 1 // Hace que el botón se vea deshabilitado con menor opacidad
                                    }}
                                >
                                    <ListItemIcon>
                                        <span className="material-symbols-outlined">apartment</span>
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary={usuarioDetalle.workplace_position || "----"} 
                                        secondary="* Posición de trabajo" 
                                    />
                                </ListItemButton>
                            </List>

                            </Grid>

                            {/* Departamento donde se ubica el trabajo */}
                            <Grid item xs={12} sm={6}>
                            <List>
                                <ListItemButton 
                                    onClick={() => { 
                                        if (usuarioDetalle.status === "0") {
                                            set_moduloEditarActivo('ubicaciontrabajo'); 
                                            set_openEditarCampos(true); 
                                        } else {
                                            alert("Esta opción está deshabilitada.");
                                        }
                                    }}
                                    disabled={usuarioDetalle.status === "1"}  // Deshabilita el botón si status es "1"
                                    style={{
                                        cursor: usuarioDetalle.status === "1" ? "not-allowed" : "pointer", // Cambia el cursor cuando está deshabilitado
                                        opacity: usuarioDetalle.status === "1" ? 0.5 : 1 // Hace que el botón se vea deshabilitado con menor opacidad
                                    }}
                                >
                                    <ListItemIcon>
                                        <span className="material-symbols-outlined">location_on</span>
                                    </ListItemIcon>
                                    <ListItemText 
                                        primaryTypographyProps={{textTransform: 'capitalize'}} 
                                        primary={
                                            (usuarioDetalle.work_region || '----') + ", " +
                                            (usuarioDetalle.work_county || '----') + ", " +
                                            (usuarioDetalle.workplace_address || '----')
                                        } 
                                        secondary="* Ubicación empleo" 
                                    />
                                </ListItemButton>
                            </List>

                            </Grid>
                            
                            <Grid item xs={12} sm={6}>
                            <List>
                                <ListItemButton 
                                    onClick={() => { 
                                        if (usuarioDetalle.status === "0") {
                                            set_moduloEditarActivo('antiguedadlaboral'); 
                                            set_openEditarCampos(true); 
                                        } else {
                                            alert("Esta opción está deshabilitada.");
                                        }
                                    }}
                                    disabled={usuarioDetalle.status === "1"}  // Deshabilita el botón si status es "1"
                                    style={{
                                        cursor: usuarioDetalle.status === "1" ? "not-allowed" : "pointer", // Cambia el cursor cuando está deshabilitado
                                        opacity: usuarioDetalle.status === "1" ? 0.5 : 1 // Hace que el botón se vea deshabilitado con menor opacidad
                                    }}
                                >
                                    <ListItemIcon>
                                        <span className="material-symbols-outlined">work</span>
                                    </ListItemIcon>
                                    <ListItemText 
                                        primaryTypographyProps={{textTransform: 'capitalize'}} 
                                        primary={
                                            (usuarioDetalle.work_experience)
                                                ? moment(usuarioDetalle.work_experience).calendar() + " (" + moment(usuarioDetalle.work_experience).fromNow('Y') + ")"
                                                : "----"
                                        } 
                                        secondary="* Antigüedad laboral" 
                                    />
                                </ListItemButton>
                            </List>

                            </Grid>


                            
                            <Grid item xs={12} sm={12}>
                                <Divider textAlign="left" sx={{m: '2rem 0 1rem 0'}}></Divider>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                            <List>
                                <ListItemButton 
                                    onClick={() => {
                                        if (usuarioDetalle.status === "0") {
                                            set_moduloEditarActivo('file1'); 
                                            set_openEditarCampos(true);
                                        } else {
                                            alert("Esta opción estará disponible en 12 meses.");
                                        }
                                    }} 
                                    disabled={usuarioDetalle.status === "1"} // Deshabilita el botón si es "1"
                                    style={{ cursor: usuarioDetalle.status === "1" ? "not-allowed" : "pointer", opacity: usuarioDetalle.status === "1" ? 0.5 : 1 }}
                                >
                                    <ListItemIcon>
                                        <span className="material-symbols-outlined">badge</span>
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary={(usuarioDetalle.file1) ? usuarioDetalle.file1.substr(-19) : "-----"} 
                                        secondary="* Identidad frontal" 
                                    />
                                </ListItemButton>
                            </List>

                            </Grid>
                            <Grid item xs={12} sm={6}>
                            <List>
                                <ListItemButton 
                                    onClick={() => {
                                        if (usuarioDetalle.status === "0") {
                                            set_moduloEditarActivo('file2'); 
                                            set_openEditarCampos(true);
                                        } else {
                                            alert("Esta opción estará disponible en 12 meses.");
                                        }
                                    }} 
                                    disabled={usuarioDetalle.status === "1"} // Deshabilita el botón si es "1"
                                    style={{ cursor: usuarioDetalle.status === "1" ? "not-allowed" : "pointer", opacity: usuarioDetalle.status === "1" ? 0.5 : 1 }}
                                >
                                    <ListItemIcon>
                                        <span className="material-symbols-outlined">badge</span>
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary={(usuarioDetalle.file2) ? usuarioDetalle.file2.substr(-19) : "-----"} 
                                        secondary="* Identidad trasera" 
                                    />
                                </ListItemButton>
                            </List>

                            </Grid>
                            <Grid item xs={12} sm={6}>
                            <List>
                                <ListItemButton 
                                    onClick={() => {
                                        if (usuarioDetalle.status === "0") {
                                            set_moduloEditarActivo('file3'); 
                                            set_openEditarCampos(true);
                                        } else {
                                            alert("Esta opción estará disponible en 12 meses.");
                                        }
                                    }} 
                                    disabled={usuarioDetalle.status === "1"} // Deshabilita el botón si status es "1"
                                    style={{ cursor: usuarioDetalle.status === "1" ? "not-allowed" : "pointer", opacity: usuarioDetalle.status === "1" ? 0.5 : 1 }}
                                >
                                    <ListItemIcon>
                                        <span className="material-symbols-outlined">receipt_long</span>
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary={(usuarioDetalle.file3) ? usuarioDetalle.file3.substr(-19) : "-----"} 
                                        secondary="* Recibo público" 
                                    />
                                </ListItemButton>
                            </List>

                            </Grid>
                            <Grid item xs={12} sm={6}>
                            <List>
                                <ListItemButton 
                                    onClick={() => {
                                        if (usuarioDetalle.status === "0") {
                                            set_moduloEditarActivo('file4'); 
                                            set_openEditarCampos(true);
                                        } else {
                                            alert("Esta opción estará disponible en 12 meses.");
                                        }
                                    }} 
                                    disabled={usuarioDetalle.status === "1"} // Deshabilita el botón si status es "1"
                                    style={{ cursor: usuarioDetalle.status === "1" ? "not-allowed" : "pointer", opacity: usuarioDetalle.status === "1" ? 0.5 : 1 }}
                                >
                                    <ListItemIcon>
                                        <span className="material-symbols-outlined">assignment_ind</span>
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary={(usuarioDetalle.file4) ? usuarioDetalle.file4.substr(-19) : "-----"} 
                                        secondary="* Foto Selfie" 
                                    />
                                </ListItemButton>
                            </List>

                            </Grid>
                            <Grid item xs={12} sm={12}>
                                <Divider textAlign="left" sx={{m: '2rem 0 1rem 0'}}></Divider>
                            </Grid>
                            <Grid item xs={12} sm={12}>
                                {(!usuarioAprobadoManual && !tieneTodosCamposObligatoriosHechos()) && <Typography variant="body2" sx={{color: '#ff3e3e'}}>Antes de empezar y poder solicitar préstamos es necesario que completes los campos obligatorios de tu perfil.</Typography>}
                                {(!usuarioAprobadoManual && tieneTodosCamposObligatoriosHechos()) && <Typography variant="body2" sx={{color: '#ff8100'}}>Tus datos se revisarán pronto, una vez hecho tu cuenta sera aprobada y podras solicitar préstamos.</Typography>}
                            </Grid>
                            {/* <Grid item xs={12} sm={6}>
                                <List>
                                    <ListItemButton onClick={()=>{set_moduloEditarActivo('documentos'); set_openEditarCampos(true);}}>
                                    <ListItemIcon>
                                        <span className="material-symbols-outlined">attachment</span>
                                    </ListItemIcon>
                                    <ListItemText primaryTypographyProps={{textTransform: 'capitalize'}} primary={"Documentos"} secondary="Adjuntar" />
                                    </ListItemButton>
                                </List>
                            </Grid> */}
                            
                        </Grid>
                    </Box>
                    }
                </Paper>
                <TerminarRegistro open={openterminarreg} cerrar={()=>{set_openterminarreg(false)}} todosaliobienfn={reiniciarpantalla} />
                <Dialog onClose={()=>{set_openEditarCampos(false)}} open={openEditarCampos}>
                    <DialogContent>
                        {(moduloEditarActivo === 'nombres') && <FormEditNombres cerrar={()=>{set_openEditarCampos(false)}} reiniciarpantalla={reiniciarpantalla} />}
                        {(moduloEditarActivo === 'income') && <FormEditIncome cerrar={()=>{set_openEditarCampos(false)}} reiniciarpantalla={reiniciarpantalla} usuarioDetalle={usuarioDetalle}/>}
                        {(moduloEditarActivo === 'telefono') && <FormEditTelefono cerrar={()=>{set_openEditarCampos(false)}} reiniciarpantalla={reiniciarpantalla} />}
                        {(moduloEditarActivo === 'tipoingreso') && <FormEditTipoIngreso cerrar={()=>{set_openEditarCampos(false)}} reiniciarpantalla={reiniciarpantalla} apiCamposConstructor={apiCamposConstructor} usuarioDetalle={usuarioDetalle}/>}
                        {(moduloEditarActivo === 'estadocivil') && <FormEditEstadoCivil cerrar={()=>{set_openEditarCampos(false)}} reiniciarpantalla={reiniciarpantalla} apiCamposConstructor={apiCamposConstructor} usuarioDetalle={usuarioDetalle}/>}
                        {(moduloEditarActivo === 'ubicacion') && <FormEditUbicacion cerrar={()=>{set_openEditarCampos(false)}} reiniciarpantalla={reiniciarpantalla} usuarioDetalleFullR={usuarioDetalleFullR}/>}
                        {(moduloEditarActivo === 'vivienda') && <FormEditVivienda cerrar={()=>{set_openEditarCampos(false)}} reiniciarpantalla={reiniciarpantalla} apiCamposConstructor={apiCamposConstructor} usuarioDetalle={usuarioDetalle}/>}
                        {(moduloEditarActivo === 'lugartrabajo') && <FormEditLugarTrabajo cerrar={()=>{set_openEditarCampos(false)}} reiniciarpantalla={reiniciarpantalla} usuarioDetalle={usuarioDetalle}/>}
                        {(moduloEditarActivo === 'numerodependientes') && <FormEditNumeroDependientes cerrar={()=>{set_openEditarCampos(false)}} reiniciarpantalla={reiniciarpantalla} usuarioDetalle={usuarioDetalle}/>}
                        {(moduloEditarActivo === 'dependendeti') && <FormEditDependeti cerrar={()=>{set_openEditarCampos(false)}} reiniciarpantalla={reiniciarpantalla} usuarioDetalle={usuarioDetalle}/>}
                        {(moduloEditarActivo === 'gradoeducativo') && <FormEditGradoEducativo cerrar={()=>{set_openEditarCampos(false)}} reiniciarpantalla={reiniciarpantalla} apiCamposConstructor={apiCamposConstructor} usuarioDetalle={usuarioDetalle}/>}
                        {(moduloEditarActivo === 'antiguedadlaboral') && <FormEditAntiguedadLaboral cerrar={()=>{set_openEditarCampos(false)}} reiniciarpantalla={reiniciarpantalla} usuarioDetalle={usuarioDetalle}/>}
                        {/* {(moduloEditarActivo === 'documentos') && <FormEditDocumentos cerrar={()=>{set_openEditarCampos(false)}} usuarioFiles={usuarioFiles} reiniciarpantalla={reiniciarpantalla} />} */}
                        {(moduloEditarActivo === 'cambiarpass') && <FormCambiarClave cerrar={()=>{set_openEditarCampos(false)}} usuarioFiles={usuarioFiles} reiniciarpantalla={reiniciarpantalla} />}
                        {(moduloEditarActivo === 'banco') && <FormCambiarBanco cerrar={()=>{set_openEditarCampos(false)}} usuarioFiles={usuarioFiles} reiniciarpantalla={reiniciarpantalla} apiCamposConstructor={apiCamposConstructor} usuarioDetalle={usuarioDetalle}/>}
                        {(moduloEditarActivo === 'file1') && <FormEditFile1 cerrar={()=>{set_openEditarCampos(false)}} usuarioFiles={usuarioFiles} reiniciarpantalla={reiniciarpantalla} />}
                        {(moduloEditarActivo === 'file2') && <FormEditFile2 cerrar={()=>{set_openEditarCampos(false)}} usuarioFiles={usuarioFiles} reiniciarpantalla={reiniciarpantalla} />}
                        {(moduloEditarActivo === 'file3') && <FormEditFile3 cerrar={()=>{set_openEditarCampos(false)}} usuarioFiles={usuarioFiles} reiniciarpantalla={reiniciarpantalla} />}
                        {(moduloEditarActivo === 'file4') && <FormEditFile4 cerrar={()=>{set_openEditarCampos(false)}} usuarioFiles={usuarioFiles} reiniciarpantalla={reiniciarpantalla} />}
                        {(moduloEditarActivo === 'posiciontrabajo') && <FormEditWorkplacePosition cerrar={()=>{set_openEditarCampos(false)}} reiniciarpantalla={reiniciarpantalla} usuarioDetalle={usuarioDetalle}/>}
                        {(moduloEditarActivo === 'ubicaciontrabajo') && <FormEditUbicacionTrabajo cerrar={()=>{set_openEditarCampos(false)}} reiniciarpantalla={reiniciarpantalla} usuarioDetalleFullR={usuarioDetalleFullR}/>}
                        </DialogContent>
                </Dialog>
                <Dialog onClose={()=>{set_openEditarCampos(false)}} open={(!usuarioAprobadoManual && tieneTodosCamposObligatoriosHechos() && !datosEnviadosArevision)}>
                    <DialogContent>
                        <Box>
                            <Typography variant="h4" sx={{}}>Confirmación</Typography>
                            <Typography variant="body2" sx={{}}>Confirma que terminaste de llenar los datos para poder pasar al proceso de revisión, una vez revisada y validada podras solicitar préstamos.</Typography>
                            <Button onClick={enviarARev} variant="contained" sx={{ mt: 5, mr: 1 }} >Mis datos son correctos</Button>
                        </Box>
                    </DialogContent>
                </Dialog>

                {/* Modal */}
                <Dialog
                    className="miDialogo"
                    open={open}  // El diálogo se mostrará si 'open' es true
                    onClose={handleClose}  // Cuando se cierra el diálogo, llamamos a la función 'handleClose'
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                    style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}
                >
                    <Box display="flex" justifyContent="center" alignItems="center">
                        <img src={`${process.env.PUBLIC_URL}/logosi.jpg`} alt="Logo" />
                    </Box>
                    <DialogTitle id="alert-dialog-title" style={{display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold'}}>{"¡Felicidades!"}</DialogTitle>
                    <DialogContent>
                        <DialogContentText className="miDialogoTexto" id="alert-dialog-description" style={{color: 'white', textAlign: 'center'}}>
                            Has completado tu perfil con exito. <br/> Procederemos a revisarlo para que puedes aplicar a tu prestamo lo antes posible.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions className="miDialogoAcciones" style={{display: 'flex', justifyContent: 'center'}}>
                        <Button className="miDialogoBoton" onClick={handleClose} to="/main" color="primary" autoFocus style={{background: 'white', alignContent: 'center', fontSize: '12px', borderRadius: '20px', width: '200px'}}>
                        Inicio
                        </Button>
                    </DialogActions>
                </Dialog>
                <BarraFinal />
            </Box>
        </Container>
    );
}

export default Perfil;


function FormEditNombres({cerrar, reiniciarpantalla}){

    const gContext = useContext(AppContext);

    const [validado, set_validado] = useState(false);
    const [inputIngresoMensual, set_inputIngresoMensual] = useState({valor: '', validado: false, textoAyuda: "", blur: false});
    const [inputNombre2, set_inputNombre2] = useState("");
    const [inputNombre3, set_inputNombre3] = useState({valor: '', validado: false, textoAyuda: "", blur: false});
    const [inputNombre4, set_inputNombre4] = useState("");

    const [enviandoForm, set_enviandoForm] = useState(false);

    function handleChange_inputIngresoMensual(event){
        let valor = event.target.value;
        let validado = false;
        let textoAyuda = "Solo numeros sin espacios";
        if(valor.length >= 1 && valor.match(/^[a-zA-ZÀ-ÿ]+$/)){
            validado = true;
            textoAyuda = "";
        }
        set_inputIngresoMensual({
            valor: valor, 
            validado: validado,
            textoAyuda: textoAyuda,
            blur: inputIngresoMensual.blur,
        });
    }

    function handleChange_inputNombre2(event){
        set_inputNombre2(event.target.value);
    }

    function handleChange_inputNombre3(event){
        let valor = event.target.value;
        let validado = false;
        let textoAyuda = "Campo obligatorio";
        if(valor.length >= 1){
            validado = true;
            textoAyuda = "";
        }
        set_inputNombre3({
            valor: valor, 
            validado: validado,
            textoAyuda: textoAyuda,
            blur: inputNombre3.blur,
        });
    }

    function handleChange_inputNombre4(event){
        set_inputNombre4(event.target.value);
    }

    useEffect(()=>{
        if(inputIngresoMensual?.validado && inputNombre3?.validado){
            set_validado(true);
        }else{
            set_validado(false);
        }
        // eslint-disable-next-line
    },[inputIngresoMensual, inputNombre3]);

    function guardarDatos(){
        set_enviandoForm(true);
        axios.request({
            url: `${config.apiUrl}/api/app/putProfile.php`,
            method: "post",
            data: {
                sid: gContext.logeado?.token,
                array: {
                    realname: inputIngresoMensual.valor,
                    midname: inputNombre2,
                    midname2: inputNombre3.valor,
                    surname: inputNombre4,
                },
              },
        })
        .then((res) => {
            set_enviandoForm(false);
            if(res.data.status === "ER"){
            }
            if(res.data.status === "ERS"){
                localStorage.removeItem('arani_session_id');
                gContext.set_logeado({estado: false, token: ''});
            }
            if(res.data.status === "OK"){
                reiniciarpantalla();
            }
        }).catch(err => {
            console.log(err.message);
        });
    }

    return (
        <Box>
            <Typography variant="h5" sx={{}} >Editar</Typography>
            <Typography variant="body" sx={{mb: '1rem'}} >Edita los siguientes campos para cambiar tus nombres</Typography>
            <Grid sx={{mt: 1, mb: 1}} container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <TextField
                        required
                        autoComplete="off"
                        fullWidth
                        label="Primer nombre"
                        onBlur={()=>{set_inputIngresoMensual({...inputIngresoMensual, blur: true})}}
                        value={inputIngresoMensual.valor}
                        onChange={handleChange_inputIngresoMensual}
                        error={(!inputIngresoMensual.validado && inputIngresoMensual.blur)} 
                        helperText={inputIngresoMensual.textoAyuda} 
                        />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        autoComplete="off"
                        fullWidth
                        label="Segundo nombre"
                        value={inputNombre2}
                        onChange={handleChange_inputNombre2}
                        helperText="" 
                        />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        autoComplete="off"
                        fullWidth
                        label="Primer apellido"
                        id="primerapellidoreg"
                        required
                        onBlur={()=>{set_inputNombre3({...inputNombre3, blur: true})}}
                        value={inputNombre3.valor}
                        onChange={handleChange_inputNombre3}
                        error={(!inputNombre3.validado && inputNombre3.blur)}
                        helperText={inputNombre3.textoAyuda}
                        />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        autoComplete="off"
                        fullWidth
                        label="Segundo apellido"
                        value={inputNombre4}
                        onChange={handleChange_inputNombre4}
                        helperText=""
                        />
                </Grid>
                <Grid item xs={12} sm={12}>
                    <Button disabled={(validado && !enviandoForm)?false:true} variant="contained" onClick={guardarDatos} sx={{ mt: 1, mr: 1 }} >{(enviandoForm)?"Enviando....":"Guardar cambios"}</Button>
                    <Button onClick={cerrar} sx={{ mt: 1, mr: 1 }} >Cerrar</Button>
                </Grid>
            </Grid>
        </Box>
    )
}

// Inicio campo Editar posicion de trabajo 
function FormEditWorkplacePosition({ cerrar, reiniciarpantalla, usuarioDetalle }) {
    const gContext = useContext(AppContext);

    const [inputWorkplacePosition, set_inputWorkplacePosition] = useState({ valor: usuarioDetalle ? usuarioDetalle.workplace_position : '', validado: false, textoAyuda: "", blur: false });
    const [enviandoForm, set_enviandoForm] = useState(false);

    function handleChange_inputWorkplacePosition(event) {
        let valor = event.target.value;
        let validado = false;
        let textoAyuda = "Campo obligatorio";
        if (valor.length >= 1) {
            validado = true;
            textoAyuda = "";
        }
        set_inputWorkplacePosition({
            valor: valor,
            validado: validado,
            textoAyuda: textoAyuda,
            blur: inputWorkplacePosition.blur,
        });
    }

    function guardarDatos() {
        set_enviandoForm(true);
        axios.request({
            url: `${config.apiUrl}/api/app/putProfile.php`,
            method: "post",
            data: {
                sid: gContext.logeado?.token,
                array: {
                    workplace_position: inputWorkplacePosition.valor
                },
            },
        })
        .then((res) => {
            set_enviandoForm(false);
            if (res.data.status === "OK") {
                reiniciarpantalla();
            }
        }).catch(err => {
            console.log(err.message);
        });
    }

    return (
        <Box>
            <Typography variant="h5" sx={{}}>Editar</Typography>
            <Typography variant="body" sx={{ mb: '1rem' }}>Edita el siguiente campo para cambiar tu posición en el lugar de trabajo</Typography>
            <Grid sx={{ mt: 1, mb: 1 }} container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <TextField
                        required
                        autoComplete="off"
                        fullWidth
                        label="Posición en el lugar de trabajo"
                        onBlur={() => { set_inputWorkplacePosition({ ...inputWorkplacePosition, blur: true }) }}
                        value={inputWorkplacePosition.valor}
                        onChange={handleChange_inputWorkplacePosition}
                        error={(!inputWorkplacePosition.validado && inputWorkplacePosition.blur)}
                        helperText={inputWorkplacePosition.textoAyuda}
                    />
                </Grid>
                <Grid item xs={12} sm={12}>
                    <Button disabled={(!inputWorkplacePosition.validado || enviandoForm) ? true : false} variant="contained" onClick={guardarDatos} sx={{ mt: 1, mr: 1 }}>{(enviandoForm) ? "Enviando...." : "Guardar cambios"}</Button>
                    <Button onClick={cerrar} sx={{ mt: 1, mr: 1 }}>Cerrar</Button>
                </Grid>
            </Grid>
        </Box>
    );
}

function FormEditIncome({cerrar, reiniciarpantalla, usuarioDetalle}){

    const gContext = useContext(AppContext);

    const [validado, set_validado] = useState(false);
    const [inputIngresoMensual, set_inputIngresoMensual] = useState({ valor: usuarioDetalle ? usuarioDetalle.income : '', validado: false, textoAyuda: "", blur: false });

    const [enviandoForm, set_enviandoForm] = useState(false);

    function handleChange_inputIngresoMensual(event){
        let valor = event.target.value;
        let validado = false;
        let textoAyuda = "Solo numeros sin espacios";
        if(valor.match(/^[0-9]+$/)){
            validado = true;
            textoAyuda = "";
        }
        set_inputIngresoMensual({
            valor: valor, 
            validado: validado,
            textoAyuda: textoAyuda,
            blur: inputIngresoMensual.blur,
        });
    }

    useEffect(()=>{
        if(inputIngresoMensual?.validado){
            set_validado(true);
        }else{
            set_validado(false);
        }
        // eslint-disable-next-line
    },[inputIngresoMensual]);

    function guardarDatos(){
        set_enviandoForm(true);
        axios.request({
            url: `${config.apiUrl}/api/app/putProfile.php`,
            method: "post",
            data: {
                sid: gContext.logeado?.token,
                array: {
                    income: inputIngresoMensual.valor,
                },
              },
        })
        .then((res) => {
            set_enviandoForm(false);
            if(res.data.status === "ER"){
            }
            if(res.data.status === "ERS"){
                localStorage.removeItem('arani_session_id');
                gContext.set_logeado({estado: false, token: ''});
            }
            if(res.data.status === "OK"){
                reiniciarpantalla();
            }
        }).catch(err => {
            console.log(err.message);
        });
    }

    return (
        <Box>
            <Typography variant="h5" sx={{}} >Editar</Typography>
            <Typography variant="body" sx={{mb: '1rem'}} >Ingrese su salario mensual en lempiras.</Typography>
            <Grid sx={{mt: 1, mb: 1}} container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <TextField
                        required
                        autoComplete="off"
                        fullWidth
                        label="Ingreso mensual"
                        onBlur={()=>{set_inputIngresoMensual({...inputIngresoMensual, blur: true})}}
                        value={inputIngresoMensual.valor}
                        onChange={handleChange_inputIngresoMensual}
                        error={(!inputIngresoMensual.validado && inputIngresoMensual.blur)} 
                        helperText={inputIngresoMensual.textoAyuda} 
                        />
                </Grid>
                <Grid item xs={12} sm={12}>
                    <Button disabled={(validado && !enviandoForm)?false:true} variant="contained" onClick={guardarDatos} sx={{ mt: 1, mr: 1 }} >{(enviandoForm)?"Enviando....":"Guardar cambios"}</Button>
                    <Button onClick={cerrar} sx={{ mt: 1, mr: 1 }} >Cerrar</Button>
                </Grid>
            </Grid>
        </Box>
    )
}

function FormEditTelefono({cerrar, reiniciarpantalla}){

    const gContext = useContext(AppContext);

    const [validado, set_validado] = useState(false);
    const [inputTelefono, set_inputTelefono] = useState({valor: '', validado: false, textoAyuda: "", blur: false});

    const [enviandoForm, set_enviandoForm] = useState(false);
    const [enviandoSMSTel, set_enviandoSMSTel] = useState(false);
    const [smsEnEspera, set_smsEnEspera] = useState(false);
    const [contadorReenvioSMS, set_contadorReenvioSMS] = useState(false);
    const [inputTelefonoCode, set_inputTelefonoCode] = useState({valor: '', validado: false, textoAyuda: "", blur: false});
    

    function handleChange_inputTelefono(event){
        let valor = event.target.value;
        let validado = false;
        let textoAyuda = "Se requieren 8 números sin espacios";
        if(valor.match(/^[0-9]{8,8}$/)){
            validado = true;
            textoAyuda = "";
        }
        set_inputTelefono({
            valor: valor, 
            validado: validado,
            textoAyuda: textoAyuda,
            blur: inputTelefono.blur,
        });
    }

    useEffect(()=>{
        if(inputTelefono?.validado && inputTelefonoCode.validado){
            set_validado(true);
        }else{
            set_validado(false);
        }
        // eslint-disable-next-line
    },[inputTelefono, inputTelefonoCode]);

    function guardarDatos(){
        set_enviandoForm(true);
        axios.request({
            url: `${config.apiUrl}/api/app/putProfile.php`,
            method: "post",
            data: {
                sid: gContext.logeado?.token,
                array: {
                    mob_phone: inputTelefono.valor,
                    OtpLNum: inputTelefonoCode.valor,
                },
              },
        })
        .then((res) => {
            set_enviandoForm(false);
            if(res.data.status === "ER"){
                set_inputTelefonoCode({...inputTelefonoCode, validado: false, textoAyuda: res.data.payload.message});
            }
            if(res.data.status === "ERS"){
                localStorage.removeItem('arani_session_id');
                gContext.set_logeado({estado: false, token: ''});
            }
            if(res.data.status === "OK"){
                reiniciarpantalla();
            }
        }).catch(err => {
            console.log(err.message);
        });
    }

    // function otpcambiartel(){
    //     // otp_upd.php
    //     // sid
    //     // UsrTelNew



    // }


  


    function handleChange_inputTelefonoCode(event){
        let valor = event.target.value;
        let validado = false;
        let textoAyuda = "Campo obligatorio";
        if(valor.length === 6){
            validado = true;
            textoAyuda = "";
        }
        set_inputTelefonoCode({
            valor: valor, 
            validado: validado,
            textoAyuda: textoAyuda,
        });
    }


    const validarTel = () =>{
        set_enviandoSMSTel(true);
        axios.request({
            url: `${config.apiUrl}/api/app/otp_upd.php`,
            method: "post",
            withCredentials: true,
            data: {
                UsrTelNew: inputTelefono.valor,
                sid: gContext.logeado?.token,
            },
        })
        .then((res) => {
            console.log(res);
            set_enviandoSMSTel(false);
            if(res.data.status === "ER"){
                set_inputTelefono({
                    valor: inputTelefono.valor, 
                    validado: false,
                    blur: true,
                    textoAyuda: res.data.payload.message+" (hasta el "+moment(res.data.payload.fechaexp).format("L")+").",
                });
                set_contadorReenvioSMS(120);
            }
            if(res.data.status === "OK"){
                // console.log('cronome');  
                set_smsEnEspera(true);
                set_inputTelefono({
                    valor: inputTelefono.valor, 
                    validado: inputTelefono.validado,
                    textoAyuda: "",
                    // textoAyuda: "Dev test: "+res.data.payload.codigo_dev,
                });
                set_contadorReenvioSMS(120);
                var tempinterval = setInterval(() => {
                    set_contadorReenvioSMS(contadorReenvioSMS => contadorReenvioSMS -1);
                }, 1000);
                setTimeout(() => {
                    set_smsEnEspera(false);
                    clearInterval(tempinterval)
                }, 120000);
            }
        }).catch(err => {
            console.log(err);
            set_inputTelefono({
                valor: inputTelefono.valor, 
                validado: false,
                textoAyuda: "Error: "+err.message,
            });
            set_contadorReenvioSMS(120);
            set_enviandoSMSTel(false);
        });

      
    }

    return (
        <Box>
            <Typography variant="h5" sx={{}} >Editar</Typography>
            <Typography variant="body" sx={{mb: '1rem'}} >Ingresa el nuevo número de teléfono, recuerda que solo podrás cambiarlo 1 vez cada 6 meses.</Typography>
            <Grid sx={{mt: 1, mb: 1}} container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <TextField
                        required
                        autoComplete="off"
                        fullWidth
                        label="Número de teléfono"
                        onBlur={()=>{set_inputTelefono({...inputTelefono, blur: true})}}
                        value={inputTelefono.valor}
                        onChange={handleChange_inputTelefono}
                        error={(!inputTelefono.validado && inputTelefono.blur)} 
                        helperText={inputTelefono.textoAyuda} 
                        />
                        
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Button fullWidth disabled={(!inputTelefono.validado || enviandoSMSTel || smsEnEspera)} variant="contained" onClick={validarTel} sx={{ mt: 1, mr: 1 }} >{(enviandoSMSTel || smsEnEspera)?"Enviado":"Enviar sms"}</Button>
                    {(smsEnEspera) && <Typography variant="body2" sx={{textAlign: "center", color: 'silver'}} >Reenviar ({contadorReenvioSMS}s)</Typography>}
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField 
                        fullWidth 
                        autoComplete="off" 
                        disabled={(!smsEnEspera)}  
                        label="Código SMS" required value={inputTelefonoCode.valor} 
                        onChange={handleChange_inputTelefonoCode} 
                        error={(!inputTelefonoCode.validado && smsEnEspera)} 
                        helperText={inputTelefonoCode.textoAyuda} 
                        />
                </Grid>
                <Grid item xs={12} sm={6}>
                    {/* <Button fullWidth variant="contained" disabled={(!inputTelefonoCode.validado || telefonoValidadoPorSMS || !smsEnEspera)} onClick={fnValidarCodigoSMS} sx={{mt:1, mb:1}}>{(telefonoValidadoPorSMS)?"Validado":"Confirmar"}</Button> */}
                </Grid>
                <Grid item xs={12} sm={12}>
                    <Button disabled={(validado && !enviandoForm)?false:true} variant="contained" onClick={guardarDatos} sx={{ mt: 1, mr: 1 }} >{(enviandoForm)?"Enviando....":"Guardar cambios"}</Button>
                    <Button onClick={cerrar} sx={{ mt: 1, mr: 1 }} >Cerrar</Button>
                </Grid>
            </Grid>
        </Box>
    )
}

function FormEditTipoIngreso({cerrar, reiniciarpantalla, apiCamposConstructor, usuarioDetalle}){

    const gContext = useContext(AppContext);

    const [validado, set_validado] = useState(false);
    const [inputTipoIngresos, set_inputTipoIngresos] = useState({ valor: usuarioDetalle ? usuarioDetalle.income_status : '', validado: false, textoAyuda: "", blur: false });

    const [enviandoForm, set_enviandoForm] = useState(false);
    
    const [inputTipoNegocio, set_inputTipoNegocio] = useState({valor: '', validado: false});

    function handleChange_inputTipoIngresos(event){
        let valor = event.target.value;
        let validado = false;
        let texto = "Seleccione una opción.";
        if(valor.length >= 1){
            validado = true;
            texto = "";
        }
        set_inputTipoIngresos({
            validado: validado,
            valor: valor,
            textoAyuda: texto,
            blur: inputTipoIngresos.blur,
        });
    }

    useEffect(()=>{
        if(inputTipoIngresos?.validado){
            set_validado(true);
        }else{
            set_validado(false);
        }
        // eslint-disable-next-line
    },[inputTipoIngresos]);

    function guardarDatos(){
        set_enviandoForm(true);
        axios.request({
            url: `${config.apiUrl}/api/app/putProfile.php`,
            method: "post",
            data: {
                sid: gContext.logeado?.token,
                array: {
                    income_status: inputTipoIngresos.valor,
                    business_type: inputTipoNegocio.valor
                },
              },
        })
        .then((res) => {
            set_enviandoForm(false);
            if(res.data.status === "ER"){
            }
            if(res.data.status === "ERS"){
                localStorage.removeItem('arani_session_id');
                gContext.set_logeado({estado: false, token: ''});
            }
            if(res.data.status === "OK"){
                reiniciarpantalla();
            }
        }).catch(err => {
            console.log(err.message);
        });
    }

    function handleChange_inputTipoNegocio(event){
        let valor = event.target.value;
        let validado = false;
        let texto = "Seleccione una opción.";
        if(valor.length >= 1){
            validado = true;
            texto = "";
        }
        set_inputTipoNegocio({
            validado: validado,
            valor: valor,
            textoAyuda: texto,
            blur: inputTipoNegocio.blur,
        });
    }

    
    

    // useEffect(()=>{
    //     cargarDatosSeleccionables();
    //     // eslint-disable-next-line
    // }, []);

    return (
        <Box>
            <Typography variant="h5" sx={{}} >Editar</Typography>
            <Typography variant="body" sx={{mb: '1rem'}} >Ingresa el tipo de ingreso que tiene actualmente.</Typography>
            <Grid sx={{mt: 1, mb: 1}} container spacing={2}>
                <Grid item xs={12} sm={12}>
                    
                    <FormControl fullWidth>
                        <InputLabel onBlur={()=>{set_inputTipoIngresos({...inputTipoIngresos, blur: true})}} required error={(!inputTipoIngresos.validado && inputTipoIngresos.blur)}>Actividad comercial</InputLabel>
                        <Select onBlur={()=>{set_inputTipoIngresos({...inputTipoIngresos, blur: true})}} required value={inputTipoIngresos.valor} onChange={handleChange_inputTipoIngresos} label="Actividad comercial" error={(!inputTipoIngresos.validado && inputTipoIngresos.blur)}>
                            {Object.keys(apiCamposConstructor?.income_status?.values).map((key)=>{
                                return ((key)?<MenuItem key={key} value={apiCamposConstructor?.income_status?.values[key]}><span className="capitalize">{apiCamposConstructor?.income_status?.values[key]}</span></MenuItem>:'');
                            })}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={12}>
                    {(inputTipoIngresos.valor === 'comerciante') && 
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel onBlur={()=>{set_inputTipoNegocio({...inputTipoNegocio, blur: true})}} required error={(!inputTipoNegocio.validado && inputTipoNegocio.blur)}>Tipo de negocio</InputLabel>
                            <Select onBlur={()=>{set_inputTipoNegocio({...inputTipoNegocio, blur: true})}} required value={inputTipoNegocio.valor} onChange={handleChange_inputTipoNegocio} label="Tipo de negocio" error={(!inputTipoNegocio.validado && inputTipoNegocio.blur)}>
                                {Object.keys(apiCamposConstructor?.business_type?.values).map((key)=>{
                                    return ((key)?<MenuItem key={key} value={key}>{apiCamposConstructor?.business_type?.values[key]}</MenuItem>:'');
                                })}
                            </Select>
                        </FormControl>
                    </Grid>
                    }
                </Grid>
                <Grid item xs={12} sm={12}>
                    <Button disabled={(validado && !enviandoForm)?false:true} variant="contained" onClick={guardarDatos} sx={{ mt: 1, mr: 1 }} >{(enviandoForm)?"Enviando....":"Guardar cambios"}</Button>
                    <Button onClick={cerrar} sx={{ mt: 1, mr: 1 }} >Cerrar</Button>
                </Grid>
            </Grid>
        </Box>
    )
}

function FormEditEstadoCivil({cerrar, reiniciarpantalla, apiCamposConstructor, usuarioDetalle}){

    const gContext = useContext(AppContext);

    const [validado, set_validado] = useState(false);
    const [inputEstadoCivil, set_inputEstadoCivil] = useState({ valor: usuarioDetalle ? usuarioDetalle.marital_status : '', validado: false, textoAyuda: "", blur: false });

    const [enviandoForm, set_enviandoForm] = useState(false);
    

    function handleChange_inputEstadoCivil(event){
        let valor = event.target.value;
        let validado = false;
        let texto = "Seleccione una opción.";
        if(valor.length >= 1){
            validado = true;
            texto = "";
        }
        set_inputEstadoCivil({
            validado: validado,
            valor: valor,
            textoAyuda: texto,
            blur: inputEstadoCivil.blur,
        });
    }

    useEffect(()=>{
        if(inputEstadoCivil?.validado){
            set_validado(true);
        }else{
            set_validado(false);
        }
        // eslint-disable-next-line
    },[inputEstadoCivil]);

    function guardarDatos(){
        set_enviandoForm(true);
        axios.request({
            url: `${config.apiUrl}/api/app/putProfile.php`,
            method: "post",
            data: {
                sid: gContext.logeado?.token,
                array: {
                    marital_status: inputEstadoCivil.valor
                },
              },
        })
        .then((res) => {
            set_enviandoForm(false);
            if(res.data.status === "ER"){
            }
            if(res.data.status === "ERS"){
                localStorage.removeItem('arani_session_id');
                gContext.set_logeado({estado: false, token: ''});
            }
            if(res.data.status === "OK"){
                reiniciarpantalla();
            }
        }).catch(err => {
            console.log(err.message);
        });
    }




    

    // useEffect(()=>{
    //     cargarDatosSeleccionables();
    //     // eslint-disable-next-line
    // }, []);

    return (
        <Box>
            <Typography variant="h5" sx={{}} >Editar</Typography>
            <Typography variant="body" sx={{mb: '1rem'}} >Ingresa su estatus civil.</Typography>
            <Grid sx={{mt: 1, mb: 1}} container spacing={2}>
                <Grid item xs={12} sm={12}>
                    <FormControl fullWidth>
                        <InputLabel onBlur={()=>{set_inputEstadoCivil({...inputEstadoCivil, blur: true})}} required error={(!inputEstadoCivil.validado && inputEstadoCivil.blur)}>Estado Cívil</InputLabel>
                        <Select onBlur={()=>{set_inputEstadoCivil({...inputEstadoCivil, blur: true})}} required value={inputEstadoCivil.valor} onChange={handleChange_inputEstadoCivil} label="Estado Cívil" error={(!inputEstadoCivil.validado && inputEstadoCivil.blur)}>
                            {Object.keys(apiCamposConstructor?.marital_status?.values).map((key)=>{
                                return ((key)?<MenuItem key={key} value={key}>{apiCamposConstructor?.marital_status?.values[key]}</MenuItem>:'');
                            })}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={12}>
                    <Button disabled={(validado && !enviandoForm)?false:true} variant="contained" onClick={guardarDatos} sx={{ mt: 1, mr: 1 }} >{(enviandoForm)?"Enviando....":"Guardar cambios"}</Button>
                    <Button onClick={cerrar} sx={{ mt: 1, mr: 1 }} >Cerrar</Button>
                </Grid>
            </Grid>
        </Box>
    )
}

function FormEditUbicacion({cerrar, reiniciarpantalla, usuarioDetalleFullR}){

    const gContext = useContext(AppContext);
    const [validado, set_validado] = useState(false);
    const [enviandoForm, set_enviandoForm] = useState(false);
    
    const [inputDepartamento, set_inputDepartamento] = useState({valor: '', validado: false, textoAyuda: ""});
    function handleChange_inputDepartamento(event){
        let valor = event.target.value;
        let validado = false;
        // console.log(event.target.value);
        let texto = "Seleccione una opción.";
        if(valor.length >= 0){
            validado = true;
            texto = "";
        }
        set_inputDepartamento({
            validado: validado,
            valor: valor,
            textoAyuda: texto,
            blur: inputDepartamento.blur,
        });
        set_inputMunicipio({...inputMunicipio, validado: false});
        set_inputLocalidad({...inputMunicipio, validado: false});
    }

    const [inputMunicipio, set_inputMunicipio] = useState({valor: '', validado: false, textoAyuda: ""});
    function handleChange_inputMunicipio(e, newValue){
        if(!newValue) return false;
        // console.log('inputMunicipi', newValue);
        let valor = newValue;
        let validado = false;
        let texto = "Seleccione una opción.";
        if(valor.length >= 0){
            validado = true;
            texto = "";
        }
        set_inputMunicipio({
            validado: validado,
            valor: valor,
            textoAyuda: texto,
            blur: inputMunicipio.blur,
        });
        set_inputLocalidad({...inputMunicipio, validado: false});
    }

    const [inputLocalidad, set_inputLocalidad] = useState({valor: '', validado: false, textoAyuda: ""});
    function handleChange_inputLocalidad(e, newValue){
        if(!newValue) return false;
        // console.log(e);
        // console.log('inputLocalidad', newValue);
        let valor = newValue;
        let validado = false;
        let texto = "Seleccione una opción.";
        if(valor.length >= 1){
            validado = true;
            texto = "";
        }
        set_inputLocalidad({
            validado: validado,
            valor: valor,
            textoAyuda: texto,
            blur: inputLocalidad.blur,
        });
    }

    const [numeroCasa, set_numeroCasa] = useState({valor: '', validado: false, textoAyuda: ""});
    function handleChange_numeroCasa(event){
        let valor = event.target.value;
        let validado = false;
        let texto = "Escriba algo";
        if(valor.length >= 1){
            validado = true;
            texto = "";
        }
        set_numeroCasa({
            validado: validado,
            valor: valor,
            textoAyuda: texto,
            blur: numeroCasa.blur,
        });
    }

    const [referenciaCasa, set_referenciaCasa] = useState({valor: '', validado: false, textoAyuda: ""});
    function handleChange_referenciaCasa(event){
        let valor = event.target.value;
        let validado = false;
        let texto = "Escriba algo";
        if(valor.length >= 1){
            validado = true;
            texto = "";
        }
        set_referenciaCasa({
            validado: validado,
            valor: valor,
            textoAyuda: texto,
            blur: referenciaCasa.blur,
        });
    }


    function guardarDatos(){
        set_enviandoForm(true);
        // console.log(usuarioDetalleFullR.ubs.filter(element => element.MunCod === inputMunicipio.valor && element.DepCod === inputDepartamento.valor).find(element => element.LocCod === inputLocalidad.valor).LocDsc);
        axios.request({
            url: `${config.apiUrl}/api/app/putProfile.php`,
            method: "post",
            data: {
                sid: gContext.logeado?.token,
                array: {
                    region: usuarioDetalleFullR?.deps.find(element => element.DepCod === inputDepartamento.valor).DepDsc,
                    county: usuarioDetalleFullR.muns.filter(element => element.DepCod === inputDepartamento.valor).find(element => element.MunCod === inputMunicipio.valor).MunDsc,
                    city: usuarioDetalleFullR.ubs.filter(element => element.MunCod === inputMunicipio.valor && element.DepCod === inputDepartamento.valor).find(element => element.LocCod === inputLocalidad.valor).LocDsc,
                    house: numeroCasa.valor,
                    address_referece: referenciaCasa.valor,
                },
              },
        })
        .then((res) => {
            set_enviandoForm(false);
            if(res.data.status === "ER"){
            }
            if(res.data.status === "ERS"){
                localStorage.removeItem('arani_session_id');
                gContext.set_logeado({estado: false, token: ''});
            }
            if(res.data.status === "OK"){
                reiniciarpantalla();
            }
        }).catch(err => {
            console.log(err.message);
        });
    }

    useEffect(()=>{
        // console.log('usuarioDetalleFullR', usuarioDetalleFullR);
        if(inputDepartamento?.validado && inputMunicipio.validado && inputLocalidad.validado && numeroCasa.validado && referenciaCasa.validado){
            set_validado(true);
        }else{
            set_validado(false);
        }
        // eslint-disable-next-line
    },[inputDepartamento, inputMunicipio, inputLocalidad, numeroCasa, referenciaCasa]);

    return (
        <Box>
            <Typography variant="h5" sx={{}} >Editar</Typography>
            <Typography variant="body" sx={{mb: '1rem'}} >Seleccione las opciones correspondientes a su residencia.</Typography>
            <Grid sx={{mt: 1, mb: 1}} container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                        <InputLabel onBlur={()=>{set_inputDepartamento({...inputDepartamento, blur: true})}} required error={(!inputDepartamento.validado && inputDepartamento.blur)}>Departamento</InputLabel>
                        <Select onBlur={()=>{set_inputDepartamento({...inputDepartamento, blur: true})}} required value={inputDepartamento.valor} onChange={handleChange_inputDepartamento} label="Departamento" error={(!inputDepartamento.validado && inputDepartamento.blur)}>
                            {usuarioDetalleFullR?.deps.map((element)=>{
                                return ((element.DepCod)?<MenuItem key={element.DepCod} value={element.DepCod}><span className="capitalize">{element.DepDsc}</span></MenuItem>:'');
                            })}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                        <Autocomplete
                            disablePortal={false}
                            id="combo-box-demo"
                            onChange={(e, newdata)=>handleChange_inputMunicipio(e, newdata.MunCod)}
                            options={usuarioDetalleFullR.muns.filter(element => element.DepCod === inputDepartamento.valor)}
                            getOptionLabel={(option) => option.MunDsc}
                            renderInput={(params) => <TextField inputProps={params.inputProps} onBlur={()=>{set_inputMunicipio({...inputMunicipio, blur: true})}} sx={{zIndex: 1000}} {...params} label="Municipio" error={(!inputMunicipio.validado && inputMunicipio.blur)} />}
                        />
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={12}>
                    <FormControl fullWidth>
                        <Autocomplete
                            disablePortal={false}
                            id="combo-box-demo"
                            onChange={(e, newdata)=>handleChange_inputLocalidad(e, newdata.LocCod)}
                            options={usuarioDetalleFullR.ubs.filter(element => element.MunCod === inputMunicipio.valor && element.DepCod === inputDepartamento.valor)}
                            getOptionLabel={(option) => option.LocDsc}
                            renderInput={(params) => <TextField onBlur={()=>{set_inputLocalidad({...inputLocalidad, blur: true})}} sx={{zIndex: 1000}} {...params} label="Colonia o Barrio" error={(!inputLocalidad.validado && inputLocalidad.blur)} />}
                        />
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        required
                        autoComplete="off"
                        fullWidth
                        label="# de casa"
                        onBlur={()=>{set_numeroCasa({...numeroCasa, blur: true})}}
                        value={numeroCasa.valor}
                        onChange={handleChange_numeroCasa}
                        error={(!numeroCasa.validado && numeroCasa.blur)} 
                        helperText={numeroCasa.textoAyuda} 
                        />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        required
                        autoComplete="off"
                        fullWidth
                        label="Referencia"
                        onBlur={()=>{set_referenciaCasa({...referenciaCasa, blur: true})}}
                        value={referenciaCasa.valor}
                        onChange={handleChange_referenciaCasa}
                        error={(!referenciaCasa.validado && referenciaCasa.blur)} 
                        helperText={referenciaCasa.textoAyuda} 
                        />
                </Grid>
                <Grid item xs={12} sm={12}>
                    <Button disabled={(validado && !enviandoForm)?false:true} variant="contained" onClick={guardarDatos} sx={{ mt: 1, mr: 1 }} >{(enviandoForm)?"Enviando....":"Guardar cambios"}</Button>
                    <Button onClick={cerrar} sx={{ mt: 1, mr: 1 }} >Cerrar</Button>
                </Grid>
            </Grid>
        </Box>
    )
}

// Ubicacion Trabajo inicio
function FormEditUbicacionTrabajo({cerrar, reiniciarpantalla, usuarioDetalleFullR, usuarioDetalle}){

    const gContext = useContext(AppContext);
    const [validado, set_validado] = useState(false);
    const [enviandoForm, set_enviandoForm] = useState(false);
    
    const [inputDepartamento, set_inputDepartamento] = useState({valor: '', validado: false, textoAyuda: ""});
    function handleChange_inputDepartamento(event){
        let valor = event.target.value;
        let validado = false;
        let texto = "Seleccione una opción.";
        if(valor.length >= 0){
            validado = true;
            texto = "";
        }
        set_inputDepartamento({
            validado: validado,
            valor: valor,
            textoAyuda: texto,
            blur: inputDepartamento.blur,
        });
    }

    const [inputMunicipio, set_inputMunicipio] = useState({valor: '', validado: false, textoAyuda: ""});
    function handleChange_inputMunicipio(e, newValue){
        if(!newValue) return false;
        let valor = newValue;
        let validado = false;
        let texto = "Seleccione una opción.";
        if(valor.length >= 0){
            validado = true;
            texto = "";
        }
        set_inputMunicipio({
            validado: validado,
            valor: valor,
            textoAyuda: texto,
            blur: inputMunicipio.blur,
        });
    }

    const [inputLocalidad, set_inputLocalidad] = useState({valor: '', validado: false, textoAyuda: ""});
    function handleChange_inputLocalidad(e, newValue){
        if(!newValue) return false;
        // console.log(e);
        // console.log('inputLocalidad', newValue);
        let valor = newValue;
        let validado = false;
        let texto = "Seleccione una opción.";
        if(valor.length >= 1){
            validado = true;
            texto = "";
        }
        set_inputLocalidad({
            validado: validado,
            valor: valor,
            textoAyuda: texto,
            blur: inputLocalidad.blur,
        });
    }

    const [referenciaCasa, set_referenciaCasa] = useState({valor: '', validado: false, textoAyuda: ""});
    function handleChange_referenciaCasa(event){
        let valor = event.target.value;
        let validado = false;
        let texto = "Escriba algo";
        if(valor.length >= 1){
            validado = true;
            texto = "";
        }
        set_referenciaCasa({
            validado: validado,
            valor: valor,
            textoAyuda: texto,
            blur: referenciaCasa.blur,
        });
    }

    function guardarDatos(){
        set_enviandoForm(true);
        axios.request({
            url: `${config.apiUrl}/api/app/putProfile.php`,
            method: "post",
            data: {
                sid: gContext.logeado?.token,
                array: {
                    work_region: usuarioDetalleFullR?.deps.find(element => element.DepCod === inputDepartamento.valor).DepDsc,
                    work_county: usuarioDetalleFullR.muns.filter(element => element.DepCod === inputDepartamento.valor).find(element => element.MunCod === inputMunicipio.valor).MunDsc,
                    work_city: usuarioDetalleFullR.ubs.filter(element => element.MunCod === inputMunicipio.valor && element.DepCod === inputDepartamento.valor).find(element => element.LocCod === inputLocalidad.valor).LocDsc,
                    workplace_address: referenciaCasa.valor,
                },
              },
        })
        .then((res) => {
            set_enviandoForm(false);
            if(res.data.status === "ER"){
            }
            if(res.data.status === "ERS"){
                localStorage.removeItem('arani_session_id');
                gContext.set_logeado({estado: false, token: ''});
            }
            if(res.data.status === "OK"){
                reiniciarpantalla();
            }
        }).catch(err => {
            console.log(err.message);
        });
    }

    useEffect(()=>{
        if(inputDepartamento?.validado && inputMunicipio.validado){
            set_validado(true);
        }else{
            set_validado(false);
        }
    },[inputDepartamento, inputMunicipio]);

    return (
        <Box>
            <Typography variant="h5" sx={{}} >Editar</Typography>
            <Typography variant="body" sx={{mb: '1rem'}} >Seleccione las opciones correspondientes a su lugar de trabajo.</Typography>
            <Grid sx={{mt: 1, mb: 1}} container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                        <InputLabel onBlur={()=>{set_inputDepartamento({...inputDepartamento, blur: true})}} required error={(!inputDepartamento.validado && inputDepartamento.blur)}>Departamento</InputLabel>
                        <Select onBlur={()=>{set_inputDepartamento({...inputDepartamento, blur: true})}} required value={inputDepartamento.valor} onChange={handleChange_inputDepartamento} label="Departamento" error={(!inputDepartamento.validado && inputDepartamento.blur)}>
                            {usuarioDetalleFullR?.deps.map((element)=>{
                                return ((element.DepCod)?<MenuItem key={element.DepCod} value={element.DepCod}><span className="capitalize">{element.DepDsc}</span></MenuItem>:'');
                            })}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                        <Autocomplete
                            disablePortal={false}
                            id="combo-box-demo"
                            onChange={(e, newdata)=>handleChange_inputMunicipio(e, newdata.MunCod)}
                            options={usuarioDetalleFullR.muns.filter(element => element.DepCod === inputDepartamento.valor)}
                            getOptionLabel={(option) => option.MunDsc}
                            renderInput={(params) => <TextField inputProps={params.inputProps} onBlur={()=>{set_inputMunicipio({...inputMunicipio, blur: true})}} sx={{zIndex: 1000}} {...params} label="Municipio" error={(!inputMunicipio.validado && inputMunicipio.blur)} />}
                        />
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                        <Autocomplete
                            disablePortal={false}
                            id="combo-box-demo"
                            onChange={(e, newdata)=>handleChange_inputLocalidad(e, newdata.LocCod)}
                            options={usuarioDetalleFullR.ubs.filter(element => element.MunCod === inputMunicipio.valor && element.DepCod === inputDepartamento.valor)}
                            getOptionLabel={(option) => option.LocDsc}
                            renderInput={(params) => <TextField onBlur={()=>{set_inputLocalidad({...inputLocalidad, blur: true})}} sx={{zIndex: 1000}} {...params} label="Colonia o Barrio" error={(!inputLocalidad.validado && inputLocalidad.blur)} />}
                        />
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        required
                        autoComplete="off"
                        fullWidth
                        label="Referencia"
                        onBlur={()=>{set_referenciaCasa({...referenciaCasa, blur: true})}}
                        value={referenciaCasa.valor}
                        onChange={handleChange_referenciaCasa}
                        error={(!referenciaCasa.validado && referenciaCasa.blur)} 
                        helperText={referenciaCasa.textoAyuda} 
                        />
                </Grid>
                <Grid item xs={12} sm={12}>
                    <Button disabled={(validado && !enviandoForm)?false:true} variant="contained" onClick={guardarDatos} sx={{ mt: 1, mr: 1 }} >{(enviandoForm)?"Enviando....":"Guardar cambios"}</Button>
                    <Button onClick={cerrar} sx={{ mt: 1, mr: 1 }} >Cerrar</Button>
                </Grid>
            </Grid>
        </Box>
    )
}

// Ubicaciion trabajo final 

function FormEditVivienda({cerrar, reiniciarpantalla, apiCamposConstructor, usuarioDetalle}){

    const gContext = useContext(AppContext);

    const [validado, set_validado] = useState(false);
    const [inputVivienda, set_inputVivienda] = useState({ valor: usuarioDetalle ? usuarioDetalle.home_status : '', validado: false, textoAyuda: "", blur: false });

    const [enviandoForm, set_enviandoForm] = useState(false);
    
    function handleChange_inputVivienda(event){
        let valor = event.target.value;
        let validado = false;
        let texto = "Seleccione una opción.";
        if(valor.length >= 1){
            validado = true;
            texto = "";
        }
        set_inputVivienda({
            validado: validado,
            valor: valor,
            textoAyuda: texto,
            blur: inputVivienda.blur,
        });
    }

    useEffect(()=>{
        if(inputVivienda?.validado){
            set_validado(true);
        }else{
            set_validado(false);
        }
        // eslint-disable-next-line
    },[inputVivienda]);

    function guardarDatos(){
        set_enviandoForm(true);
        axios.request({
            url: `${config.apiUrl}/api/app/putProfile.php`,
            method: "post",
            data: {
                sid: gContext.logeado?.token,
                array: {
                    home_status: inputVivienda.valor
                },
              },
        })
        .then((res) => {
            set_enviandoForm(false);
            if(res.data.status === "ER"){
            }
            if(res.data.status === "ERS"){
                localStorage.removeItem('arani_session_id');
                gContext.set_logeado({estado: false, token: ''});
            }
            if(res.data.status === "OK"){
                reiniciarpantalla();
            }
        }).catch(err => {
            console.log(err.message);
        });
    }




    

    // useEffect(()=>{
    //     cargarDatosSeleccionables();
    //     // eslint-disable-next-line
    // }, []);

    return (
        <Box>
            <Typography variant="h5" sx={{}} >Editar</Typography>
            <Typography variant="body" sx={{mb: '1rem'}} >Ingresa el tipo de vivienda que tiene.</Typography>
            <Grid sx={{mt: 1, mb: 1}} container spacing={2}>
                <Grid item xs={12} sm={12}>
                    <FormControl fullWidth>
                        <InputLabel onBlur={()=>{set_inputVivienda({...inputVivienda, blur: true})}} required error={(!inputVivienda.validado && inputVivienda.blur)}>Vivienda</InputLabel>
                        <Select onBlur={()=>{set_inputVivienda({...inputVivienda, blur: true})}} required value={inputVivienda.valor} onChange={handleChange_inputVivienda} label="Vivienda" error={(!inputVivienda.validado && inputVivienda.blur)}>
                            {Object.keys(apiCamposConstructor?.home_status?.values).map((key)=>{
                                return ((key)?<MenuItem key={key} value={apiCamposConstructor?.home_status?.values[key]}><span className="capitalize">{apiCamposConstructor?.home_status?.values[key]}</span></MenuItem>:'');
                            })}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={12}>
                    <Button disabled={(validado && !enviandoForm)?false:true} variant="contained" onClick={guardarDatos} sx={{ mt: 1, mr: 1 }} >{(enviandoForm)?"Enviando....":"Guardar cambios"}</Button>
                    <Button onClick={cerrar} sx={{ mt: 1, mr: 1 }} >Cerrar</Button>
                </Grid>
            </Grid>
        </Box>
    )
}

function FormEditLugarTrabajo({cerrar, reiniciarpantalla, usuarioDetalle}){

    const gContext = useContext(AppContext);

    const [validado, set_validado] = useState(false);
    const [inputLugarTrabajo, set_inputLugarTrabajo] = useState({ valor: usuarioDetalle ? usuarioDetalle.workplace : '', validado: false, textoAyuda: "", blur: false });

    const [enviandoForm, set_enviandoForm] = useState(false);

    function handleChange_inputLugarTrabajo(event){
        let valor = event.target.value;
        let validado = false;
        let textoAyuda = "Escriba algo mayor a 2 caracteres.";
        if(valor.length > 2){
            validado = true;
            textoAyuda = "";
        }
        set_inputLugarTrabajo({
            valor: valor, 
            validado: validado,
            textoAyuda: textoAyuda,
            blur: inputLugarTrabajo.blur,
        });
    }

    useEffect(()=>{
        if(inputLugarTrabajo?.validado){
            set_validado(true);
        }else{
            set_validado(false);
        }
        // eslint-disable-next-line
    },[inputLugarTrabajo]);

    function guardarDatos(){
        set_enviandoForm(true);
        axios.request({
            url: `${config.apiUrl}/api/app/putProfile.php`,
            method: "post",
            data: {
                sid: gContext.logeado?.token,
                array: {
                    workplace: inputLugarTrabajo.valor,
                },
              },
        })
        .then((res) => {
            set_enviandoForm(false);
            if(res.data.status === "ER"){
            }
            if(res.data.status === "ERS"){
                localStorage.removeItem('arani_session_id');
                gContext.set_logeado({estado: false, token: ''});
            }
            if(res.data.status === "OK"){
                reiniciarpantalla();
            }
        }).catch(err => {
            console.log(err.message);
        });
    }

    return (
        <Box>
            <Typography variant="h5" sx={{}} >Editar</Typography>
            <Typography variant="body" sx={{mb: '1rem'}} >Ingrese el nombre de la empresa o negocio donde trabaja.</Typography>
            <Grid sx={{mt: 1, mb: 1}} container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <TextField
                        required
                        autoComplete="off"
                        fullWidth
                        label="Lugar de trabajo"
                        onBlur={()=>{set_inputLugarTrabajo({...inputLugarTrabajo, blur: true})}}
                        value={inputLugarTrabajo.valor}
                        onChange={handleChange_inputLugarTrabajo}
                        error={(!inputLugarTrabajo.validado && inputLugarTrabajo.blur)} 
                        helperText={inputLugarTrabajo.textoAyuda} 
                        />
                </Grid>
                <Grid item xs={12} sm={12}>
                    <Button disabled={(validado && !enviandoForm)?false:true} variant="contained" onClick={guardarDatos} sx={{ mt: 1, mr: 1 }} >{(enviandoForm)?"Enviando....":"Guardar cambios"}</Button>
                    <Button onClick={cerrar} sx={{ mt: 1, mr: 1 }} >Cerrar</Button>
                </Grid>
            </Grid>
        </Box>
    )
}

function FormEditNumeroDependientes({cerrar, reiniciarpantalla, usuarioDetalle}){

    const gContext = useContext(AppContext);

    const [validado, set_validado] = useState(false);
    const [inputNumeroDependientes, set_inputNumeroDependientes] = useState({ valor: usuarioDetalle ? usuarioDetalle.dependents : '', validado: false, textoAyuda: "", blur: false });

    const [enviandoForm, set_enviandoForm] = useState(false);

    function handleChange_inputNumeroDependientes(event){
        let valor = event.target.value;
        let validado = false;
        let textoAyuda = "Escriba algo mayor a 2 caracteres.";
        if(valor >= 0){
            validado = true;
            textoAyuda = "";
        }
        set_inputNumeroDependientes({
            valor: valor, 
            validado: validado,
            textoAyuda: textoAyuda,
            blur: inputNumeroDependientes.blur,
        });
    }

    useEffect(()=>{
        if(inputNumeroDependientes?.validado){
            set_validado(true);
        }else{
            set_validado(false);
        }
        // eslint-disable-next-line
    },[inputNumeroDependientes]);

    function guardarDatos(){
        set_enviandoForm(true);
        axios.request({
            url: `${config.apiUrl}/api/app/putProfile.php`,
            method: "post",
            data: {
                sid: gContext.logeado?.token,
                array: {
                    dependents: inputNumeroDependientes.valor,
                },
              },
        })
        .then((res) => {
            set_enviandoForm(false);
            if(res.data.status === "ER"){
            }
            if(res.data.status === "ERS"){
                localStorage.removeItem('arani_session_id');
                gContext.set_logeado({estado: false, token: ''});
            }
            if(res.data.status === "OK"){
                reiniciarpantalla();
            }
        }).catch(err => {
            console.log(err.message);
        });
    }

    return (
        <Box>
            <Typography variant="h5" sx={{}} >Editar</Typography>
            <Typography variant="body" sx={{mb: '1rem'}} >Ingrese la cantidad de dependientes.</Typography>
            <Grid sx={{mt: 1, mb: 1}} container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                        <InputLabel onBlur={()=>{set_inputNumeroDependientes({...inputNumeroDependientes, blur: true})}} required error={(!inputNumeroDependientes.validado && inputNumeroDependientes.blur)}># de dependientes</InputLabel>
                        <Select onBlur={()=>{set_inputNumeroDependientes({...inputNumeroDependientes, blur: true})}} required value={inputNumeroDependientes.valor} onChange={handleChange_inputNumeroDependientes} label="# de dependientes" error={(!inputNumeroDependientes.validado && inputNumeroDependientes.blur)}>
                            <MenuItem value={0}>0</MenuItem>
                            <MenuItem value={1}>1</MenuItem>
                            <MenuItem value={2}>2</MenuItem>
                            <MenuItem value={3}>3</MenuItem>
                            <MenuItem value={4}>4</MenuItem>
                            <MenuItem value={5}>5</MenuItem>
                            <MenuItem value={6}>6</MenuItem>
                            <MenuItem value={7}>7</MenuItem>
                            <MenuItem value={8}>8</MenuItem>
                            <MenuItem value={9}>9</MenuItem>
                            <MenuItem value={10}>10</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={12}>
                    <Button disabled={(validado && !enviandoForm)?false:true} variant="contained" onClick={guardarDatos} sx={{ mt: 1, mr: 1 }} >{(enviandoForm)?"Enviando....":"Guardar cambios"}</Button>
                    <Button onClick={cerrar} sx={{ mt: 1, mr: 1 }} >Cerrar</Button>
                </Grid>
            </Grid>
        </Box>
    )
}


// TIPO DE DEPENDIENTES
function FormEditDependeti({cerrar, reiniciarpantalla, usuarioDetalle}){

    const gContext = useContext(AppContext);

    const [validado, set_validado] = useState(false);
    const [inputTipoDependientes, set_inputTipoDependientes] = useState({ valor: usuarioDetalle ? usuarioDetalle.dependents_who : '', validado: false, textoAyuda: "", blur: false });

    const [enviandoForm, set_enviandoForm] = useState(false);

    function handleChange_inputTipoDependientes(event){
        let valor = event.target.value;
        let validado = false;
        let textoAyuda = "Seleccione una opción.";
        if(valor !== ''){
            validado = true;
            textoAyuda = "";
        }
        set_inputTipoDependientes({
            valor: valor, 
            validado: validado,
            textoAyuda: textoAyuda,
            blur: inputTipoDependientes.blur,
        });
    }

    useEffect(()=>{
        if(inputTipoDependientes?.validado){
            set_validado(true);
        }else{
            set_validado(false);
        }
        // eslint-disable-next-line
    },[inputTipoDependientes]);

    function guardarDatos(){
        set_enviandoForm(true);
        axios.request({
            url: `${config.apiUrl}/api/app/putProfile.php`,
            method: "post",
            data: {
                sid: gContext.logeado?.token,
                array: {
                    dependents_who: inputTipoDependientes.valor,
                },
              },
        })
        .then((res) => {
            set_enviandoForm(false);
            if(res.data.status === "ER"){
            }
            if(res.data.status === "ERS"){
                localStorage.removeItem('arani_session_id');
                gContext.set_logeado({estado: false, token: ''});
            }
            if(res.data.status === "OK"){
                reiniciarpantalla();
            }
        }).catch(err => {
            console.log(err.message);
        });
    }

    return (
        <Box>
            <Typography variant="h5" sx={{}} >Editar</Typography>
            <Typography variant="body" sx={{mb: '1rem'}} >Ingrese el tipo de dependientes.</Typography>
            <Grid sx={{mt: 1, mb: 1}} container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                        <InputLabel onBlur={()=>{set_inputTipoDependientes({...inputTipoDependientes, blur: true})}} required error={(!inputTipoDependientes.validado && inputTipoDependientes.blur)}>Tipo de dependientes</InputLabel>
                        <Select onBlur={()=>{set_inputTipoDependientes({...inputTipoDependientes, blur: true})}} required value={inputTipoDependientes.valor} onChange={handleChange_inputTipoDependientes} label="Tipo de dependientes" error={(!inputTipoDependientes.validado && inputTipoDependientes.blur)}>
                            <MenuItem value={"Tus hijos"}>Tus hijos</MenuItem>
                            <MenuItem value={"Tu pareja"}>Tu pareja</MenuItem>
                            <MenuItem value={"Tus padres"}>Tus padres</MenuItem>
                            <MenuItem value={"Tus hermanos"}>Tus hermanos</MenuItem>
                            <MenuItem value={"No tengo dependientes"}>No tengo dependientes</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={12}>
                    <Button disabled={(validado && !enviandoForm)?false:true} variant="contained" onClick={guardarDatos} sx={{ mt: 1, mr: 1 }} >{(enviandoForm)?"Enviando....":"Guardar cambios"}</Button>
                    <Button onClick={cerrar} sx={{ mt: 1, mr: 1 }} >Cerrar</Button>
                </Grid>
            </Grid>
        </Box>
    )
}


// FIN TIPO DE DEPENDIENTES 

function FormEditGradoEducativo({cerrar, reiniciarpantalla, apiCamposConstructor, usuarioDetalle}){

    const gContext = useContext(AppContext);

    const [validado, set_validado] = useState(false);
    const [inputGradoEducativo, set_inputGradoEducativo] = useState({ valor: usuarioDetalle ? usuarioDetalle.education : '', validado: false, textoAyuda: "", blur: false });

    const [enviandoForm, set_enviandoForm] = useState(false);
    

    function handleChange_inputGradoEducativo(event){
        let valor = event.target.value;
        let validado = false;
        let texto = "Seleccione una opción.";
        if(valor.length >= 1){
            validado = true;
            texto = "";
        }
        set_inputGradoEducativo({
            validado: validado,
            valor: valor,
            textoAyuda: texto,
            blur: inputGradoEducativo.blur,
        });
    }

    useEffect(()=>{
        if(inputGradoEducativo?.validado){
            set_validado(true);
        }else{
            set_validado(false);
        }
        // eslint-disable-next-line
    },[inputGradoEducativo]);

    function guardarDatos(){
        set_enviandoForm(true);
        axios.request({
            url: `${config.apiUrl}/api/app/putProfile.php`,
            method: "post",
            data: {
                sid: gContext.logeado?.token,
                array: {
                    education: inputGradoEducativo.valor
                },
              },
        })
        .then((res) => {
            set_enviandoForm(false);
            if(res.data.status === "ER"){
            }
            if(res.data.status === "ERS"){
                localStorage.removeItem('arani_session_id');
                gContext.set_logeado({estado: false, token: ''});
            }
            if(res.data.status === "OK"){
                reiniciarpantalla();
            }
        }).catch(err => {
            console.log(err.message);
        });
    }




    

    // useEffect(()=>{
    //     cargarDatosSeleccionables();
    //     // eslint-disable-next-line
    // }, []);

    return (
        <Box>
            <Typography variant="h5" sx={{}} >Editar</Typography>
            <Typography variant="body" sx={{mb: '1rem'}} >Ingresa el grado educativo.</Typography>
            <Grid sx={{mt: 1, mb: 1}} container spacing={2}>
                <Grid item xs={12} sm={12}>
                    <FormControl fullWidth>
                        <InputLabel onBlur={()=>{set_inputGradoEducativo({...inputGradoEducativo, blur: true})}} required error={(!inputGradoEducativo.validado && inputGradoEducativo.blur)}>Grado educativo</InputLabel>
                        <Select onBlur={()=>{set_inputGradoEducativo({...inputGradoEducativo, blur: true})}} required value={inputGradoEducativo.valor} onChange={handleChange_inputGradoEducativo} label="Grado educativo" error={(!inputGradoEducativo.validado && inputGradoEducativo.blur)}>
                            {Object.keys(apiCamposConstructor?.education?.values).filter(key => apiCamposConstructor?.education?.values[key] !== "").map((key)=>{
                                return ((key)?<MenuItem key={key} value={key}>{apiCamposConstructor?.education?.values[key]}</MenuItem>:'');
                            })}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={12}>
                    <Button disabled={(validado && !enviandoForm)?false:true} variant="contained" onClick={guardarDatos} sx={{ mt: 1, mr: 1 }} >{(enviandoForm)?"Enviando....":"Guardar cambios"}</Button>
                    <Button onClick={cerrar} sx={{ mt: 1, mr: 1 }} >Cerrar</Button>
                </Grid>
            </Grid>
        </Box>
    )
}

function FormEditAntiguedadLaboral({cerrar, reiniciarpantalla, usuarioDetalle}){

    const gContext = useContext(AppContext);
    const [validado, set_validado] = useState(false);
    const [inputFechaIngresoTrabajo, set_inputFechaIngresoTrabajo] = useState({
        valor: gContext.usuarioDetalle ? gContext.usuarioDetalle.work_experience : '',
        validado: false,
        textoAyuda: "",
        blur: false
    });
    const [enviandoForm, set_enviandoForm] = useState(false);

    function handleChange_inputFechaIngresoTrabajo(nuevoValor) {
        let valor = nuevoValor;
        let validado = false;
        if (nuevoValor?.$d) {
            validado = true;
        }
        set_inputFechaIngresoTrabajo({
            validado: validado,
            valor: valor,
            blur: inputFechaIngresoTrabajo.blur,
        });
    }

    useEffect(() => {
        if (inputFechaIngresoTrabajo?.validado) {
            set_validado(true);
        } else {
            set_validado(false);
        }
    }, [inputFechaIngresoTrabajo]);

    function formatFecha(fecha) {
        if (fecha?.$d) {
            const date = new Date(fecha.$d);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
        return fecha; // Return the raw value if it's already formatted
    }

    function guardarDatos() {
        if (!validado) {
            console.log('Datos no válidos, no se puede enviar el formulario');
            return;
        }

        set_enviandoForm(true);
        const fechaFormateada = formatFecha(inputFechaIngresoTrabajo.valor);
        console.log('Enviando datos:', {
            sid: gContext.logeado?.token,
            array: {
                work_experience: fechaFormateada
            }
        });

        axios.request({
            url: `${config.apiUrl}/api/app/putProfile.php`,
            method: "post",
            data: {
                sid: gContext.logeado?.token,
                array: {
                    work_experience: fechaFormateada
                },
            },
        })
        .then((res) => {
            set_enviandoForm(false);
            console.log('Respuesta de la API:', res.data);
            if (res.data.status === "ER") {
                console.log('Error en la API:', res.data);
            }
            if (res.data.status === "ERS") {
                localStorage.removeItem('arani_session_id');
                gContext.set_logeado({estado: false, token: ''});
            }
            if (res.data.status === "OK") {
                reiniciarpantalla();
            }
        }).catch(err => {
            set_enviandoForm(false);
            console.log('Error en la petición:', err.message);
        });
    }
    

    // useEffect(()=>{
    //     cargarDatosSeleccionables();
    //     // eslint-disable-next-line
    // }, []);

    return (
        <Box>
            <Typography variant="h5" sx={{}} >Editar</Typography>
            <Typography variant="body" sx={{mb: '1rem'}} >Ingresa la antiguedad laboral.</Typography>
            <Grid sx={{mt: 1, mb: 1}} container spacing={2}>
                <Grid item xs={12} sm={12}>
                    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={"es"}>
                        <DatePicker
                            fullWidth
                            // onClose={()=>{set_inputFechaIngresoTrabajo({...inputFechaIngresoTrabajo, blur: true})}}
                            openTo="year"
                            maxDate={moment().subtract(1, 'years')._d}
                            minDate={moment().subtract(20, 'years')._d}
                            label="Inicio de labores"
                            value={inputFechaIngresoTrabajo.valor}
                            onChange={handleChange_inputFechaIngresoTrabajo}
                            renderInput={(params) => <TextField {...params} autoComplete="off" onBlur={()=>{set_inputFechaIngresoTrabajo({...inputFechaIngresoTrabajo, blur: true})}} fullWidth required error={(!inputFechaIngresoTrabajo.validado && inputFechaIngresoTrabajo.blur)} />}
                        />
                    </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={12}>
                    <Button disabled={(validado && !enviandoForm)?false:true} variant="contained" onClick={guardarDatos} sx={{ mt: 1, mr: 1 }} >{(enviandoForm)?"Enviando....":"Guardar cambios"}</Button>
                    <Button onClick={cerrar} sx={{ mt: 1, mr: 1 }} >Cerrar</Button>
                </Grid>
            </Grid>
        </Box>
    )
}

// function FormEditDocumentos({cerrar, reiniciarpantalla, usuarioFiles}){

//     const gContext = useContext(AppContext);
//     const [imageFiles1, set_imageFiles1] = useState(false);
//     const [imageFiles2, set_imageFiles2] = useState(false);
//     const [imageFiles3, set_imageFiles3] = useState(false);
//     const [imageFiles4, set_imageFiles4] = useState(false);

//     useEffect(()=>{
//         console.log('usuarioFiles', usuarioFiles);
        
//         let t18 = usuarioFiles.find(e=>e.type === "18");
//         let t19 = usuarioFiles.find(e=>e.type === "19");
//         let t20 = usuarioFiles.find(e=>e.type === "20");
//         let t21 = usuarioFiles.find(e=>e.type === "21");

//         console.log('map', t18);
        


//         // eslint-disable-next-line
//     }, []);

//     const [cargandoArchivo1, set_cargandoArchivo1] = useState(false);
//     const [subidoArchivo1, set_subidoArchivo1] = useState(false);
//     const [imagendata1, set_imagendata1] = useState(false);
//     function enviarArchivo1(e){
//         console.log('event',e);

//         let file = e.target.files[0];
//         set_imagendata1(URL.createObjectURL(e.target.files[0]));
//         const formData = new FormData();
//         formData.append('file1', file);
//         formData.append('sid', gContext.logeado?.token);

//         set_cargandoArchivo1(true);

//             headers: {
//                 'Content-Type': 'multipart/form-data'
//             },
//         }).then((res) => {
//             set_cargandoArchivo1(false);
            
//             if(res.data.status === "ER"){
//             }
//             // if(res.data.status === "ERS"){
//             //     localStorage.removeItem('arani_session_id');
//             //     gContext.set_logeado({estado: false, token: ''});
//             // }
//             if(res.data.status === "OK"){
//                 set_subidoArchivo1(true);
//                 // reiniciarpantalla();
//             }
//         }).catch(err => {
//             console.log(err.message);
//         });
//     }

//     const [cargandoArchivo2, set_cargandoArchivo2] = useState(false);
//     const [subidoArchivo2, set_subidoArchivo2] = useState(false);
//     const [imagendata2, set_imagendata2] = useState(false);
//     function enviarArchivo2(e){
//         console.log('event',e);

//         let file = e.target.files[0];
//         set_imagendata2(URL.createObjectURL(e.target.files[0]));
//         const formData = new FormData();
//         formData.append('file2', file);
//         formData.append('sid', gContext.logeado?.token);

//         set_cargandoArchivo2(true);

//             headers: {
//                 'Content-Type': 'multipart/form-data'
//             },
//         }).then((res) => {
//             set_cargandoArchivo2(false);
//             if(res.data.status === "ER"){
//             }
//             // if(res.data.status === "ERS"){
//             //     localStorage.removeItem('arani_session_id');
//             //     gContext.set_logeado({estado: false, token: ''});
//             // }
//             if(res.data.status === "OK"){
//                 // reiniciarpantalla();
//                 set_subidoArchivo2(true);
//             }
//         }).catch(err => {
//             console.log(err.message);
//         });
//     }

//     const [cargandoArchivo3, set_cargandoArchivo3] = useState(false);
//     const [subidoArchivo3, set_subidoArchivo3] = useState(false);
//     const [imagendata3, set_imagendata3] = useState(false);
//     function enviarArchivo3(e){
//         console.log('event',e);

//         let file = e.target.files[0];
//         set_imagendata3(URL.createObjectURL(e.target.files[0]));
//         const formData = new FormData();
//         formData.append('file3', file);
//         formData.append('sid', gContext.logeado?.token);

//         set_cargandoArchivo3(true);

//             headers: {
//                 'Content-Type': 'multipart/form-data'
//             },
//         }).then((res) => {
//             set_cargandoArchivo3(false);
//             if(res.data.status === "ER"){
//             }
//             // if(res.data.status === "ERS"){
//             //     localStorage.removeItem('arani_session_id');
//             //     gContext.set_logeado({estado: false, token: ''});
//             // }
//             if(res.data.status === "OK"){
//                 set_subidoArchivo3(true);
//                 // reiniciarpantalla();
//             }
//         }).catch(err => {
//             console.log(err.message);
//         });
//     }

//     const [cargandoArchivo4, set_cargandoArchivo4] = useState(false);
//     const [subidoArchivo4, set_subidoArchivo4] = useState(false);
//     const [imagendata4, set_imagendata4] = useState(false);
//     function enviarArchivo4(e){
//         console.log('event',e);

//         let file = e.target.files[0];
//         set_imagendata4(URL.createObjectURL(e.target.files[0]));
        
//         const formData = new FormData();
//         formData.append('file4', file);
//         formData.append('sid', gContext.logeado?.token);

//         set_cargandoArchivo4(true);

//             headers: {
//                 'Content-Type': 'multipart/form-data'
//             },
//         }).then((res) => {
//             set_cargandoArchivo4(false);
//             if(res.data.status === "ER"){
//             }
//             // if(res.data.status === "ERS"){
//             //     localStorage.removeItem('arani_session_id');
//             //     gContext.set_logeado({estado: false, token: ''});
//             // }
//             if(res.data.status === "OK"){
//                 set_subidoArchivo4(true);
//                 // reiniciarpantalla();
//             }
//         }).catch(err => {
//             console.log(err.message);
//         });
//     }

//     return (
//         <Box>
//             <Typography variant="h5" sx={{}} >Editar</Typography>
//             <Typography variant="body" sx={{mb: '1rem'}} >Ingresa el tipo de ingreso que tiene actualmente.</Typography>
//             <Typography variant="body2" sx={{textAlign: '', color: 'red'}}>Una vez subido los archivos tienen que ser aprobabos por una administrador para que aparezcan en esta sección.</Typography>
//             <Grid sx={{mt: 1, mb: 1}} container spacing={2}>
//                 <Grid item xs={12} sm={6}>
//                     {/* {subidoArchivo1 && <Typography sx={{textAlign: 'center', color: '#5aad55'}}>Se subio correctamente</Typography>} */}
//                     <Button fullWidth disabled={cargandoArchivo1||subidoArchivo1} variant="contained" component="label" startIcon={<span className="material-symbols-outlined">cloud_upload</span>}>
//                         {(cargandoArchivo1)?"Subiendo...":"Subir identidada frontal"}
//                         <input hidden onChange={enviarArchivo1} accept="image/*" multiple type="file" />
//                     </Button>      
//                     {(subidoArchivo1||imageFiles1) && <img className="imgprevperfil" src={imagendata1||imageFiles1} alt="preview" />}
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                     {/* {subidoArchivo2 && <Typography sx={{textAlign: 'center', color: '#5aad55'}}>Se subio correctamente</Typography>} */}
//                     <Button fullWidth disabled={cargandoArchivo2||subidoArchivo2} variant="contained" component="label" startIcon={<span className="material-symbols-outlined">cloud_upload</span>}>
//                         {(cargandoArchivo2)?"Subiendo...":"Subir identidad trasera"}
//                         <input hidden onChange={enviarArchivo2} accept="image/*" multiple type="file" />
//                     </Button>                      
//                     {(subidoArchivo2||imageFiles2) && <img className="imgprevperfil" src={imagendata2||imageFiles2}  alt="preview" />}
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                     {/* {subidoArchivo3 && <Typography sx={{textAlign: 'center', color: '#5aad55'}}>Se subio correctamente</Typography>} */}
//                     <Button fullWidth disabled={cargandoArchivo3||subidoArchivo3} variant="contained" component="label" startIcon={<span className="material-symbols-outlined">cloud_upload</span>}>
//                         {(cargandoArchivo3)?"Subiendo...":"Subir recibo publico"}
//                         <input hidden onChange={enviarArchivo3} accept="image/*" multiple type="file" />
//                     </Button>
//                     {(subidoArchivo3||imageFiles3) && <img className="imgprevperfil" src={imagendata3||imageFiles3}  alt="preview" />}
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                     {/* {subidoArchivo4 && <Typography sx={{textAlign: 'center', color: '#5aad55'}}>Se subio correctamente</Typography>} */}
//                     <Button fullWidth disabled={cargandoArchivo4||subidoArchivo4} variant="contained" component="label" startIcon={<span className="material-symbols-outlined">cloud_upload</span>}>
//                         {(cargandoArchivo4)?"Subiendo...":"Foto de perfil"}
//                         <input hidden onChange={enviarArchivo4} accept="image/*" multiple type="file" />
//                     </Button>
//                     {(subidoArchivo4||imageFiles4) && <img className="imgprevperfil" src={imagendata4||imageFiles4} alt="preview" />}
//                 </Grid>
//                 <Grid item xs={12} sm={12}>
                    
//                 </Grid>
//                 <Grid item xs={12} sm={12}>
//                     <Button onClick={reiniciarpantalla} sx={{ mt: 1, mr: 1 }} >Cerrar</Button>
//                 </Grid>
//             </Grid>
//         </Box>
//     )
// }

function FormCambiarClave({cerrar, reiniciarpantalla}){

    const gContext = useContext(AppContext);

    const [validado, set_validado] = useState(false);
    const [inputPassActual, set_inputPassActual] = useState({valor: '', validado: false, textoAyuda: "", blur: false});
    const [inputPass1, set_inputPass1] = useState("");
    const [inputPass2, set_inputPass2] = useState({valor: '', validado: false, textoAyuda: "", blur: false});
    const [passCambiado, set_passCambiado] = useState(false);
    const [errorAjax, set_errorAjax] = useState(false);
    
    // const [inputPass2, set_inputPass2] = useState({valor: '', validado: false, textoAyuda: "", blur: false});

    const [enviandoForm, set_enviandoForm] = useState(false);

    function handleChange_inputPassActual(event){
        let valor = event.target.value;
        let validado = false;
        let textoAyuda = "Solo letras sin espacios";
        if(valor.length >= 1){
            validado = true;
            textoAyuda = "";
        }
        set_inputPassActual({
            valor: valor, 
            validado: validado,
            textoAyuda: textoAyuda,
            blur: inputPassActual.blur,
        });
    }

 


    function handleChange_inputPass1(event){
        event.preventDefault();
        let valor = event.target.value;
        let validado = false;
        let textoAyuda = "Minimo debe tener 8 letras, 1 mayúscula 1 carácter especial y un número.";
        let regexp = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^\w\d]).{8,}$/;
        if(valor.match(regexp)){
            validado = true;
            textoAyuda = "";
        }
        set_inputPass1({
            valor: valor, 
            validado: validado,
            textoAyuda: textoAyuda,
            blur: inputPass1.blur,
        });
        set_inputPass2({
            ...inputPass2,
            blur: inputPass2.blur,
        });
    }

    function handleChange_inputPass2(event){
        event.preventDefault();
        let valor = event.target.value;
        let validado = false;
        let textoAyuda = "Minimo debe tener 8 letras, 1 mayúscula 1 carácter especial y un número.";
        let regexp = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^\w\d]).{8,}$/;
        // console.log(valor);
        // console.log(inputPass1.valor);
        if(valor.match(regexp)){
            if(valor !== inputPass1.valor){
                validado = false;
                textoAyuda = "Esta contraseña no coincide con la primera.";
            }else{
                validado = true;
                textoAyuda = "";
            }
        }
        set_inputPass2({
            valor: valor, 
            validado: validado,
            textoAyuda: textoAyuda,
            blur: inputPass2.blur,
        });
    }

 

    useEffect(()=>{
        if(inputPassActual?.validado && inputPass1?.validado && inputPass2?.validado){
            set_validado(true);
        }else{
            set_validado(false);
        }
        // eslint-disable-next-line
    },[inputPassActual, inputPass1, inputPass2]);

    function guardarDatos(){
        set_enviandoForm(true);
        axios.request({
            url: `${config.apiUrl}/api/app/PostResetPassword.php`,
            method: "post",
            data: {
                sid: gContext.logeado?.token,
                UsrPwd: inputPassActual.valor,
                UsrPwdNew: inputPass1.valor,
              },
        })
        .then((res) => {
            set_enviandoForm(false);
            if(res.data.status === "ER"){
                set_errorAjax(res.data.payload.message);
            }
            if(res.data.status === "ERS"){
                localStorage.removeItem('arani_session_id');
                gContext.set_logeado({estado: false, token: ''});
            }
            if(res.data.status === "OK"){
                // reiniciarpantalla();
                set_passCambiado(true);
            }
        }).catch(err => {
            console.log(err.message);
        });
    }

    return (
        <Box>
            <Typography variant="h5" sx={{}} >Cambiar contraseña</Typography>
            <Typography variant="body" sx={{mb: '1rem'}} >Ingresa tu actual contraseña para comenzar.</Typography>
            <Grid sx={{mt: 1, mb: 1}} container spacing={2}>
                {passCambiado && 
                <>
                <Grid item xs={12} sm={12}>
                    <Typography variant="body2" sx={{mb: '1rem', color: 'green'}} >Contraseña cambiada correctamente.</Typography>
                </Grid>
                <Grid item xs={12} sm={12}>
                    <Button variant="contained" onClick={cerrar} sx={{ mt: 1, mr: 1 }} >Cerrar</Button>
                </Grid>
                </>
                }
                {!passCambiado && 
                <>
                <Grid item xs={12} sm={12}>
                    <TextField
                        required
                        autoComplete="off"
                        fullWidth
                        type="password"
                        label="Contraseña actual"
                        onBlur={()=>{set_inputPassActual({...inputPassActual, blur: true})}}
                        value={inputPassActual.valor}
                        onChange={handleChange_inputPassActual}
                        error={(!inputPassActual.validado && inputPassActual.blur)} 
                        helperText={inputPassActual.textoAyuda} 
                        />
                </Grid>
                <Grid item xs={12} sm={12}>
                    <TextField
                        autoComplete="off"
                        fullWidth
                        type="password"
                        label="Contraseña nueva"
                        required
                        onBlur={()=>{set_inputPass1({...inputPass1, blur: true})}}
                        value={inputPass1.valor}
                        onChange={handleChange_inputPass1}
                        error={(!inputPass1.validado && inputPass1.blur)}
                        helperText={inputPass1.textoAyuda}
                        />
                </Grid>
                <Grid item xs={12} sm={12}>
                    <TextField
                        autoComplete="off"
                        fullWidth
                        type="password"
                        label="Repite contraseña nueva"
                        required
                        onBlur={()=>{set_inputPass2({...inputPass2, blur: true})}}
                        value={inputPass2.valor}
                        onChange={handleChange_inputPass2}
                        error={(!inputPass2.validado && inputPass2.blur)}
                        helperText={inputPass2.textoAyuda}
                        />
                </Grid>
                <Grid item xs={12} sm={12}>
                    <Typography variant="body2" sx={{mb: '1rem', color: '#ff4d4d'}} >{errorAjax}</Typography>
                </Grid>
                <Grid item xs={12} sm={12}>
                    <Button disabled={(validado && !enviandoForm)?false:true} variant="contained" onClick={guardarDatos} sx={{ mt: 1, mr: 1 }} >{(enviandoForm)?"Enviando....":"Cambiar contraseña"}</Button>
                    <Button onClick={cerrar} sx={{ mt: 1, mr: 1 }} >Cerrar</Button>
                </Grid>
                </>
                }
            </Grid>
        </Box>
    )
}



function FormCambiarBanco({cerrar, reiniciarpantalla, apiCamposConstructor, usuarioDetalle}){

    const gContext = useContext(AppContext);

    const [validado, set_validado] = useState(false);

    const [inputCuentaBanco, set_inputCuentaBanco] = useState({valor: usuarioDetalle ? usuarioDetalle.account_number : '0', validado: false, textoAyuda: "", blur: false}) 
    const [inputBanco, set_inputBanco] = useState({ valor: usuarioDetalle && usuarioDetalle.bank ? usuarioDetalle.bank : '0', validado: false, textoAyuda: "", blur: false });

    const [errorAjax, set_errorAjax] = useState(false);
    
    const [enviandoForm, set_enviandoForm] = useState(false);

    const handleChange_inputBanco = (event) => {
        set_inputBanco({
            ...inputBanco,
            valor: event.target.value,
            validado: true
        });
    }

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (usuarioDetalle && usuarioDetalle.bank) {
                set_inputBanco(inputBanco => ({
                    ...inputBanco,
                    valor: usuarioDetalle.bank,
                    validado: true
                }));
            }
        }, 500); // 5000 milisegundos = 5 segundos
    
        // Limpia el timeout cuando el componente se desmonta
        return () => clearTimeout(timeout);
    }, [usuarioDetalle]);

    const handleChange_inputCuentaBanco = (event) => {
        set_inputCuentaBanco({
            ...inputCuentaBanco,
            valor: event.target.value,
            validado: true
        });
    }

    useEffect(() => {
        if (inputBanco.validado && inputCuentaBanco.validado) {
            set_validado(true);
        } else {
            set_validado(false);
        }
    }, [inputBanco, inputCuentaBanco]);

    const guardarDatos = () => {
        set_enviandoForm(true);
        axios.request({
            url: `${config.apiUrl}/api/app/putProfile.php`,
            method: "post",
            data: {
                sid: gContext.logeado?.token,
                array: {
                    account_number: inputCuentaBanco.valor,
                    bank: inputBanco.valor,

                },
              },
        })
        .then((res) => {
            set_enviandoForm(false);
            if(res.data.status === "ER"){
                
            }
            if(res.data.status === "ERS"){
                localStorage.removeItem('arani_session_id');
                gContext.set_logeado({estado: false, token: ''});
            }
            if(res.data.status === "OK"){
                reiniciarpantalla();
            }
        }).catch(err => {
            console.log(err.message);
            set_errorAjax(err.message);
        });
    }

    const cargarCuentaBanco = () => {
        axios.request({
            url: `${config.apiUrl}/api/app/get_bankaccount.php`,
            method: "post",
            data: {
                sid: gContext.logeado.token,
            },
        })
        .then((res) => {
            if (res.data.status === "OK") {
                console.log('get_bankaccount', res.data.payload?.data);

                let cuentaActiva = false;
                for (const key in res.data.payload?.data) {
                    if (Object.hasOwnProperty.call(res.data.payload?.data, key)) {
                        const element = res.data.payload?.data[key];
                        if (element.current === '1') {
                            cuentaActiva = element;
                        }
                    }
                }

                set_inputCuentaBanco({
                    ...inputCuentaBanco,
                    valor: cuentaActiva && cuentaActiva.account_number ? cuentaActiva.account_number : '',
                    validado: true
                });
                set_inputBanco({
                    ...inputBanco,
                    valor: cuentaActiva && cuentaActiva.bank ? cuentaActiva.bank : '',
                    validado: true
                });
            }
        }).catch(err => {
            console.log(err.message);
        });
    }

    useEffect(() => {
        cargarCuentaBanco();
    }, []);
    

    return (
        <Box>
            <Typography variant="h5" sx={{}} >Cambiar cuenta de banco</Typography>
            <Typography variant="body" sx={{mb: '1rem'}} >Ingrese su cuenta de banco en la que quiere recibir el dinero de los préstamos.</Typography>
            <Grid sx={{mt: 1, mb: 1}} container spacing={2}>
            <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                    <InputLabel onBlur={()=>{set_inputBanco({...inputBanco, blur: true})}} required error={(!inputBanco.validado && inputBanco.blur)}>Banco</InputLabel>
                    <Select onBlur={()=>{set_inputBanco({...inputBanco, blur: true})}} required value={inputBanco.valor} onChange={handleChange_inputBanco} label="Banco" error={(!inputBanco.validado && inputBanco.blur)}>
                        {Object.keys(apiCamposConstructor?.bank?.values).map((key)=>{
                            return ((key)?<MenuItem key={key} value={key}>{apiCamposConstructor?.bank?.values[key]}</MenuItem>:'');
                        })}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
            <TextField 
                helperText={inputCuentaBanco.textoAyuda} 
                required 
                value={inputCuentaBanco.valor} 
                onBlur={()=>{set_inputCuentaBanco({...inputCuentaBanco, blur: true})}}
                onChange={handleChange_inputCuentaBanco} 
                error={(!inputCuentaBanco.validado && inputCuentaBanco.blur)} 
                autoComplete="off" 
                fullWidth 
                label={"# de cuenta  "}
                InputLabelProps={{
                    shrink: true,
                }}
            />

                </Grid>
                <Grid item xs={12} sm={12}>
                    <Typography variant="body2" sx={{mb: '1rem', color: '#ff4d4d'}} >{errorAjax}</Typography>
                </Grid>
                <Grid item xs={12} sm={12}>
                    <Button disabled={(validado && !enviandoForm)?false:true} variant="contained" onClick={guardarDatos} sx={{ mt: 1, mr: 1 }} >{(enviandoForm)?"Enviando....":"Guardar"}</Button>
                    <Button onClick={cerrar} sx={{ mt: 1, mr: 1 }} >Cerrar</Button>
                </Grid>
            </Grid>
        </Box>
    )
}

function FormEditFile1({reiniciarpantalla, usuarioFiles}){

    const gContext = useContext(AppContext);
    const [imageFiles1, set_imageFiles1] = useState(false);
    
    useEffect(()=>{
        console.log('usuarioFiles', usuarioFiles);
        
        let t19 = usuarioFiles.find(e=>e.type === "19");
        if(!/\.eu$/.test(t19?.dir)){
            if(t19?.dir) set_imageFiles1(`${config.apiUrl}${t19?.dir}`);
        }

        // eslint-disable-next-line
    }, []);

    const [cargandoArchivo1, set_cargandoArchivo1] = useState(false);
    const [subidoArchivo1, set_subidoArchivo1] = useState(false);
    const [imagendata1, set_imagendata1] = useState(false);
    function enviarArchivo1(e){
        console.log('event',e);

        let file = e.target.files[0];
        set_imagendata1(URL.createObjectURL(e.target.files[0]));
        const formData = new FormData();
        formData.append('file1', file);
        formData.append('sid', gContext.logeado?.token);

        set_cargandoArchivo1(true);
        axios.post(`${config.apiUrl}/api/app/putProfileFile.php`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
        }).then((res) => {
            set_cargandoArchivo1(false);
            
            if(res.data.status === "ER"){
            }
            // if(res.data.status === "ERS"){
            //     localStorage.removeItem('arani_session_id');
            //     gContext.set_logeado({estado: false, token: ''});
            // }
            if(res.data.status === "OK"){
                set_subidoArchivo1(true);
                // reiniciarpantalla();
            }
        }).catch(err => {
            console.log(err.message);
        });
    }

    

    return (
        <Box>
            <Typography variant="h5" sx={{}} >Identidad</Typography>
            <Typography variant="body" sx={{mb: '1rem'}} >Suba una fotografía de la parte frontal de su identidad</Typography>
            <Grid sx={{mt: 1, mb: 1}} container spacing={2}>
                <Grid item xs={12} sm={12}>
                    {subidoArchivo1 && <Typography sx={{textAlign: 'center', color: '#5aad55'}}>Se subio correctamente</Typography>}
                    {(subidoArchivo1||imageFiles1) && <img className="imgprevperfil" src={imagendata1||imageFiles1} alt="preview" />}
                    <Button fullWidth disabled={cargandoArchivo1||subidoArchivo1} variant="contained" component="label" startIcon={<span className="material-symbols-outlined">cloud_upload</span>}>
                        {(cargandoArchivo1)?"Subiendo...":"Subir identidada frontal"}
                        <input hidden onChange={enviarArchivo1} accept=".png, .jpg, .jpeg" multiple type="file" />
                    </Button>      
                </Grid>
                <Grid item xs={12} sm={12}>
                    <Button onClick={reiniciarpantalla} sx={{}} >Cerrar</Button>
                </Grid>
            </Grid>
        </Box>
    )
}

function FormEditFile2({reiniciarpantalla, usuarioFiles}){
    const gContext = useContext(AppContext);
    const [imageFiles2, set_imageFiles2] = useState(false);

    useEffect(()=>{
        console.log('usuarioFiles', usuarioFiles);
        
        let t20 = usuarioFiles.find(e=>e.type === "20");
        if(t20?.dir) set_imageFiles2(`${config.apiUrl}${t20?.dir}`);

        // eslint-disable-next-line
    }, []);

   

    const [cargandoArchivo2, set_cargandoArchivo2] = useState(false);
    const [subidoArchivo2, set_subidoArchivo2] = useState(false);
    const [imagendata2, set_imagendata2] = useState(false);
    function enviarArchivo2(e){
        console.log('event',e);

        let file = e.target.files[0];
        set_imagendata2(URL.createObjectURL(e.target.files[0]));
        const formData = new FormData();
        formData.append('file2', file);
        formData.append('sid', gContext.logeado?.token);

        set_cargandoArchivo2(true);
        axios.post(`${config.apiUrl}/api/app/putProfileFile.php`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
        }).then((res) => {
            set_cargandoArchivo2(false);
            if(res.data.status === "ER"){
            }
            // if(res.data.status === "ERS"){
            //     localStorage.removeItem('arani_session_id');
            //     gContext.set_logeado({estado: false, token: ''});
            // }
            if(res.data.status === "OK"){
                // reiniciarpantalla();
                set_subidoArchivo2(true);
            }
        }).catch(err => {
            console.log(err.message);
        });
    }    

    return (
        <Box>
            <Typography variant="h5" sx={{}} >Identidad</Typography>
            <Typography variant="body" sx={{mb: '1rem'}} >Suba una fotografía de la parte trasera de su identidad</Typography>
            <Grid sx={{mt: 1, mb: 1}} container spacing={2}>
               
                <Grid item xs={12} sm={12}>
                    {subidoArchivo2 && <Typography sx={{textAlign: 'center', color: '#5aad55'}}>Se subio correctamente</Typography>}
                    {(subidoArchivo2||imageFiles2) && <img className="imgprevperfil" src={imagendata2||imageFiles2}  alt="preview" />}
                    <Button fullWidth disabled={cargandoArchivo2||subidoArchivo2} variant="contained" component="label" startIcon={<span className="material-symbols-outlined">cloud_upload</span>}>
                        {(cargandoArchivo2)?"Subiendo...":"Subir identidad trasera"}
                        <input hidden onChange={enviarArchivo2} accept="image/*" multiple type="file" />
                    </Button>                      
                </Grid>
                <Grid item xs={12} sm={12}>
                    <Button onClick={reiniciarpantalla} sx={{ mt: 1, mr: 1 }} >Cerrar</Button>
                </Grid>
            </Grid>
        </Box>
    )
}

function FormEditFile3({reiniciarpantalla, usuarioFiles}){
    const gContext = useContext(AppContext);
    const [imageFiles3, set_imageFiles3] = useState(false);

    useEffect(()=>{
        console.log('usuarioFiles', usuarioFiles);
        
        let t21 = usuarioFiles.find(e=>e.type === "21");
        if(t21?.dir) set_imageFiles3(`${config.apiUrl}${t21?.dir}`);

        // eslint-disable-next-line
    }, []);

    

    const [cargandoArchivo3, set_cargandoArchivo3] = useState(false);
    const [subidoArchivo3, set_subidoArchivo3] = useState(false);
    const [imagendata3, set_imagendata3] = useState(false);
    function enviarArchivo3(e){
        console.log('event',e);

        let file = e.target.files[0];
        set_imagendata3(URL.createObjectURL(e.target.files[0]));
        const formData = new FormData();
        formData.append('file3', file);
        formData.append('sid', gContext.logeado?.token);

        set_cargandoArchivo3(true);
        axios.post(`${config.apiUrl}/api/app/putProfileFile.php`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
        }).then((res) => {
            set_cargandoArchivo3(false);
            if(res.data.status === "ER"){
            }
            // if(res.data.status === "ERS"){
            //     localStorage.removeItem('arani_session_id');
            //     gContext.set_logeado({estado: false, token: ''});
            // }
            if(res.data.status === "OK"){
                set_subidoArchivo3(true);
                // reiniciarpantalla();
            }
        }).catch(err => {
            console.log(err.message);
        });
    }

    return (
        <Box>
            <Typography variant="h5" sx={{}} >Recibo publico</Typography>
            <br/>
            <Typography variant="body2" sx={{textAlign: ''}}>
                Sube una foto clara de un recibo publico de <strong>(los ultimos 6 meses)</strong> de cualquiera de las siguientes empresas: <strong>EEH, UMAPS, Aguas de San Pedro, servicios de cable TIGO, Claro y Cable Color</strong>.  <br/> El recibo debe mostrar la direccion de su vivienda.  
                <br/>
                <br/>
                <strong>Si el recibo no cumple las condiciones mencionadas no sera aceptado</strong>
            </Typography>
            <Grid sx={{mt: 1, mb: 1}} container spacing={2}>
               
                <Grid item xs={12} sm={12}>
                    {subidoArchivo3 && <Typography sx={{textAlign: 'center', color: '#5aad55'}}>Se subio correctamente</Typography>}
                    {(subidoArchivo3||imageFiles3) && <img className="imgprevperfil" src={imagendata3||imageFiles3}  alt="preview" />}
                    <br/>
                    <Button fullWidth disabled={cargandoArchivo3||subidoArchivo3} variant="contained" component="label" startIcon={<span className="material-symbols-outlined">cloud_upload</span>}>
                        {(cargandoArchivo3)?"Subiendo...":"Subir recibo publico"}
                        <input hidden onChange={enviarArchivo3} accept="image/*" multiple type="file" />
                    </Button>
                </Grid>
               
                <Grid item xs={12} sm={12}>
                    <Button onClick={reiniciarpantalla} sx={{ mt: 1, mr: 1 }} >Cerrar</Button>
                </Grid>
            </Grid>
        </Box>
    )
}

function FormEditFile4({reiniciarpantalla, usuarioFiles}){
    const gContext = useContext(AppContext);
    
    const [imageFiles4, set_imageFiles4] = useState(false);

    useEffect(()=>{
        console.log('usuarioFiles', usuarioFiles);
        
        let t18 = usuarioFiles.find(e=>e.type === "18");
        if(t18?.dir) set_imageFiles4(`${config.apiUrl}${t18?.dir}`);

        // eslint-disable-next-line
    }, []);

    

    const [cargandoArchivo4, set_cargandoArchivo4] = useState(false);
    const [subidoArchivo4, set_subidoArchivo4] = useState(false);
    const [imagendata4, set_imagendata4] = useState(false);
    function enviarArchivo4(e){
        console.log('event',e);

        let file = e.target.files[0];
        set_imagendata4(URL.createObjectURL(e.target.files[0]));
        
        const formData = new FormData();
        formData.append('file4', file);
        formData.append('sid', gContext.logeado?.token);

        set_cargandoArchivo4(true);
        axios.post(`${config.apiUrl}/api/app/putProfileFile.php`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
        }).then((res) => {
            set_cargandoArchivo4(false);
            if(res.data.status === "ER"){
            }
            // if(res.data.status === "ERS"){
            //     localStorage.removeItem('arani_session_id');
            //     gContext.set_logeado({estado: false, token: ''});
            // }
            if(res.data.status === "OK"){
                set_subidoArchivo4(true);
                // reiniciarpantalla();
            }
        }).catch(err => {
            console.log(err.message);
        });
    }

    return (
        <Box>
            <Typography variant="h5" sx={{}}>Foto selfie</Typography>
            <br/>
            <Typography variant="body1" sx={{ mb: '1rem', textAlign: 'justify' }}>
                Sube una foto selfie que servirá como tu foto de perfil. Asegúrate de que la foto sea a color, muestres tu DNI, y aparezca todo tu rostro y cabello. No uses gorra, sombrero ni lentes de sol. <br/><br/><strong>Las fotos que no cumplan con estas condiciones no serán aceptadas</strong>.
            </Typography>

            <Grid sx={{mt: 1, mb: 1}} container spacing={2}>
                
                <Grid item xs={12} sm={12}>
                    {subidoArchivo4 && <Typography sx={{textAlign: 'center', color: '#5aad55'}}>Se subio correctamente</Typography>}
                    {(subidoArchivo4||imageFiles4) && <img className="imgprevperfil" src={imagendata4||imageFiles4} alt="preview" />}
                    <br/>
                    <Button fullWidth disabled={cargandoArchivo4||subidoArchivo4} variant="contained" component="label" startIcon={<span className="material-symbols-outlined">cloud_upload</span>}>
                        {(cargandoArchivo4)?"Subiendo...":"Foto de perfil"}
                        <input hidden onChange={enviarArchivo4} accept="image/*" multiple type="file" />
                    </Button>
                </Grid>
               
                <Grid item xs={12} sm={12}>
                    <Button onClick={reiniciarpantalla} sx={{ mt: 1, mr: 1 }} >Cerrar</Button>
                </Grid>
            </Grid>
        </Box>
    )
}