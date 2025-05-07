import config from '../config';
import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../App';
import { Button, TextField, Typography, Box, Grid} from "@mui/material";
import moment from "moment";



//Editar Telefono
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

export default FormEditTelefono;