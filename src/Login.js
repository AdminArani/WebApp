import config from './config';
import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "./App.js";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { Link, useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
// import logoArani from "./images/logoarani_blanco.png";
import logoArani from "./images/logominiarani.png";
import { Dialog, DialogContent, Paper, Typography } from "@mui/material";
import BarraFinal from './componentes/BarraFinal.js';
import procesar_login from "./funciones/procesar_login.js";
import axios from "axios";

function Login(){
    const gContext = useContext(AppContext);

    const [msgErrorForm, set_msgErrorForm] = useState(false);
    const [cargando, set_cargando] = useState(false);


    const [openVentanaSMS, set_openVentanaSMS] = useState(false);
    const [errorMessageSMS, set_errorMessageSMS] = useState(""); 
    const [SMSLoginCode, set_SMSLoginCode] = useState(""); 
    const [sidTemp, set_sidTemp] = useState(false);
    const [guardarDatos, set_guardarDatos] = useState(false);

    const [showContador, set_showContador] = useState(false);
    
    const [inputUser, set_inputUser] = useState("");
    const [inputPass, set_inputPass] = useState("");

    const navigate = useNavigate();

    const handleSubmit = (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        set_cargando(true);
        procesar_login(data.get("email"), data.get("password"), function(rs){
            set_cargando(false);
            set_openVentanaSMS(true);
            set_showContador(true);
            setTimeout(() => {
                set_showContador(false);
            }, 60000);
            enviarSMSLogin(rs.payload.sid);
            set_sidTemp(rs.payload.sid);
            set_msgErrorForm(
                <Typography variant="body2" sx={{ color: "green", pt: 0, textAlign: "center", fontSize: "0.9rem", mt: 2, mb: 0 }} >
                    {rs.payload.message}
                </Typography>
            );

            if(guardarDatos){
                localStorage.setItem('recuerdame', data.get("si"));
                localStorage.setItem('email', data.get("email"));
                localStorage.setItem('password', data.get("password"));

            }else{
                localStorage.removeItem('recuerdame');
                localStorage.removeItem('email');
                localStorage.removeItem('password');
            }

            navigate("/");
        }, function(message){
            set_cargando(false);
            set_msgErrorForm(
                <Typography variant="body2" sx={{ color: "red", pt: 0, textAlign: "center", fontSize: "0.9rem", mt: 2, mb: 0 }} >
                    {message}
                </Typography>
            );
        });

        // console.log({
        //     UsrUsr: data.get("email"),
        //     UsrPwd: data.get("password"),
        // });
    };

    const enviarSMSLogin = (sid)=>{
        axios.request({
            url: `${config.apiUrl}/api/app/otp_login.php`,
            method: "post",
            data: {
                sid: sid,
            },
        })
        .then((res) => {
            // console.log(res);
            if(res.data.status === "ER"){
                
            }
            if(res.data.status === "OK"){
                
            }
        }).catch(err => {
            // console.log(err);
            
        });
    }

    function reenviarSMS(){
        enviarSMSLogin(sidTemp);
        set_showContador(true);
        set_SMSLoginCode("");
        setTimeout(() => {
            set_showContador(false);
        }, 60000);
    }

    function handleChange_SMSLoginCode(event){
        if(event.target.value.length <= 6){
            set_SMSLoginCode(event.target.value);
            if(event.target.value.length === 6){
                confirmarSMSLogin(event.target.value);
            }
        }
    }

    const confirmarSMSLogin = (smsCode)=>{
        axios.request({
            url: `${config.apiUrl}/api/app/otp_cmp_login.php`,
            method: "post",
            data: {
                OtpLNum: smsCode,
                sid: sidTemp,
            },
        })
        .then((res) => {
            // console.log(res);
            if(res.data.status === "ER"){
                set_errorMessageSMS(res.data.payload.message);
            }
            if(res.data.status === "OK"){
                gContext.set_logeado({estado: true, token: sidTemp});
                localStorage.setItem('arani_session_id', sidTemp);
                set_errorMessageSMS("");
            }
            if(res.data.status === "ERS"){
                window.location.reload();
            }
        }).catch(err => {
            console.log(err);
        });
    }


    function hndl_recuerdame(e){
        if(e.target.checked){
            set_guardarDatos(true);
            // console.log('true');
        }else{
            set_guardarDatos(false);
            // console.log('false');
        }
    }
  
    useEffect(()=>{
        if(localStorage.getItem('email') && localStorage.getItem('password') && localStorage.getItem('recuerdame')){
            set_guardarDatos(true);
            set_inputUser(localStorage.getItem('email'));
            set_inputPass(localStorage.getItem('password'));
        }
    },[]);

    function changeUser(e){
        set_inputUser(e.target.value);
    }

    function changePass(e){
        set_inputPass(e.target.value);
    }

    function enviarCodigoEmail(){
        set_showContador(true);
        set_SMSLoginCode("");
        setTimeout(() => {
            set_showContador(false);
        }, 60000);
        axios.request({
            url: `${config.apiUrl}/api/app/otp_mail.php`,
            method: "post",
            data: {
                sid: sidTemp,
            },
        })
        .then((res) => {
            // console.log(res);
            if(res.data.status === "ER"){
                set_errorMessageSMS(res.data.payload.message);
            }
            if(res.data.status === "OK"){
                set_errorMessageSMS("");
            }
            if(res.data.status === "ERS"){
                window.location.reload();
            }
        }).catch(err => {
            console.log(err);
        });
    }

    return (
        <Container disableGutters sx={{ minHeight: '100vh', display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"  }} component="main" maxWidth="xs">
            <Box sx={{p: '4px'}}>
                <Box sx={{textAlign: 'center', pt: 2, pb: 5}}>
                    <img style={{ maxHeight: "5rem" }} alt="Logo Arani" src={logoArani} />
                </Box>
                <Paper elevation={6} sx={{ p: 6 }}>
                    {/* <Typography sx={{textAlign: 'center', pb: 3}} variant="h5">Ingresar</Typography> */}
                    <Typography sx={{textAlign: 'center'}} variant="body1" >Para ingresar rellena los campos con tus datos de ingreso y presiona ingresar.</Typography>
                    <Box component="form" autoComplete="off" onSubmit={handleSubmit} sx={{mt: 3}}>
                        <TextField margin="normal" required fullWidth id="email" label="Correo" name="email" autoComplete="email" value={inputUser} onChange={changeUser}/>
                        <TextField margin="normal" required fullWidth name="password" label="Contraseña" type="password" id="password" autoComplete="Contraseña actual" value={inputPass} onChange={changePass}/>
                        <FormControlLabel control={<Checkbox value="remember" color="primary" onChange={hndl_recuerdame} checked={guardarDatos} />} label="Recuerdame" />
                        {msgErrorForm}
                        <Button disabled={cargando} type="submit" fullWidth variant="contained" size="large" sx={{ mt: 2, mb: 2 }} >
                            {(cargando)?"Cargando":"Ingresar"}
                        </Button>
                        <Grid container>
                            <Grid item xs>
                                <Link style={{color: '#4c74e9'}} to="/recuperarpass">{"Recuperar contraseña"}</Link>
                            </Grid>
                            <Grid item>
                                {/* <Link style={{color: '#4c74e9'}} to="/registro">{"Registrarse"}</Link> */}
                            </Grid>
                        </Grid>
                    </Box>
                </Paper>
                <Dialog open={openVentanaSMS}>
                    <DialogContent sx={{maxWidth: '20rem'}}>
                        <Typography sx={{}} variant="h5" >Confirmación</Typography>
                        <Typography sx={{}} variant="body2" >Se envió un código a su número de teléfono, por favor ingreselo en el campo siguiente:.</Typography>
                        <TextField autoFocus={true} margin="normal" fullWidth label="Código de acceso" value={SMSLoginCode} helperText={errorMessageSMS} error={(errorMessageSMS)?true:false} onChange={handleChange_SMSLoginCode} />
                        <Button fullWidth disabled={showContador} sx={{mt: 2, mr: 2}} variant="contained" onClick={reenviarSMS}>Reenviar SMS {showContador && <Contador/>}</Button>
                        <Button fullWidth sx={{mt: 2}} variant="contained" disabled={showContador} onClick={enviarCodigoEmail}>Enviar al correo {showContador && <Contador/>}</Button>
                    </DialogContent>
                </Dialog>
                <BarraFinal />
            </Box>
        </Container>
    );
}

function Contador(){
    const [tiempoRestante, set_tiempoRestante] = useState(60);
    useEffect(()=>{
        const interval = setInterval(() => {
            set_tiempoRestante( (tiempoRestante) => tiempoRestante-1 );
        }, 1000);
        return () => clearInterval(interval);
    }, []);
    return <>{tiempoRestante}s</>;
}

export default Login;
