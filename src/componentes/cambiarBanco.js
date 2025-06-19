import config from '../config';
import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../App';
import { Button, Typography, Box, Grid, TextField, FormControl, InputLabel, MenuItem, Select} from "@mui/material";

//Cambiar Banco
function FormCambiarBanco({cerrar, reiniciarpantalla, apiCamposConstructor, usuarioDetalle}){

    const gContext = useContext(AppContext);

    const [validado, set_validado] = useState(false);

    const [inputCuentaBanco, set_inputCuentaBanco] = useState({valor: usuarioDetalle ? usuarioDetalle.account_number : '0', validado: false, textoAyuda: "", blur: false}) 
    const [inputBanco, set_inputBanco] = useState({ valor: usuarioDetalle && usuarioDetalle.bank ? usuarioDetalle.bank : '0', validado: false, textoAyuda: "", blur: false });

    const [errorAjax, set_errorAjax] = useState(false);
    
    const [enviandoForm, set_enviandoForm] = useState(false);

    const handleChange_inputBanco = (event) => {
        set_inputBanco({
            ...inputBanco,
            valor: event.target.value,
            validado: true
        });
    }

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (usuarioDetalle && usuarioDetalle.bank) {
                set_inputBanco(inputBanco => ({
                    ...inputBanco,
                    valor: usuarioDetalle.bank,
                    validado: true
                }));
            }
        }, 500); // 5000 milisegundos = 5 segundos
    
        // Limpia el timeout cuando el componente se desmonta
        return () => clearTimeout(timeout);
    }, [usuarioDetalle]);

    const handleChange_inputCuentaBanco = (event) => {
        // Eliminar todo lo que no sea número
        const soloNumeros = event.target.value.replace(/[^0-9]/g, "");
        set_inputCuentaBanco({
            ...inputCuentaBanco,
            valor: soloNumeros,
            validado: soloNumeros.length > 0 // O tu lógica de validación
        });
    }

    useEffect(() => {
        if (inputBanco.validado && inputCuentaBanco.validado) {
            set_validado(true);
        } else {
            set_validado(false);
        }
    }, [inputBanco, inputCuentaBanco]);

    const guardarDatos = () => {
        set_enviandoForm(true);
        axios.request({
            url: `${config.apiUrl}/api/app/putProfile.php`,
            method: "post",
            data: {
                sid: gContext.logeado?.token,
                array: {
                    account_number: inputCuentaBanco.valor,
                    bank: inputBanco.valor,

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
            set_errorAjax(err.message);
        });
    }

    const cargarCuentaBanco = () => {
        axios.request({
            url: `${config.apiUrl}/api/app/get_bankaccount.php`,
            method: "post",
            data: {
                sid: gContext.logeado.token,
            },
        })
        .then((res) => {
            if (res.data.status === "OK") {
                console.log('get_bankaccount', res.data.payload?.data);

                let cuentaActiva = false;
                for (const key in res.data.payload?.data) {
                    if (Object.hasOwnProperty.call(res.data.payload?.data, key)) {
                        const element = res.data.payload?.data[key];
                        if (element.current === '1') {
                            cuentaActiva = element;
                        }
                    }
                }

                set_inputCuentaBanco({
                    ...inputCuentaBanco,
                    valor: cuentaActiva && cuentaActiva.account_number ? cuentaActiva.account_number : '',
                    validado: true
                });
                set_inputBanco({
                    ...inputBanco,
                    valor: cuentaActiva && cuentaActiva.bank ? cuentaActiva.bank : '',
                    validado: true
                });
            }
        }).catch(err => {
            console.log(err.message);
        });
    }

    useEffect(() => {
        cargarCuentaBanco();
    }, []);
    

    return (
        <Box>
            <Typography variant="h5" sx={{}} >Cambiar cuenta de banco</Typography>
            <Typography variant="body" sx={{mb: '1rem'}} >Ingrese su cuenta de banco en la que quiere recibir el dinero de los préstamos.</Typography>
            <Grid sx={{mt: 1, mb: 1}} container spacing={2}>
            <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                    <InputLabel onBlur={()=>{set_inputBanco({...inputBanco, blur: true})}} required error={(!inputBanco.validado && inputBanco.blur)}>Banco</InputLabel>
                    <Select onBlur={()=>{set_inputBanco({...inputBanco, blur: true})}} required value={inputBanco.valor} onChange={handleChange_inputBanco} label="Banco" error={(!inputBanco.validado && inputBanco.blur)}>
                        {Object.keys(apiCamposConstructor?.bank?.values).map((key)=>{
                            return ((key)?<MenuItem key={key} value={key}>{apiCamposConstructor?.bank?.values[key]}</MenuItem>:'');
                        })}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
            <TextField 
                helperText={inputCuentaBanco.textoAyuda} 
                required 
                value={inputCuentaBanco.valor} 
                onBlur={()=>{set_inputCuentaBanco({...inputCuentaBanco, blur: true})}}
                onChange={handleChange_inputCuentaBanco} 
                error={(!inputCuentaBanco.validado && inputCuentaBanco.blur)} 
                autoComplete="off" 
                fullWidth 
                label={"# de cuenta  "}
                InputLabelProps={{
                    shrink: true,
                }}
            />

                </Grid>
                <Grid item xs={12} sm={12}>
                    <Typography variant="body2" sx={{mb: '1rem', color: '#ff4d4d'}} >{errorAjax}</Typography>
                </Grid>
                <Grid item xs={12} sm={12}>
                    <Button disabled={(validado && !enviandoForm)?false:true} variant="contained" onClick={guardarDatos} sx={{ mt: 1, mr: 1 }} >{(enviandoForm)?"Enviando....":"Guardar"}</Button>
                    <Button onClick={cerrar} sx={{ mt: 1, mr: 1 }} >Cerrar</Button>
                </Grid>
            </Grid>
        </Box>
    )
}

export default FormCambiarBanco;