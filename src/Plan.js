import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
// import logoArani from "./images/logoarani.png";
import {Button, Chip, Dialog, DialogActions, DialogContent, Divider, Grid, List, ListItem, ListItemText, Paper, Typography } from "@mui/material";
import { useContext, useState } from "react";
// import axios from "axios";
import { AppContext } from "./App";
import BarraFinal from "./componentes/BarraFinal";
import { Link, useNavigate, useParams } from "react-router-dom";
import BarraApp from "./componentes/BarraApp";
import { useEffect } from "react";
import axios from "axios";
import numeral from "numeral";
import moment from "moment";
import { nombreEstadoPrestamo, nombreEstadoPago } from "./componentes/utilidades.js";
// import Contrato from "./componentes/Contrato";
import parse from "html-react-parser";

function Plan() {
    let { idprestamoparam } = useParams();
    const gContext = useContext(AppContext);
    const navigate = useNavigate();
    const [cargando, set_cargando] = useState(false);
    const [prestamoSeleccionado, set_prestamoSeleccionado] = useState(false);
    const [listaPagos, set_listaPagos] = useState(false);
    const [pagosrealizadosnum, set_pagosrealizadosnum] = useState(0);
    const [pricelistData, set_pricelistData] = useState(false);
    const [productsArr, set_productsArr] = useState(false);
    const [productoSeleccionado, set_productoSeleccionado] = useState(false);
    const [interesPeriodo, set_interesPeriodo] = useState(false);
    const [walletData, set_walletData] = useState(false);
    const [openSubirComprobantePago, set_openSubirComprobantePago] = useState(false);
    const [pagoseleccionado, set_pagoseleccionado] = useState(false);
    const [fDOCComprobante, set_fDOCComprobante] = useState(false);
    const [cargandoEnviandoComprobante, set_cargandoEnviandoComprobante] = useState(false);
    const [ventanaContrato, set_ventanaContrato] = useState(false);
    const [contratoPrestamo, set_contratoPrestamo] = useState(false);
    

    function getApplicationProfile(){
        axios.request({
            url: "https://app.arani.hn/api/app/getApplicationProfile.php",
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
                // set_contratoPrestamo(res.data.payload)
                // console.log(res.data.payload);
                // let productosProcesados = [];
                // for (const key in res.data?.payload?.Products) {
                //     if (Object.hasOwnProperty.call(res.data?.payload?.Products, key)) {
                //         const element = res.data?.payload?.Products[key];
                //         if(res.data?.payload?.PriceList?.data?.options?.products_ids.indexOf(element.ProCod) > -1){
                //             productosProcesados.push({...element, puedeAcceder: true});
                //             // console.log('Producto habilitado');
                //         }else{
                //             productosProcesados.push({...element, puedeAcceder: false});
                //             // console.log('Producto deshabilitado');
                //         }
                //     }
                // }

                // // console.log('procesado ',productosProcesados);
                set_productsArr(res.data?.payload?.Products);
                for (const key in res.data?.payload?.PriceList?.data?.pricelistData) {
                    if (Object.hasOwnProperty.call(res.data?.payload?.PriceList?.data?.pricelistData, key)) {
                        const element = res.data?.payload?.PriceList?.data?.pricelistData[key];
                        set_pricelistData(element);
                    }
                }
            }

        }).catch(err => {
            console.log(err.message);
            navigate("/login");
        });
    }


    
    function cargarListaPrestamos(){
        if(cargando) return false;
        set_cargando(true);
        axios.request({
            url: "https://app.arani.hn/api/app/getCustomerOfferList.php",
            method: "post",
            data: {
                sid: gContext.logeado?.token,
              },
        })
        .then((res) => {
            // set_cargando(false);
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
                
                let elementThis = false;
                for (const key in res.data.payload) {
                    if (Object.hasOwnProperty.call(res.data.payload, key)) {
                        const element = res.data.payload[key];
                        if(idprestamoparam){
                            if(element.container_id+"" === idprestamoparam+""){
                                elementThis = element;
                            }
                        }else{
                            if(element.status === 3 || element.status === 1 || element.status === 8 || element.status === 5){
                                elementThis = element;
                            }
                        }
                    }
                }
                // console.log(elementThis.container_id);
                set_prestamoSeleccionado(elementThis);
                // console.log("prestamo seleccionado: ", elementThis);
                cargarCalendarioPagos(elementThis.container_id);
                set_contratoPrestamo(res.data.payload[elementThis.container_id]?.contract_content);
            }
            if(res.data.status === 500){
            }
        }).catch(err => {
            console.log(err.message);
            navigate("/login");
        });
    }

    function cargarCalendarioPagos(idPrestamo){
        set_cargando(true);
        axios.request({
            url: "https://app.arani.hn/api/app/getBorrowerRepaymentSchedule.php",
            method: "post",
            data: {
                sid: gContext.logeado?.token,
                ContainerId: idPrestamo,
              },
        })
        .then((res) => {
            set_cargando(false);
            if(res.data.status === "ER"){
                // console.log(res.data.payload.message);
            }
            if(res.data.status === "OK"){
                // console.log(res.data.payload);
                set_listaPagos(res.data.payload);
                // console.log('listado de pagos: ', res.data.payload);
                
                let numpagosrealizados = 0;
                for (const key in res.data.payload) {
                    if (Object.hasOwnProperty.call(res.data.payload, key)) {
                        const element = res.data.payload[key];
                        if(element.status === 6 || element.status === 1){
                            numpagosrealizados++;
                        }
                    }
                }
                set_pagosrealizadosnum(numpagosrealizados);
            }
        }).catch(err => {
            console.log(err.message);
            navigate("/login");
        });
    }

    // useEffect(()=>{
    //     cargarListaPrestamos();
    //     getApplicationProfile();
    //     cargarWallet();
    //     // eslint-disable-next-line
    // }, []);

    useEffect(()=>{
        cargarListaPrestamos();
        getApplicationProfile();
        cargarWallet();
        // eslint-disable-next-line
    }, [idprestamoparam]);

    useEffect(()=>{
        if(prestamoSeleccionado && pricelistData && productsArr){
            let productoSeleccionado = productsArr.find(element => element.ProCod+"" === prestamoSeleccionado.product_id+"")
            set_productoSeleccionado(productoSeleccionado);
            // console.log(productoSeleccionado);


            var interesPeriodo = pricelistData.interest;
            if(productoSeleccionado.ProTip === 'semanal') set_interesPeriodo(numeral(interesPeriodo/52.1429).format('0,0.00'));
            if(productoSeleccionado.ProTip === 'quincenal') set_interesPeriodo(numeral(interesPeriodo/26.0714).format('0,0.00'));
            if(productoSeleccionado.ProTip === 'mensual') set_interesPeriodo(numeral(interesPeriodo/12).format('0,0.00'));
            // console.log(prestamoSeleccionado);
            // console.log(pricelistData);
            // console.log(productsArr);
        }
        // eslint-disable-next-line
    }, [prestamoSeleccionado, pricelistData, productsArr]);



    function cargarWallet(){
        axios.request({
            url: "https://app.arani.hn/api/app/getWalletInfo.php",
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

   


    function guardarAdjuntarComprobante(){
        // https://app.arani.hn/api/app/send_recipemail.php
        // sid: id de sesion
        // containerId: codigo de prestamo
        // DOC: documento a enviar



        const formData = new FormData();
        formData.append('DOC', fDOCComprobante);
        formData.append('sid', gContext.logeado?.token);
        formData.append('containerId', prestamoSeleccionado.container_id);
        formData.append('idpago', pagoseleccionado.id);



        // console.log(pagoseleccionado);
        set_cargandoEnviandoComprobante(true);
        axios.post("https://app.arani.hn/api/app/send_recipemail.php", formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
        }).then((res) => {
            set_cargandoEnviandoComprobante(false);
            if(res.data.status === "ER"){
            }
            if(res.data.status === "OK"){
                set_openSubirComprobantePago(false);
                set_fDOCComprobante(false);
            }
        }).catch(err => {
            console.log(err.message);
        });
    }

    function changefileComprobante(e){
        let file = e.target.files[0];
        set_fDOCComprobante(file);
    }
    
    return (
        <Container disableGutters sx={{ minHeight: '100vh', display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"  }} component="main" maxWidth="md">
            {/* <Contrato /> */}
            <Box sx={{p: '4px', width: '100%'}}>
                <Paper elevation={6} sx={{p: 4}}>
                    <BarraApp />
                    <Button component={Link} to="/" variant="outlined" startIcon={<span className="material-symbols-outlined">arrow_back</span>}>Volver</Button>
                    {cargando && <Typography variant="body2" sx={{p: '8rem 0 8rem 0', color: 'silver', textAlign: 'center'}} >Cargando....</Typography>}
                    {(!cargando && prestamoSeleccionado) && <Box>
                        <Typography variant="h5" sx={{mt: 6}} >Información</Typography>
                        <Typography variant="body" sx={{}} >Resumen rápido del préstamo seleccionado:</Typography>

                        {(prestamoSeleccionado.status === 0) && <Typography variant="body2" sx={{color: '#26c926', paddingTop: '1rem'}}>Gracias por solicitar un préstamo con ARANI. Queremos informarte que hemos recibido tu solicitud y estamos trabajando en revisar la información que nos has proporcionado.</Typography>}
                        {(prestamoSeleccionado.status === 1) && <Typography variant="body2" sx={{color: '#26c926', paddingTop: '1rem'}}>Le informamos que su préstamo ha sido asignado a uno de nuestros agentes y actualmente se encuentra en proceso de validación. Nos esforzamos por asegurarnos de que cada préstamo sea revisado cuidadosamente para garantizar la mejor experiencia de préstamo posible.</Typography>}
                        {(prestamoSeleccionado.status === 5) && <Typography variant="body2" sx={{color: '#26c926', paddingTop: '1rem'}}>Le informamos que su préstamo ha sido asignado a uno de nuestros agentes y actualmente se encuentra en proceso de validación. Nos esforzamos por asegurarnos de que cada préstamo sea revisado cuidadosamente para garantizar la mejor experiencia de préstamo posible.</Typography>}
                        {(prestamoSeleccionado.status === 4) && <Typography variant="body2" sx={{color: '#26c926', paddingTop: '1rem'}}><b>Detalle:</b> Su préstamo ya ha sido pagado por completo.</Typography>}
                        {(prestamoSeleccionado.status === 2) && <Typography variant="body2" sx={{color: 'red', paddingTop: '1rem'}}>Le informamos que hemos revisado detalladamente la información que nos proporcionó para su solicitud de préstamo en línea, pero lamentablemente, su solicitud ha sido rechazada por uno de nuestros agentes.</Typography>}
                        

                        <div className="bloqueprestamopdt">
                            
                            <span className="material-symbols-outlined iconodefondogrande">payments</span>

                            <Grid container sx={{position: 'relative', zIndex: 2, mb: 2}}>
                                <Grid item xs={12} sm={6}>
                                    <Typography sx={{verticalAlign: 'middle'}} >Cuenta virtual: L {numeral(walletData?.amount_wallet_balance).format('0,0.00')} Saldo</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography align="right" >Número de préstamo: {prestamoSeleccionado.container_id}</Typography>
                                </Grid>
                            </Grid>


                            <div className="bloqueprestamopdt-tit">
                                <span>Total a pagar</span>
                                <h4><span>L</span>{numeral(prestamoSeleccionado.debt).format('0,0.00')}</h4>
                            </div>
                            <div className="bloqueprestamopdt-bar">
                                <div className="bloqueprestamopdt-barstatus">Pagos {pagosrealizadosnum} / {listaPagos.length}</div>
                                <div className="bloqueprestamopdt-barllena" style={{width: ((pagosrealizadosnum/listaPagos.length)*100)+"%"}}></div>
                            </div>
                            

                            

                            <Box className="bloqueprestamopdt-dtll">
                                <Chip size="small" label={"Creación: "+moment(prestamoSeleccionado.created).format("LL")} variant="outlined" sx={{color: "#FFFFFF"}} />
                                <Chip size="small" label={"Interes "+productoSeleccionado.ProTip+": "+interesPeriodo+"%"} variant="outlined" sx={{color: "#FFFFFF"}} />
                                <Chip size="small" label={"Terminos: "+productoSeleccionado.ProTip} variant="outlined" sx={{color: "#FFFFFF"}} />
                                {(prestamoSeleccionado.confirmed_date !== '0000-00-00 00:00:00') && <Chip size="small" label={"Aprobación: "+moment(prestamoSeleccionado.confirmed_date).format("LL")} variant="outlined" sx={{color: "#FFFFFF"}} />}
                                <Chip size="small" label={"Estado: "+nombreEstadoPrestamo[prestamoSeleccionado.status]} variant="outlined" sx={{color: "#FFFFFF"}} />
                            </Box>



                            
                            
                            
                            
                        </div>

                        <Box sx={{textAlign: 'right'}}><Button onClick={()=>{set_ventanaContrato(true)}}>Ver contrato</Button></Box>
                        

                        <Typography variant="h5" sx={{mt: 6}} >Plan de pagos</Typography>
                        <Typography variant="body" sx={{}} >Tus fechas de pago son las siguientes:</Typography>
                        <Divider sx={{mt: 2}} />
                        {(listaPagos) && 
                            <List sx={{mt: 2}}>
                                {listaPagos.map((element, index)=>{
                                    return(<ListItem key={element.schedule_date} disablePadding className={"listitempagostatus"+element.status}>
                                        {/* <ListItemIcon>
                                            <span className="material-symbols-outlined">payments</span>
                                        </ListItemIcon> */}
                                        {/* {console.log(element.status)} */}
                                        <ListItemText primaryTypographyProps={{component: 'div', fontSize: '1.5rem'}} secondaryTypographyProps={{component: 'div'}} primary={"Pago "+(index+1)+"/"+listaPagos.length} secondary={<>
                                            <Typography variant="body2">Fecha de pago: {moment(element.schedule_date).format("LL")}</Typography>
                                            <Typography variant="body2">Estado: {(nombreEstadoPago[element.status] || element.status)}</Typography>
                                            {(parseInt(element.status) === 4 || parseInt(element.status) === 3 || parseInt(element.status) === 2 || parseInt(element.status) === 1) && <Button onClick={()=>{set_openSubirComprobantePago(true); set_pagoseleccionado(element); set_fDOCComprobante(false);}} variant="outlined" startIcon={<span className="material-symbols-outlined">attach_file</span>}>
                                                Adjuntar comprobante
                                            </Button>}
                                        </>} />
                                        <Typography variant="h6" >
                                            <span>L. {numeral(element.charge+element.administrator_fee+element.amount+element.late_fee).format("0,0.[00]")}</span>
                                            {element.late_fee && <Typography variant="body2" >Mora de L {numeral(element.late_fee).format("0,0.00")}</Typography>}
                                        </Typography>
                                        
                                      </ListItem>)
                                })}
                            </List>
                        }
                        {(!listaPagos) && 
                            <Typography variant="body2" sx={{m: '8rem 0', textAlign: 'center', color: 'silver'}} component={"div"} >No tienes lista de pagos</Typography>
                        }
                    </Box>}
                    <Dialog onClose={()=>{set_openSubirComprobantePago(false)}} open={openSubirComprobantePago}>
                    <DialogContent>
                        <Typography variant="h5">Subir archivo</Typography>
                        <Typography variant="body2" sx={{mb: 2}}>Adjunte su comprobante de pago.</Typography>
                        <Button disabled={Boolean(fDOCComprobante)} fullWidth variant="contained" component="label" startIcon={<span className="material-symbols-outlined">cloud_upload</span>}>
                            Adjuntar documento
                            <input onChange={changefileComprobante} hidden accept="image/*" multiple type="file" />
                        </Button>
                        <Typography variant="body2" sx={{mt: 2}}>Una vez enviado, será revisado por uno de nuestros agentes para validar que el pago se haya realizado correctamente.</Typography>
                        <Divider sx={{mb: 2, mt: 2}}></Divider>
                        <Button disabled={Boolean(!fDOCComprobante) || cargandoEnviandoComprobante} onClick={guardarAdjuntarComprobante} variant="contained">{(cargandoEnviandoComprobante)?"Subiendo....":"Enviar comprobante"}</Button>
                    </DialogContent>
                </Dialog>
                    {(!cargando && !prestamoSeleccionado) && <Box sx={{m: '8rem 0', textAlign: 'center', color: 'silver'}}>
                        <Typography variant="body2" sx={{maxWidth: '30rem', display: 'block', margin: '0 auto', pb: 3}} component={"div"} >No tienes préstamos aprobados aún, puedes solicitar un nuevo préstamo o ver el estado de tu solicitud.</Typography>
                        <Button component={Link} to="/aplicar" variant="contained" sx={{mr: 1}}>Aplicar</Button>
                        <Button component={Link} to="/historial" variant="contained">Historial</Button>
                    </Box>}
                </Paper>
                <BarraFinal />


                <Dialog open={ventanaContrato} onClose={()=>{set_ventanaContrato(false)}} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" >
                    {/* <DialogTitle id="alert-dialog-title">Contrato de préstamo Arani</DialogTitle> */}
                    <DialogContent>
                        {parse(contratoPrestamo||"<br><br>No hay contrato generado<br><br>")}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={()=>{set_ventanaContrato(false)}}>Cerrar</Button>
                    </DialogActions>
                </Dialog>

            </Box>
        </Container>
    );
}

export default Plan;
