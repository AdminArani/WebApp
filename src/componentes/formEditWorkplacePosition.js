import config from '../config';
import axios from 'axios';
import { useContext, useState } from 'react';
import { AppContext } from '../App';
import { Button, TextField, Typography, Box, Grid} from "@mui/material";

// Inicio campo Editar posicion de trabajo
function FormEditWorkplacePosition({ cerrar, reiniciarpantalla, usuarioDetalle }) {
    const gContext = useContext(AppContext);

    const [inputWorkplacePosition, set_inputWorkplacePosition] = useState({ valor: usuarioDetalle ? usuarioDetalle.workplace_position : '', validado: false, textoAyuda: "", blur: false });
    const [enviandoForm, set_enviandoForm] = useState(false);

    function handleChange_inputWorkplacePosition(event) {
        let valor = event.target.value;
        let validado = false;
        let textoAyuda = "Campo obligatorio";
        if (valor.length >= 1) {
            validado = true;
            textoAyuda = "";
        }
        set_inputWorkplacePosition({
            valor: valor,
            validado: validado,
            textoAyuda: textoAyuda,
            blur: inputWorkplacePosition.blur,
        });
    }

    function guardarDatos() {
        set_enviandoForm(true);
        axios.request({
            url: `${config.apiUrl}/api/app/putProfile.php`,
            method: "post",
            data: {
                sid: gContext.logeado?.token,
                array: {
                    workplace_position: inputWorkplacePosition.valor
                },
            },
        })
        .then((res) => {
            set_enviandoForm(false);
            if (res.data.status === "OK") {
                reiniciarpantalla();
            }
        }).catch(err => {
            console.log(err.message);
        });
    }

    return (
        <Box>
            <Typography variant="h5" sx={{}}>Editar</Typography>
            <Typography variant="body" sx={{ mb: '1rem' }}>Edita el siguiente campo para cambiar tu posición en el lugar de trabajo</Typography>
            <Grid sx={{ mt: 1, mb: 1 }} container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <TextField
                        required
                        autoComplete="off"
                        fullWidth
                        label="Posición en el lugar de trabajo"
                        onBlur={() => { set_inputWorkplacePosition({ ...inputWorkplacePosition, blur: true }) }}
                        value={inputWorkplacePosition.valor}
                        onChange={handleChange_inputWorkplacePosition}
                        error={(!inputWorkplacePosition.validado && inputWorkplacePosition.blur)}
                        helperText={inputWorkplacePosition.textoAyuda}
                    />
                </Grid>
                <Grid item xs={12} sm={12}>
                    <Button disabled={(!inputWorkplacePosition.validado || enviandoForm) ? true : false} variant="contained" onClick={guardarDatos} sx={{ mt: 1, mr: 1 }}>{(enviandoForm) ? "Enviando...." : "Guardar cambios"}</Button>
                    <Button onClick={cerrar} sx={{ mt: 1, mr: 1 }}>Cerrar</Button>
                </Grid>
            </Grid>
        </Box>
    );
}

export default FormEditWorkplacePosition;