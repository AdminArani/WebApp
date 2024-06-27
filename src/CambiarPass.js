import { Button, FormControl, FormHelperText, Grid, InputAdornment, InputLabel, OutlinedInput, Paper } from "@mui/material";
import Box from "@mui/material/Box";
import { Container } from "@mui/system";
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import BarraFinal from "./componentes/BarraFinal";


function CambiarPass(){
    const [msgErrorForm, set_msgErrorForm] = useState("");
    const [cargando, set_cargando] = useState(false);
    const [passCambiado, set_passCambiado] = useState(false);

    const [inputPass1, set_inputPass1] = useState({valor: '', validado: false, textoAyuda: ""});
    const [inputPass2, set_inputPass2] = useState({valor: '', validado: false, textoAyuda: ""});
    const [inputPassVisible, set_inputPassVisible] = useState(false);
    const [passValidados, set_passValidados] = useState(false);

    const { data } = useParams();

    function handleChange_inputPass1(event){
        

        event.preventDefault();
        let valor = event.target.value;
        let validado = false;
        let textoAyuda = "Min. 8 letras, 1 mayúscula y 1 carácter especial o número.";
        let regexp = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm;
        if(valor.match(regexp)){
            validado = true;
            textoAyuda = "";
        }
        set_inputPass1({
            valor: valor, 
            validado: validado,
            textoAyuda: textoAyuda,
        });
        set_inputPass2({
            valor: "", 
            validado: false,
            textoAyuda: "",
        });
    }

    function handleChange_inputPass2(event){
        event.preventDefault();
        let valor = event.target.value;
        let validado = false;
        let textoAyuda = "Min. 8 letras, 1 mayúscula y 1 carácter especial o número.";
        let regexp = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm;
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
        });
    }

    const handleClick_mostrarpass = ()=>{
        set_inputPassVisible(!inputPassVisible);
    }

    function handleSubmit(event){
        event.preventDefault();
        // const data = new FormData(event.currentTarget);
        
        const dataparam = JSON.parse(decodeBase64(data));
        console.log(dataparam);
        // set_msgErrorForm("Click");
        set_cargando(true);
        axios
        .request({
            url: `${process.env.REACT_APP_API_URL}/api/app/recoverypwd.php`,
            method: "post",
            withCredentials: true,
            data: {
                UsrMail: dataparam.UsrMail,
                NewPwd: dataparam.newPWD,
                UsrPwd: inputPass1.valor
            },
        })
        .then((res) => {
            console.log(res);
            set_cargando(false);
            if(res.data.status === "ER"){
                set_msgErrorForm(
                    <Typography variant="body2" sx={{ color: "red", pt: 0, textAlign: "center", fontSize: "0.9rem", mt: 2, mb: 0}}>
                        {res.data.payload.message}
                    </Typography>
                );
            }
            if(res.data.status === "OK"){
                set_passCambiado(true);
                set_msgErrorForm(
                    <Typography variant="body2" sx={{ color: "green", pt: 0, textAlign: "center", fontSize: "0.9rem", mt: 2, mb: 0}}>
                        {res.data.payload.message}
                    </Typography>
                );
            }
        }).catch(err => {
            // console.log(err);
            // set_cargando(false);
            set_msgErrorForm(
                <Typography variant="body2" sx={{ color: "red", pt: 0, textAlign: "center", fontSize: "0.9rem", mt: 2, mb: 0}}>
                    {err.message}
                </Typography>
            );
        });

        return false;
    }

    useEffect(()=>{
        if(inputPass1.validado && inputPass2.validado){
            set_passValidados(true);
        }else{
            set_passValidados(false);
        }
    },[inputPass1, inputPass2])

    return (
        <Container disableGutters sx={{ minHeight: '100vh', display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"    }} component="main" maxWidth="sm">
            <Box sx={{display: "flex", flexDirection: "column", alignItems: "center", p: '4px'}}>
                <Paper>
                    {/* ------------------------------- */}
                    <AppBar sx={{borderRadius: "0.5rem 0.5rem 0 0"}} position="static">
                        <Toolbar>
                            <IconButton component={Link} to="/login" edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
                                <span className="material-symbols-outlined">arrow_back</span>
                            </IconButton>
                            <Typography variant="h6" color="inherit" component="div">Cambiar contraseña</Typography>
                        </Toolbar>
                    </AppBar>
                    {/* ------------------------------- */}
                    <Box component="form" onSubmit={handleSubmit} sx={{ p: 6 }}>
                        <Typography>Escriba su nueva contraseña, recuerda que tu contraseña tiene que ser de al menos 8 caracteres, tener 1 tetra en mayúscula y 1 carácter especial. </Typography>
                        
                        <Grid sx={{mt: 1, mb: 1}} container spacing={2}>
                            <Grid item xs={12} sm={12}>
                                <FormControl component={"div"} fullWidth variant="outlined">
                                    <InputLabel required error={!inputPass1.validado}>Contraseña</InputLabel>
                                    <OutlinedInput required autoComplete="off" disabled={passCambiado} fullWidth id="inputPass1" type={(inputPassVisible) ? 'text' : 'password'} value={inputPass1.valor} onChange={handleChange_inputPass1} label="Contraseña" error={!inputPass1.validado} endAdornment={
                                        <InputAdornment position="end">
                                            <IconButton onClick={handleClick_mostrarpass} onMouseDown={(e)=>{e.preventDefault()}} edge="end">
                                                {(inputPassVisible) ? <span className="material-symbols-outlined">visibility_off</span>: <span className="material-symbols-outlined">visibility</span>}
                                            </IconButton>
                                        </InputAdornment>
                                        }
                                    />
                                    <FormHelperText error={!inputPass1.validado} >{inputPass1.textoAyuda}</FormHelperText>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={12}>
                                <FormControl component={"div"} fullWidth variant="outlined">
                                    <InputLabel required error={!inputPass2.validado}>Repetir contraseña</InputLabel>
                                    <OutlinedInput required autoComplete="off" disabled={passCambiado} fullWidth id="inputPass2" type={(inputPassVisible)?'text':'password'} value={inputPass2.valor} onChange={handleChange_inputPass2} label="Repetir contraseña" error={!inputPass2.validado} endAdornment={
                                        <InputAdornment position="end">
                                            <IconButton onClick={handleClick_mostrarpass} onMouseDown={(e)=>{e.preventDefault()}} edge="end">
                                                {(inputPassVisible) ? <span className="material-symbols-outlined">visibility_off</span>: <span className="material-symbols-outlined">visibility</span>}
                                            </IconButton>
                                        </InputAdornment>
                                        }
                                    />
                                    <FormHelperText error={!inputPass2.validado}>{inputPass2.textoAyuda}</FormHelperText>
                                </FormControl>
                            </Grid>
                        </Grid>
                        {msgErrorForm}
                        {passCambiado && <Button component={Link} to="/login" fullWidth variant="contained" size="large" sx={{ mt: 2, mb: 2 }} >Volver a formulario de inicio</Button>}
                        {!passCambiado && <Button type="submit" disabled={(cargando || !passValidados)} fullWidth variant="contained" size="large" sx={{ mt: 2, mb: 2 }} >{(cargando)?"Enviando...":"Cambiar contraseña"}</Button>}
                    </Box>
                    {/* ------------------------------- */}
                </Paper>
                <BarraFinal />
            </Box>
        </Container>
    );
}

const decodeBase64 = function(s) {
    var e={},i,b=0,c,x,l=0,a,r='',w=String.fromCharCode,L=s.length;
    var A="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    for(i=0;i<64;i++){e[A.charAt(i)]=i;}
    for(x=0;x<L;x++){
        c=e[s.charAt(x)];b=(b<<6)+c;l+=6;
        while(l>=8){((a=(b>>>(l-=8))&0xff)||(x<(L-2)))&&(r+=w(a));}
    }
    return r;
};

export default CambiarPass;