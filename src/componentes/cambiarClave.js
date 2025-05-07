import config from '../config';
import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../App';
import { Button, Typography, Box, Grid, TextField} from "@mui/material";

//Cambiar Clave

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

export default FormCambiarClave;