import config from '../config';
import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../App';
import { Button, TextField, Typography, Box, Grid} from "@mui/material";


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

export default FormEditNombres;