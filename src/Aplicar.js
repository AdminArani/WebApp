import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import {Button, Divider, List, ListItem, ListItemText, Paper, Typography } from "@mui/material";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "./App";
import BarraFinal from "./componentes/BarraFinal";
import { Link, useNavigate } from "react-router-dom";
import BarraApp from "./componentes/BarraApp";
import CrearNuevoPrestamo from "./componentes/CrearNuevoPrestamo";
import tile_nuevopre from "./images/tile_nuevopre.svg";
import TerminarRegistro from "./componentes/TerminarRegistro";
import tile_perfil from "./images/tile_perfil.svg";
import CircularProgress from '@mui/material/CircularProgress';
import { orange } from "@mui/material/colors";

function Aplicar() {
    const gContext = useContext(AppContext);
    const [usuarioRegistradoEnCore, set_usuarioRegistradoEnCore] = useState(false);
    const [cargandoPage, set_cargandoPage] = useState(true);
    const [usuarioAprobadoManual, set_usuarioAprobadoManual] = useState(false);
    const [openVentanaTerminarRegistro, set_openVentanaTerminarRegistro] = useState(false);
    const [datosEnviadosArevision, set_datosEnviadosArevision] = useState(false);
    
    
    const navigate = useNavigate();

    function validarPerfilEnCore(){ // Para saber si ya esta registrado en el CORE o no
        axios.request({
            url:  `${process.env.REACT_APP_API_URL}/api/app/getProfile.php`,
            method: "post",
            data: {
                sid: gContext.logeado?.token,
              },
        })
        .then((res) => {
            set_cargandoPage(false);
            set_usuarioRegistradoEnCore(false);
            if(res.data.status === "ER"){
                console.log(res.data.payload.message);
            }
            if(res.data.status === "ERS"){
                localStorage.removeItem('arani_session_id');
                localStorage.removeItem('arani_session_data');
                gContext.set_logeado({estado: false, token: '', data: {}});
            }
            if(res.data.status === "OK"){
                console.log('getProfile', res.data);
                set_usuarioRegistradoEnCore(true);
                if(res.data.payload.data.status === "1"){
                    set_usuarioAprobadoManual(true);
                }
            }
            if(res.data.datasend === "CMP"){
                set_datosEnviadosArevision(true);
            }
            if(res.data.status === 500){
                set_usuarioRegistradoEnCore(false);
            }
        }).catch(err => {
            console.log(err.message);
            navigate("/login");
        });
    }
    
    function recargarlapagina(){
        console.log("recargarlapagina");
        set_usuarioRegistradoEnCore(false);
        set_cargandoPage(true);
        set_openVentanaTerminarRegistro(false);
        validarPerfilEnCore();
        console.log("recargarlapagina");
    }

    useEffect(()=>{
        validarPerfilEnCore();
        
        // eslint-disable-next-line
    },[]);
    
    return (
        <Container disableGutters sx={{ minHeight: '100vh', display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"  }} component="main" maxWidth="md">
            <Box sx={{p: '4px', width: '100%'}}>
                <Paper elevation={6} sx={{p: 4}}>
                    <BarraApp />
                    <Button component={Link} to="/" variant="outlined" startIcon={<span className="material-symbols-outlined">arrow_back</span>}>Volver</Button>
                    {(cargandoPage) && <Cargando />}
                    {(!cargandoPage && usuarioRegistradoEnCore) && <RegistradoCore todosaliobienfn={recargarlapagina} usuarioAprobadoManual={usuarioAprobadoManual} datosEnviadosArevision={datosEnviadosArevision} />}
                    {(!cargandoPage && !usuarioRegistradoEnCore) && <NoRegistradoCore set_openVentanaTerminarRegistro={set_openVentanaTerminarRegistro} />}
                </Paper>
                <TerminarRegistro open={(!usuarioRegistradoEnCore && openVentanaTerminarRegistro)} cerrar={()=>{set_openVentanaTerminarRegistro(false)}} todosaliobienfn={recargarlapagina} />
                <BarraFinal />
            </Box>
        </Container>
    );
}

function Cargando(){
    return (
        <Typography variant="body2" sx={{color: 'silver', textAlign: 'center', maxWidth: '20rem', m: '3rem auto', p: '0 2rem'}} >
            <CircularProgress /><br></br>Consultando la información en nuestros servidores, por favor espere...
        </Typography>
    );
}

function RegistradoCore({todosaliobienfn, usuarioAprobadoManual, datosEnviadosArevision}){
    const gContext = useContext(AppContext);
    const [cargandoPage, set_cargandoPage] = useState(true);
    const [productsArr, set_productsArr] = useState([]);
    const [openVNuevoPres, set_openVNuevoPres] = useState(false);
    const [idProductSelected, set_idProductSelected] = useState(false);
    const [productSelected, set_productSelected] = useState(false);
    const [purposeListaObj, set_purposeListaObj] = useState({});
    const [pricelistData, set_pricelistData] = useState({});
    const [tieneOtroPrestamo, set_tieneOtroPrestamo] = useState(true);
    const [estacargandoValidacionPrestamo, set_estacargandoValidacionPrestamo] = useState(false);
    const [statusPrestamo, set_statusPrestamo] = useState(false);
    // const [tieneOtroPrestamoEstadosArr, set_tieneOtroPrestamoEstadosArr] = useState([]);
    
    const navigate = useNavigate();

    // INICIO CODIGO ANTIGUO

    // function getApplicationProfile(){
    //     set_cargandoPage(true);
    //     axios.request({

    //         method: "post",
    //         data: {
    //             sid: gContext.logeado?.token,
    //           },
    //     })
    //     .then((res) => {
    //         set_cargandoPage(false);
    //         if(res.data.status === "ER"){
    //             console.log(res.data.payload.message);
    //         }
    //         if(res.data.status === "ERS"){
    //             localStorage.removeItem('arani_session_id');
    //             localStorage.removeItem('arani_session_data');
    //             gContext.set_logeado({estado: false, token: '', data: {}});
    //         }
    //         if(res.data.status === "OK"){
    //             console.log(res.data.payload);
    //             let productosProcesados = [];
    //             for (const key in res.data?.payload?.Products) {
    //                 if (Object.hasOwnProperty.call(res.data?.payload?.Products, key)) {
    //                     const element = res.data?.payload?.Products[key];
    //                     if(res.data?.payload?.Products_r?.indexOf(element.ProCod) > -1){
    //                         productosProcesados.push({...element, puedeAcceder: true});
    //                         // console.log('Producto habilitado');
    //                     }else{
    //                         productosProcesados.push({...element, puedeAcceder: false});
    //                         // console.log('Producto deshabilitado');
    //                     }
    //                 }
    //             }
    //             // productosProcesados.sort((a,b)=>a.ProFch=b.ProFch);


    //             set_productsArr(productosProcesados);
    //             set_pricelistData(res.data?.payload?.PriceList);

    //             // console.log('procesado ',productosProcesados);
    //             // for (const key in res.data?.payload?.PriceList?.data?.pricelistData) {
    //             //     if (Object.hasOwnProperty.call(res.data?.payload?.PriceList?.data?.pricelistData, key)) {
    //             //         const element = res.data?.payload?.PriceList?.data?.pricelistData[key];
    //             //     }
    //             // }
    //         }
            
    //     }).catch(err => {
    //         console.log(err.message);
    //         navigate("/login");
    //     });
    // }

    // FIN CODIGO ANTIGUO

    function getApplicationProfile(){
        set_cargandoPage(true);
        axios.request({
            url:  `${process.env.REACT_APP_API_URL}/api/app/getApplicationProfilev2.php`,
            method: "post",
            data: {
                sid: gContext.logeado?.token,
            },
        })
        .then((res) => {
            set_cargandoPage(false);
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
                let productosProcesados = [];
                for (const key in res.data?.payload?.Products) {
                    if (Object.hasOwnProperty.call(res.data?.payload?.Products, key)) {
                        const element = res.data?.payload?.Products[key];
                        if(res.data?.payload?.Products_r?.indexOf(element.ProCod) > -1){
                            productosProcesados.push({...element, puedeAcceder: true});
                        }else{
                            productosProcesados.push({...element, puedeAcceder: false});
                        }
                    }
                }
    
                if(productosProcesados.length >= 3) {
                    const ultimo = productosProcesados.pop();
                    const penultimo = productosProcesados.pop();
    
                    productosProcesados.push(ultimo);
                    productosProcesados.push(penultimo);
                }
    
                set_productsArr(productosProcesados);
                set_pricelistData(res.data?.payload?.PriceList);
            }
            
        }).catch(err => {
            console.log(err.message);
            navigate("/login");
        });
    }

    function getPurposeList(){
        axios.request({
            url: `${process.env.REACT_APP_API_URL}/api/app/getPurposeList.php`,
            method: "post",
            data: {
                sid: gContext.logeado?.token,
              },
        })
        .then((res) => {
            if(res.data.status === "ER"){
                console.log(res.data.payload.message);
            }
            if(res.data.status === "ERS"){
                localStorage.removeItem('arani_session_id');
                localStorage.removeItem('arani_session_data');
                gContext.set_logeado({estado: false, token: '', data: {}});
            }
            if(res.data.status === "OK"){
                console.log(res.data);
                set_purposeListaObj(res.data.payload);
            }
            if(res.data.status === 500){
            }
        }).catch(err => {
            console.log(err.message);
            navigate("/login");
        });
    }


    function validarSiTienePrestamos(){
        set_estacargandoValidacionPrestamo(true);
        axios.request({
            url: `${process.env.REACT_APP_API_URL}/api/app/getCustomerOfferList.php`,
            method: "post",
            data: {
                sid: gContext.logeado?.token,
              },
        })
        .then((res) => {
            set_estacargandoValidacionPrestamo(false);
            if(res.data.status === "ER"){
                console.log(res.data.payload.message);
            }
            if(res.data.status === "ERS"){
                localStorage.removeItem('arani_session_id');
                localStorage.removeItem('arani_session_data');
                gContext.set_logeado({estado: false, token: '', data: {}});
            }
            if(res.data.status === "OK"){
                // console.log(res.data.payload);
                // set_dataObj(res.data.payload);
                // let arraystadosprest = [];
                set_tieneOtroPrestamo(false);
                for (const key in res.data.payload) {
                    if (Object.hasOwnProperty.call(res.data.payload, key)) {
                        const element = res.data.payload[key];
                        // arraystadosprest[element.status] = true;
                        if(element.status === 3) set_tieneOtroPrestamo(true);
                        if(element.status === 1) set_tieneOtroPrestamo(true);
                        if(element.status === 0) set_tieneOtroPrestamo(true);
                        if(element.status === 8) set_tieneOtroPrestamo(true);
                        if(element.status === 5) set_tieneOtroPrestamo(true);
                        set_statusPrestamo(element.status);
                        // console.log('element.status', element.status);
                    }
                }
                // set_tieneOtroPrestamoEstadosArr(arraystadosprest);
                // -------------------------------------------
                // -------------------------------------------
                // -------------------------------------------
                // -------------------------------------------
                // -------------------------------------------
                // -------------------------------------------
                // set_tieneOtroPrestamo(false);
                // BORRAR ESTO DESPUES DE PROBAR
                
            }
            if(res.data.status === 500){
            }
        }).catch(err => {
            console.log(err.message);
            navigate("/login");
        });
    }


    useEffect(()=>{
        getApplicationProfile();
        getPurposeList();
        validarSiTienePrestamos();
        // eslint-disable-next-line
    },[]);


    return (
        <Box>
            {cargandoPage && <Cargando />}
            {!cargandoPage && 
            <Box>
                <Typography variant="h5" sx={{mt: 6}} >Nuevo préstamo</Typography>
                <Typography variant="body2" sx={{}} >Selecciona un tipo de préstamo de la siguiente lista.</Typography>

                {(tieneOtroPrestamo && !estacargandoValidacionPrestamo) && <List dense>
                    <ListItem disablePadding>
                       
                        <ListItemText sx={{}} primary={
                            <Box>
                                {(statusPrestamo === 0) && <Typography variant="body2" sx={{color: '#26c926', paddingTop: '1rem'}}>Gracias por solicitar un préstamo con ARANI. Queremos informarte que hemos recibido tu solicitud y estamos trabajando en revisar la información que nos has proporcionado.</Typography>}
                                {(statusPrestamo === 1) && <Typography variant="body2" sx={{color: '#26c926', paddingTop: '1rem'}}>Le informamos que su préstamo ha sido asignado a uno de nuestros agentes y actualmente se encuentra en proceso de validación. Nos esforzamos por asegurarnos de que cada préstamo sea revisado cuidadosamente para garantizar la mejor experiencia de préstamo posible.</Typography>}
                                {(statusPrestamo === 5) && <Typography variant="body2" sx={{color: '#26c926', paddingTop: '1rem'}}>Le informamos que su préstamo ha sido asignado a uno de nuestros agentes y actualmente se encuentra en proceso de validación. Nos esforzamos por asegurarnos de que cada préstamo sea revisado cuidadosamente para garantizar la mejor experiencia de préstamo posible.</Typography>}
                                {(statusPrestamo === 4) && <Typography variant="body2" sx={{color: '#26c926', paddingTop: '1rem'}}><b>Detalle:</b> Su préstamo ya ha sido pagado por completo.</Typography>}
                                {(statusPrestamo === 2) && <Typography variant="body2" sx={{color: 'red', paddingTop: '1rem'}}>Le informamos que hemos revisado detalladamente la información que nos proporcionó para su solicitud de préstamo en línea, pero lamentablemente, su solicitud ha sido rechazada por uno de nuestros agentes.</Typography>}
                                {(statusPrestamo === 3) && <Typography variant="body2" sx={{color: orange[600], paddingTop: '1rem'}}>Ya tiene un préstamo activo.</Typography>}
                        
                                {/* {console.log(prestamoSeleccionado.status)} */}
                                <Divider sx={{m: '1rem 0'}}></Divider>
                            
                                <Box>
                                    <Button component={Link} to="/historial" variant="contained" sx={{mr: 1}}>Historial</Button>
                                    {/* <Button component={Link} to="/plan" variant="contained">Ir al Plan de pagos</Button> */}
                                </Box>
                            </Box>
                            } 
                        />
                    </ListItem>
                    
                </List>}


                {(!usuarioAprobadoManual && !datosEnviadosArevision) && 
                    <Box>
                        <Typography variant="body2" sx={{color: 'red', maxWidth: '35rem'}} >No puede solicitar préstamos hasta haber rellenado los campos faltantes en la sección de perfil.</Typography>
                        <Button component={Link} to="/perfil" variant="contained" sx={{ mt: 1, mr: 1 }} >Ir al perfil</Button>
                    </Box>
                }

                {(!usuarioAprobadoManual && datosEnviadosArevision) && 
                    <Box>
                        <Typography variant="body2" sx={{color: 'orange', maxWidth: '35rem'}} >Su usuario no ha sido aprobado, espere hasta que su cuenta sea aprobada para solicitar préstamos.</Typography>
                        <Button component={Link} to="/perfil" variant="contained" sx={{ mt: 1, mr: 1 }} >Ir al perfil</Button>
                    </Box>
                }
                
                <div className="contetilebotonpri">
                    {productsArr.map((element)=>{
                        return (
                            <div key={element.ProCod} onClick={()=>{
                                    if(!tieneOtroPrestamo && element.puedeAcceder && usuarioAprobadoManual){
                                        set_idProductSelected(element.ProCod); 
                                        set_productSelected(element); 
                                        set_openVNuevoPres(true); 
                                    }
                                }} className={(tieneOtroPrestamo || !element.puedeAcceder || !usuarioAprobadoManual)?"tilebotonpri disabled":"tilebotonpri"}>
                                <div className="tilebotonpri-icon"><img alt="" src={tile_nuevopre} /></div>
                                <div className="tilebotonpri-tit">{element.ProTip}</div>
                                <div className="tilebotonpri-desc">Solicitar préstamo en temporalidad {element.ProTip}.</div>
                                <div className="tilebotonpri-estado"></div>
                            </div>
                        )
                    })}
                </div>
                
                {openVNuevoPres && <CrearNuevoPrestamo 
                    open={openVNuevoPres} 
                    cerrarVentana={()=>{set_openVNuevoPres(false)}}
                    todosaliobienfn={todosaliobienfn}
                    params={{
                        idproduct: idProductSelected,
                        purposeListaObj: purposeListaObj,
                        pricelistData: pricelistData,
                        productSelected: productSelected,
                    }}
                />}
               
            </Box>
            }
        </Box>
    );
}

function NoRegistradoCore({set_openVentanaTerminarRegistro}){
    return (
        <Box sx={{pb: 6}}>
        <img style={{display: 'block', margin: '2rem auto 1rem auto', width: '10rem'}} alt="" src={tile_perfil} />
        <Typography variant="body" component={"div"} sx={{m: '1rem auto', maxWidth: '30rem', textAlign: 'center'}} >Para aplicar a un préstamo primero debes completar algunos datos personales adicionales, después de eso se habilitará la opción aquí mismo.</Typography>
        <br></br>
        <center>
        <Button onClick={()=>{set_openVentanaTerminarRegistro(true)}} variant="contained">Completar registro</Button>
        </center>
        </Box>
    );
}

export default Aplicar;
