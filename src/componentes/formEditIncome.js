import config from '../config';
import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../App';
import { Button, TextField, Typography, Box, Grid} from "@mui/material";


// Editar Ingreso
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


export default FormEditIncome;