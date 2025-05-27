import config from '../config';
import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../App";
import { Modal, Box, TextField, Grid, Divider, Button, Typography, MenuItem } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import logominiarani from "../images/logominiarani.png"; // Importa la imagen

const ModalDatosFaltantes = ({ open, onClose, onSave, usuarioDetalle }) => {
  const gContext = useContext(AppContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    ref_tipo_per: "",
    ref_nom_per: "",
    ref_tel_per: "",
    ref_correo_per: "",
    ref_tipo_lab: "",
    ref_nom_lab: "",
    ref_tel_lab: "",
    ref_correo_lab: "",
  });

  const [errors, setErrors] = useState({
    ref_tipo_per: "",
    ref_nom_per: "",
    ref_tel_per: "",
    ref_correo_per: "",
    ref_tipo_lab: "",
    ref_nom_lab: "",
    ref_tel_lab: "",
    ref_correo_lab: "",
  });

  const [validado, setValidado] = useState(false);
  const [enviandoForm, setEnviandoForm] = useState(false);
  const [agradecimiento, setAgradecimiento] = useState(false); // Nuevo estado para la pantalla de agradecimiento

  useEffect(() => {
    if (usuarioDetalle) {
      setFormData({
        ref_tipo_per: usuarioDetalle.ref_tipo_per || "",
        ref_nom_per: usuarioDetalle.ref_nom_per || "",
        ref_tel_per: usuarioDetalle.ref_tel_per || "",
        ref_correo_per: usuarioDetalle.ref_correo_per || "",
        ref_tipo_lab: usuarioDetalle.ref_tipo_lab || "",
        ref_nom_lab: usuarioDetalle.ref_nom_lab || "",
        ref_tel_lab: usuarioDetalle.ref_tel_lab || "",
        ref_correo_lab: usuarioDetalle.ref_correo_lab || "",
      });
    }
  }, [usuarioDetalle]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    let newValue = value;
    let error = "";

    if (name === "ref_nom_per" || name === "ref_nom_lab") {
      newValue = value.replace(/[^a-zA-Z\s]/g, "").toUpperCase();
      if (!/^[A-Z\s]+$/.test(newValue)) {
        error = "Solo se permiten letras.";
      }
    } else if (name === "ref_tel_per" || name === "ref_tel_lab") {
      newValue = value.replace(/[^0-9]/g, "");
      if (newValue.length < 8) {
        error = "Debe tener al menos 8 caracteres.";
      }
    } else if (name === "ref_correo_per" || name === "ref_correo_lab") {
      newValue = value.toLowerCase();
      if (newValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newValue)) {
        error = "Debe ser un correo válido.";
      }
    } else if (name === "ref_tipo_per" || name === "ref_tipo_lab") {
      if (!value) {
        error = "Este campo es obligatorio.";
      }
    }

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: newValue,
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: error,
    }));
  };

  useEffect(() => {
    const isValid =
      !Object.values(errors).some((error) => error) &&
      Object.entries(formData).every(([key, value]) => {
        if (key === "ref_correo_per" || key === "ref_correo_lab") {
          return true;
        }
        return value;
      }) &&
      formData.ref_tel_per !== formData.ref_tel_lab &&
      (!formData.ref_correo_per || formData.ref_correo_per !== formData.ref_correo_lab);

    setValidado(isValid);

    if (formData.ref_tel_per && formData.ref_tel_lab && formData.ref_tel_per === formData.ref_tel_lab) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        ref_tel_per: "El teléfono personal no puede ser igual al laboral.",
        ref_tel_lab: "El teléfono laboral no puede ser igual al personal.",
      }));
    }

    if (formData.ref_correo_per && formData.ref_correo_lab && formData.ref_correo_per === formData.ref_correo_lab) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        ref_correo_per: "El correo personal no puede ser igual al laboral.",
        ref_correo_lab: "El correo laboral no puede ser igual al personal.",
      }));
    }
  }, [formData]);

  const handleSave = () => {
    if (!validado) {
      Object.keys(formData).forEach((key) => {
        if (!formData[key] && key !== "ref_correo_per" && key !== "ref_correo_lab") {
          setErrors((prevErrors) => ({
            ...prevErrors,
            [key]: "Este campo es obligatorio.",
          }));
        }
      });
      return;
    }

    setEnviandoForm(true);

    axios
      .post(`${config.apiUrl}/api/app/putProfile.php`, {
        sid: gContext.logeado?.token,
        array: formData,
      })
      .then((res) => {
        setEnviandoForm(false);
        if (res.data.status === "OK") {
          setAgradecimiento(true);
        } else if (res.data.status === "ERS") {
          console.error("Sesión expirada. Por favor, inicia sesión nuevamente.");
          localStorage.removeItem("arani_session_id");
          gContext.set_logeado({ estado: false, token: "" });
        } else {
          console.error("Error en la API:", res.data);
        }
      })
      .catch((err) => {
        setEnviandoForm(false);
        console.error("Error en la petición:", err.message);
      });
  };

  if (agradecimiento) {
    return (
      <Modal open={open} onClose={onClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", sm: "600px" },
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            textAlign: "center",
          }}
        >
          <Typography variant="h5" sx={{ mb: 2 }}>
            ¡Gracias por compartir tus referencias! 🎉
          </Typography>
          <Typography variant="body1" sx={{ mb: 4 }}>
            Esto nos ayuda a conocerte mejor y agiliza tu nuevo préstamo.
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mb: 4,
            }}
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/845/845646.png"
              alt="Check"
              style={{ width: "80px", height: "80px" }}
            />
          </Box>
          <Typography variant="body2" sx={{ mb: 4, color: "text.secondary" }}>
            Tus datos están seguros y protegidos. Solo los usamos para validar tu solicitud.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              navigate("/Aplicar");
              window.location.reload();
            }}
            sx={{ fontSize: "16px", padding: "10px 20px" }}
          >
            Continuar con mi solicitud
          </Button>
        </Box>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "90%", sm: "600px" },
          maxHeight: "90vh",
          overflow: "auto",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            mb: 2,
          }}
        >
          <img src={logominiarani} alt="Logo Mini Arani" style={{ maxWidth: "50px", height: "auto" }} />
        </Box>

        <Typography
          variant="caption"
          sx={{
            mb: 2,
            mt: 2,
            color: "text.secondary",
            textAlign: "justify",
            fontSize: "18px",
          }}
        >
          Hola, <br /><br />
          gracias por confiar nuevamente en nosotros. <br />
          Antes de continuar, necesitamos un pequeño paso adicional. <br />
          Solo nos falta un detalle: <br />¿Nos puedes compartir 1 referencia personal y 1 laboral? <br /><br />
          Esto nos ayudará a procesar tu nuevo préstamo más rápido.
        </Typography>
        <Box sx={{ height: 24 }} />
        <Grid item xs={12} sm={12}>
          <Divider textAlign="left" sx={{ m: "2rem 0 1rem 0" }}>
            Referencias Personales
          </Divider>
          <Typography
            variant="body2"
            sx={{ m: "0 0 2rem 0", color: "silver" }}
          >
            Comparte el contacto de un amigo, familiar, vecino o conocido.
          </Typography>
        </Grid>
        <Box sx={{ height: 24 }} />

        <TextField
          select
          fullWidth
          label="Tipo de Referencia Personal"
          name="ref_tipo_per"
          value={formData.ref_tipo_per}
          onChange={handleChange}
          error={!!errors.ref_tipo_per}
          helperText={errors.ref_tipo_per}
          sx={{ mb: 2 }}
        >
          <MenuItem value="">Seleccione una opción</MenuItem>
          <MenuItem value="amigo">Amigo/a</MenuItem>
          <MenuItem value="vecino">Vecino/a</MenuItem>
          <MenuItem value="conocido">Conocido/a</MenuItem>
          <MenuItem value="esposo">Esposo/a</MenuItem>
          <MenuItem value="hijo">Hijo/a</MenuItem>
          <MenuItem value="hermano">Hermano/a</MenuItem>
          <MenuItem value="papa_mama">Papá/Mamá</MenuItem>
        </TextField>
        <TextField
          fullWidth
          label="Nombre de Referencia Personal"
          name="ref_nom_per"
          value={formData.ref_nom_per}
          onChange={handleChange}
          error={!!errors.ref_nom_per}
          helperText={errors.ref_nom_per}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Teléfono de Referencia Personal"
          name="ref_tel_per"
          value={formData.ref_tel_per}
          onChange={handleChange}
          error={!!errors.ref_tel_per}
          helperText={errors.ref_tel_per}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Correo de Referencia Personal"
          name="ref_correo_per"
          value={formData.ref_correo_per}
          onChange={handleChange}
          error={!!errors.ref_correo_per}
          helperText={errors.ref_correo_per}
          sx={{ mb: 2 }}
        />

        <Box sx={{ height: 24 }} />
        <Grid item xs={12} sm={12}>
          <Divider textAlign="left" sx={{ m: "2rem 0 1rem 0" }}>
            Referencias Laborales
          </Divider>
          <Typography
            variant="body2"
            sx={{ m: "0 0 2rem 0", color: "silver" }}
          >
            Comparte el contacto de un compañero de trabajo, jefe o cliente.
          </Typography>
        </Grid>
        <Box sx={{ height: 24 }} />

        <TextField
          select
          fullWidth
          label="Tipo de Referencia Laboral"
          name="ref_tipo_lab"
          value={formData.ref_tipo_lab}
          onChange={handleChange}
          error={!!errors.ref_tipo_lab}
          helperText={errors.ref_tipo_lab}
          sx={{ mb: 2 }}
        >
          <MenuItem value="">Seleccione una opción</MenuItem>
          <MenuItem value="jefe">Jefe/a</MenuItem>
          <MenuItem value="compañero">Compañero/a</MenuItem>
          <MenuItem value="cliente">Cliente/a</MenuItem>
        </TextField>
        <TextField
          fullWidth
          label="Nombre de Referencia Laboral"
          name="ref_nom_lab"
          value={formData.ref_nom_lab}
          onChange={handleChange}
          error={!!errors.ref_nom_lab}
          helperText={errors.ref_nom_lab}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Teléfono de Referencia Laboral"
          name="ref_tel_lab"
          value={formData.ref_tel_lab}
          onChange={handleChange}
          error={!!errors.ref_tel_lab}
          helperText={errors.ref_tel_lab}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Correo de Referencia Laboral"
          name="ref_correo_lab"
          value={formData.ref_correo_lab}
          onChange={handleChange}
          error={!!errors.ref_correo_lab}
          helperText={errors.ref_correo_lab}
          sx={{ mb: 2 }}
        />
          <Box
          sx={{
            position: "sticky",
            bottom: 10,
            left: 0,
            right: 0,
            bgcolor: "background.paper",
            paddingTop: 2,
            zIndex: 10,
            display: "flex",
            flexDirection: { xs: "column", sm: "row" }, // Columnas en móvil, filas en pantallas más grandes
            gap: 2, // Espaciado entre los botones
            width: "100%", // Asegura que ocupe todo el ancho del modal
          }}
        >
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!validado || enviandoForm}
            sx={{ flex: 1 }} // Los botones ocupan el mismo espacio
          >
            {enviandoForm ? "Enviando..." : "Guardar y Continuar"}
          </Button>
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{ flex: 1 }} // Los botones ocupan el mismo espacio
          >
            Cancelar
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ModalDatosFaltantes;