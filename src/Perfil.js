import config from './config';
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import {Button, Dialog, DialogTitle,DialogContentText,DialogActions, DialogContent, Divider, Grid, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Paper, TextField, Typography } from "@mui/material";
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
import FormEditNombres from './componentes/formEditNombres.js';
import FormEditWorkplacePosition from './componentes/formEditWorkplacePosition.js';
import FormEditIncome from './componentes/formEditIncome.js';
import FormEditTelefono from './componentes/formEditTelefono.js';
import FormEditTipoIngreso from './componentes/formEditTipoIngreso.js';
import FormEditEstadoCivil from './componentes/formEditarEstadoCivil.js';
import FormEditUbicacion from './componentes/formEditUbicacion.js';
import FormEditUbicacionTrabajo from './componentes/formUbicacionTrabajoInicio.js';
import FormEditVivienda from './componentes/formEditVivienda.js';
import FormEditLugarTrabajo from './componentes/formEditLugarTrabajo.js';
import FormEditNumeroDependientes from './componentes/formEditNumeroDependientes.js';
import FormEditDependeti from './componentes/formTipoDependientes.js';
import FormEditGradoEducativo from './componentes/formEditGradoEducativo.js';
import FormCambiarClave from './componentes/cambiarClave.js';
import FormCambiarBanco from './componentes/cambiarBanco.js';
import FormEditFile1 from './componentes/editFile1.js';
import FormEditFile2 from './componentes/editFile2.js';
import FormEditFile3 from './componentes/editFile3.js';
import FormEditFile4 from './componentes/editFile4.js';
import React from 'react';

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
                    "La Paz, Honduras"
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

    async function validarPerfilEnCore(callback) { // Para saber si ya esta registrado en el CORE o no
        try {
            const res = await axios.request({
                url: `${config.apiUrl}/api/app/getProfile.php`,
                method: "post",
                data: {
                    sid: gContext.logeado?.token,
                },
            });

            set_cargando(false);

            const { status, payload, files, csas, datasend } = res.data;

            if (status === "ER") {
                console.error(payload.message);
            } else if (status === "ERS") {
                localStorage.removeItem('arani_session_id');
                gContext.set_logeado({ estado: false, token: '' });
            } else if (status === "OK") {
                console.log('usuarioDetalle', payload.data);
                set_usuarioDetalleFullR(res.data);
                set_usuarioDetalle(payload.data);
                set_usuarioFiles(files);
                set_clasificacion(csas);

                if (payload.data.status === "1") {
                    set_usuarioAprobadoManual(true);
                }

                if (datasend === "CMP") {
                    set_datosEnviadosArevision(true);
                }

                // Imagen perfil
                const t18 = files.find(e => e.type === "18");
                if (t18?.dir) {
                    set_urlImagenPerfilTerminada(`${config.apiUrl}${t18?.dir}`);
                }

                console.log('usuarioDetalleFullR.datasend', usuarioDetalleFullR.datasend);
                console.log('usuarioDetalleFullR', usuarioDetalleFullR);
            } else if (status === 500) {
                console.error("res.data.status === 500");
                set_faltaTerminarRegistro(true);
            }

            if (typeof callback === 'function') callback();
        } catch (err) {
            console.error(err.message);
            navigate("/login");
        }
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

    }   useEffect(()=>{
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
                                    disabled={usuarioDetalle.status === "1"}  // Deshabilita el botón si status es "1"
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

//Editar Antiguedad Laboral
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
    }   return (
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
    )}