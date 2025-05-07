import config from '../config';
import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../App';
import { Button, Typography, Box, Grid, MenuItem, FormControl, Select, InputLabel} from "@mui/material";

//Editar numero dependientes
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

export default FormEditNumeroDependientes;